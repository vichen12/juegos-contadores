/* ============================================================
   El Anotador · Registry
   Fuente única de verdad del ecosistema. Para sumar una app
   nueva: creá su carpeta en /apps/<id>/ y agregá una entrada acá.
   El launcher y el drawer se arman solos desde esta lista.
   ============================================================ */
(function (global) {
  "use strict";

  // base = ruta al root del sitio, calculada según dónde estés.
  // En "/" -> ""   ·   en "/apps/truco/" -> "../../"
  function computeBase() {
    const p = location.pathname;
    const m = p.match(/\/apps\/[^/]+\/?$/);
    return m ? "../../" : "./";
  }
  const BASE = computeBase();

  const APPS = [
    {
      id: "truco",
      name: "Truco",
      tagline: "Anotador de puntos · a 30, 24, 18…",
      glyph: "♠",
      href: BASE + "apps/truco/",
      accent: "#ECEAE3",
    },
    {
      id: "podrido",
      name: "Podrido",
      tagline: "Contador por rondas · cartas que suben",
      glyph: "♦",
      href: BASE + "apps/podrido/",
      accent: "#ECEAE3",
    },
    // ↓ Próximas apps: agregalas acá.
    // { id:"chinchon", name:"Chinchón", tagline:"…", glyph:"♣", href:BASE+"apps/chinchon/" },
  ];

  function byId(id) { return APPS.find((a) => a.id === id) || null; }

  // ¿En qué app estamos parados? (para marcar el activo en el drawer)
  function current() {
    const m = location.pathname.match(/\/apps\/([^/]+)\/?$/);
    return m ? m[1] : null;
  }

  global.Registry = { apps: APPS, byId, current, base: BASE, home: BASE };
})(window);
