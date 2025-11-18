browser.contextMenus.create({
  id: "clean-link",
  title: "Copy Clean Link",
  contexts: ["link"]
});

// Handle menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clean-link") {
    const cleaned = cleanLink(info.linkUrl);

    navigator.clipboard.writeText(cleaned).then(() => {
      browser.notifications.create({
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

// Handle extension button
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const url = currentTab.url;

    const cleaned = cleanLink(url);

    chrome.tabs.update(currentTab.id, {
      url: cleaned
    });
  });
});
