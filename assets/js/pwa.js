/* ============================================================
   El Anotador · PWA
   - Registra el service worker (raíz del sitio -> alcance total).
   - Captura beforeinstallprompt para ofrecer "Instalar".
   El botón de instalar vive en el drawer (shell.js) y también
   puede haber uno propio en cada página (id="btn-install").
   ============================================================ */
(function (global) {
  "use strict";

  let deferred = null;

  function swPath() {
    // El SW siempre está en la raíz para tener scope de todo el sitio.
    return Registry.base + "sw.js";
  }

  function refreshInstallButton() {
    const show = !!deferred;
    document
      .querySelectorAll("#shell-install-btn, #btn-install")
      .forEach((b) => {
        if (b.id === "shell-install-btn") b.classList.toggle("show", show);
        else b.hidden = !show;
      });
  }

  async function promptInstall() {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch (e) {}
    deferred = null;
    refreshInstallButton();
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
        .register(swPath(), { scope: Registry.base })
        .catch((err) => console.warn("[PWA] SW no registrado:", err));
    });
  }

  // Botón propio de página (si existe)
  document.addEventListener("DOMContentLoaded", () => {
    const own = document.getElementById("btn-install");
    if (own) own.addEventListener("click", promptInstall);
    refreshInstallButton();
  });

  global.PWA = { promptInstall, refreshInstallButton };
})(window);
