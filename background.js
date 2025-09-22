// Create right-click menu item
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
        iconUrl: "icons/icon.png",
        title: "Link cleaned & copied!",
        message: cleaned
      });
    }).catch(err => {
      console.error("Clipboard write failed:", err);
    });
  }
});
