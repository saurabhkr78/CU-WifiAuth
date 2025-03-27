// Function to check if current page is a FortiGate WiFi authentication page
function isWiFiAuthPage() {
  const pageUrl = window.location.href.toLowerCase();
  return pageUrl.includes('fgtauth') || pageUrl.includes('172.16.2.1:1000');
}

// Function to find and fill authentication form
function fillCredentials() {
  chrome.storage.sync.get(['username', 'password'], function(result) {
    if (!result.username || !result.password) {
      console.log('No credentials found');
      return;
    }

    // Find username and password fields
    const usernameField = findUsernameField();
    const passwordField = findPasswordField();

    if (usernameField && passwordField) {
      console.log('Found form fields, filling credentials...');
      
      // Fill in the credentials
      usernameField.value = result.username;
      passwordField.value = result.password;

      // Trigger input events to ensure the form recognizes the changes
      usernameField.dispatchEvent(new Event('input', { bubbles: true }));
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      usernameField.dispatchEvent(new Event('change', { bubbles: true }));
      passwordField.dispatchEvent(new Event('change', { bubbles: true }));

      // Find and click the submit button
      const submitButton = findSubmitButton();
      if (submitButton) {
        console.log('Found submit button, clicking...');
        submitButton.click();
      } else {
        console.log('No submit button found, trying form submit...');
        // If no submit button found, try to submit the form
        const form = usernameField.closest('form') || passwordField.closest('form');
        if (form) {
          form.submit();
        }
      }
    } else {
      console.log('Could not find form fields:', { username: !!usernameField, password: !!passwordField });
    }
  });
}

function findUsernameField() {
  // FortiGate specific selectors for username
  const selectors = [
    // FortiGate specific
    'input[name="username"]',
    'input[name="user"]',
    'input[name="email"]',
    
    // Generic selectors
    'input[type="text"][name*="user"]',
    'input[type="text"][name*="login"]',
    'input[type="text"][name*="account"]',
    'input[type="text"][name*="email"]',
    'input[type="text"][name*="identity"]',
    
    // Fallback to first text input if no specific match
    'input[type="text"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('Found username field:', selector);
      return element;
    }
  }
  return null;
}

function findPasswordField() {
  // FortiGate specific selectors for password
  const selectors = [
    // FortiGate specific
    'input[name="password"]',
    'input[name="pwd"]',
    
    // Generic selectors
    'input[type="password"]',
    'input[type="password"][name*="pass"]',
    'input[type="password"][name*="pwd"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('Found password field:', selector);
      return element;
    }
  }
  return null;
}

function findSubmitButton() {
  // FortiGate specific selectors
  const selectors = [
    // FortiGate specific
    'input[type="submit"]',
    'input[value="Login"]',
    'input[value="Continue"]',
    'input[value="Connect"]',
    
    // Generic selectors
    'button[type="submit"]',
    'input[type="submit"]',
    'button:contains("Submit")',
    'button:contains("Login")',
    'button:contains("Sign In")',
    'button:contains("Continue")',
    'button:contains("Connect")',
    'button:contains("Authenticate")',
    'button:contains("Accept")',
    'button:contains("OK")',
    
    // Input value matches
    'input[value*="Submit"]',
    'input[value*="Login"]',
    'input[value*="Sign In"]',
    'input[value*="Continue"]',
    'input[value*="Connect"]',
    'input[value*="Authenticate"]',
    'input[value*="Accept"]',
    'input[value*="OK"]',
    
    // Common button classes and IDs
    'button.submit',
    'button.login',
    'button.continue',
    'button.connect',
    'button#submit',
    'button#login',
    'button#continue',
    'button#connect'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('Found submit button:', selector);
      return element;
    }
  }
  return null;
}

// Function to check and fill credentials periodically
function checkAndFillCredentials() {
  if (isWiFiAuthPage()) {
    console.log('FortiGate auth page detected, attempting to fill credentials...');
    fillCredentials();
  }
}

// Initial check
checkAndFillCredentials();

// Check periodically
setInterval(checkAndFillCredentials, 1000);

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "fillCredentials") {
    fillCredentials();
  }
});

// Monitor for dynamic changes in the page
const observer = new MutationObserver(function(mutations) {
  checkAndFillCredentials();
});

// Start observing the page for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
}); 