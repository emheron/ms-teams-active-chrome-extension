var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10 * 1000;
var executedTabs = {};
var isActive = true;  

function keepTeamsActive() {
  console.log("keepTeamsActive function started.");
  if (!isActive) {
    console.log("Extension is not active.");
    return;
  } 

  chrome.tabs.query({}, function (tabs) {
    const teamsTabs = tabs.filter(tab => tab.url && tab.url.includes('teams.microsoft.com'));
    console.log("Teams tabs found:", teamsTabs.length);

    if (teamsTabs.length) {
      teamsTabs.forEach(tab => {
        console.log(`Processing tab: ${tab.id}`);
        if (!executedTabs[tab.id]) {
          executedTabs[tab.id] = true;

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }).then(() => {
            console.log(`Script executed on tab ${tab.id}`);
            chrome.tabs.sendMessage(tab.id, { action: 'simulateActivity' });
          }).catch(error => {
            console.error(`Error executing script on tab ${tab.id}:`, error);
            executedTabs[tab.id] = false;
          });
        } else {
          console.log(`Tab ${tab.id} already had script executed.`);
        }
      });

      if (!intervalId) {
        intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
        console.log("Interval set for keepTeamsActive function.");
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        executedTabs = {};
        console.log("Interval cleared for keepTeamsActive function.");
      }
    }
  });
  console.log("keepTeamsActive function ended.");
}

function toggleActiveState() {
  console.log("toggleActiveState function called.");
  isActive = !isActive;
  console.log(`Extension active state changed to: ${isActive}`);
  if (!isActive && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    executedTabs = {};
    console.log("Extension deactivated and interval cleared.");
  } else if (isActive) {
    keepTeamsActive();
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getStatus') {
    sendResponse({ isActive: isActive });
  } else if (request.action === 'toggleActiveState') {
    toggleActiveState();
    sendResponse({ isActive: isActive });
  }
  return true;  
});