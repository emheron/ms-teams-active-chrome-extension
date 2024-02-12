var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10000; // 10 seconds in milliseconds
var isActive = false; // Globally defined to track the active state

// Initialize or retrieve the active state from storage and manage accordingly
function initializeActiveState() {
    chrome.storage.local.get({isActive: true}, function(result) {
        isActive = result.isActive;
        console.log(`Extension active state on initialization: ${isActive}`);
        manageActivitySimulationInterval(isActive);
        findAndInjectScripts();
    });
}

chrome.runtime.onInstalled.addListener(() => {
    isActive = true; // Set to true upon installation
    chrome.storage.local.set({isActive: isActive}, () => {
        console.log("Extension installed and activated.");
        initializeActiveState();
    });
});
chrome.runtime.onStartup.addListener(initializeActiveState);

// Find and inject content scripts into applicable tabs
function findAndInjectScripts() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com")) {
                injectContentScript(tab.id);
            }
        });
    });
}

// Inject content script into a given tab
function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ["content.js"]
    }).then(() => {
        sendMessageToTab(tabId, {action: "toggleActivity", isActive: isActive});
    }).catch(error => {
        console.error(`Failed to inject content script into tab ${tabId}. Error: ${error.message}`);
    });
}

// Manage periodic tasks or checks based on the extension's active state
function manageActivitySimulationInterval(shouldStart) {
    if (shouldStart && !intervalId) {
        intervalId = setInterval(() => {
            // Placeholder for any periodic checks or updates based on active state
        }, KEEP_ACTIVE_INTERVAL);
    } else if (!shouldStart && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// Toggle the active state and update content scripts
function toggleActiveState() {
    isActive = !isActive;
    chrome.storage.local.set({isActive: isActive}, () => {
        console.log(`Extension active state toggled to: ${isActive}`);
        manageActivitySimulationInterval(isActive);
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com")) {
                    sendMessageToTab(tab.id, {action: "toggleActivity", isActive: isActive});
                }
            });
        });
    });
}

// Send a message to a tab, logging errors if message sending fails
function sendMessageToTab(tabId, message) {
    chrome.tabs.sendMessage(tabId, message, () => {
        if (chrome.runtime.lastError) {
            console.error(`Error sending message to tab ${tabId}: ${chrome.runtime.lastError.message}`);
        }
    });
}

// Handle messages from popup or other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleActiveState') {
        toggleActiveState();
        sendResponse({isActive: isActive});
    } else if (request.action === 'getStatus') {
        sendResponse({isActive: isActive});
    }
    return true; // Indicates asynchronous response
});

// Re-inject content scripts upon tab update to ensure it's always active
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com"))) {
        injectContentScript(tabId);
    }
});
