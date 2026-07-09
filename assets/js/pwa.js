/* ============================================================
   Vichen · PWA
   - Registra el service worker (raíz -> scope de todo el sitio).
   - Captura beforeinstallprompt para el botón "Instalar app".
   - El botón se ofrece siempre (salvo app ya instalada): si el
     navegador no dispara su prompt nativo, mostramos las instrucciones
     de instalación (iPhone: Compartir → Agregar a inicio; Android/desktop:
     menú ⋮ → Instalar app).
   Botones que maneja: #shell-install-btn (drawer) y #btn-install.
   ============================================================ */
(function (global) {
  "use strict";

  let deferred = null;

  const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = () =>
    (typeof global.matchMedia === "function" && global.matchMedia("(display-mode: standalone)").matches) ||
    navigator.standalone === true;
  const isAndroid = () => /android/i.test(navigator.userAgent);

  // Siempre ofrecemos instalar (salvo que ya esté instalada): si Chrome no
  // disparó su prompt nativo, mostramos igual las instrucciones del navegador.
  function canOffer() {
    return !isStandalone();
  }

  function refreshInstallButton() {
    const show = canOffer();
    document.querySelectorAll("#shell-install-btn, #btn-install").forEach((b) => {
      if (b.classList.contains("shell-install")) b.classList.toggle("show", show);
      else b.hidden = !show;
    });
  }

  function helpToast(icon, html) {
    const prev = document.getElementById("pwa-install-toast");
    if (prev) prev.remove();
    const t = document.createElement("div");
    t.id = "pwa-install-toast";
    t.setAttribute("role", "status");
    t.style.cssText =
      "position:fixed;left:50%;bottom:calc(20px + var(--safe-bottom));transform:translateX(-50%);z-index:120;" +
      "max-width:min(360px,92vw);background:var(--surface-2);color:var(--ink);border:1px solid var(--hair);" +
      "border-radius:var(--r-3);box-shadow:var(--shadow-pop);padding:14px 16px;font-size:13.5px;line-height:1.5;" +
      "display:flex;gap:10px;align-items:flex-start;animation:vtoast .3s var(--ease) both";
    t.innerHTML =
      '<span style="flex:0 0 auto;color:var(--accent-text);margin-top:1px">' + Icons.svg(icon, { size: 20 }) + "</span>" +
      "<span>" + html + "</span>";
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; setTimeout(() => t.remove(), 320); }, 6000);
  }

  function manualHelp() {
    if (isIOS()) {
      helpToast("share", "Para instalar: tocá <b>Compartir</b> abajo y elegí <b>“Agregar a inicio”</b>.");
    } else if (isAndroid()) {
      helpToast("menu", "Para instalar: abrí el menú <b>⋮</b> del navegador y tocá <b>“Instalar app”</b> o <b>“Agregar a pantalla principal”</b>.");
    } else {
      helpToast("menu", "Para instalar: usá el ícono de instalar en la barra de direcciones, o el menú <b>⋮</b> → <b>“Instalar…”</b>.");
    }
  }

  async function promptInstall() {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) {}
      deferred = null;
      refreshInstallButton();
      return;
    }
    // Sin prompt nativo (iOS, o Chrome que no lo disparó): mostramos la ayuda.
    manualHelp();
  }

  global.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    refreshInstallButton();
  });
  global.addEventListener("appinstalled", () => {
    deferred = null;
    refreshInstallButton();
  });

  if ("serviceWorker" in navigator) {
    global.addEventListener("load", () => {
      navigator.serviceWorker
        .register(Registry.base + "sw.js", { scope: Registry.base })
        .catch((err) => console.warn("[PWA] SW no registrado:", err));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const own = document.getElementById("btn-install");
    if (own) own.addEventListener("click", promptInstall);
    refreshInstallButton();
  });

  global.PWA = { promptInstall, refreshInstallButton, isIOS, isStandalone, canOffer };
})(window);
