/**
 * ORBIT content entry point.
 *
 * Detects the current text selection and supplies context-specific actions
 * to the radial interface.
 */
(() => {
  if (window.__orbitInitialized) return;
  window.__orbitInitialized = true;

  let activeMenu = null;

  async function savePassage(text) {
    // 1. Retrieve existing passages
    const result = await chrome.storage.local.get("savedPassages");
  
    // 2. Make sure we have an array
    const passages = Array.isArray(result.savedPassages)
      ? result.savedPassages
      : [];
  
    // 3. Prevent duplicate saves
    const alreadySaved = passages.some((passage) =>
      passage.text === text && passage.url === window.location.href
    );
  
    if (alreadySaved) {
      return "ALREADY SAVED";
    }
  
    // 4. Create the new passage
    const passage = {
      text: text,
      url: window.location.href,
      title: document.title,
      savedAt: Date.now()
    };
  
    // 5. Add it to the collection
    passages.push(passage);
  
    // 6. Store the updated collection
    await chrome.storage.local.set({
      savedPassages: passages
    });
  
    return "PASSAGE SAVED";
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "ORBIT_OPEN") {
      openOrbit();
    }
  });

  function openOrbit() {
    if (activeMenu) {
      activeMenu.close();
      activeMenu = null;
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection?.toString();

    if (!selectedText?.trim() || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (!rect || (!rect.width && !rect.height)) return;

    activeMenu = window.ORBITRadial.create({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      contextLabel: "TEXT",
      actions: [
        {
          id: "copy-text",
          label: "Copy",
          description: "Copy the selected text",
          run: async () => {
            await navigator.clipboard.writeText(selectedText);
            return "COPIED";
          }
        },
        {
          id: "search-text",
          label: "Search",
          description: "Search the web for the selected text",
          run: async () => {
            const url = new URL("https://www.google.com/search");
            url.searchParams.set("q", selectedText);
            window.open(url.toString(), "_blank", "noopener");
            return "SEARCH OPENED";
          }
        },
        {
          id: "translate-text",
          label: "Translate",
          disabled: true,
          comingSoon: "TRANSLATE · COMING SOON"
        },
        {
          id: "save-text",
          label: "Save",
          description: "Save the selected passage locally",
          run: async () => {
            return await savePassage(selectedText);
          }
        },
        {
          id: "explain-text",
          label: "Explain",
          disabled: true,
          comingSoon: "EXPLAIN · COMING SOON"
        },
        {
          id: "define-text",
          label: "Define",
          disabled: true,
          comingSoon: "DEFINE · COMING SOON"
        },
        {
          id: "more",
          label: "More",
          description: "More actions",
          run: async () => {
            activeMenu?.close();
            window.ORBITQuickPanel.create();
            return "OPENING SAVED PASSAGES";
          }
        }
      ],
      onClose: () => {
        activeMenu = null;
      }
    });
  }
})();
