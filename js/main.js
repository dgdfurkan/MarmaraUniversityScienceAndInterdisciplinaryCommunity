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
    const blogContainer = document.getElementById('blog-posts');
    if (!blogContainer) return;
    
    try {
        const posts = await DatabaseService.getBlogPosts();
        
        if (posts.length === 0) {
            blogContainer.innerHTML = '<p class="no-posts">Henüz blog yazısı bulunmuyor. Yakında yeni yazılar eklenecek!</p>';
            return;
        }
        
        blogContainer.innerHTML = posts.map(post => {
            const postDate = new Date(post.created_at);
            const day = postDate.getDate();
            const month = postDate.toLocaleDateString('tr-TR', { month: 'long' }).toUpperCase();
            
            // Get image source
            const imageSrc = post.image_file || post.image_url || 'https://via.placeholder.com/530x320/3b82f6/ffffff?text=MUSIC';
            
            return `
                <div class="blog-card-new">
                    <div class="blog-thumbnail">
                        <img src="${imageSrc}" alt="${post.title}">
                    </div>
                    <div class="blog-content-new">
                        <h1>${post.title}</h1>
                        <div class="blog-author">
                            <img src="${post.author_avatar || 'https://via.placeholder.com/20x20/3b82f6/ffffff?text=M'}" alt="${post.author_name}">
                            <h2>${post.author_name || 'MUSIC Ekibi'}</h2>
                        </div>
                        <div class="blog-separator"></div>
                        <p>${post.excerpt || post.content.substring(0, 200) + '...'}</p>
                    </div>
                    <div class="blog-date">${day}</div>
                    <div class="blog-month">${month}</div>
                    <div class="blog-actions">
                        <div class="blog-action" onclick="incrementViewCount(${post.id})">
                            <i class="fas fa-eye"></i>
                            <span>${post.view_count || 0}</span>
                        </div>
                        <div class="blog-action" onclick="toggleLike(${post.id})">
                            <i class="fas fa-heart"></i>
                            <span>${post.like_count || 0}</span>
                        </div>
                        <div class="blog-action" onclick="openCommentModal(${post.id})">
                            <i class="fas fa-envelope"></i>
                            <span>Yorum</span>
                        </div>
                        <div class="blog-action" onclick="sharePost(${post.id})">
                            <i class="fas fa-share-alt"></i>
                            <span>${post.share_count || 0}</span>
                        </div>
                    </div>
                    <div class="blog-fab" onclick="scrollToTop()">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogContainer.innerHTML = '<p class="no-posts">Blog yazıları yüklenirken bir hata oluştu.</p>';
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

// Blog interaction functions
async function incrementViewCount(postId) {
    try {
        await DatabaseService.incrementBlogView(postId);
        // Update the view count in UI
        const viewElement = document.querySelector(`[onclick="incrementViewCount(${postId})"] span`);
        if (viewElement) {
            const currentCount = parseInt(viewElement.textContent) || 0;
            viewElement.textContent = currentCount + 1;
        }
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

async function toggleLike(postId) {
    try {
        const result = await DatabaseService.toggleBlogLike(postId);
        // Update the like count in UI
        const likeElement = document.querySelector(`[onclick="toggleLike(${postId})"] span`);
        if (likeElement) {
            likeElement.textContent = result.like_count;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

async function sharePost(postId) {
    try {
        await DatabaseService.incrementBlogShare(postId);
        // Update the share count in UI
        const shareElement = document.querySelector(`[onclick="sharePost(${postId})"] span`);
        if (shareElement) {
            const currentCount = parseInt(shareElement.textContent) || 0;
            shareElement.textContent = currentCount + 1;
        }
        
        // Show share options
        if (navigator.share) {
            await navigator.share({
                title: 'MUSIC Blog',
                text: 'Bu blog yazısını kontrol edin!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            alert('Link kopyalandı!');
        }
    } catch (error) {
        console.error('Error sharing post:', error);
    }
}

function openCommentModal(postId) {
    // TODO: Implement comment modal
    alert('Yorum sistemi yakında eklenecek!');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
