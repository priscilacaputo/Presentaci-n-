# Mantenimiento AEP — Pantalla de salidas

Hub de presentación con las 7 herramientas del equipo de Mantenimiento AEP, con estética de pantalla de salidas de aeropuerto: tarjeta de embarque, hora y puerta por parada, y estado de "embarque" que avanza solo a medida que se scrollea.

El sitio (`index.html`) es estático: HTML, CSS y JS (incluida la librería de generación de QR) están todos inline, sin build. La única parte con backend es la **Torre de control** (el tablero de ideas): usa una función serverless (`api/ideas.js`) con una base Redis para que lo que escribe cada persona se vea reflejado en todos los celus y en la pantalla proyectada, no solo en el propio dispositivo.

## Desarrollo local

Abrí `index.html` directo en el navegador, o serví la carpeta con cualquier servidor estático:

```bash
npx serve .
```

La Torre de control no sincroniza en local ni en una vista previa suelta (no hay backend corriendo) — muestra un aviso y sigue funcionando el resto de la página. Sincroniza recién en el deploy de Vercel, con el paso 4 de abajo hecho.

## Deploy en Vercel

1. Subí este repo a GitHub (ver abajo).
2. En [vercel.com](https://vercel.com), **Add New → Project** e importá el repo.
3. Framework preset: **Other** (o "Static"). No hace falta build command ni output directory — Vercel sirve `index.html` desde la raíz y detecta `api/ideas.js` como función serverless automáticamente.
4. **Para que la Torre de control sincronice entre celus**: en el proyecto ya creado, andá a la pestaña **Storage** (o **Browse Marketplace** si no aparece nada ahí) y buscá **"Upstash for Redis"** — Vercel sacó el nombre "KV" del menú, ahora este mismo producto (Redis con plan gratis) aparece con ese nombre. Conectalo al proyecto.
   ⚠️ Ojo: en el marketplace también aparece un producto que se llama solo **"Redis"** (de Redis Ltd.) — **ese no sirve**, usa otro tipo de conexión y `api/ideas.js` no lo va a poder leer. Tiene que ser específicamente **"Upstash for Redis"**.
   Conectarlo agrega solo las variables de entorno que necesita `api/ideas.js` (`KV_REST_API_URL`, `KV_REST_API_TOKEN`). Volvé a hacer deploy (Vercel suele ofrecer redeploy automático apenas conectás el storage).
5. Deploy. Cada push a la rama principal actualiza el sitio solo.

## Subir a GitHub

```bash
git remote add origin https://github.com/<tu-usuario>/<nombre-del-repo>.git
git branch -M main
git push -u origin main
```
