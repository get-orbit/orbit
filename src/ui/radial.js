/**
 * ORBIT radial interface.
 *
 * The menu is isolated in a closed Shadow DOM so page styles do not leak
 * into ORBIT. Actions are positioned around a central context indicator.
 */
(() => {
  if (window.ORBITRadial) return;

  const MENU_SIZE = 252;
  const ACTION_RADIUS = 94;

  function create({ x, y, contextLabel = "PAGE", actions, onClose }) {
    const host = document.createElement("div");
    host.setAttribute("data-orbit-host", "");
    Object.assign(host.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      pointerEvents: "none"
    });

    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; }
      .menu {
        position: fixed;
        width: ${MENU_SIZE}px;
        height: ${MENU_SIZE}px;
        transform: translate(-50%, -50%) scale(.94);
        opacity: 0;
        transition: opacity 150ms ease, transform 150ms ease;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        color: #f2f0e9;
        pointer-events: none;
      }
      .menu.ready { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      .ring {
        position: absolute;
        inset: 9px;
        border: 1px solid rgba(242,240,233,.13);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(35,37,47,.98), rgba(23,25,31,.97));
        box-shadow: 0 14px 46px rgba(0,0,0,.34), inset 0 0 28px rgba(139,131,255,.045);
        pointer-events: none;
      }
      .orbit-line {
        position: absolute;
        inset: 31px;
        border: 1px solid rgba(139,131,255,.17);
        border-radius: 50%;
        pointer-events: none;
      }
      .center {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 76px;
        height: 76px;
        transform: translate(-50%,-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        border-radius: 50%;
        border: 1px solid rgba(139,131,255,.58);
        background: rgba(23,25,31,.98);
        box-shadow: 0 0 22px rgba(139,131,255,.12);
        pointer-events: none;
      }
      .center-name {
        color: #f2f0e9;
        font-size: 11px;
        font-weight: 750;
        letter-spacing: .16em;
      }
      .context {
        color: #a49eff;
        font-size: 8px;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .action {
        position: absolute;
        width: 76px;
        min-height: 34px;
        transform: translate(-50%, -50%);
        border: 1px solid rgba(242,240,233,.17);
        border-radius: 999px;
        padding: 7px 8px;
        background: rgba(48,50,62,.98);
        color: #f2f0e9;
        font: 600 11px/1.1 Inter, ui-sans-serif, system-ui, sans-serif;
        cursor: pointer;
        pointer-events: auto;
        transition: background 110ms ease, border-color 110ms ease, transform 110ms ease, box-shadow 110ms ease;
      }
      .action:hover:not(:disabled),
      .action:focus-visible {
        background: #8b83ff;
        border-color: #b6b0ff;
        color: #17191f;
        outline: 2px solid rgba(242,240,233,.92);
        outline-offset: 3px;
        box-shadow: 0 4px 18px rgba(139,131,255,.24);
        z-index: 2;
      }
      .action:focus-visible { transform: translate(-50%, -50%) scale(1.06); }
      .action:disabled {
        color: rgba(242,240,233,.38);
        border-color: rgba(242,240,233,.08);
        background: rgba(40,42,51,.8);
        cursor: not-allowed;
      }
      .action.more {
        background: rgba(139,131,255,.16);
        border-color: rgba(139,131,255,.5);
        color: #c9c5ff;
      }
      .action.more:hover, .action.more:focus-visible {
        background: #8b83ff;
        color: #17191f;
      }
      .hint {
        position: absolute;
        left: 25px;
        right: 25px;
        bottom: 2px;
        min-height: 12px;
        text-align: center;
        color: rgba(242,240,233,.62);
        font-size: 9px;
        letter-spacing: .07em;
        text-transform: uppercase;
        pointer-events: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .menu, .action { transition: none; }
      }
    `;

    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-label", "ORBIT radial actions");

    const ring = document.createElement("div");
    ring.className = "ring";

    const orbitLine = document.createElement("div");
    orbitLine.className = "orbit-line";

    const center = document.createElement("div");
    center.className = "center";

    const centerName = document.createElement("span");
    centerName.className = "center-name";
    centerName.textContent = "ORBIT";

    const context = document.createElement("span");
    context.className = "context";
    context.textContent = contextLabel;

    center.append(centerName, context);

    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "ARROWS TO NAVIGATE · ENTER TO SELECT · ESC TO CLOSE";

    menu.append(ring, orbitLine, center, hint);

    const buttons = [];
    const count = actions.length;

    actions.forEach((action, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `action${action.id === "more" ? " more" : ""}`;
      button.textContent = action.label;
      button.disabled = Boolean(action.disabled);
      button.title = action.disabled ? (action.comingSoon || "Coming soon") : (action.description || action.label);
      button.setAttribute("aria-label", button.title === action.label ? action.label : `${action.label}. ${button.title}`);

      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / count);
      const centerPoint = MENU_SIZE / 2;
      button.style.left = `${centerPoint + Math.cos(angle) * ACTION_RADIUS}px`;
      button.style.top = `${centerPoint + Math.sin(angle) * ACTION_RADIUS}px`;

      button.addEventListener("mouseenter", () => {
        if (!button.disabled) hint.textContent = action.description || action.label;
        else hint.textContent = action.comingSoon || "COMING SOON";
      });

      button.addEventListener("focus", () => {
        hint.textContent = action.disabled
          ? (action.comingSoon || "COMING SOON")
          : (action.description || action.label);
      });

      button.addEventListener("click", async () => {
        if (button.disabled) return;

        if (action.id === "more") {
          hint.textContent = "MORE ACTIONS WILL APPEAR HERE";
          return;
        }

        button.disabled = true;
        hint.textContent = "WORKING";
        try {
          const result = await action.run();
          hint.textContent = result || "DONE";
          window.setTimeout(close, 550);
        } catch {
          hint.textContent = "COULD NOT COMPLETE";
          button.disabled = false;
          button.focus({ preventScroll: true });
        }
      });

      buttons.push(button);
      menu.append(button);
    });

    shadow.append(style, menu);
    document.documentElement.append(host);

    const half = MENU_SIZE / 2;
    const left = Math.max(half + 8, Math.min(window.innerWidth - half - 8, x));
    const top = Math.max(half + 8, Math.min(window.innerHeight - half - 8, y));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;

    function focusNext(currentIndex, direction) {
      const current = buttons[currentIndex];
      if (!current) return;

      const currentX = current.offsetLeft - half;
      const currentY = current.offsetTop - half;
      const candidates = buttons
        .map((button, index) => {
          if (button.disabled || index === currentIndex) return null;
          const dx = button.offsetLeft - half - currentX;
          const dy = button.offsetTop - half - currentY;
          const length = Math.hypot(dx, dy) || 1;
          const alignment = (dx * direction.x + dy * direction.y) / length;
          return { button, alignment };
        })
        .filter(Boolean)
        .filter((candidate) => candidate.alignment > 0.15)
        .sort((a, b) => b.alignment - a.alignment);

      if (candidates.length) candidates[0].button.focus({ preventScroll: true });
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }

      const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      if (directions[event.key]) {
        event.preventDefault();
        event.stopPropagation();
        const currentIndex = buttons.indexOf(shadow.activeElement);
        focusNext(currentIndex, directions[event.key]);
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
      buttons.find((button) => !button.disabled)?.focus({ preventScroll: true });
    });

    return { close };
  }

  window.ORBITRadial = { create };
})();