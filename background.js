var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10000; // 10 seconds in milliseconds
var isActive = false; // Define isActive globally to ensure it's accessible throughout the script

// Initialize or retrieve the active state from storage
function initializeActiveState() {
    chrome.storage.local.get({isActive: true}, function(result) {
        isActive = result.isActive;
        manageActivitySimulationInterval(isActive);
        findAndInjectScripts();
    });
}

chrome.runtime.onInstalled.addListener(() => {
    isActive = true; // Explicitly set isActive to true upon installation
    chrome.storage.local.set({isActive: isActive}, initializeActiveState);
});
chrome.runtime.onStartup.addListener(initializeActiveState);

function findAndInjectScripts() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            if (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com")) {
                injectContentScript(tab.id);
            }
        });
    });
}

function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ["content.js"]
    }, () => {
        // Check if injection was successful before sending a message
        if (chrome.runtime.lastError) {
            console.error(`Failed to inject content script into tab ${tabId}: ${chrome.runtime.lastError.message}`);
            return;
        }
        sendMessageToTab(tabId, {action: "toggleActivity", isActive: isActive});
    });
}

function manageActivitySimulationInterval(shouldStart) {
    if (shouldStart && !intervalId) {
        // Assuming direct activity checks or other periodic tasks here
        intervalId = setInterval(() => {
            // Task to perform, e.g., checking tab conditions or updating state
            console.log("Periodic activity check or state update");
        }, KEEP_ACTIVE_INTERVAL);
    } else if (!shouldStart && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function toggleActiveState() {
    isActive = !isActive;
    chrome.storage.local.set({isActive: isActive}, () => {
        manageActivitySimulationInterval(isActive);
        // Notify all content scripts of the new state
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com")) {
                    sendMessageToTab(tab.id, {action: "toggleActivity", isActive: isActive});
                }
            });
        });
    });
}

function sendMessageToTab(tabId, message) {
    chrome.tabs.sendMessage(tabId, message, () => {
        if (chrome.runtime.lastError) {
            // Now only logging the error to avoid interrupting the flow
            console.log(`Error sending message to tab ${tabId}: ${chrome.runtime.lastError.message}`);
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleActiveState') {
        toggleActiveState();
        sendResponse({isActive: isActive});
    } else if (request.action === 'getStatus') {
        sendResponse({isActive: isActive});
    }
    return true; // Ensures asynchronous response handling
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && (tab.url.includes("teams.microsoft.com") || tab.url.includes("teams.live.com"))) {
        injectContentScript(tabId);
    }
});
