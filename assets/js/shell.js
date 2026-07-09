/* ============================================================
   El Anotador · Shell
   Inyecta el botón hamburguesa + el drawer de navegación en
   cualquier app. Se arma solo desde Registry y respeta el Theme.

   Requiere (en este orden) antes que este script:
     tokens.css, base.css, shell.css
     store.js, registry.js, theme.js, pwa.js
   Y luego basta con:  Shell.mount();
   ============================================================ */
(function (global) {
  "use strict";

  const VERSION = "1.0.0";

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  const BURGER_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  function build() {
    const base = Registry.base;
    const currentId = Registry.current();

    // --- Botón hamburguesa ---
    const burger = el("button", "shell-burger");
    burger.setAttribute("aria-label", "Abrir menú de apps");
    burger.innerHTML = BURGER_SVG;

    // --- Scrim ---
    const scrim = el("div", "shell-scrim");

    // --- Drawer ---
    const drawer = el("aside", "shell-drawer");
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Menú de apps");

    const brand = el(
      "div",
      "shell-brand",
      '<div class="title">El Anotador</div><div class="sub">Tus apps · offline</div>'
    );

    // Inicio
    const nav = el("ul", "shell-nav");
    const homeLi = el("li");
    const homeLink = el(
      "button",
      "shell-link" + (currentId === null ? " active" : ""),
      '<span class="ic">⌂</span><span class="tx"><span class="nm">Inicio</span>' +
        '<span class="ds">Todas las apps</span></span><span class="go">›</span>'
    );
    homeLink.addEventListener("click", () => go(base));
    homeLi.appendChild(homeLink);
    nav.appendChild(homeLi);

    const sect = el("div", "shell-sect", "Apps");
    nav.appendChild(sect);

    Registry.apps.forEach((a) => {
      const li = el("li");
      const link = el(
        "button",
        "shell-link" + (a.id === currentId ? " active" : ""),
        '<span class="ic">' + a.glyph + "</span>" +
          '<span class="tx"><span class="nm">' + a.name + "</span>" +
          '<span class="ds">' + a.tagline + "</span></span>" +
          '<span class="go">›</span>'
      );
      link.addEventListener("click", () => go(a.href));
      li.appendChild(link);
      nav.appendChild(li);
    });

    // --- Pie: tema + instalar ---
    const foot = el("div", "shell-foot");

    const themeRow = el("div", "shell-row");
    themeRow.appendChild(el("span", null, "Tema"));
    const dots = el("div", "shell-themes");
    Theme.VALID.forEach((t) => {
      const d = el("button", "shell-tdot" + (Theme.get() === t ? " on" : ""));
      d.dataset.t = t;
      d.setAttribute("aria-label", "Tema " + t);
      d.addEventListener("click", () => {
        Theme.set(t);
        dots.querySelectorAll(".shell-tdot").forEach((x) =>
          x.classList.toggle("on", x.dataset.t === t)
        );
      });
      dots.appendChild(d);
    });
    themeRow.appendChild(dots);
    foot.appendChild(themeRow);

    const install = el("button", "shell-install", "⤓ Instalar en el celu");
    install.id = "shell-install-btn";
    install.addEventListener("click", () => global.PWA && PWA.promptInstall());
    foot.appendChild(install);

    foot.appendChild(el("div", "shell-version", "v" + VERSION));

    drawer.appendChild(brand);
    drawer.appendChild(nav);
    drawer.appendChild(foot);

    // --- Interacción ---
    function open() {
      scrim.classList.add("open");
      drawer.classList.add("open");
      document.body.style.overflow = "hidden";
      // Mostrar botón instalar si corresponde
      if (global.PWA) PWA.refreshInstallButton();
    }
    function close() {
      scrim.classList.remove("open");
      drawer.classList.remove("open");
      document.body.style.overflow = "";
    }
    function go(href) {
      close();
      // pequeño respiro para que se vea el cierre antes de navegar
      setTimeout(() => (location.href = href), 90);
    }

    burger.addEventListener("click", open);
    scrim.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) close();
    });

    document.body.appendChild(burger);
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);

    return { open, close };
  }

  let instance = null;
  function mount() {
    Theme.init();
    if (instance) return instance;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => (instance = build()));
    } else {
      instance = build();
    }
    return instance;
  }

  global.Shell = { mount, VERSION };
})(window);
