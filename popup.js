document.addEventListener('DOMContentLoaded', function() {
  // Load saved credentials
  chrome.storage.sync.get(['username', 'password'], function(result) {
    if (result.username) {
      document.getElementById('username').value = result.username;
    }
    if (result.password) {
      document.getElementById('password').value = result.password;
    }
  });

  // Save credentials
  document.getElementById('save').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('status');

    if (!username || !password) {
      showStatus('Please fill in both username and password', 'error');
      return;
    }

    chrome.storage.sync.set({
      username: username,
      password: password
    }, function() {
      showStatus('Credentials saved successfully!', 'success');
    });
  });
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
} 