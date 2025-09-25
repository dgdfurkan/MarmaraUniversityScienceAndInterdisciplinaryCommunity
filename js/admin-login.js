// Admin Login JavaScript

// Demo credentials
const DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'music2024'
};

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'admin.html';
    }
});

// Login form handling
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const username = formData.get('username');
    const password = formData.get('password');
    const remember = formData.get('remember');
    
    // Show loading state
    const submitBtn = this.querySelector('.login-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
    submitBtn.disabled = true;
    
    // Hide any previous error messages
    hideMessages();
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check credentials
        if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
            // Login successful
            showSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
            
            // Store login state
            if (remember) {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUsername', username);
            } else {
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminUsername', username);
            }
            
            // Redirect to admin panel after short delay
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
            
        } else {
            // Login failed
            showErrorMessage('Kullanıcı adı veya şifre hatalı!');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Show error message
function showErrorMessage(message) {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.login-form').insertBefore(errorDiv, document.querySelector('.form-group'));
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// Show success message
function showSuccessMessage(message) {
    let successDiv = document.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        document.querySelector('.login-form').insertBefore(successDiv, document.querySelector('.form-group'));
    }
    
    successDiv.textContent = message;
    successDiv.classList.add('show');
}

// Hide all messages
function hideMessages() {
    const errorDiv = document.querySelector('.error-message');
    const successDiv = document.querySelector('.success-message');
    
    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');
}

// Auto-fill demo credentials on double-click
document.addEventListener('dblclick', function(e) {
    if (e.target.tagName === 'CODE') {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (e.target.textContent === 'admin') {
            usernameInput.value = 'admin';
            usernameInput.focus();
        } else if (e.target.textContent === 'music2024') {
            passwordInput.value = 'music2024';
            passwordInput.focus();
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('login-form').dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        document.getElementById('login-form').reset();
        hideMessages();
    }
});

// Form validation
document.getElementById('username').addEventListener('input', function() {
    this.style.borderColor = '#e5e7eb';
});

document.getElementById('password').addEventListener('input', function() {
    this.style.borderColor = '#e5e7eb';
});

// Focus management
document.getElementById('username').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('password').focus();
    }
});

document.getElementById('password').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('login-form').dispatchEvent(new Event('submit'));
    }
});
