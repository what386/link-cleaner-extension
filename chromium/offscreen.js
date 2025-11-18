chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'copy-to-clipboard') {
    navigator.clipboard.writeText(message.text).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep message channel open for async response
  }
});
