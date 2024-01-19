document.addEventListener('DOMContentLoaded', function() {
    const statusIndicator = document.getElementById('extensionStatus');
    const toggleButton = document.getElementById('toggleExtension');
  
    function updateButton(isActive) {
      if (isActive) {
        toggleButton.classList.add('active');
        toggleButton.textContent = 'Deactivate Extension';
      } else {
        toggleButton.classList.remove('active');
        toggleButton.textContent = 'Activate Extension';
      }
    }
  
    chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
      if (response) {
        statusIndicator.textContent = response.isActive ? 'Active' : 'Inactive';
        updateButton(response.isActive);
      } else {
        console.error('No response received from background script.');
      }
    });
  
    toggleButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'toggleActiveState' }, function(response) {
        statusIndicator.textContent = response.isActive ? 'Active' : 'Inactive';
        updateButton(response.isActive);
      });
    });
  });
  
  