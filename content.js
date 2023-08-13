if (window.hasRun) {
    throw new Error('content.js has already been executed on this page.');
  }
  
  window.hasRun = true;
  
console.log("Content script loaded and running!");

function simulateActivity() {
  console.log('Starting user activity simulation...');

  const body = document.querySelector('body');
  console.log('Found body element:', body);

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

  console.log('Simulation of user activity completed.');
}

// Listen for a message from the background script to start the simulation
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'simulateActivity') {
    simulateActivity();
    sendResponse({ success: true });
  }
});
