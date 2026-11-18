/**
 * ORBIT radial interface.
 *
 * The menu is mounted in a Shadow DOM so ordinary webpage styles do not
 * leak into ORBIT and page styles cannot easily alter its controls.
 */
(() => {
  if (window.ORBITRadial) return;

  function create({ x, y, actions, onClose }) {
    const host = document.createElement("div");
    host.setAttribute("data-orbit-host", "");
    Object.assign(host.style, {
      position: "fixed",
      left: "0",
      top: "0",
      zIndex: "2147483647",
      pointerEvents: "none"
    });

    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .menu {
        position: fixed;
        width: 196px;
        height: 196px;
        transform: translate(-50%, -50%) scale(.94);
        opacity: 0;
        transition: opacity 140ms ease, transform 140ms ease;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        color: #f2f0e9;
        pointer-events: none;
      }
      .menu.ready { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      .ring {
        position: absolute;
        inset: 0;
        border: 1px solid rgba(242,240,233,.16);
        border-radius: 50%;
        background: rgba(23,25,31,.96);
        box-shadow: 0 12px 42px rgba(0,0,0,.32);
        backdrop-filter: blur(14px);
        pointer-events: auto;
      }
      .center {
        position: absolute;
        left: 50%; top: 50%;
        width: 66px; height: 66px;
        transform: translate(-50%,-50%);
        display: grid; place-items: center;
        border-radius: 50%;
        border: 1px solid rgba(139,131,255,.48);
        color: #f2f0e9;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .16em;
        pointer-events: none;
      }
      button {
        position: absolute;
        left: 50%; top: 17px;
        transform: translateX(-50%);
        border: 1px solid rgba(139,131,255,.6);
        border-radius: 999px;
        padding: 10px 17px;
        background: #8b83ff;
        color: #17191f;
        font: 600 13px/1 ui-sans-serif, system-ui, sans-serif;
        cursor: pointer;
        pointer-events: auto;
      }
      button:hover, button:focus-visible {
        background: #a49eff;
        outline: 2px solid #f2f0e9;
        outline-offset: 3px;
      }
      button:disabled { opacity: .65; cursor: wait; }
      .hint {
        position: absolute;
        bottom: 16px; left: 0; right: 0;
        text-align: center;
        color: rgba(242,240,233,.68);
        font-size: 9px;
        letter-spacing: .04em;
        pointer-events: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .menu { transition: none; }
      }
    `;

    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-label", "ORBIT actions");

    const ring = document.createElement("div");
    ring.className = "ring";

    const center = document.createElement("div");
    center.className = "center";
    center.textContent = "ORBIT";

    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "ESC TO CLOSE";

    menu.append(ring, center, hint);

    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label;
      button.setAttribute("aria-label", action.description || action.label);
      button.addEventListener("click", async () => {
        button.disabled = true;
        hint.textContent = "WORKING";
        try {
          const result = await action.run();
          hint.textContent = result || "DONE";
          window.setTimeout(close, 500);
        } catch {
          hint.textContent = "COULD NOT COMPLETE";
          button.disabled = false;
        }
      });
      menu.append(button);
    });

    shadow.append(style, menu);
    document.documentElement.append(host);

    const left = Math.max(104, Math.min(window.innerWidth - 104, x));
    const top = Math.max(104, Math.min(window.innerHeight - 104, y));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    }

    function close() {
      document.removeEventListener("keydown", onKeyDown, true);
      host.remove();
      onClose?.();
    }

    document.addEventListener("keydown", onKeyDown, true);
    requestAnimationFrame(() => {
      menu.classList.add("ready");
      menu.querySelector("button")?.focus({ preventScroll: true });
    });

    return { close };
  }

  window.ORBITRadial = { create };
})();