// Global state initialization or retention
if (typeof window.isSimulating === 'undefined') {
  window.isSimulating = true; // Initialize the state
  console.log('Simulation state initialized to active.');
} else {
  // Log retained for debugging if the script is re-injected or re-executed without reloading
  console.log('Retained simulation state:', window.isSimulating ? 'active' : 'inactive');
}

// Random delay generator
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Mouse movement simulation
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

// Mouse click simulation
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

// Keyboard interaction simulation
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
  // Log only the key press for visibility into active simulation without clutter
  console.log(`Simulated key press: ${randomKey}`);
}

// User activity simulation
function simulateActivity() {
  if (!window.isSimulating) {
    console.log('Simulation stopped.'); // Important state change log
    return;
  }

  const targetElement = document.body || document.documentElement;
  if (!targetElement) {
    console.error('Unable to find target element for simulation.'); // Critical error log
    return;
  }

  setTimeout(() => {
    if (!window.isSimulating) return; // Check state again before continuing
    simulateMouseClick(targetElement);
    simulateMouseMovement(targetElement);
    window.scrollBy(0, randomDelay(-100, 100));
    simulateKeyPress(targetElement);
    simulateActivity(); // Recursive call to continue the simulation loop
  }, randomDelay(500, 3000));
}

// Message listener for simulation control
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleActivity') {
    window.isSimulating = message.isActive;
    console.log('Toggled simulation state:', window.isSimulating ? 'active' : 'inactive');
    if (window.isSimulating) {
      simulateActivity(); // Optionally restart simulation on state change
    }
    sendResponse({ success: true, message: "Simulation state updated." });
  } else {
    console.warn('Unknown message action received:', message.action);
  }
});
