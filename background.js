var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10 * 1000; // 10 seconds
var executedTabs = new Set(); // Efficient tab ID management
var isActive; // Initialized dynamically based on storage or default.

console.log("Background script loading...");

function logDetailed(message) {
    console.log(message); // Enhanced logging for debugging
}

function keepTeamsActive() {
    if (!isActive) {
        console.log("Extension is inactive. Halting activity simulation.");
        return;
    }
    logDetailed("Checking for Microsoft Teams tabs to keep active...");

    chrome.tabs.query({}, function(tabs) {
        const teamsTabs = tabs.filter(tab => 
            tab.url.includes("teams.microsoft.com") || 
            tab.url.includes("teams.live.com")
        );

        if (teamsTabs.length === 0) {
            logDetailed("No Microsoft Teams tabs found at this time.");
            return;
        }

        teamsTabs.forEach(tab => {
            logDetailed(`Ensuring activity on Microsoft Teams tab: ${tab.id}`);
            // Using sendMessage to trigger activity, with error handling
            chrome.tabs.sendMessage(tab.id, { action: 'simulateActivity' }, response => {
                if (chrome.runtime.lastError) {
                    console.warn(`Error sending message to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                    // Consider re-injecting content script here if necessary
                } else if (response && response.success) {
                    logDetailed(`Activity simulation triggered on Tab ${tab.id}.`);
                }
            });
        });
    });
}

function initializeActiveState() {
    chrome.storage.local.get(['isActive'], function(result) {
        isActive = result.isActive !== undefined ? result.isActive : true;
        console.log(`Extension active state initialized to: ${isActive}.`);
        if (isActive) {
            manageActivitySimulationInterval(true);
        }
    });
}

function manageActivitySimulationInterval(start) {
    if (start) {
        if (!intervalId) {
            intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
            logDetailed("Keep-alive interval started for Microsoft Teams tabs.");
        }
    } else {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            logDetailed("Keep-alive interval stopped.");
        }
    }
}

function toggleActiveState() {
    isActive = !isActive;
    chrome.storage.local.set({isActive: isActive}, function() {
        console.log(`Extension state toggled to: ${isActive ? 'ACTIVE' : 'INACTIVE'}.`);
    });
    manageActivitySimulationInterval(isActive);
}

chrome.runtime.onInstalled.addListener(initializeActiveState);
chrome.runtime.onStartup.addListener(initializeActiveState);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStatus' || request.action === 'toggleActiveState') {
        if (request.action === 'toggleActiveState') {
            toggleActiveState();
        }
        sendResponse({isActive: isActive});
    }
});

chrome.action.onClicked.addListener((tab) => {
    console.log(`Manual trigger for activity check on tab ${tab.id}.`);
    keepTeamsActive();
});
