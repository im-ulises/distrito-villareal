# Distrito Villarreal

Landing comercial para Distrito Villarreal, Ciudad Juárez, Chihuahua.

## Stack

- Next.js 16 / React 19
- vinext
- Cloudflare Workers
- CSS propio, sin framework visual pesado

## Dirección de UI

La implementación reutiliza patrones de composición observados en Mobbin y los adapta a la identidad de Distrito Villarreal; no se copian assets ni branding de terceros.

- Hero / navegación: KOBU — https://mobbin.com/sites/sections/d07ad815-77af-4cab-a6ff-c35761c7b2a6
- Galería editorial: KOBU — https://mobbin.com/sites/sections/4226456d-e845-483a-ad1b-305a93fe7d36
- CTA oscuro: UGLYCASH — https://mobbin.com/sites/sections/a61ca807-9b71-4722-90b2-4bc6a927125d

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run check
npm run build
```

## Deploy a Cloudflare Workers

El proyecto ya incluye `wrangler.jsonc`. Autentica Wrangler y despliega:

```bash
npx wrangler login
npm run deploy
```

Para CI/CD agrega `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` como secrets del repositorio.
