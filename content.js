if (window.hasRun) {
  throw new Error('content.js has already been executed on this page.');
}

window.hasRun = true;

function simulateActivity() {
  const body = document.querySelector('body');

  if (!body) {
    console.error('Body element not found.');
    return;
  }

  body.click();

  const mouseEvent = new MouseEvent('mousemove', {
    clientX: Math.random() * window.innerWidth,
    clientY: Math.random() * window.innerHeight
  });
  body.dispatchEvent(mouseEvent);

  window.scrollBy(0, Math.random() * 100 - 50);

  const keyboardEvent = new KeyboardEvent('keydown', {
    key: ' ',
    code: 'Space',
  });
  body.dispatchEvent(keyboardEvent);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'simulateActivity') {
    simulateActivity();
    sendResponse({ success: true });
  }
});


