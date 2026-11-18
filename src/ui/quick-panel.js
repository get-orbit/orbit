/**
 * ORBIT Quick Panel.
 *
 * Displays and manages passages saved through the radial interface.
 * Data is stored locally with chrome.storage.local.
 */
(() => {
  if (window.ORBITQuickPanel) return;

  function create() {
    const host = document.createElement("div");
    host.setAttribute("data-orbit-panel-host", "");
    Object.assign(host.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647"
    });

    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; }
      .backdrop {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background: rgba(10, 11, 15, .58);
        color: #f2f0e9;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        animation: fade-in 140ms ease both;
      }
      .panel {
        width: min(560px, 100%);
        max-height: min(680px, 100%);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(242,240,233,.14);
        border-radius: 20px;
        background: #1b1d25;
        box-shadow: 0 24px 80px rgba(0,0,0,.48);
        animation: rise-in 160ms ease both;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 22px 24px 16px;
      }
      .eyebrow {
        margin: 0 0 5px;
        color: #a49eff;
        font-size: 9px;
        font-weight: 750;
        letter-spacing: .17em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        color: #f2f0e9;
        font-size: 21px;
        font-weight: 650;
        letter-spacing: -.035em;
      }
      .count {
        margin-top: 5px;
        color: rgba(242,240,233,.52);
        font-size: 11px;
      }
      button, input { font: inherit; }
      .close {
        width: 34px;
        height: 34px;
        border: 1px solid rgba(242,240,233,.14);
        border-radius: 50%;
        background: rgba(255,255,255,.04);
        color: #f2f0e9;
        cursor: pointer;
      }
      .close:hover, .close:focus-visible {
        border-color: #8b83ff;
        outline: 2px solid rgba(139,131,255,.35);
      }
      .search-wrap { padding: 0 24px 16px; }
      .search {
        width: 100%;
        padding: 11px 13px;
        border: 1px solid rgba(242,240,233,.13);
        border-radius: 10px;
        outline: none;
        background: #252732;
        color: #f2f0e9;
        font-size: 12px;
      }
      .search:focus { border-color: #8b83ff; }
      .search::placeholder { color: rgba(242,240,233,.38); }
      .list {
        min-height: 120px;
        overflow-y: auto;
        padding: 0 24px 22px;
      }
      .item {
        padding: 15px 0;
        border-top: 1px solid rgba(242,240,233,.09);
      }
      .item-title {
        margin: 0 0 6px;
        color: #f2f0e9;
        font-size: 12px;
        font-weight: 650;
      }
      .passage {
        margin: 0;
        color: rgba(242,240,233,.76);
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
        color: rgba(242,240,233,.42);
        font-size: 10px;
      }
      .actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
      .item-action {
        padding: 6px 10px;
        border: 1px solid rgba(242,240,233,.14);
        border-radius: 999px;
        background: rgba(255,255,255,.04);
        color: #e9e7df;
        font-size: 10px;
        cursor: pointer;
      }
      .item-action:hover, .item-action:focus-visible {
        border-color: #8b83ff;
        outline: none;
        background: rgba(139,131,255,.14);
      }
      .item-action.delete { color: #e7a4a4; }
      .empty {
        padding: 42px 12px;
        color: rgba(242,240,233,.58);
        text-align: center;
        font-size: 12px;
        line-height: 1.6;
      }
      .empty strong { display: block; margin-bottom: 6px; color: #f2f0e9; }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes rise-in { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @media (prefers-reduced-motion: reduce) {
        .backdrop, .panel { animation: none; }
      }
    `;

    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) close();
    });

    const panel = document.createElement("section");
    panel.className = "panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "orbit-panel-title");

    const header = document.createElement("header");
    header.className = "header";

    const headingGroup = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "ORBIT LIBRARY";

    const heading = document.createElement("h1");
    heading.id = "orbit-panel-title";
    heading.textContent = "Saved Passages";

    const count = document.createElement("div");
    count.className = "count";
    count.textContent = "Loading saved passages…";
    headingGroup.append(eyebrow, heading, count);

    const closeButton = document.createElement("button");
    closeButton.className = "close";
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Close saved passages");
    closeButton.addEventListener("click", close);
    header.append(headingGroup, closeButton);

    const searchWrap = document.createElement("div");
    searchWrap.className = "search-wrap";
    const search = document.createElement("input");
    search.className = "search";
    search.type = "search";
    search.placeholder = "Search saved passages…";
    search.setAttribute("aria-label", "Search saved passages");
    searchWrap.append(search);

    const list = document.createElement("div");
    list.className = "list";
    list.setAttribute("aria-live", "polite");

    panel.append(header, searchWrap, list);
    backdrop.append(panel);
    shadow.append(style, backdrop);
    document.documentElement.append(host);

    let passages = [];

    function formatDate(timestamp) {
      if (!timestamp) return "Date unavailable";
      return new Date(timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }

    function render() {
      list.replaceChildren();
      count.textContent = `${passages.length} saved ${passages.length === 1 ? "passage" : "passages"}`;

      const query = search.value.trim().toLowerCase();
      const filtered = passages
        .map((passage, index) => ({ passage, index }))
        .filter(({ passage }) =>
          !query ||
          String(passage.text || "").toLowerCase().includes(query) ||
          String(passage.title || "").toLowerCase().includes(query) ||
          String(passage.url || "").toLowerCase().includes(query)
        )
        .reverse();

      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        const strong = document.createElement("strong");
        strong.textContent = passages.length ? "No matching passages" : "Nothing saved yet";
        const detail = document.createElement("span");
        detail.textContent = passages.length
          ? "Try a different search."
          : "Select text on a webpage, open ORBIT, and choose Save.";
        empty.append(strong, detail);
        list.append(empty);
        return;
      }

      for (const { passage, index } of filtered) {
        const item = document.createElement("article");
        item.className = "item";

        const title = document.createElement("h2");
        title.className = "item-title";
        title.textContent = passage.title || "Untitled page";

        const text = document.createElement("p");
        text.className = "passage";
        text.textContent = passage.text || "";

        const meta = document.createElement("div");
        meta.className = "meta";
        const date = document.createElement("span");
        date.textContent = formatDate(passage.savedAt);
        const source = document.createElement("span");
        source.textContent = passage.url || "Source unavailable";
        meta.append(date, source);

        const actions = document.createElement("div");
        actions.className = "actions";

        const copyButton = makeAction("Copy", async () => {
          await navigator.clipboard.writeText(passage.text || "");
          copyButton.textContent = "Copied";
        });

        const openButton = makeAction("Open source", () => {
          chrome.runtime.sendMessage({
            type: "ORBIT_OPEN_URL",
            url: passage.url
          });
        });

        const deleteButton = makeAction("Delete", async () => {
          const current = await chrome.storage.local.get("savedPassages");
          const stored = Array.isArray(current.savedPassages) ? current.savedPassages : [];
          const matchIndex = stored.findIndex((entry) =>
            entry.text === passage.text &&
            entry.url === passage.url &&
            entry.savedAt === passage.savedAt
          );
          if (matchIndex !== -1) stored.splice(matchIndex, 1);
          await chrome.storage.local.set({ savedPassages: stored });
          passages = stored;
          render();
        });
        deleteButton.classList.add("delete");

        actions.append(copyButton, openButton, deleteButton);
        item.append(title, text, meta, actions);
        list.append(item);
      }
    }

    function makeAction(label, callback) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "item-action";
      button.textContent = label;
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await callback();
        } catch {
          button.textContent = "Failed";
        } finally {
          button.disabled = false;
        }
      });
      return button;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    function close() {
      document.removeEventListener("keydown", onKeyDown, true);
      host.remove();
    }

    search.addEventListener("input", render);
    document.addEventListener("keydown", onKeyDown, true);

    chrome.storage.local.get("savedPassages").then((result) => {
      passages = Array.isArray(result.savedPassages) ? result.savedPassages : [];
      render();
    }).catch(() => {
      count.textContent = "Unable to load saved passages";
      list.textContent = "ORBIT could not access local storage.";
    });

    closeButton.focus({ preventScroll: true });
    return { close };
  }

  window.ORBITQuickPanel = { create };
})();
