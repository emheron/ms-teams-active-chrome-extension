var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 5 * 60 * 1000; 
function keepTeamsActive() {
  chrome.tabs.query({ url: '*://teams.microsoft.com/*', active: true }, function(tabs) {
    if (tabs.length) {
      tabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: simulateUserActivity,
          args: []
        });
      });

      if (!intervalId) {
        intervalId = setInterval(keepTeamsActive, KEEP_ACTIVE_INTERVAL);
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  });
}

function simulateUserActivity() {
    const body = document.querySelector('body');
    
    body.click();

    const mouseEvent = new MouseEvent('mousemove', {
        clientX: Math.random() * window.innerWidth,
        clientY: Math.random() * window.innerHeight
    });
    body.dispatchEvent(mouseEvent);
}

keepTeamsActive();

