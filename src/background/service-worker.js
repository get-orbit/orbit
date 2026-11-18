/**
 * ORBIT background service worker.
 *
 * Relays the keyboard command to the active tab. The content script owns
 * context detection and presentation; the service worker does not inspect
 * page content.
 */
console.log("ORBIT service worker loaded");
chrome.commands.onCommand.addListener(async (command) => {
  console.log("ORBIT command received:", command);
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


/**
 * Opens a saved source URL in a new tab.
 * Only normal web pages are accepted.
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "ORBIT_OPEN_URL") return;

  try {
    const url = new URL(message.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") return;

    chrome.tabs.create({ url: url.toString() });
  } catch {
    // Ignore missing or invalid URLs.
  }
});
