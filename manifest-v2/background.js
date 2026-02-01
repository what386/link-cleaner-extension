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

browser.browserAction.onClicked.addListener(function(tab) {
  const cleaned = cleanLink(tab.url);
  browser.tabs.update(tab.id, { url: cleaned }).catch(err => {
    console.error("Failed to update tab:", err);
  });
});
