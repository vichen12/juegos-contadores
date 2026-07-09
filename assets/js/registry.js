/* ============================================================
   Vichen · Registry
   Fuente única de verdad del ecosistema. Para sumar una app:
   creá /apps/<id>/ y agregá una entrada acá. El launcher y el
   drawer se arman solos desde esta lista.
   ============================================================ */
(function (global) {
  "use strict";

  // base = ruta al root del sitio según dónde estés.
  //   en "/" -> "./"   ·   en "/apps/truco/" -> "../../"
  function computeBase() {
    return /\/apps\/[^/]+\/?$/.test(location.pathname) ? "../../" : "./";
  }
  const BASE = computeBase();

  const APPS = [
    {
      id: "truco",
      name: "Truco",
      appName: "Truco Vichen",
      tagline: "Anotador de puntos, con fósforos",
      icon: "spade",
      href: BASE + "apps/truco/",
    },
    {
      id: "magic",
      name: "Magic",
      appName: "Magic Vichen",
      tagline: "Rondas que suben y bajan",
      icon: "wand",
      href: BASE + "apps/magic/",
    },
    // ↓ Próximas apps: agregalas acá.
    // { id:"chinchon", name:"Chinchón", appName:"Chinchón Vichen", tagline:"…", icon:"club", href:BASE+"apps/chinchon/" },
  ];

  function byId(id) { return APPS.find((a) => a.id === id) || null; }

  function current() {
    const m = location.pathname.match(/\/apps\/([^/]+)\/?$/);
    return m ? m[1] : null;
  }

  global.Registry = { apps: APPS, byId, current, base: BASE, home: BASE };
})(window);
