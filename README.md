# Vichen · Anotador de juegos

Colección de **anotadores de juegos de cartas** en una PWA instalable que
funciona **sin internet** y guarda todo **en el celular** (localStorage, sin
servidor ni base de datos externa). Se sube tal cual a **Vercel** (sitio
estático, sin build step).

| App       | Qué hace                                                                 |
|-----------|--------------------------------------------------------------------------|
| **Truco** | Anotador de puntos con fósforos, malas/buenas, partido a 12–30.          |
| **Magic** | Contador por rondas. Modos **solo sube** (1,2,3…) y **sube y baja** (1…N…1). Cada jugador arranca en 10; botón **0** si no sumó; puntaje negativo permitido. Totales, tabla y ganador. |

Cada juego se instala como su propia app: **Truco Vichen** y **Magic Vichen**.

## Diseño

- Tipografías: **Fraunces** (display/números) + **Inter** (UI).
- Temas: **Noche** (oscuro, por defecto) y **Día** (claro), con acento **ámbar**.
- Íconos: **Lucide** auto-hospedados (offline) en `assets/js/icons.js`.

## Estructura

```
/
├── index.html                  ← Launcher (portada Vichen con la grilla)
├── manifest.webmanifest        ← Manifiesto PWA del ecosistema
├── sw.js                       ← Service worker (offline / caché)
├── vercel.json                 ← Headers para Vercel
├── assets/
│   ├── css/
│   │   ├── tokens.css           ← Paleta (noche/día) + radios/sombras/motion
│   │   ├── base.css             ← Reset + base
│   │   ├── components.css       ← Botones, seg control, switches, modal, etc.
│   │   └── shell.css            ← Menú hamburguesa (drawer)
│   ├── js/
│   │   ├── store.js             ← "Base de datos": wrapper de localStorage
│   │   ├── registry.js          ← Lista de apps (fuente única de verdad)
│   │   ├── icons.js             ← Íconos Lucide (self-host)
│   │   ├── theme.js             ← Tema global (noche/día)
│   │   ├── shell.js             ← Inyecta hamburguesa + drawer
│   │   └── pwa.js               ← Instalar (+ ayuda iOS) + service worker
│   └── icons/                   ← PNG por app: vichen/truco/magic (192/512/maskable/apple)
└── apps/
    ├── truco/  (index.html + manifest.webmanifest)
    └── magic/  (index.html + manifest.webmanifest)
```

## Cómo agregar una app nueva

1. Creá `apps/<id>/index.html` (copiá `apps/magic/` como plantilla: ya trae
   `<head>`, boot de tema, scripts y su `manifest.webmanifest`).
2. Guardá su estado con `Store.namespace("<id>", 1)`.
3. Agregá una entrada en `assets/js/registry.js` (con `icon` = nombre de un
   ícono Lucide incluido en `icons.js`, y `appName` para la app instalable).
4. Sumá su `index.html`, carpeta y manifest a `PRECACHE` en `sw.js` y subí `VERSION`.

## Almacenamiento

`Store` guarda en `localStorage` con claves `vichen:<app>:<clave>` y un JSON
`{ v, d }`. Persiste aunque cierres la app; si el navegador lo bloquea, cae a
un respaldo en memoria (no rompe).

## Local

```bash
python -m http.server 5173   #  (el SW no anda con file://)
```

## Deploy a Vercel

Sitio estático, sin configuración especial:

```bash
vercel --prod
```

O conectá el repo en Vercel (preset **Other**, sin build command).
