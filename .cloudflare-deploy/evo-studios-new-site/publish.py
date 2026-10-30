#!/usr/bin/env python3
"""Publish the verified EVO static artifact through the Cloudflare Pages REST API.
The token is read only from the runner environment and never logged or saved.
"""
import base64, hashlib, json, mimetypes, os, sys, tarfile, time, uuid
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from blake3 import blake3

HERE=Path(__file__).resolve().parent
CONFIG=json.loads((HERE/'manifest.json').read_text())
OUTPUT=Path(os.environ.get('RUNNER_TEMP','/tmp'))/'evo-studios-new-site-dist'
PROJECT='evo-studios-new-site'
BASE='https://api.cloudflare.com/client/v4'
TOKEN=os.environ.get('CLOUDFLARE_API_TOKEN','')
ACCOUNT=os.environ.get('CLOUDFLARE_ACCOUNT_ID','')

def log(message): print(message,flush=True)
def digest(b):return hashlib.sha256(b).hexdigest()
def cf(method,path,data=None,jwt=None,content_type='application/json',allow_missing=False):
    raw=(json.dumps(data,separators=(',',':')).encode() if data is not None and content_type=='application/json' else data)
    for attempt in range(4):
        request=Request(BASE+path,data=raw,method=method,headers={'Authorization':'Bearer '+(jwt or TOKEN),'Content-Type':content_type,'User-Agent':'EVO-Studios-Cloudflare-API-Deploy'})
        try:
            with urlopen(request,timeout=180) as response: result=json.load(response)
        except HTTPError as error:
            if allow_missing and error.code==404:return None
            if error.code in (429,500,502,503,504) and attempt<3:time.sleep(2**attempt);continue
            try: codes=[e.get('code') for e in json.loads(error.read()).get('errors',[])]
            except Exception:codes=[]
            raise RuntimeError(f'Cloudflare API {method} failed: HTTP {error.code}; error codes {codes}') from None
        except (URLError,TimeoutError):
            if attempt<3:time.sleep(2**attempt);continue
            raise RuntimeError('Cloudflare API connection failed') from None
        if result.get('success') is not True:
            raise RuntimeError(f"Cloudflare API failed; error codes {[e.get('code') for e in result.get('errors',[])]}")
        return result.get('result')

def fetch_asset(item):
    target=OUTPUT/item['path'];target.parent.mkdir(parents=True,exist_ok=True)
    for url in item['urls']:
        for attempt in range(2):
            try:
                with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60) as response:data=response.read()
                if len(data)==item['size'] and digest(data)==item['sha256']:
                    target.write_bytes(data);return
            except (HTTPError,URLError,TimeoutError):pass
    raise RuntimeError('Asset did not match verified source: '+item['path'])

def prepare():
    archive=HERE/'site-text.tar.gz'
    if digest(archive.read_bytes())!=CONFIG['text_bundle_sha256']:raise RuntimeError('Text bundle verification failed')
    OUTPUT.mkdir(parents=True,exist_ok=True)
    with tarfile.open(archive) as package:package.extractall(OUTPUT,filter='data')
    complete=0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures=[pool.submit(fetch_asset,item) for item in CONFIG['binary']]
        for future in as_completed(futures):
            future.result();complete+=1
            if complete%40==0:log(f'Validated binary assets: {complete}/{len(futures)}')
    for item in CONFIG['files']:
        path=OUTPUT/item['path']
        if not path.is_file() or path.stat().st_size!=item['size'] or digest(path.read_bytes())!=item['sha256']:
            raise RuntimeError('Artifact verification failed: '+item['path'])
    log(f"Artifact validated: {len(CONFIG['files'])} files match source commit {CONFIG['source_commit']}")

def multipart(fields):
    boundary='evo-'+uuid.uuid4().hex;parts=[]
    for name,value in fields.items():
        parts.append((f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n').encode())
    parts.append(f'--{boundary}--\r\n'.encode())
    return b''.join(parts),'multipart/form-data; boundary='+boundary

def publish():
    if not TOKEN or not ACCOUNT:raise RuntimeError('Missing Cloudflare repository secrets')
    prefix=f'/accounts/{ACCOUNT}/pages/projects'
    project=cf('GET',prefix+'/'+PROJECT,allow_missing=True)
    if project is None:project=cf('POST',prefix,{'name':PROJECT,'production_branch':'main'})
    log('Cloudflare Pages project ready: '+PROJECT)
    jwt=cf('GET',prefix+'/'+PROJECT+'/upload-token')['jwt']
    manifest={};assets={}
    for item in CONFIG['files']:
        path=OUTPUT/item['path'];value=base64.b64encode(path.read_bytes()).decode()
        key=blake3((value+path.suffix.lstrip('.')).encode()).hexdigest()[:32]
        manifest['/'+item['path']]=key
        content_type=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
        assets[key]={'key':key,'value':value,'base64':True,'metadata':{'contentType':content_type}}
    batch=[];size=0;uploaded=0
    for item in sorted(assets.values(),key=lambda e:len(e['value']),reverse=True):
        if batch and size+len(item['value'])>12*1024*1024:
            cf('POST','/pages/assets/upload',batch,jwt=jwt);uploaded+=len(batch);log(f'Uploaded assets: {uploaded}/{len(assets)}');batch=[];size=0
        batch.append(item);size+=len(item['value'])
    if batch:cf('POST','/pages/assets/upload',batch,jwt=jwt);uploaded+=len(batch);log(f'Uploaded assets: {uploaded}/{len(assets)}')
    cf('POST','/pages/assets/upsert-hashes',{'hashes':list(assets)},jwt=jwt)
    data,kind=multipart({'manifest':json.dumps(manifest,separators=(',',':')),'branch':project.get('production_branch','main'),'commit_hash':CONFIG['source_commit'],'commit_dirty':'false','commit_message':'Publish verified EVO Studios visual replica','pages_build_output_dir':'dist'})
    deployment=cf('POST',prefix+'/'+PROJECT+'/deployments',data,content_type=kind)
    for attempt in range(90):
        stage=deployment.get('latest_stage',{})
        if stage.get('status')=='success':break
        if stage.get('status') in ('failure','canceled','cancelled'):raise RuntimeError('Cloudflare deployment failed: '+str(stage))
        log('Deployment stage: '+stage.get('name','pending')+' / '+stage.get('status','pending'))
        time.sleep(4);deployment=cf('GET',prefix+'/'+PROJECT+'/deployments/'+deployment['id'])
    else:raise RuntimeError('Cloudflare deployment did not reach a terminal state')
    url='https://'+project['subdomain']
    result={'project':PROJECT,'deployment_id':deployment['id'],'url':url,'deployment_url':deployment['url'],'source_commit':CONFIG['source_commit'],'files':len(CONFIG['files']),'status':'success'}
    (HERE/'deployment-result.json').write_text(json.dumps(result,indent=2))
    log('DEPLOYMENT_RESULT='+json.dumps(result,separators=(',',':')))
    routes={'/':'index.html','/project/':'project/index.html','/studio/':'studio/index.html','/contact/':'contact/index.html','/project/spine-clinic-family-holistic/':'project/spine-clinic-family-holistic/index.html'}
    for attempt in range(12):
        try:
            for route,path in routes.items():
                with urlopen(url+route,timeout=30) as response:body=response.read()
                if digest(body)!=digest((OUTPUT/path).read_bytes()):raise RuntimeError('Live page did not match deployment: '+route)
            for asset in ['/storage/2026/07/Grid-Background-Gian-Media.mp4','/storage/2026/07/GMG-Logo-Icon.png','/webgl-fallback.js']:
                with urlopen(Request(url+asset,method='HEAD'),timeout=30) as response:
                    if response.status!=200:raise RuntimeError('Missing deployed asset')
            log('LIVE_VERIFIED='+url);break
        except (HTTPError,URLError,TimeoutError,RuntimeError):
            if attempt==11:raise
            time.sleep(5)

if __name__=='__main__':
    try:prepare();publish()
    except Exception as error:
        message=str(error)
        if TOKEN:message=message.replace(TOKEN,'[REDACTED]')
        log('DEPLOY_ERROR='+message);sys.exit(1)
