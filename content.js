// Function to generate a random delay within a given range
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Function to simulate a more complex mouse movement
function simulateMouseMovement(element) {
  const clientX = randomDelay(0, window.innerWidth);
  const clientY = randomDelay(0, window.innerHeight);
  const moveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
  });
  element.dispatchEvent(moveEvent);
}

// Function to simulate a mouse click
function simulateMouseClick(element) {
  ['mousedown', 'mouseup', 'click'].forEach(type => {
      const mouseEvent = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
      });
      element.dispatchEvent(mouseEvent);
  });
}

// Function to simulate keyboard interaction
function simulateKeyPress(element) {
  const keys = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
  const randomKey = keys[randomDelay(0, keys.length - 1)];
  const keyEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: randomKey,
      code: randomKey,
  });
  element.dispatchEvent(keyEvent);
}

// Main function to simulate user activity
function simulateActivity() {
  const targetElement = document.body || document.documentElement;

  if (!targetElement) {
      console.error('Target element not found. Unable to simulate activity.');
      return;
  }

  // Execute activity simulation after a random delay to mimic natural interaction
  setTimeout(() => {
      simulateMouseClick(targetElement);
      simulateMouseMovement(targetElement);
      window.scrollBy(0, randomDelay(-100, 100));
      simulateKeyPress(targetElement);
  }, randomDelay(500, 3000)); // Random delay to make the activity less predictable
}

// Periodically simulate activity
setInterval(simulateActivity, 10000); // Adjusted to use a direct value for clarity

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'simulateActivity') {
      simulateActivity(); // Trigger activity simulation upon request
      sendResponse({ success: true, message: "Activity simulation triggered." });
  }
});
