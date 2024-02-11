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
    // Set isActive to true on install and then initialize
    chrome.storage.local.set({isActive: true}, initializeActiveState);
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

// Conditionally activates or deactivates the Teams activity based on isActive state
function keepTeamsActive() {
    chrome.storage.local.get('isActive', function(data) {
        if (data.isActive) {
            chrome.tabs.query({url: ["*://*.teams.microsoft.com/*", "*://*.teams.live.com/*"]}, (tabs) => {
                tabs.forEach(tab => injectContentScript(tab.id));
            });
        }
    });
}

// Manages the interval for simulating activity based on the extension's active state
function manageActivitySimulationInterval(shouldStart) {
    if (shouldStart && !intervalId) {
        intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
    } else if (!shouldStart && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// Toggles the active state of the extension and updates the activity simulation accordingly
function toggleActiveState(callback) {
    chrome.storage.local.get('isActive', function(data) {
        const newIsActive = !data.isActive;
        chrome.storage.local.set({isActive: newIsActive}, () => {
            manageActivitySimulationInterval(newIsActive);
            if (newIsActive) {
                findAndInjectScripts(); // Re-inject scripts if toggled back on
            }
            if (callback) callback(newIsActive);
        });
    });
}

// Listens for messages from the popup or other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleActiveState') {
        toggleActiveState((newIsActive) => {
            sendResponse({isActive: newIsActive});
        });
        return true; // Indicates an asynchronous response will be sent
    } else if (request.action === 'getStatus') {
        chrome.storage.local.get('isActive', function(data) {
            sendResponse({isActive: data.isActive});
        });
        return true; // Indicates an asynchronous response will be sent
    }
});

// Re-injects the content script into tabs when they are fully loaded, if the extension is active
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com"))) {
        injectContentScript(tabId);
    }
});
