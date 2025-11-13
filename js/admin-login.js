// Admin Login JavaScript

// Check if user is already logged in and is admin
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check Supabase auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('Error getting session:', sessionError);
            showAccessDeniedMessage();
            return;
        }
        
        if (session && session.user) {
            // User is logged in, check if admin
            const isAdmin = await DatabaseService.checkAdminStatus(session.user.id);
            
            if (isAdmin) {
                // User is admin, redirect to admin panel immediately
                window.location.href = 'admin.html';
                return;
            } else {
                // User is logged in but not admin
                showAccessDeniedMessage('Giriş yaptınız ancak admin yetkiniz bulunmamaktadır.');
                return;
            }
        }
        
        // If not logged in, show message to login on main page
        showAccessDeniedMessage('Admin paneline erişmek için önce ana sayfada giriş yapmanız gerekiyor.');
    } catch (error) {
        console.error('Error checking admin status:', error);
        showAccessDeniedMessage();
    }
});

function showAccessDeniedMessage(customMessage = null) {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const message = customMessage || 'Admin paneline erişmek için önce ana sayfada giriş yapmanız gerekiyor. Eğer admin yetkiniz varsa, giriş yaptıktan sonra profil butonunun yanında admin paneli butonu görünecektir.';
        
        loginForm.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-info-circle" style="font-size: 3rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <h2 style="margin-bottom: 1rem;">Admin Paneli Erişimi</h2>
                <p style="margin-bottom: 2rem; color: #666;">
                    ${message}
                </p>
                <a href="index.html" class="btn btn-primary" style="display: inline-block; padding: 0.75rem 2rem; text-decoration: none; border-radius: 8px; background: #3b82f6; color: white;">
                    <i class="fas fa-arrow-left"></i> Ana Sayfaya Dön
                </a>
            </div>
        `;
    }
}

// Login form is now handled on main page
// This file is kept for backward compatibility but redirects to main page

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
