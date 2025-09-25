// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to your backend
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Mesajınız başarıyla gönderildi!');
        this.reset();
    });
}

// Load blog posts dynamically
async function loadBlogPosts() {
    const blogGrid = document.getElementById('blog-posts');
    if (!blogGrid) return;
    
    try {
        const posts = await DatabaseService.getBlogPosts();
        
        blogGrid.innerHTML = posts.map(post => `
            <div class="blog-card">
                <div class="blog-image">
                    <i class="${getBlogIcon(post.category)}"></i>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                        <span><i class="fas fa-tag"></i> ${getCategoryName(post.category)}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <a href="#" class="blog-link">Devamını Oku <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogGrid.innerHTML = '<p>Blog yazıları yüklenirken bir hata oluştu.</p>';
    }
}

// Helper function to get blog icon based on category
function getBlogIcon(category) {
    const icons = {
        'bilim': 'fas fa-flask',
        'teknoloji': 'fas fa-microchip',
        'etkinlik': 'fas fa-calendar-alt',
        'duyuru': 'fas fa-bullhorn',
        'atolye': 'fas fa-tools',
        'konferans': 'fas fa-microphone'
    };
    return icons[category] || 'fas fa-newspaper';
}

// Helper function to get category name
function getCategoryName(category) {
    const categories = {
        'bilim': 'Bilim',
        'teknoloji': 'Teknoloji',
        'etkinlik': 'Etkinlik',
        'duyuru': 'Duyuru',
        'atolye': 'Atölye',
        'konferans': 'Konferans'
    };
    return categories[category] || category;
}

// Load events dynamically
async function loadEvents() {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;
    
    try {
        const events = await DatabaseService.getEvents();
        
        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-events">Henüz etkinlik bulunmuyor. Yakında yeni etkinlikler eklenecek!</p>';
            return;
        }
        
        eventsGrid.innerHTML = events.map(event => {
            const eventDate = new Date(event.date);
            const isFull = (event.registered || 0) >= event.capacity;
            
            return `
                <div class="event-card">
                    <div class="event-image">
                        <i class="${getEventIcon(event.type)}"></i>
                    </div>
                    <div class="event-content">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <div class="event-meta">
                            <span><i class="fas fa-calendar"></i> ${eventDate.toLocaleDateString('tr-TR')}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                        </div>
                        <a href="register.html" class="event-link">Kayıt Ol <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = '<p class="no-events">Etkinlikler yüklenirken bir hata oluştu.</p>';
    }
}

// Helper function to get event icon based on type
function getEventIcon(type) {
    const icons = {
        'bilim-senligi': 'fas fa-flask',
        'atolye': 'fas fa-tools',
        'konferans': 'fas fa-microphone',
        'teknik-gezi': 'fas fa-bus'
    };
    return icons[type] || 'fas fa-calendar-alt';
}

// Load blog posts and events when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
    loadEvents();
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.about-card, .event-card, .blog-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
