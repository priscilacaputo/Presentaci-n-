# Mantenimiento AEP — Pantalla de salidas

Hub de presentación con las 7 herramientas del equipo de Mantenimiento AEP, con estética de pantalla de salidas de aeropuerto: tarjeta de embarque, hora y puerta por parada, y estado de "embarque" que avanza solo a medida que se scrollea.

Es un único archivo estático (`index.html`) sin dependencias externas ni build: HTML, CSS y JS (incluida la librería de generación de QR) están todos inline en el mismo archivo, para que funcione en cualquier hosting estático sin configuración.

## Desarrollo local

Abrí `index.html` directo en el navegador, o serví la carpeta con cualquier servidor estático:

```bash
npx serve .
```

## Deploy en Vercel

1. Subí este repo a GitHub (ver abajo).
2. En [vercel.com](https://vercel.com), **Add New → Project** e importá el repo.
3. Framework preset: **Other** (o "Static"). No hace falta build command ni output directory — Vercel sirve `index.html` desde la raíz automáticamente.
4. Deploy. Cada push a la rama principal actualiza el sitio solo.

## Subir a GitHub

```bash
git remote add origin https://github.com/<tu-usuario>/<nombre-del-repo>.git
git branch -M main
git push -u origin main
```
