console.log("Content script loaded and executing.");

// Function to generate a random delay within a given range
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Main function to simulate user activity
function simulateActivity() {
    const body = document.body || document.documentElement;

    if (!body) {
        console.error('Body element not found. Unable to simulate activity.');
        return;
    }

    // Execute activity simulation after a random delay to mimic natural interaction
    setTimeout(() => {
        console.log("Simulating user activity.");
        body.click();
        console.log("Simulated mouse click.");

        const mouseEvent = new MouseEvent('mousemove', {
            clientX: randomDelay(0, window.innerWidth),
            clientY: randomDelay(0, window.innerHeight),
        });
        body.dispatchEvent(mouseEvent);
        console.log("Simulated mouse movement.");

        window.scrollBy(0, randomDelay(-100, 100));
        console.log("Simulated scroll.");

        const keys = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        const randomKey = keys[randomDelay(0, keys.length - 1)];
        const keyboardEvent = new KeyboardEvent('keydown', { key: randomKey });
        body.dispatchEvent(keyboardEvent);
        console.log(`Simulated key press: ${randomKey}.`);
    }, randomDelay(500, 3000)); // Random delay to make the activity less predictable
}

// Periodically simulate activity
setInterval(simulateActivity, 10000); // Adjusted to use a direct value for clarity

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'simulateActivity') {
        simulateActivity(); // Trigger activity simulation upon request
        sendResponse({ success: true });
    }
});
