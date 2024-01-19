var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10 * 1000;
var executedTabs = {};
var isActive = true;  

function keepTeamsActive() {
  if (!isActive) return; 

  chrome.tabs.query({}, function (tabs) {
    const teamsTabs = tabs.filter(tab => tab.url && tab.url.includes('teams.microsoft.com'));

    if (teamsTabs.length) {
      teamsTabs.forEach(tab => {
        if (!executedTabs[tab.id]) {
          executedTabs[tab.id] = true;

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }).then(() => {
            chrome.tabs.sendMessage(tab.id, { action: 'simulateActivity' });
          }).catch(error => {
            console.error(`Error executing script on tab ${tab.id}:`, error);
            executedTabs[tab.id] = false;
          });
        }
      });

      if (!intervalId) {
        intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        executedTabs = {};
      }
    }
  });
}

function toggleActiveState() {
  isActive = !isActive;
  if (!isActive && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    executedTabs = {};
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




