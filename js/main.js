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
            const formattedDate = postDate.toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Get image source
            const imageSrc = post.image_file || post.image_url || 'https://images.unsplash.com/photo-1640102953836-5651f5d6b240?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1024&q=80';
            
            // Otomatik görüntülenme sayısını artır
            incrementViewCount(post.id);
            
            return `
                <div class="card" data-post-id="${post.id}" onclick="readFullBlog(${post.id})" style="cursor: pointer;">
                    <div class="card-img-holder">
                        <img src="${imageSrc}" alt="${post.title}">
                    </div>
                    <h3 class="blog-title">${post.title}</h3>
                    <span class="blog-time">${formattedDate}</span>
                    <p class="description">
                        ${post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>
                    <div class="options">
                        <span>
                            Blog Yazısını Oku
                        </span>
                        <button class="btn" onclick="event.stopPropagation(); toggleLike(${post.id})">
                            <i class="fas fa-heart" style="color: ${post.user_liked ? '#ef4444' : '#22215B'}"></i>
                            ${post.like_count || 0}
                        </button>
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
        const result = await DatabaseService.incrementBlogView(postId);
        if (result.alreadyViewed) {
            console.log('Post already viewed by this IP');
        } else if (result.success) {
            console.log('View count incremented');
        }
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

async function toggleLike(postId) {
    try {
        const result = await DatabaseService.toggleBlogLike(postId);
        
        if (result.error) {
            console.error('Error toggling like:', result.error);
            return;
        }
        
        // Update the like count and icon color in UI
        const cardElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (cardElement) {
            const likeButton = cardElement.querySelector(`[onclick="toggleLike(${postId})"]`);
            const icon = likeButton.querySelector('i');
            
            // Update icon color based on action
            if (result.action === 'liked') {
                icon.style.color = '#ef4444'; // Red for liked
            } else if (result.action === 'unliked') {
                icon.style.color = '#22215B'; // Default color for unliked
            }
        }
        
        console.log('Like toggled:', result.action);
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('Beğeni işlemi sırasında bir hata oluştu.');
    }
}

async function sharePost(postId) {
    try {
        const result = await DatabaseService.incrementBlogShare(postId);
        
        if (result.alreadyShared) {
            console.log('Post already shared by this IP');
            return;
        }
        
        if (result.error) {
            console.error('Error sharing post:', result.error);
            return;
        }
        
        // Show share options
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'MUSIC Blog',
                    text: 'Bu blog yazısını kontrol edin!',
                    url: window.location.href
                });
            } catch (shareError) {
                if (shareError.name === 'AbortError') {
                    console.log('Share canceled by user');
                    // Don't show error for user cancellation
                } else {
                    throw shareError;
                }
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link kopyalandı!');
            } catch (clipboardError) {
                console.error('Clipboard error:', clipboardError);
                alert('Paylaşım linki: ' + window.location.href);
            }
        }
    } catch (error) {
        console.error('Error sharing post:', error);
        alert('Paylaşım sırasında bir hata oluştu.');
    }
}

async function readFullBlog(postId) {
    // Close any existing modal first
    closeBlogModal();
    
    // Add click animation
    const cardElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (cardElement) {
        cardElement.classList.add('clicking');
        setTimeout(() => {
            cardElement.classList.remove('clicking');
        }, 150);
    }
    
    try {
        // Get specific blog post data from Supabase
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', postId)
            .eq('status', 'published')
            .single();
        
        if (error || !data) {
            alert('Blog yazısı bulunamadı!');
            return;
        }
        
        const postTitle = data.title;
        const postDate = new Date(data.created_at).toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const postContent = data.content;
        const authorName = data.author_name || 'MUSIC Ekibi';
        
        // Debug: Log the content to see what we're getting
        console.log('Blog content from Supabase:', postContent);
        console.log('Content type:', typeof postContent);
        console.log('Content length:', postContent ? postContent.length : 'null/undefined');
        
        // Create modal HTML
        const modalHTML = `
            <div class="blog-modal-overlay" id="blog-modal-overlay">
                <div class="blog-modal">
                    <button class="blog-modal-close" onclick="closeBlogModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="blog-modal-header">
                        <h1 class="blog-modal-title">${postTitle}</h1>
                        <div class="blog-modal-meta">
                            <div class="blog-modal-date">
                                <i class="fas fa-calendar"></i>
                                <span>${postDate}</span>
                            </div>
                            <div class="blog-modal-author">
                                <i class="fas fa-user"></i>
                                <span>${authorName}</span>
                            </div>
                        </div>
                    </div>
                    <div class="blog-modal-content" id="blog-modal-content">
                        ${formatBlogContent(postContent)}
                    </div>
                    <div class="blog-modal-actions">
                        <button class="blog-modal-like" onclick="toggleModalLike(${postId})" id="modal-like-${postId}">
                            <i class="fas fa-heart"></i>
                            <span>Beğen</span>
                        </button>
                        <button class="blog-modal-share" onclick="shareModalPost(${postId})">
                            <i class="fas fa-share-alt"></i>
                            <span>Paylaş</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal with animation immediately
        const modalOverlay = document.getElementById('blog-modal-overlay');
        modalOverlay.classList.add('active');
        
        // Remove image resize containers from blog modal content
        const modalContent = document.getElementById('blog-modal-content');
        const resizeContainers = modalContent.querySelectorAll('.image-resize-container');
        resizeContainers.forEach(container => {
            const img = container.querySelector('img');
            if (img) {
                // Move image out of resize container
                container.parentNode.insertBefore(img, container);
                container.remove();
            }
        });
        
        // Close modal when clicking outside
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeBlogModal();
            }
        });
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        alert('Blog yazısı yüklenirken bir hata oluştu.');
    }
}

function closeBlogModal() {
    const modal = document.getElementById('blog-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        
        // Remove modal after animation
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function toggleModalLike(postId) {
    // Use the existing toggleLike function
    toggleLike(postId);
    
    // Update modal like button
    const modalLikeBtn = document.getElementById(`modal-like-${postId}`);
    if (modalLikeBtn) {
        // This will be updated by the toggleLike function
        setTimeout(() => {
            // Check if the card like button shows liked state
            const cardElement = document.querySelector(`[data-post-id="${postId}"]`);
            const cardLikeBtn = cardElement.querySelector(`[onclick="toggleLike(${postId})"]`);
            const cardIcon = cardLikeBtn.querySelector('i');
            
            if (cardIcon.style.color === 'rgb(239, 68, 68)') {
                modalLikeBtn.classList.add('liked');
                modalLikeBtn.querySelector('span').textContent = 'Beğenildi';
            } else {
                modalLikeBtn.classList.remove('liked');
                modalLikeBtn.querySelector('span').textContent = 'Beğen';
            }
        }, 100);
    }
}

function shareModalPost(postId) {
    // Use the existing sharePost function
    sharePost(postId);
}

function openCommentModal(postId) {
    // TODO: Implement comment modal
    alert('Yorum sistemi yakında eklenecek!');
}

function formatBlogContent(content) {
    console.log('formatBlogContent input:', content);
    
    // If content is null or undefined, return empty string
    if (!content) {
        console.log('Content is null/undefined, returning empty string');
        return '';
    }
    
    // If content contains HTML tags, return it as is
    if (content.includes('<') && content.includes('>')) {
        console.log('Content contains HTML, returning as is');
        return content;
    }
    
    // Otherwise, format as plain text with paragraphs
    console.log('Content is plain text, formatting as paragraphs');
    const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
    const result = paragraphs.map(paragraph => 
        `<p>${paragraph.trim()}</p>`
    ).join('');
    
    console.log('Formatted result:', result);
    return result;
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
