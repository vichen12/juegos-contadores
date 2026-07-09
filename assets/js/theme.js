/* ============================================================
   El Anotador · Theme
   Tema global (onix | marfil) compartido por todo el ecosistema.
   Se aplica en <html data-theme> y persiste en Store.

   Para evitar el "flash" del tema equivocado, cada página además
   corre un mini-bootstrap inline en el <head> (ver head-boot).
   ============================================================ */
(function (global) {
  "use strict";

  const KEY = "current";
  const db = Store.namespace("theme", 1);
  const VALID = ["onix", "marfil"];
  const META_BG = { onix: "#0F0F11", marfil: "#F5F3ED" };

  function get() {
    const t = db.get(KEY, "onix");
    return VALID.includes(t) ? t : "onix";
  }

  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", META_BG[t] || META_BG.onix);
  }

  function set(t) {
    if (!VALID.includes(t)) return;
    db.set(KEY, t);
    apply(t);
  }

  function init() { apply(get()); }

  // Si otra app/pestaña cambia el tema, reflejarlo al toque.
  db.subscribe(KEY, (t) => { if (VALID.includes(t)) apply(t); });

  global.Theme = { get, set, apply, init, VALID };
})(window);
