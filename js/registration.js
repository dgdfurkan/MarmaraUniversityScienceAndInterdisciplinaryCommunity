// Registration Page JavaScript

let selectedEvent = null;

// Load events on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

// Load available events
async function loadEvents() {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;
    
    try {
        const events = await DatabaseService.getEvents();
        
        eventsGrid.innerHTML = events.map(event => {
            const eventDate = new Date(event.date);
            const isFull = (event.registered || 0) >= event.capacity;
            const badge = isFull ? 'Dolu' : (event.registered > event.capacity * 0.8 ? 'Sınırlı' : 'Açık');
            
            return `
                <div class="event-card" data-event-id="${event.id}">
                    <div class="event-image">
                        <i class="${getEventIcon(event.type)}"></i>
                        <div class="event-badge">${badge}</div>
                    </div>
                    <div class="event-content">
                        <h3>${event.title}</h3>
                        <div class="event-meta">
                            <span><i class="fas fa-calendar"></i> ${eventDate.toLocaleDateString('tr-TR')}</span>
                            <span><i class="fas fa-clock"></i> ${eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                        </div>
                        <p>${event.description}</p>
                        <div class="event-details">
                            <span class="event-price">${event.price === 0 ? 'Ücretsiz' : `${event.price} TL`}</span>
                            <span class="event-capacity">${event.registered || 0}/${event.capacity} kişi</span>
                        </div>
                        <button class="select-event-btn" 
                                onclick="selectEvent(${event.id})"
                                ${isFull ? 'disabled' : ''}>
                            ${isFull ? 'Dolu' : 'Bu Etkinliği Seç'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = '<p>Etkinlikler yüklenirken bir hata oluştu.</p>';
    }
}

// Helper function to get event icon based on type
function getEventIcon(type) {
    const icons = {
        'bilim-senligi': 'fas fa-flask',
        'atolye': 'fas fa-microscope',
        'konferans': 'fas fa-rocket',
        'teknik-gezi': 'fas fa-industry'
    };
    return icons[type] || 'fas fa-calendar-alt';
}

// Select an event
function selectEvent(eventId) {
    const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
    const events = document.querySelectorAll('.event-card');
    
    // Remove selection from all cards
    events.forEach(card => card.classList.remove('selected'));
    
    // Add selection to clicked card
    eventCard.classList.add('selected');
    
    // Store selected event data
    selectedEvent = {
        id: eventId,
        title: eventCard.querySelector('h3').textContent,
        date: eventCard.querySelector('.event-meta span').textContent.replace('📅 ', ''),
        time: eventCard.querySelectorAll('.event-meta span')[1].textContent.replace('🕒 ', ''),
        location: eventCard.querySelectorAll('.event-meta span')[2].textContent.replace('📍 ', ''),
        price: eventCard.querySelector('.event-price').textContent
    };
    
    // Show selected event info
    showSelectedEventInfo();
    
    // Show registration form
    showRegistrationForm();
}

// Show selected event info
function showSelectedEventInfo() {
    const selectedEventInfo = document.getElementById('selected-event-info');
    if (!selectedEventInfo || !selectedEvent) return;
    
    selectedEventInfo.innerHTML = `
        <h3>${selectedEvent.title}</h3>
        <p><strong>Tarih:</strong> ${selectedEvent.date} | <strong>Saat:</strong> ${selectedEvent.time}</p>
        <p><strong>Konum:</strong> ${selectedEvent.location} | <strong>Ücret:</strong> ${selectedEvent.price}</p>
    `;
}

// Show registration form
function showRegistrationForm() {
    const eventSelection = document.querySelector('.event-selection');
    const registrationFormSection = document.getElementById('registration-form-section');
    
    eventSelection.style.display = 'none';
    registrationFormSection.style.display = 'block';
    
    // Scroll to form
    registrationFormSection.scrollIntoView({ behavior: 'smooth' });
}

// Go back to event selection
function goBackToEvents() {
    const eventSelection = document.querySelector('.event-selection');
    const registrationFormSection = document.getElementById('registration-form-section');
    
    registrationFormSection.style.display = 'none';
    eventSelection.style.display = 'block';
    
    // Clear selection
    selectedEvent = null;
    document.querySelectorAll('.event-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle form submission
document.getElementById('registration-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Add selected event data
    data.eventId = selectedEvent.id;
    data.eventTitle = selectedEvent.title;
    data.eventDate = selectedEvent.date;
    data.eventTime = selectedEvent.time;
    data.eventLocation = selectedEvent.location;
    data.eventPrice = selectedEvent.price;
    
    // Add timestamp
    data.registrationDate = new Date().toISOString();
    
    try {
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kayıt Olunuyor...';
        submitBtn.disabled = true;
        
        // Create registration
        await DatabaseService.createRegistration(data);
        
        // Show success section
        showSuccessSection();
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        
        // Reset button
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Show success section
function showSuccessSection() {
    const registrationFormSection = document.getElementById('registration-form-section');
    const successSection = document.getElementById('success-section');
    
    registrationFormSection.style.display = 'none';
    successSection.style.display = 'block';
    
    // Scroll to success section
    successSection.scrollIntoView({ behavior: 'smooth' });
}

// Register for another event
function registerForAnother() {
    const successSection = document.getElementById('success-section');
    const eventSelection = document.querySelector('.event-selection');
    
    successSection.style.display = 'none';
    eventSelection.style.display = 'block';
    
    // Reset form
    document.getElementById('registration-form').reset();
    selectedEvent = null;
    
    // Clear selection
    document.querySelectorAll('.event-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Form validation
function validateForm() {
    const form = document.getElementById('registration-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });
    
    // Email validation
    const emailField = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value && !emailRegex.test(emailField.value)) {
        emailField.style.borderColor = '#ef4444';
        isValid = false;
    }
    
    // Phone validation
    const phoneField = document.getElementById('phone');
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (phoneField.value && !phoneRegex.test(phoneField.value)) {
        phoneField.style.borderColor = '#ef4444';
        isValid = false;
    }
    
    return isValid;
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = '#e5e7eb';
            }
        });
        
        input.addEventListener('input', () => {
            if (input.style.borderColor === 'rgb(239, 68, 68)') {
                input.style.borderColor = '#e5e7eb';
            }
        });
    });
});

// Auto-format phone number
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    e.target.value = value;
});

// Character counter for textareas
document.addEventListener('DOMContentLoaded', () => {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        if (maxLength) {
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.textAlign = 'right';
            counter.style.fontSize = '0.8rem';
            counter.style.color = '#6b7280';
            counter.style.marginTop = '0.25rem';
            
            textarea.parentNode.appendChild(counter);
            
            function updateCounter() {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${remaining} karakter kaldı`;
                counter.style.color = remaining < 50 ? '#ef4444' : '#6b7280';
            }
            
            textarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    });
});
