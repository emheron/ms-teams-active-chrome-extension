if (window.hasRun) {
    throw new Error('content.js has already been executed on this page.');
  }
  
  window.hasRun = true;

function simulateActivity() {

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

  // Simulate Keyboard Event
  const keyboardEvent = new KeyboardEvent('keydown', {
    key: ' ',
    code: 'Space',
  });
  body.dispatchEvent(keyboardEvent);

}

// Listen for a message from the background script to start the simulation
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'simulateActivity') {
    simulateActivity();
    sendResponse({ success: true });
  }
});
