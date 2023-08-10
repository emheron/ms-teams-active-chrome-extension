var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 1 * 60 * 1000; 

function keepTeamsActive() {
  chrome.tabs.query({ url: '*://teams.microsoft.com/*', active: true }, function(tabs) {
    if (tabs.length) {
      tabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: simulateUserActivity,
          args: []
        }).catch(error => {
          console.error('Error executing script:', error);
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
    
    // Simulate Click
    body.click();

    // Simulate Mouse Movement
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: Math.random() * window.innerWidth,
        clientY: Math.random() * window.innerHeight
    });
    body.dispatchEvent(mouseEvent);

    // Simulate Scrolling
    window.scrollBy(0, Math.random() * 100 - 50); // Scrolls up or down by a random amount
}

keepTeamsActive();
