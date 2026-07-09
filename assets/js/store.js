/* ============================================================
   El Anotador · Store
   "Base de datos" del dispositivo. Persiste en localStorage
   (sobrevive a cerrar la app / apagar el celu), con espacios de
   nombre por app y versionado de esquema.

   Uso:
     const db = Store.namespace("podrido", 1);
     db.set("partida", {...});
     const p = db.get("partida", fallback);
     db.remove("partida");
     db.subscribe("partida", val => ...);   // reacciona a cambios
   ============================================================ */
(function (global) {
  "use strict";

  const ROOT = "anotador"; // prefijo global de todas las claves
  const hasLS = (() => {
    try {
      const k = "__anotador_probe__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  })();

  // Respaldo en memoria por si el navegador bloquea localStorage
  // (modo privado viejo, etc.). No persiste, pero no rompe.
  const memory = new Map();

  function rawGet(key) {
    if (hasLS) return localStorage.getItem(key);
    return memory.has(key) ? memory.get(key) : null;
  }
  function rawSet(key, str) {
    if (hasLS) {
      try { localStorage.setItem(key, str); return true; }
      catch (e) { console.warn("[Store] no se pudo guardar", key, e); return false; }
    }
    memory.set(key, str);
    return true;
  }
  function rawDel(key) {
    if (hasLS) localStorage.removeItem(key);
    else memory.delete(key);
  }

  const listeners = new Map(); // fullKey -> Set<fn>

  function notify(fullKey, value) {
    const set = listeners.get(fullKey);
    if (set) set.forEach((fn) => { try { fn(value); } catch (e) { console.error(e); } });
  }

  // Sincroniza entre pestañas / apps abiertas del ecosistema.
  if (hasLS) {
    global.addEventListener("storage", (e) => {
      if (!e.key || !e.key.startsWith(ROOT + ":")) return;
      let val = null;
      try { val = e.newValue == null ? null : JSON.parse(e.newValue).d; } catch (_) {}
      notify(e.key, val);
    });
  }

  function namespace(name, version) {
    version = version || 1;
    const prefix = `${ROOT}:${name}:`;

    function fullKey(key) { return prefix + key; }

    function get(key, fallback) {
      const raw = rawGet(fullKey(key));
      if (raw == null) return fallback === undefined ? null : fallback;
      try {
        const parsed = JSON.parse(raw);
        // Migración simple por versión: si cambió el esquema, descartamos.
        if (parsed.v !== version) return fallback === undefined ? null : fallback;
        return parsed.d;
      } catch (e) {
        return fallback === undefined ? null : fallback;
      }
    }

    function set(key, value) {
      const ok = rawSet(fullKey(key), JSON.stringify({ v: version, d: value }));
      if (ok) notify(fullKey(key), value);
      return ok;
    }

    function remove(key) {
      rawDel(fullKey(key));
      notify(fullKey(key), null);
    }

    // Devuelve una función para cancelar la suscripción.
    function subscribe(key, fn) {
      const fk = fullKey(key);
      if (!listeners.has(fk)) listeners.set(fk, new Set());
      listeners.get(fk).add(fn);
      return () => listeners.get(fk) && listeners.get(fk).delete(fn);
    }

    return { get, set, remove, subscribe, version, name };
  }

  global.Store = { namespace, ROOT, persistent: hasLS };
})(window);
