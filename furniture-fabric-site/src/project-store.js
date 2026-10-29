import {DEFAULTS} from './engine.js';
import {CLOSET_DEFAULTS} from './closet-engine.js';

// Furniture Fabric Project Library — local-first. Data never leaves this browser.
export const LIBRARY_KEY='furniture-fabric-library-v1';
export const LEGACY_KEYS={drawer:'furniture-fabric-v1',closet:'furniture-fabric-closet-v1'};
export const ACTIVE_KEYS={drawer:'furniture-fabric-active-drawer',closet:'furniture-fabric-active-closet'};
export const PROJECT_TYPES={drawer:{label:'Cajonera',href:'./index.html'},closet:{label:'Clóset',href:'./closet.html'}};
const presets={drawer:DEFAULTS,closet:CLOSET_DEFAULTS};
const folders=['Personal','Clientes','Ideas'];
export const FOLDERS=Object.freeze(folders);
const iso=()=>new Date().toISOString();
const generateId=()=>globalThis.crypto?.randomUUID?.()||`ff-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
const parse=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};
const validType=type=>Object.hasOwn(PROJECT_TYPES,type);
const safeName=(str,fallback='Proyecto sin título')=>String(str??'').trim().slice(0,80)||fallback;
const cleanFolder=str=>String(str||'Personal').trim().slice(0,40)||'Personal';
const normalize=(x)=>({id:x.id,type:x.type,name:safeName(x.name),data:{...presets[x.type],...x.data,name:safeName(x.name)},folder:cleanFolder(x.folder),favorite:!!x.favorite,archived:!!x.archived,createdAt:x.createdAt||iso(),updatedAt:x.updatedAt||iso()});
function checkStore(storage){if(!storage||typeof storage.getItem!=='function')throw Error('Almacenamiento local no disponible');}
export function readLibrary(storage=localStorage){checkStore(storage);const raw=parse(storage.getItem(LIBRARY_KEY),null);if(raw&&Array.isArray(raw.projects))return {version:1,folders:[...new Set([...(Array.isArray(raw.folders)?raw.folders:folders).map(cleanFolder),'Personal'])],projects:raw.projects.filter(x=>x&&validType(x.type)&&typeof x.id==='string').map(normalize)};return null;}
export function writeLibrary(library,storage=localStorage){checkStore(storage);storage.setItem(LIBRARY_KEY,JSON.stringify({version:1,folders:library.folders||folders,projects:library.projects}));return library;}
export function bootstrapLibrary(storage=localStorage){let library=readLibrary(storage);if(library)return library;
 const projects=[];for(const type of ['closet','drawer']){
  const old=parse(storage.getItem(LEGACY_KEYS[type]),{});
  const data={...presets[type],...(old&&typeof old==='object'&&!Array.isArray(old)?old:{})};
  const name=safeName(data.name,type==='closet'?'Clóset Nogales':'Cajonera 01');
  projects.push(normalize({id:type==='closet'?'ff-closet-original':'ff-drawer-original',type,name,data,folder:'Personal'}));
 }
 library=writeLibrary({version:1,folders:[...folders],projects},storage);
 for(const p of projects)storage.setItem(ACTIVE_KEYS[p.type],p.id);
 return library;
}
export function findProject(id,storage=localStorage){return bootstrapLibrary(storage).projects.find(p=>p.id===id)||null;}
export function createFolder(name,storage=localStorage){const folder=cleanFolder(name);if(!name||!String(name).trim())throw Error('Ingresa un nombre para la carpeta');const library=bootstrapLibrary(storage);if(library.folders.some(x=>x.toLowerCase()===folder.toLowerCase()))throw Error('Esa carpeta ya existe');library.folders.push(folder);writeLibrary(library,storage);return folder;}
export function createProject(type,name,storage=localStorage){if(!validType(type))throw Error('Tipo de proyecto desconocido');const library=bootstrapLibrary(storage);const project=normalize({id:generateId(),type,name:safeName(name,presets[type].name),data:{...presets[type]},folder:'Personal'});library.projects.unshift(project);writeLibrary(library,storage);return project;}
export function updateProject(id,patch,storage=localStorage){const library=bootstrapLibrary(storage),idx=library.projects.findIndex(p=>p.id===id);if(idx<0)throw Error('No se encontró el proyecto');
 const base=library.projects[idx];const changes={...patch};delete changes.id;delete changes.type;delete changes.createdAt;delete changes.updatedAt;
 if(changes.name!==undefined)changes.name=safeName(changes.name,base.name);
 if(changes.folder!==undefined){changes.folder=cleanFolder(changes.folder);if(!library.folders.includes(changes.folder))throw Error('La carpeta no existe');}
 if(changes.data!==undefined)changes.data={...base.data,...changes.data};
 const next=normalize({...base,...changes,updatedAt:iso()});next.data.name=next.name;
 library.projects[idx]=next;writeLibrary(library,storage);
 if(storage.getItem(ACTIVE_KEYS[next.type])===id)storage.setItem(LEGACY_KEYS[next.type],JSON.stringify(next.data));
 return next;
}
export function duplicateProject(id,storage=localStorage){const original=findProject(id,storage);if(!original)throw Error('No se encontró el proyecto');const library=bootstrapLibrary(storage);const copy=normalize({...original,id:generateId(),name:`${original.name} (copia)`,favorite:false,archived:false,createdAt:iso(),updatedAt:iso(),data:{...original.data}});library.projects.unshift(copy);writeLibrary(library,storage);return copy;}
export function deleteProject(id,storage=localStorage){const library=bootstrapLibrary(storage);const idx=library.projects.findIndex(p=>p.id===id);if(idx<0)return false;const p=library.projects[idx];library.projects.splice(idx,1);writeLibrary(library,storage);if(storage.getItem(ACTIVE_KEYS[p.type])===id){storage.removeItem(ACTIVE_KEYS[p.type]);}return true;}
export function openProject(id,storage=localStorage){const p=findProject(id,storage);if(!p)throw Error('Proyecto no encontrado');storage.setItem(ACTIVE_KEYS[p.type],p.id);storage.setItem(LEGACY_KEYS[p.type],JSON.stringify(p.data));return PROJECT_TYPES[p.type].href;}
export function activeProject(type,storage=localStorage){if(!validType(type))throw Error('Tipo inválido');const lib=bootstrapLibrary(storage);const activeId=storage.getItem(ACTIVE_KEYS[type]);let p=lib.projects.find(x=>x.id===activeId&&x.type===type);if(!p){p=lib.projects.find(x=>x.type===type&&!x.archived)||createProject(type,presets[type].name,storage);storage.setItem(ACTIVE_KEYS[type],p.id);storage.setItem(LEGACY_KEYS[type],JSON.stringify(p.data));}return p;}
export function persistActiveProject(type,data,storage=localStorage){const active=activeProject(type,storage);const next={...data,name:safeName(data.name,active.name)};return updateProject(active.id,{name:next.name,data:next},storage);}
export function projectFromJSON(json,storage=localStorage){const input=typeof json==='string'?JSON.parse(json):json;
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Formato de archivo no válido');
 const src=input.data&&typeof input.data==='object'?input.data:input;
 const type=validType(input.type)?input.type:(src.nicheWidth!==undefined?'closet':'drawer');
 if(!validType(type)||!Object.keys(src).some(k=>k in presets[type]))throw Error('No es un proyecto compatible de Furniture Fabric');
 const name=safeName(input.name||src.name,'Proyecto importado');
 const p=createProject(type,name,storage);return updateProject(p.id,{data:{...presets[type],...src,name},folder:bootstrapLibrary(storage).folders.includes(input.folder)?input.folder:'Personal'},storage);
}
export function exportProject(id,storage=localStorage){const p=findProject(id,storage);if(!p)throw Error('No existe el proyecto');return JSON.stringify({app:'Furniture Fabric',version:1,type:p.type,name:p.name,data:p.data},null,2);}
