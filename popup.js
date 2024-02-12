document.addEventListener('DOMContentLoaded', function() {
  const statusIndicator = document.getElementById('extensionStatus');
  const toggleButton = document.getElementById('toggleExtension');

  // Update UI to reflect current state
  function updateUI(isActive) {
      statusIndicator.textContent = isActive ? 'Active' : 'Inactive';
      toggleButton.textContent = isActive ? 'Deactivate Extension' : 'Activate Extension';
      toggleButton.classList.toggle('active', isActive); // Concisely toggle class based on isActive
  }

  // Fetch current state and update UI accordingly
  function fetchAndUpdateUI() {
      toggleButton.disabled = true; // Disable the button while fetching the state
      chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
          toggleButton.disabled = false; // Re-enable the button once the state is fetched
          if (chrome.runtime.lastError) {
              console.error('Error fetching status:', chrome.runtime.lastError.message);
              setTimeout(fetchAndUpdateUI, 1000); // Retry after a delay if there's an error
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
      toggleButton.disabled = true; // Disable the button to prevent multiple clicks during processing
      chrome.runtime.sendMessage({ action: 'toggleActiveState' }, function(response) {
          toggleButton.disabled = false; // Re-enable the button after toggling
          if (chrome.runtime.lastError) {
              console.error('Error toggling state:', chrome.runtime.lastError.message);
              return; // Early return on error
          }

          // Re-fetch the updated state after a toggle attempt to ensure UI consistency
          fetchAndUpdateUI();
      });
  });
});
