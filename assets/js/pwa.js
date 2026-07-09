/* ============================================================
   Vichen · PWA
   - Registra el service worker (raíz -> scope de todo el sitio).
   - Captura beforeinstallprompt para el botón "Instalar app".
   - En iPhone/iPad (Safari no dispara el prompt) muestra la ayuda
     de "Compartir → Agregar a inicio".
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

  function canOffer() {
    if (isStandalone()) return false;
    return !!deferred || isIOS();
  }

  function refreshInstallButton() {
    const show = canOffer();
    document.querySelectorAll("#shell-install-btn, #btn-install").forEach((b) => {
      if (b.classList.contains("shell-install")) b.classList.toggle("show", show);
      else b.hidden = !show;
    });
  }

  function iosToast() {
    if (document.getElementById("ios-install-toast")) return;
    const t = document.createElement("div");
    t.id = "ios-install-toast";
    t.setAttribute("role", "status");
    t.style.cssText =
      "position:fixed;left:50%;bottom:calc(20px + var(--safe-bottom));transform:translateX(-50%);z-index:120;" +
      "max-width:min(360px,92vw);background:var(--surface-2);color:var(--ink);border:1px solid var(--hair);" +
      "border-radius:var(--r-3);box-shadow:var(--shadow-pop);padding:14px 16px;font-size:13.5px;line-height:1.5;" +
      "display:flex;gap:10px;align-items:flex-start;animation:vtoast .3s var(--ease) both";
    t.innerHTML =
      '<span style="flex:0 0 auto;color:var(--accent-text);margin-top:1px">' + Icons.svg("share", { size: 20 }) + "</span>" +
      "<span>Para instalar: tocá <b>Compartir</b> abajo y elegí <b>“Agregar a inicio”</b>.</span>";
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; setTimeout(() => t.remove(), 320); }, 4600);
  }

  async function promptInstall() {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) {}
      deferred = null;
      refreshInstallButton();
      return;
    }
    if (isIOS()) iosToast();
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
