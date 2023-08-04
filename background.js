var intervalId = null;

function keepTeamsActive() {
  chrome.tabs.query({ url: '*://teams.microsoft.com/*' }, function(tabs) {
    if(tabs.length){
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
            document.querySelector('body').click();
        }
      });
      
      if (!intervalId) {
        intervalId = setInterval(keepTeamsActive, Math.random() * 60000);
      }
    } else {

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  });
}


keepTeamsActive();

