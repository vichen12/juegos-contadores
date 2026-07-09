/* ============================================================
   Vichen · Theme
   Tema global (noche | dia) compartido por todo el ecosistema.
   Se aplica en <html data-theme> y persiste en Store.
   Para evitar el "flash", cada página corre un mini-boot inline
   en el <head> (lee vichen:theme:current antes de pintar).
   ============================================================ */
(function (global) {
  "use strict";

  const KEY = "current";
  const db = Store.namespace("theme", 1);
  const VALID = ["noche", "dia"];
  const META_BG = { noche: "#0F1115", dia: "#F1F1EF" };

  function get() {
    const t = db.get(KEY, "noche");
    return VALID.includes(t) ? t : "noche";
  }

  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", META_BG[t] || META_BG.noche);
  }

  function set(t) {
    if (!VALID.includes(t)) return;
    db.set(KEY, t);
    apply(t);
  }

  function toggle() { set(get() === "noche" ? "dia" : "noche"); }

  function init() { apply(get()); }

  db.subscribe(KEY, (t) => { if (VALID.includes(t)) apply(t); });

  global.Theme = { get, set, toggle, apply, init, VALID };
})(window);
