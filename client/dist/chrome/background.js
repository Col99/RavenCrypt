chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({'url': chrome.extension.getURL('data/index.html')}, function(tab) {
        // Tab opened.
    });
});