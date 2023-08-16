var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10 * 1000;

var executedTabs = {};

function keepTeamsActive() {

  //console.log('keepTeamsActive() called.');

  chrome.tabs.query({}, function (tabs) {
    const teamsTabs = tabs.filter(tab => tab.url && tab.url.includes('teams.microsoft.com'));

   // console.log('Number of Teams tabs detected:', teamsTabs.length);

    if (teamsTabs.length) {
      teamsTabs.forEach(tab => {
        if (!executedTabs[tab.id]) {
          executedTabs[tab.id] = true;

         // console.log('Executing on tab:', tab.id);

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }).then(() => {
            chrome.tabs.sendMessage(tab.id, { action: 'simulateActivity' });
          }).catch(error => {
            console.error('Error executing script:', error);
      
            executedTabs[tab.id] = false;
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
