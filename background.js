var intervalId = null;
const KEEP_ACTIVE_INTERVAL = 10 * 1000; // 10 seconds

function keepTeamsActive() {
  console.log('Starting check for Microsoft Teams tabs...');

  chrome.tabs.query({}, function(tabs) {
    const teamsTabs = tabs.filter(tab => tab.url && tab.url.includes('teams.microsoft.com'));

    if (teamsTabs.length) {
      console.log(`Found ${teamsTabs.length} Microsoft Teams tabs. Starting simulation of user activity...`);
      teamsTabs.forEach(tab => {
        console.log(`Simulating user activity for tab: ${tab.url}`);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: simulateUserActivity,
          args: []
        }).then(() => {
          console.log(`User activity simulation successful for tab: ${tab.url}`);
        }).catch(error => {
          console.error(`Error executing script for tab: ${tab.url}`, error);
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
  if (!body) {
    console.error('Body element not found.');
    return;
  }

  // Additional logging for each simulation
  // Simulate Click
  console.log('Simulating click...');
  body.click();
  console.log('Click simulation complete.');

  // Simulate Mouse Movement
  console.log('Simulating mouse movement...');
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: Math.random() * window.innerWidth,
    clientY: Math.random() * window.innerHeight
  });
  body.dispatchEvent(mouseEvent);
  console.log('Mouse movement simulation complete.');

  // Simulate Scrolling
  console.log('Simulating scrolling...');
  window.scrollBy(0, Math.random() * 100 - 50); // Scrolls up or down by a random amount
  console.log('Scrolling simulation complete.');

  // Simulate Keyboard Event
  console.log('Simulating keyboard event...');
  const keyboardEvent = new KeyboardEvent('keydown', {
    key: ' ',
    code: 'Space',
  });
  body.dispatchEvent(keyboardEvent);
  console.log('Keyboard event simulation complete.');
}

keepTeamsActive();
