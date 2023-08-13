var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10 * 1000; // 10 seconds

function keepTeamsActive() {
  console.log('Starting check for Microsoft Teams tabs...');

  chrome.tabs.query({}, function(tabs) {
    const teamsTabs = tabs.filter(tab => tab.url && tab.url.includes('teams.microsoft.com'));

    if (teamsTabs.length) {
      console.log(`Found ${teamsTabs.length} Microsoft Teams tabs. Starting simulation of user activity...`);
      teamsTabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }).then(() => {
          console.log(`User activity simulation successful for tab: ${tab.url}`);
        }).catch(error => {
          console.error('Error executing script:', error);
        });
      });

      if (!intervalId) {
        console.log('Starting interval to keep Teams active.');
        intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
      }
    } else {
      console.log('No Microsoft Teams tabs found.');
      if (intervalId) {
        console.log('Clearing interval.');
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  });
}

keepTeamsActive();
