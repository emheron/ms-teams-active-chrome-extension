var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 30 * 1000; // 30 seconds

function keepTeamsActive() {
  console.log('Checking for Microsoft Teams tabs...');

  chrome.tabs.query({ url: ['*://teams.microsoft.com/*', '*://*.teams.microsoft.com/*'], active: true }, function(tabs) {
    if (tabs.length) {
      console.log(`Found ${tabs.length} Microsoft Teams tabs. Simulating user activity...`);
      tabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: simulateUserActivity,
          args: []
        }).then(() => {
          console.log('User activity simulation successful.');
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

function simulateUserActivity() {
    const body = document.querySelector('body');

    // Simulate Click
    console.log('Simulating click...');
    body.click();

    // Simulate Mouse Movement
    console.log('Simulating mouse movement...');
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: Math.random() * window.innerWidth,
        clientY: Math.random() * window.innerHeight
    });
    body.dispatchEvent(mouseEvent);

    // Simulate Scrolling
    console.log('Simulating scrolling...');
    window.scrollBy(0, Math.random() * 100 - 50); // Scrolls up or down by a random amount

    // Simulate Keyboard Event
    console.log('Simulating keyboard event...');
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
    });
    body.dispatchEvent(keyboardEvent);
}

keepTeamsActive();
