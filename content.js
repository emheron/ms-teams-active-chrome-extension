// Ensure 'isSimulating' is globally scoped to avoid redeclaration errors
if (typeof window.isSimulating === 'undefined') {
  window.isSimulating = true; // Initialize or retain the existing state
  console.log('Simulation state initialized:', window.isSimulating);
} else {
  console.log('Simulation state already set:', window.isSimulating);
}

// Function to generate a random delay within a given range
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Simulate mouse movement
function simulateMouseMovement(element) {
  try {
    const clientX = randomDelay(0, window.innerWidth);
    const clientY = randomDelay(0, window.innerHeight);
    const moveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
    });
    element.dispatchEvent(moveEvent);
  } catch (error) {
    console.error('Error simulating mouse movement:', error);
  }
}

// Simulate mouse click
function simulateMouseClick(element) {
  try {
    ['mousedown', 'mouseup', 'click'].forEach(type => {
      const mouseEvent = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      element.dispatchEvent(mouseEvent);
    });
  } catch (error) {
    console.error('Error simulating mouse click:', error);
  }
}

// Simulate keyboard interaction
function simulateKeyPress(element) {
  try {
    const keys = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
    const randomKey = keys[randomDelay(0, keys.length - 1)];
    const keyEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: randomKey,
      code: randomKey,
    });
    element.dispatchEvent(keyEvent);
    console.log(`Simulated key press: ${randomKey}`);
  } catch (error) {
    console.error('Error simulating key press:', error);
  }
}

// Main function to simulate user activity
function simulateActivity() {
  if (!window.isSimulating) {
    console.log('Simulation stopped.');
    return; // Exit if simulation is turned off
  }

  const targetElement = document.body || document.documentElement;
  if (!targetElement) {
    console.error('Target element not found. Unable to simulate activity.');
    return;
  }

  // Execute activity simulation after a random delay
  setTimeout(() => {
    if (!window.isSimulating) {
      console.log('Exiting simulation due to toggle off.');
      return; // Exit if simulation is turned off
    }
    simulateMouseClick(targetElement);
    simulateMouseMovement(targetElement);
    window.scrollBy(0, randomDelay(-100, 100));
    simulateKeyPress(targetElement);
    console.log('Activity simulation cycle completed.');
    simulateActivity(); // Continue simulation
  }, randomDelay(500, 3000));
}

// Listen for messages from the background script to toggle simulation
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleActivity') {
    window.isSimulating = message.isActive;
    console.log(`Activity simulation toggled: ${window.isSimulating}`);
    if (window.isSimulating) {
      simulateActivity(); // Restart or continue simulation
    }
    sendResponse({ success: true, message: "Activity simulation state changed." });
  } else {
    console.error('Received unknown action:', message.action);
  }
});
