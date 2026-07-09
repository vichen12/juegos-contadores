# El Anotador · Ecosistema de apps

Colección de **anotadores de juegos** en una sola PWA instalable, que
funciona **sin internet** y guarda todo **en el celular** (localStorage —
no hay servidor ni base de datos externa). Se sube tal cual a **Vercel**
(sitio estático, sin build step).

Apps incluidas:

| App        | Qué hace                                                        |
|------------|-----------------------------------------------------------------|
| **Truco**  | Anotador de puntos con fósforos, malas/buenas, partido a 12–30. |
| **Podrido**| Contador por rondas: repartís 1, 2, 3… cartas y anotás puntaje (+/−) por ronda; totales y ganador. |

## Estructura

```
/
├── index.html              ← Launcher (portada con la grilla de apps)
├── manifest.webmanifest    ← Manifiesto PWA del ecosistema
├── sw.js                   ← Service worker (offline / caché)
├── vercel.json             ← Headers para Vercel
├── assets/
│   ├── css/
│   │   ├── tokens.css       ← Temas (ónix/marfil) + variables compartidas
│   │   ├── base.css         ← Reset + base
│   │   └── shell.css        ← Estilos del menú hamburguesa (drawer)
│   ├── js/
│   │   ├── store.js         ← "Base de datos": wrapper de localStorage
│   │   ├── registry.js      ← Lista de apps (fuente única de verdad)
│   │   ├── theme.js         ← Tema global compartido
│   │   ├── shell.js         ← Inyecta hamburguesa + drawer
│   │   └── pwa.js           ← Instalar + registrar service worker
│   └── icons/               ← Íconos PNG (192/512/maskable/apple/favicon)
└── apps/
    ├── truco/index.html
    └── podrido/index.html
```

Cada app es una página independiente que incluye el núcleo compartido
(`store.js`, `registry.js`, `theme.js`, `pwa.js`, `shell.js`) y llama a
`Shell.mount()`. El menú hamburguesa (arriba a la izquierda) y la portada
se arman solos desde `registry.js`.

## Cómo agregar una app nueva

1. Creá la carpeta `apps/<id>/index.html` (podés copiar `apps/podrido/`
   como plantilla: ya trae el `<head>`, el boot del tema y los scripts).
2. Guardá su estado con `Store.namespace("<id>", 1)`.
3. Agregá una entrada en `assets/js/registry.js`:
   ```js
   { id:"<id>", name:"Nombre", tagline:"Descripción corta", glyph:"♣",
     href:BASE+"apps/<id>/" }
   ```
4. Sumá su `index.html` a la lista `PRECACHE` de `sw.js` y subí `VERSION`.

Listo: aparece en la portada y en el menú de todas las apps.

## Almacenamiento (la "base de datos")

`Store` guarda en `localStorage` con claves `anotador:<app>:<clave>` y un
JSON `{ v: versión, d: dato }`. Persiste aunque cierres la app o apagues
el celu, y se sincroniza entre pestañas. Si el navegador bloquea
`localStorage`, cae a un respaldo en memoria (no rompe, pero no persiste).

```js
const db = Store.namespace("podrido", 1);
db.set("game", {...});
const g = db.get("game", null);
db.subscribe("game", val => { /* reacciona a cambios */ });
```

## Correr en local

Necesita un servidor (el service worker no anda con `file://`):

```bash
npx serve .
#  o
python -m http.server 5173
```

Abrí `http://localhost:5173`.

## Deploy a Vercel

Sin configuración especial: es un sitio estático.

```bash
npm i -g vercel
vercel        # deploy de prueba
vercel --prod # a producción
```

O conectá el repo desde el panel de Vercel (framework preset: **Other**,
sin build command, output = raíz del proyecto).
