/* ============================================================
   Vichen · Shell
   Inyecta el botón hamburguesa + el drawer de navegación.
   Se arma desde Registry, usa Icons (Lucide) y respeta Theme.
   Cargar antes: tokens/base/components/shell.css + store, registry,
   icons, theme, pwa. Luego:  Shell.mount();
   ============================================================ */
(function (global) {
  "use strict";

  const VERSION = "2.0";

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  const ic = (name, size) => Icons.svg(name, { size: size || 20 });

  function build() {
    const base = Registry.base;
    const currentId = Registry.current();

    const burger = el("button", "shell-burger");
    burger.setAttribute("aria-label", "Abrir menú de apps");
    burger.innerHTML = ic("menu", 20);

    const scrim = el("div", "shell-scrim");

    const drawer = el("aside", "shell-drawer");
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Menú de apps");

    // Marca
    const brand = el("div", "shell-brand",
      '<span class="logo">' + ic("sparkles", 23) + '</span>' +
      '<span class="txt"><span class="name">Vichen</span>' +
      '<span class="sub">Anotador de juegos</span></span>');

    // Navegación
    const nav = el("ul", "shell-nav");
    const homeLink = el("button", "shell-link" + (currentId === null ? " active" : ""),
      '<span class="ic">' + ic("home") + '</span>' +
      '<span class="tx"><span class="nm">Inicio</span><span class="ds">Todas las apps</span></span>' +
      '<span class="go">' + ic("right", 18) + '</span>');
    homeLink.addEventListener("click", () => go(base));
    const homeLi = el("li"); homeLi.appendChild(homeLink); nav.appendChild(homeLi);

    const sect = el("li"); sect.appendChild(el("div", "shell-sect", "Juegos")); nav.appendChild(sect);

    Registry.apps.forEach((a) => {
      const link = el("button", "shell-link" + (a.id === currentId ? " active" : ""),
        '<span class="ic">' + ic(a.icon) + '</span>' +
        '<span class="tx"><span class="nm">' + a.name + '</span>' +
        '<span class="ds">' + a.tagline + '</span></span>' +
        '<span class="go">' + ic("right", 18) + '</span>');
      link.addEventListener("click", () => go(a.href));
      const li = el("li"); li.appendChild(link); nav.appendChild(li);
    });

    // Pie: tema + instalar
    const foot = el("div", "shell-foot");

    const themeRow = el("div", "row");
    themeRow.appendChild(el("span", "lbl", "Tema"));
    const seg = el("div", "seg");
    [["noche", "moon", "Noche"], ["dia", "sun", "Día"]].forEach(([t, icon, label]) => {
      const opt = el("button", "seg-opt", ic(icon, 16) + label);
      opt.setAttribute("aria-selected", Theme.get() === t);
      opt.addEventListener("click", () => {
        Theme.set(t);
        seg.querySelectorAll(".seg-opt").forEach((o, i) =>
          o.setAttribute("aria-selected", (i === 0 ? "noche" : "dia") === t));
      });
      seg.appendChild(opt);
    });
    themeRow.appendChild(seg);
    foot.appendChild(themeRow);

    const install = el("button", "btn btn--primary btn--block shell-install",
      ic("install", 18) + "Instalar app");
    install.id = "shell-install-btn";
    install.addEventListener("click", () => global.PWA && PWA.promptInstall());
    foot.appendChild(install);

    foot.appendChild(el("div", "shell-version", "Vichen · v" + VERSION));

    drawer.appendChild(brand);
    drawer.appendChild(nav);
    drawer.appendChild(foot);

    function open() {
      scrim.classList.add("open"); drawer.classList.add("open");
      document.body.style.overflow = "hidden";
      if (global.PWA) PWA.refreshInstallButton();
    }
    function close() {
      scrim.classList.remove("open"); drawer.classList.remove("open");
      document.body.style.overflow = "";
    }
    function go(href) { close(); setTimeout(() => (location.href = href), 110); }

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
