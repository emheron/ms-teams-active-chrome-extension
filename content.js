// Function to generate a random delay within a given range
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Function to simulate a more complex mouse movement
function simulateMouseMovement(element) {
  const clientX = randomDelay(0, window.innerWidth);
  const clientY = randomDelay(0, window.innerHeight);
  console.log(`Generating mousemove event at (${clientX}, ${clientY}).`);
  const moveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
  });
  element.dispatchEvent(moveEvent);
  console.log("Mousemove event dispatched.");
}

// Function to simulate a mouse click
function simulateMouseClick(element) {
  console.log("Starting to simulate mouse click sequence.");
  ['mousedown', 'mouseup', 'click'].forEach(type => {
      console.log(`Generating ${type} event.`);
      const mouseEvent = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
      });
      element.dispatchEvent(mouseEvent);
      console.log(`${type} event dispatched.`);
  });
}

// Function to simulate keyboard interaction
function simulateKeyPress(element) {
  const keys = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
  const randomKey = keys[randomDelay(0, keys.length - 1)];
  console.log(`Generating keydown event for key: ${randomKey}.`);
  const keyEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: randomKey,
      code: randomKey,
  });
  element.dispatchEvent(keyEvent);
  console.log(`Keydown event for ${randomKey} dispatched.`);
}

// Main function to simulate user activity
function simulateActivity() {
  const targetElement = document.body || document.documentElement;

  if (!targetElement) {
      console.error('Target element not found. Unable to simulate activity.');
      return;
  }

  console.log("Beginning activity simulation after random delay.");
  // Execute activity simulation after a random delay to mimic natural interaction
  setTimeout(() => {
      console.log("Simulating user activity...");

      simulateMouseClick(targetElement);

      simulateMouseMovement(targetElement);

      const scrollDistance = randomDelay(-100, 100);
      console.log(`Simulating scroll by ${scrollDistance} pixels.`);
      window.scrollBy(0, scrollDistance);
      console.log("Scroll simulation completed.");

      simulateKeyPress(targetElement);
  }, randomDelay(500, 3000)); // Random delay to make the activity less predictable
}

// Periodically simulate activity
setInterval(simulateActivity, 10000); // Adjusted to use a direct value for clarity

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'simulateActivity') {
      console.log("Received request to simulate activity.");
      simulateActivity(); // Trigger activity simulation upon request
      sendResponse({ success: true, message: "Activity simulation triggered." });
  }
});
