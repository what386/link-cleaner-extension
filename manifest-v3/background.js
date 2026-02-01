// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "clean-link",
    title: "Copy Clean Link",
    contexts: ["link"]
  });
});

// Handle menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clean-link") {
    const cleaned = cleanLink(info.linkUrl);

    // Use offscreen document for clipboard access
    writeToClipboard(cleaned).then(() => {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-32.png",
        title: "Link cleaned & copied!",
        message: cleaned
      });
    }).catch(err => {
      console.error("Clipboard write failed:", err);
    });
  }
});

// Handle extension button (action replaces browserAction)
chrome.action.onClicked.addListener((tab) => {
  const cleaned = cleanLink(tab.url);
  chrome.tabs.update(tab.id, {
    url: cleaned
  });
});

// Clipboard helper using offscreen document
async function writeToClipboard(text) {
  await setupOffscreenDocument();

  // Send message to offscreen document to write to clipboard
  await chrome.runtime.sendMessage({
    type: 'copy-to-clipboard',
    text: text
  });
}

async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });

  if (existingContexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Write cleaned link to clipboard'
  });
}
