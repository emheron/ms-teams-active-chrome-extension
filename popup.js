document.addEventListener('DOMContentLoaded', function() {
  const statusIndicator = document.getElementById('extensionStatus');
  const toggleButton = document.getElementById('toggleExtension');

  // Update UI to reflect current state
  function updateUI(isActive) {
      statusIndicator.textContent = isActive ? 'Active' : 'Inactive';
      toggleButton.textContent = isActive ? 'Deactivate Extension' : 'Activate Extension';
      if (isActive) {
          toggleButton.classList.add('active');
      } else {
          toggleButton.classList.remove('active');
      }
  }

  // Fetch current state and update UI accordingly
  function fetchAndUpdateUI() {
      chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
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
          if (response && typeof response.isActive !== 'undefined') {
              updateUI(response.isActive);
          } else {
              console.error('Failed to toggle the state.');
          }
      });
  });
});

  