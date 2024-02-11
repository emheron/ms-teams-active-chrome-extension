document.addEventListener('DOMContentLoaded', function() {
  const statusIndicator = document.getElementById('extensionStatus');
  const toggleButton = document.getElementById('toggleExtension');

  // Update UI to reflect current state
  function updateUI(isActive) {
      statusIndicator.textContent = isActive ? 'Active' : 'Inactive';
      toggleButton.textContent = isActive ? 'Deactivate Extension' : 'Activate Extension';
      toggleButton.classList.toggle('active', isActive); // More concise way to add/remove class
  }

  // Fetch current state and update UI accordingly
  function fetchAndUpdateUI() {
      chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
          if (chrome.runtime.lastError) {
              // Handle potential errors (e.g., disconnected background page)
              console.error('Error fetching status:', chrome.runtime.lastError);
              setTimeout(fetchAndUpdateUI, 1000); // Retry after a delay
              return;
          }
          
          if (response && typeof response.isActive !== 'undefined') {
              updateUI(response.isActive);
          } else {
              console.error('No response received from background script.');
          }
      });
  }

  // Initial fetch and update UI
  fetchAndUpdateUI();

  // Toggle the active state on button click and update UI
  toggleButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'toggleActiveState' }, function(response) {
          if (chrome.runtime.lastError) {
              // Handle potential errors (e.g., disconnected background page)
              console.error('Error toggling state:', chrome.runtime.lastError);
              return;
          }

          if (response && typeof response.isActive !== 'undefined') {
              updateUI(response.isActive);
          } else {
              console.error('Failed to toggle the state.');
          }
      });
  });
});
