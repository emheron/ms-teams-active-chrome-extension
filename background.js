var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10 * 1000;

var executedTabs = {};

function keepTeamsActive() {

  chrome.tabs.query({}, function(tabs) {
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
            console.error('Error executing script:', error);
          });
        }
      });

      if (!intervalId) {
        intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
      }
    } else {
      if (intervalId) {
        console.log('Clearing interval.');
        clearInterval(intervalId);
        intervalId = null;
        executedTabs = {}; 
    }
  }
  });
}

keepTeamsActive();
