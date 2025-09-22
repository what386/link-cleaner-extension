importScripts('cleaner.js');

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "clean-link",
        title: "Copy Clean Link",
        contexts: ["link"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "clean-link") {
        const cleaned = cleanLink(info.linkUrl);

        navigator.clipboard.writeText(cleaned).then(() => {
            chrome.notifications.create({
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
