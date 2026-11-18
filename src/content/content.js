/**
 * ORBIT content entry point.
 *
 * Detects the current text selection and delegates rendering and command
 * execution to the radial interface.
 */
(() => {
  if (window.__orbitInitialized) return;
  window.__orbitInitialized = true;

  let activeMenu = null;

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
      actions: [
        {
          id: "copy-text",
          label: "Copy",
          description: "Copy selected text",
          run: async () => {
            await navigator.clipboard.writeText(selectedText);
            return "COPIED";
          }
        }
      ],
      onClose: () => {
        activeMenu = null;
      }
    });
  }
})();