console.log("Content script loaded and executing.");

// Removed the check for window.hasRun to allow repeated execution

// Function to simulate user activity
function simulateActivity() {
    console.log("Simulating user activity.");
    const body = document.querySelector('body');

    if (!body) {
        console.error('Body element not found. Unable to simulate activity.');
        return;
    }

    // Simulate mouse click
    body.click();
    console.log("Simulated mouse click.");

    // Simulate mouse movement
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: Math.random() * window.innerWidth,
        clientY: Math.random() * window.innerHeight,
    });
    body.dispatchEvent(mouseEvent);
    console.log("Simulated mouse movement.");

    // Simulate scroll
    window.scrollBy(0, Math.random() * 100 - 50);
    console.log("Simulated scroll.");

    // Simulate key press
    const keyboardEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
    body.dispatchEvent(keyboardEvent);
    console.log("Simulated key press.");
}

// Ensuring DOM is fully loaded before attempting to simulate activity
if (document.readyState === "complete" || document.readyState === "interactive") {
    simulateActivity();
} else {
    document.addEventListener('DOMContentLoaded', simulateActivity);
}

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`Received message to simulate activity: action = ${message.action}`);
    if (message.action === 'simulateActivity') {
        simulateActivity();
        sendResponse({ success: true });
        console.log("Activity simulation complete.");
    } else {
        console.error("Unknown action requested:", message.action);
    }
});
