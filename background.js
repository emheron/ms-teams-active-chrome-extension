var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10000; // 10 seconds in milliseconds
var isActive; // Dynamically set based on storage or default to true.

console.log("Background script loading...");

// Initialize or retrieve the active state from storage
function initializeActiveState() {
    chrome.storage.local.get({isActive: true}, function(result) {
        isActive = result.isActive;
        manageActivitySimulationInterval(isActive);
        findAndInjectScripts();
    });
}

chrome.runtime.onInstalled.addListener(initializeActiveState);
chrome.runtime.onStartup.addListener(initializeActiveState);

function logDetailed(message) {
    console.log(message);
}

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
    }).then(() => {
        logDetailed(`Content script injected into tab ${tabId}.`);
    }).catch((error) => {
        console.error(`Failed to inject content script into tab ${tabId}: ${error.message}`);
    });
}

function keepTeamsActive() {
    if (!isActive) return;
    chrome.tabs.query({url: ["*://*.teams.microsoft.com/*", "*://*.teams.live.com/*"]}, (tabs) => {
        if (tabs.length === 0) logDetailed("No Microsoft Teams tabs found.");
        tabs.forEach(tab => injectContentScript(tab.id));
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

function toggleActiveState() {
    isActive = !isActive;
    chrome.storage.local.set({isActive: isActive}, () => {
        console.log(`Extension state toggled to: ${isActive ? 'ACTIVE' : 'INACTIVE'}.`);
        manageActivitySimulationInterval(isActive);
        if (isActive) findAndInjectScripts(); // Re-inject scripts if toggled back on
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleActiveState') {
        toggleActiveState();
        sendResponse({isActive: isActive});
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com"))) {
        injectContentScript(tabId);
    }
});
