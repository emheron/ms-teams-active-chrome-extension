var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10000; // 10 seconds in milliseconds

// Initialize or retrieve the active state from storage
function initializeActiveState() {
    chrome.storage.local.get({isActive: true}, function(result) {
        isActive = result.isActive;
        manageActivitySimulationInterval(isActive);
        findAndInjectScripts();
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({isActive: true}, initializeActiveState); // Ensure isActive is true on install
});
chrome.runtime.onStartup.addListener(initializeActiveState);

// Inject content script into open Microsoft Teams tabs
function findAndInjectScripts() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            if (tab.url && (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com"))) {
                injectContentScript(tab.id);
            }
        });
    });
}

function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ["content.js"]
    }).catch((error) => {
        console.error(`Failed to inject content script into tab ${tabId}: ${error.message}`);
    });
}

function keepTeamsActive() {
    chrome.storage.local.get('isActive', function(data) {
        if (data.isActive) {
            chrome.tabs.query({url: ["*://*.teams.microsoft.com/*", "*://*.teams.live.com/*"]}, (tabs) => {
                tabs.forEach(tab => injectContentScript(tab.id));
            });
        }
    });
}

function manageActivitySimulationInterval(shouldStart) {
    if (shouldStart && !intervalId) {
        intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
    } else if (!shouldStart && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function toggleActiveState(callback) {
    chrome.storage.local.get('isActive', function(data) {
        const newIsActive = !data.isActive;
        chrome.storage.local.set({isActive: newIsActive}, () => {
            manageActivitySimulationInterval(newIsActive);
            if (newIsActive) findAndInjectScripts(); // Re-inject scripts if toggled back on
            if (callback) callback(newIsActive);
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleActiveState') {
        toggleActiveState((newIsActive) => {
            sendResponse({isActive: newIsActive});
        });
        return true; // indicates you wish to send a response asynchronously
    } else if (request.action === 'getStatus') {
        chrome.storage.local.get('isActive', function(data) {
            sendResponse({isActive: data.isActive});
        });
        return true; // indicates you wish to send a response asynchronously
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com"))) {
        injectContentScript(tabId);
    }
});
