/**
 * ORBIT background service worker.
 *
 * Relays the keyboard command to the active tab. The content script owns
 * context detection and presentation; the service worker does not inspect
 * page content.
 */
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "open-orbit") return;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    if (!tab?.id) return;

    await chrome.tabs.sendMessage(tab.id, {
      type: "ORBIT_OPEN"
    });
  } catch {
    // Restricted browser pages and tabs without the content script are
    // expected to reject messages. The page itself remains unaffected.
  }
});