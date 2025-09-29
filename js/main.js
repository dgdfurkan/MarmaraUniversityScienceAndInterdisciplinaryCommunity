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
            const formattedDate = postDate.toLocaleString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Istanbul'
            });
            
            // Get image source
            const imageSrc = post.image_file || post.image_url || 'https://images.unsplash.com/photo-1640102953836-5651f5d6b240?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1024&q=80';
            
            // Otomatik görüntülenme sayısını artır
            incrementViewCount(post.id);
            
            return `
                <div class="card blog-card-enhanced" data-post-id="${post.id}" onclick="readFullBlog(${post.id})" style="cursor: pointer;">
                    <div class="card-img-holder">
                        <img src="${imageSrc}" alt="${post.title}">
                        <div class="blog-overlay">
                            <div class="blog-stats">
                                <div class="stat-item">
                                    <i class="fas fa-eye"></i>
                                    <span>${post.view_count || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-heart"></i>
                                    <span>${post.like_count || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="blog-content">
                        <h3 class="blog-title">${post.title}</h3>
                        <span class="blog-time">${formattedDate}</span>
                        <p class="description">
                            ${post.excerpt || post.content}
                        </p>
                        <div class="blog-actions">
                            <div class="reaction-buttons">
                                <div class="reaction-group">
                                    <button class="reaction-btn like-btn ${post.user_liked ? 'active' : ''}" 
                                            onclick="event.stopPropagation(); toggleBlogLike(${post.id})" 
                                            title="Beğen">
                                        <span class="emoji">❤️</span>
                                        <span class="count">${post.like_count || 0}</span>
                                    </button>
                                    <button class="reaction-btn useful-btn ${post.user_useful ? 'active' : ''}" 
                                            onclick="event.stopPropagation(); addBlogReaction(${post.id}, 'useful')" 
                                            title="Faydalı">
                                        <span class="emoji">👍</span>
                                        <span class="count">${post.useful_count || 0}</span>
                                    </button>
                                    <button class="reaction-btn informative-btn ${post.user_informative ? 'active' : ''}" 
                                            onclick="event.stopPropagation(); addBlogReaction(${post.id}, 'informative')" 
                                            title="Bilgilendirici">
                                        <span class="emoji">💡</span>
                                        <span class="count">${post.informative_count || 0}</span>
                                    </button>
                                    <button class="reaction-btn inspiring-btn ${post.user_inspiring ? 'active' : ''}" 
                                            onclick="event.stopPropagation(); addBlogReaction(${post.id}, 'inspiring')" 
                                            title="İlham Verici">
                                        <span class="emoji">✨</span>
                                        <span class="count">${post.inspiring_count || 0}</span>
                                    </button>
                                </div>
                                <div class="blog-stats-summary">
                                    <div class="stat-item">
                                        <i class="fas fa-eye"></i>
                                        <span>${post.view_count || 0}</span>
                                    </div>
                                    <div class="stat-item">
                                        <i class="fas fa-poll"></i>
                                        <span>${(post.like_count || 0) + (post.useful_count || 0) + (post.informative_count || 0) + (post.inspiring_count || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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

// Increment announcement view count
async function incrementAnnouncementViewCount(announcementId) {
    try {
        await DatabaseService.incrementAnnouncementViewCount(announcementId);
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

// Global updateVoteDisplay fonksiyonu
function updateVoteDisplay(announcementCard) {
    const announcementId = announcementCard.dataset.announcementId;
    const reactions = announcementCard.querySelectorAll('.reaction');
    
    // Total votes'u hesapla
    let totalVotes = 0;
    reactions.forEach(reaction => {
        const count = parseInt(reaction.querySelector('.count').textContent);
        totalVotes += count;
    });
    
    // Total votes span'ini güncelle
    const totalVotesSpan = announcementCard.querySelector(`#total-votes-count-${announcementId}`);
    if (totalVotesSpan) {
        totalVotesSpan.textContent = totalVotes;
    }
    
    // Progress bar'ları güncelle
    reactions.forEach(reaction => {
        const count = parseInt(reaction.querySelector('.count').textContent);
        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        const progressBar = reaction.querySelector('.reaction-progress');
            if (progressBar) {
                // Oylar varsa göster
                if (count > 0) {
                    progressBar.classList.add('show');
                    progressBar.style.opacity = '0.4';
                } else {
                    progressBar.classList.remove('show');
                    progressBar.style.opacity = '0';
                }
                
                // İlk yüklemede transition'ı geçici disable et
                progressBar.style.transition = 'none';
                progressBar.style.width = `${percentage}%`;
                
                // Kısa bir süre sonra transition'ı tekrar aktif et
                setTimeout(() => {
                    progressBar.style.transition = 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
                }, 100);
            }
    });
}

// Load announcements dynamically
async function loadAnnouncements() {
    const announcementsContainer = document.getElementById('announcements-container');
    if (!announcementsContainer) return;
    
    try {
        const announcements = await DatabaseService.getAnnouncements();
        
        if (announcements.length === 0) {
            announcementsContainer.innerHTML = '<p class="no-announcements">Henüz duyuru bulunmuyor. Yakında yeni duyurular eklenecek!</p>';
            return;
        }
        
        // Her duyuru için kullanıcı etkileşimini kontrol et
        const announcementsWithInteractions = await Promise.all(
            announcements.map(async (announcement) => {
                const userInteraction = await DatabaseService.getUserInteraction(announcement.id);
                return { ...announcement, userInteraction };
            })
        );
        
        announcementsContainer.innerHTML = announcementsWithInteractions.map(announcement => {
            const announcementDate = new Date(announcement.created_at);
            const formattedDate = announcementDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            const formattedTime = announcementDate.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Otomatik görüntülenme sayısını artır (IP tabanlı)
            incrementAnnouncementViewCount(announcement.id);
            
            // Kullanıcının aktif reaksiyonunu belirle
            const activeReaction = announcement.userInteraction?.reaction_type;
            
            return `
                <div class="announcement-card" data-announcement-id="${announcement.id}">
                <div class="announcement-header">
                        <div class="header-icon"><i class="fas fa-bullhorn"></i></div>
                        <div class="header-text">
                            <h2>${announcement.title}</h2>
                            <p class="date">${formattedDate} • ${formattedTime}</p>
                        </div>
                </div>
                <div class="announcement-content">
                        ${announcement.content || '<p>İçerik bulunmuyor</p>'}
                </div>
                <div class="announcement-footer">
                        <div class="reactions-group reactions">
                            <div class="reaction ${activeReaction === 'onay' ? 'active' : ''}" data-reaction="onay">
                                <div class="reaction-progress"></div>
                                <span class="emoji">👍</span>
                                <span class="count">${announcement.reaction_onay || 0}</span>
                </div>
                            <div class="reaction ${activeReaction === 'katiliyorum' ? 'active' : ''}" data-reaction="katiliyorum">
                                <div class="reaction-progress"></div>
                                <span class="emoji">✅</span>
                                <span class="count">${announcement.reaction_katiliyorum || 0}</span>
            </div>
                            <div class="reaction ${activeReaction === 'katilamiyorum' ? 'active' : ''}" data-reaction="katilamiyorum">
                                <div class="reaction-progress"></div>
                                <span class="emoji">❌</span>
                                <span class="count">${announcement.reaction_katilamiyorum || 0}</span>
                            </div>
                            <div class="reaction ${activeReaction === 'sorum_var' ? 'active' : ''}" data-reaction="sorum_var">
                                <div class="reaction-progress"></div>
                                <span class="emoji">🤔</span>
                                <span class="count">${announcement.reaction_sorum_var || 0}</span>
                            </div>
                            <div class="reaction ${activeReaction === 'destek' ? 'active' : ''}" data-reaction="destek">
                                <div class="reaction-progress"></div>
                                <span class="emoji">👏</span>
                                <span class="count">${announcement.reaction_destek || 0}</span>
                            </div>
                        </div>
                        <div class="footer-stats">
                            <div class="view-count">
                                <i class="fas fa-eye"></i>
                                <span>${announcement.view_count || 0}</span>
                            </div>
                            <div class="total-votes">
                                <i class="fas fa-poll"></i>
                                <span id="total-votes-count-${announcement.id}">${(announcement.reaction_onay || 0) + (announcement.reaction_katiliyorum || 0) + (announcement.reaction_katilamiyorum || 0) + (announcement.reaction_sorum_var || 0) + (announcement.reaction_destek || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Sayfa yüklendiğinde progress bar'ları ayarla
        setTimeout(() => {
            document.querySelectorAll('.announcement-card').forEach(card => {
                updateVoteDisplay(card);
            });
        }, 500);
        
        // Sayfa tamamen yüklendikten sonra da bir kez daha kontrol et
        setTimeout(() => {
            document.querySelectorAll('.announcement-card').forEach(card => {
                updateVoteDisplay(card);
            });
        }, 1000);
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        announcementsContainer.innerHTML = '<p class="error">Duyurular yüklenirken bir hata oluştu.</p>';
    }
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
        
        // En yeni etkinliği en sola koymak için reverse kullanıyoruz
        eventsGrid.innerHTML = events.map(event => {
            const eventDate = new Date(event.date);
            const eventId = event.id;
            return `
                <div class="event-card-container">
                    <div class="event-card" data-event-id="${eventId}" onclick="flipEventCard(${eventId})">
                        <!-- KARTIN ÖN YÜZÜ -->
                        <div class="card-face card-front">
                            <div class="card-image">
                                <img src="${event.image_url || 'https://placehold.co/600x400/a2d2ff/333?text=Etkinlik'}" alt="${event.title}">
                            </div>
                            <div class="card-content">
                                <h2 class="event-title">${event.title}</h2>
                                <ul class="event-details">
                                    <li><i class="fas fa-calendar-alt"></i> ${eventDate.toLocaleString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        timeZone: 'Europe/Istanbul'
                                    })}</li>
                                    <li><i class="fas fa-clock"></i> ${eventDate.toLocaleString('tr-TR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Europe/Istanbul'
                                    })}</li>
                                    <li><i class="fas fa-map-marker-alt"></i> ${event.location}</li>
                                </ul>
                                <p class="event-description">${event.description ? event.description.substring(0, 100) + '...' : 'Etkinlik açıklaması bulunmuyor.'}</p>
                            </div>
                            <div class="card-footer">
                                <div class="participant-count"><i class="fas fa-users"></i> ${event.capacity || 'Sınırsız'} Katılımcı</div>
                                <button class="btn flip-btn" onclick="event.stopPropagation(); flipEventCard(${eventId})">Etkinliğe Kayıt Ol</button>
                            </div>
                        </div>
                        <!-- KARTIN ARKA YÜZÜ (FORM) -->
                        <div class="card-face card-back">
                            <div class="registration-form">
                                <h3 class="form-title">Etkinliğe Kayıt Ol</h3>
                                <form class="event-registration-form" data-event-id="${eventId}">
                                    <div class="animated-form-control">
                                        <input type="text" name="fullname" required="">
                                        <label for="fullname">
                                            <span style="transition-delay:0ms">İ</span><span style="transition-delay:50ms">s</span><span style="transition-delay:100ms">i</span><span style="transition-delay:150ms">m</span><span style="transition-delay:200ms"> </span><span style="transition-delay:250ms">S</span><span style="transition-delay:300ms">o</span><span style="transition-delay:350ms">y</span><span style="transition-delay:400ms">i</span><span style="transition-delay:450ms">s</span><span style="transition-delay:500ms">i</span><span style="transition-delay:550ms">m</span>
                                        </label>
                                    </div>
                                   
                                    <div class="animated-form-control">
                                        <input type="text" name="university" autocomplete="off" required="">
                                        <label for="university">
                                             <span style="transition-delay:0ms">Ü</span><span style="transition-delay:50ms">n</span><span style="transition-delay:100ms">i</span><span style="transition-delay:150ms">v</span><span style="transition-delay:200ms">e</span><span style="transition-delay:250ms">r</span><span style="transition-delay:300ms">s</span><span style="transition-delay:350ms">i</span><span style="transition-delay:400ms">t</span><span style="transition-delay:450ms">e</span>
                                        </label>
                                        <div class="custom-dropdown university-dropdown"></div>
                                    </div>

                                    <div class="animated-form-control">
                                        <input type="text" name="department" autocomplete="off" required="">
                                        <label for="department">
                                            <span style="transition-delay:0ms">B</span><span style="transition-delay:50ms">ö</span><span style="transition-delay:100ms">l</span><span style="transition-delay:150ms">ü</span><span style="transition-delay:200ms">m</span>
                                        </label>
                                        <div class="custom-dropdown department-dropdown"></div>
                                    </div>

                                    <div class="animated-form-control">
                                        <input type="email" name="email" required="">
                                        <label for="email">
                                            <span style="transition-delay:0ms">E</span><span style="transition-delay:50ms">-</span><span style="transition-delay:100ms">p</span><span style="transition-delay:150ms">o</span><span style="transition-delay:200ms">s</span><span style="transition-delay:250ms">t</span><span style="transition-delay:300ms">a</span>
                                        </label>
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" class="btn btn-back" onclick="flipEventCardBack(${eventId})">Geri Dön</button>
                                        <button type="submit" class="btn">Kaydı Onayla</button>
                                    </div>
                                </form>
                            </div>
                            <div class="success-message" style="display: none;">
                                 <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                                 <h3>Kaydınız Alındı!</h3>
                                 <p>Etkinlik detayları e-posta adresinize gönderilecektir.</p>
                                 <button type="button" class="btn btn-primary" onclick="flipEventCardBack(${eventId})">
                                     <i class="fas fa-arrow-left"></i> Geri Dön
                                 </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = '<p class="no-events">Etkinlikler yüklenirken bir hata oluştu.</p>';
    }
}

// Event card flip functions
function flipEventCard(eventId) {
    const card = document.querySelector(`[data-event-id="${eventId}"]`);
    if (card) {
        card.classList.add('is-flipped');
        setupCustomDropdowns(eventId);
    }
}

function flipEventCardBack(eventId) {
    const card = document.querySelector(`[data-event-id="${eventId}"]`);
    if (card) {
        card.classList.remove('is-flipped');
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

async function toggleBlogLike(postId) {
    try {
        const result = await DatabaseService.toggleBlogLike(postId);
        
        if (result.error) {
            console.error('Error toggling like:', result.error);
            return;
        }
        
        // Update the like count and button state in UI
        const cardElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (cardElement) {
            const likeButton = cardElement.querySelector(`[onclick="toggleBlogLike(${postId})"]`);
            if (likeButton) {
                // Update button state
                if (result.action === 'liked') {
                    likeButton.classList.add('active');
                } else if (result.action === 'unliked') {
                    likeButton.classList.remove('active');
                }
                
                // Update count (we'll need to reload to get accurate count)
                setTimeout(() => {
                    loadBlogPosts();
                }, 500);
            }
        }
        
        console.log('Like toggled:', result.action);
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('Beğeni işlemi sırasında bir hata oluştu.');
    }
}

async function addBlogReaction(postId, reactionType) {
    try {
        const result = await DatabaseService.addBlogReaction(postId, reactionType);
        
        if (result.error) {
            console.error('Error adding reaction:', result.error);
            return;
        }
        
        // Update the reaction button state in UI
        const cardElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (cardElement) {
            const reactionButton = cardElement.querySelector(`[onclick="addBlogReaction(${postId}, '${reactionType}')"]`);
            if (reactionButton) {
                // Update button state
                if (result.action === 'added') {
                    reactionButton.classList.add('active');
                } else if (result.action === 'removed') {
                    reactionButton.classList.remove('active');
                }
                
                // Update count (we'll need to reload to get accurate count)
                setTimeout(() => {
                    loadBlogPosts();
                }, 500);
            }
        }
        
        console.log('Reaction toggled:', result.action, result.reactionType);
    } catch (error) {
        console.error('Error adding reaction:', error);
        alert('Reaksiyon işlemi sırasında bir hata oluştu.');
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
        const postDate = new Date(data.created_at).toLocaleString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Istanbul'
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
// Data Arrays for dropdowns
const universities = [
    "Acıbadem Mehmet Ali Aydınlar Üniversitesi",
    "Altınbaş Üniversitesi",
    "Ataşehir Adıgüzel Meslek Yüksekokulu",
    "Bahçeşehir Üniversitesi",
    "Beykoz Üniversitesi",
    "Bezm-i Alem Vakıf Üniversitesi",
    "Boğaziçi Üniversitesi",
    "Demiroğlu Bilim Üniversitesi",
    "Doğuş Üniversitesi",
    "Fatih Sultan Mehmet Vakıf Üniversitesi",
    "Fenerbahçe Üniversitesi",
    "Galatasaray Üniversitesi",
    "Haliç Üniversitesi",
    "Işık Üniversitesi",
    "İbn Haldun Üniversitesi",
    "İstanbul Medeniyet Üniversitesi",
    "İstanbul Teknik Üniversitesi",
    "İstanbul Üniversitesi",
    "İstanbul Üniversitesi-Cerrahpaşa",
    "Marmara Üniversitesi",
    "Mimar Sinan Güzel Sanatlar Üniversitesi",
    "Sağlık Bilimleri Üniversitesi",
    "Türk-Alman Üniversitesi",
    "Yıldız Teknik Üniversitesi",
    "İstanbul 29 Mayıs Üniversitesi",
    "İstanbul Arel Üniversitesi",
    "İstanbul Atlas Üniversitesi",
    "İstanbul Aydın Üniversitesi",
    "İstanbul Beykent Üniversitesi",
    "İstanbul Bilgi Üniversitesi",
    "İstanbul Esenyurt Üniversitesi",
    "İstanbul Galata Üniversitesi",
    "İstanbul Gedik Üniversitesi",
    "İstanbul Gelişim Üniversitesi",
    "İstanbul Kent Üniversitesi",
    "İstanbul Kültür Üniversitesi",
    "İstanbul Medeniyet Üniversitesi",
    "İstanbul Medipol Üniversitesi",
    "İstanbul Nişantaşı Üniversitesi",
    "İstanbul Okan Üniversitesi",
    "İstanbul Rumeli Üniversitesi",
    "İstanbul Sabahattin Zaim Üniversitesi",
    "İstanbul Sağlık ve Sosyal Bilimler Meslek YüksekOkulu",
    "İstanbul Sağlık ve Teknoloji Üniversitesi",
    "İstanbul Şişli Meslek Yüksekokulu"
];

const departments = [
    "Abaza Dili ve Edebiyatı",
    "Açık Deniz Sondaj Teknolojisi",
    "Açık Deniz Tabanı Uygulamaları Teknolojisi",
    "Acil Durum ve Afet Yönetimi",
    "Acil Durum ve Afet Yönetimi (Açıköğretim)",
    "Acil Yardım ve Afet Yönetimi",
    "Acil Yardım ve Afet Yönetimi (Fakülte)",
    "Acil Yardım ve Afet Yönetimi (Yüksekokul)",
    "Adalet",
    "Adli Bilimler",
    "Adli Bilişim Mühendisliği",
    "Adli Bilişim Mühendisliği (M.T.O.K.)",
    "Ağaç İşleri Endüstri Mühendisliği",
    "Ağaç İşleri Endüstri Mühendisliği (M.T.O.K.)",
    "Ağız ve Diş Sağlığı",
    "Aile ve Tüketici Bilimleri",
    "Aktüerya Bilimleri",
    "Alman Dili ve Edebiyatı",
    "Almanca Mütercim ve Tercümanlık",
    "Almanca Öğretmenliği",
    "Alternatif Enerji Kaynakları Teknolojisi",
    "Ambalaj Tasarımı",
    "Ameliyathane Hizmetleri",
    "Amerikan Kültürü ve Edebiyatı",
    "Anestezi",
    "Antrenörlük Eğitimi",
    "Antropoloji",
    "Arap Dili ve Edebiyatı",
    "Arapça Mütercim ve Tercümanlık",
    "Arapça Mütercim ve Tercümanlık (Fakülte)",
    "Arapça Mütercim ve Tercümanlık (Yüksekokul)",
    "Arapça Öğretmenliği",
    "Arıcılık",
    "Arka-Yüz Yazılım Geliştirme",
    "Arkeoloji",
    "Arkeoloji ve Sanat Tarihi",
    "Arnavut Dili ve Edebiyatı",
    "Aşçılık",
    "Aşçılık (Açıköğretim)",
    "Astronomi ve Uzay Bilimleri",
    "Atçılık ve Antrenörlüğü",
    "Atık Yönetimi",
    "Avcılık ve Yaban Hayatı",
    "Ayakkabı Tasarım ve Üretimi",
    "Ayakkabı Tasarımı ve Üretimi",
    "Azerbaycan Türkçesi ve Edebiyatı",
    "Bağcılık",
    "Bağcılık ve Bağ Ürünleri Teknolojisi",
    "Bahçe Bitkileri",
    "Bahçe Tarımı",
    "Balıkçılık Teknolojisi Mühendisliği",
    "Bankacılık",
    "Bankacılık ve Finans",
    "Bankacılık ve Sigortacılık",
    "Bankacılık ve Sigortacılık",
    "Bankacılık ve Sigortacılık (Açıköğretim)",
    "Bankacılık ve Sigortacılık (Fakülte)",
    "Bankacılık ve Sigortacılık (Önlisans)",
    "Bankacılık ve Sigortacılık (Yüksekokul)",
    "Basım Teknolojileri",
    "Basım ve Yayım Teknolojileri",
    "Basın ve Yayın",
    "Batı Dilleri",
    "Beden Eğitimi ve Spor Öğretmenliği",
    "Beden Eğitimi ve Spor Öğretmenliği (Yüksekokul)",
    "Beslenme ve Diyetetik",
    "Beslenme ve Diyetetik (Fakülte)",
    "Beslenme ve Diyetetik (Yüksekokul)",
    "Bıçakçılık ve El Aletleri Üretim Teknolojisi",
    "Bilgi Güvenliği Teknolojisi",
    "Bilgi Güvenliği Teknolojisi (Fakülte)",
    "Bilgi Güvenliği Teknolojisi (Yüksekokul)",
    "Bilgi ve Belge Yönetimi",
    "Bilgi Yönetimi",
    "Bilgi Yönetimi (Açıköğretim)",
    "Bilgisayar Bilimleri",
    "Bilgisayar Bilimleri ve Mühendisliği",
    "Bilgisayar Destekli Tasarım ve Animasyon",
    "Bilgisayar Mühendisliği",
    "Bilgisayar Mühendisliği (M.T.O.K.)",
    "Bilgisayar Operatörlüğü",
    "Bilgisayar Programcılığı",
    "Bilgisayar Programcılığı (Açıköğretim)",
    "Bilgisayar Teknolojisi",
    "Bilgisayar Teknolojisi ve Bilişim Sistemleri",
    "Bilgisayar ve Öğretim Teknolojileri Öğretmenliği",
    "Bilim Tarihi",
    "Bilişim Güvenliği Teknolojisi",
    "Bilişim Sistemleri Mühendisliği",
    "Bilişim Sistemleri Mühendisliği (M.T.O.K.)",
    "Bilişim Sistemleri ve Teknolojileri",
    "Bilişim Sistemleri ve Teknolojileri (Fakülte)",
    "Bilişim Sistemleri ve Teknolojileri (Yüksekokul)",
    "Bitki Koruma",
    "Bitki Koruma",
    "Bitki Koruma (Önlisans)",
    "Bitkisel Üretim ve Teknolojileri",
    "Biyokimya",
    "Biyokimya",
    "Biyokimya (Önlisans)",
    "Biyoloji",
    "Biyoloji Öğretmenliği",
    "Biyomedikal Cihaz Teknolojisi",
    "Biyomedikal Mühendisliği",
    "Biyomedikal Mühendisliği (M.T.O.K.)",
    "Biyomühendislik",
    "Biyosistem Mühendisliği",
    "Biyoteknoloji",
    "Boşnak Dili ve Edebiyatı",
    "Boya Teknolojisi",
    "Bulgar Dili ve Edebiyatı",
    "Bulgarca Mütercim ve Tercümanlık",
    "Bulut Bilişim Operatörlüğü",
    "Büro Yönetimi ve Yönetici Asistanlığı",
    "Büro Yönetimi ve Yönetici Asistanlığı (Açıköğretim)",
    "Büyük Veri Analistliği",
    "Cevher Hazırlama Mühendisliği",
    "Ceza İnfaz ve Güvenlik Hizmetleri",
    "CNC Programlama ve Operatörlüğü",
    "Coğrafi Bilgi Sistemleri",
    "Coğrafi Bilgi Sistemleri (Açıköğretim)",
    "Coğrafya",
    "Coğrafya (Açıköğretim)",
    "Coğrafya Öğretmenliği",
    "Çağdaş Türk Lehçeleri ve Edebiyatları",
    "Çağdaş Yunan Dili ve Edebiyatı",
    "Çağrı Merkezi Hizmetleri",
    "Çağrı Merkezi Hizmetleri (Açıköğretim)",
    "Çalışma Ekonomisi ve Endüstri İlişkileri",
    "Çalışma Ekonomisi ve Endüstri İlişkileri (Açıköğretim)",
    "Çay Tarımı ve İşleme Teknolojisi",
    "Çerkez Dili ve Kültürü",
    "Çeviribilimi",
    "Çevre Koruma ve Kontrol",
    "Çevre Mühendisliği",
    "Çevre Sağlığı",
    "Çevre Temizliği ve Denetimi",
    "Çim Alan Tesisi ve Yönetimi",
    "Çin Dili ve Edebiyatı",
    "Çince Mütercim ve Tercümanlık",
    "Çini Sanatı ve Tasarımı",
    "Çizgi Film ve Animasyon",
    "Çocuk Gelişimi",
    "Çocuk Gelişimi",
    "Çocuk Gelişimi (Açıköğretim)",
    "Çocuk Gelişimi (Açıköğretim)",
    "Çocuk Gelişimi (Fakülte)",
    "Çocuk Gelişimi (Önlisans)",
    "Çocuk Gelişimi (Yüksekokul)",
    "Çocuk Koruma ve Bakım Hizmetleri",
    "Çok Boyutlu Modelleme ve Animasyon",
    "Deniz Brokerliği",
    "Deniz Ulaştırma İşletme Mühendisliği",
    "Deniz Ulaştırma İşletme Mühendisliği (Fakülte)",
    "Deniz Ulaştırma İşletme Mühendisliği (Yüksekokul)",
    "Deniz Ulaştırma ve İşletme",
    "Deniz ve Liman İşletmeciliği",
    "Denizcilik İşletmeleri Yönetimi",
    "Deri Mühendisliği",
    "Deri Teknolojisi",
    "Dezenfeksiyon, Sterilizasyon ve Antisepsi Teknikerliği",
    "Dijital Dönüşüm Elektroniği",
    "Dijital Fabrika Teknolojileri",
    "Dijital Oyun Tasarımı",
    "Dil ve Konuşma Terapisi",
    "Dil ve Konuşma Terapisi (Fakülte)",
    "Dil ve Konuşma Terapisi (Yüksekokul)",
    "Dilbilimi",
    "Diş Hekimliği",
    "Diş Hekimliği",
    "Diş Protez Teknolojisi",
    "Dış Ticaret",
    "Dış Ticaret (Açıköğretim)",
    "Diyaliz",
    "Doğal Yapı Taşları Teknolojisi",
    "Doğalgaz ve Tesisatı Teknolojisi",
    "Doğu Dilleri",
    "Döküm",
    "E-Ticaret",
    "E-Ticaret ve Pazarlama",
    "E-Ticaret ve Pazarlama (Açıköğretim)",
    "Ebelik",
    "Ebelik (Fakülte)",
    "Ebelik (Yüksekokul)",
    "Eczacılık",
    "Eczane Hizmetleri",
    "Egzersiz ve Spor Bilimleri",
    "Egzersiz ve Spor Bilimleri (Açıköğretim)",
    "Ekonometri",
    "Ekonomi",
    "Ekonomi ve Finans",
    "El Sanatları",
    "El Sanatları (M.T.O.K.)",
    "Elektrik",
    "Elektrik Enerjisi Üretim, İletim ve Dağıtımı",
    "Elektrik Enerjisi Üretim, İletim ve Dağıtımı (Açıköğretim)",
    "Elektrik Mühendisliği",
    "Elektrik-Elektronik Mühendisliği",
    "Elektrik-Elektronik Mühendisliği (M.T.O.K.)",
    "Elektrikli Cihaz Teknolojisi",
    "Elektronik Haberleşme Teknolojisi",
    "Elektronik Mühendisliği",
    "Elektronik Teknolojisi",
    "Elektronik Ticaret ve Yönetimi",
    "Elektronik Ticaret ve Yönetimi (Açıköğretim)",
    "Elektronik ve Haberleşme Mühendisliği",
    "Elektronörofizyoloji",
    "Emlak ve Emlak Yönetimi",
    "Emlak Yönetimi",
    "Emlak Yönetimi (Açıköğretim)",
    "Endüstri Mühendisliği",
    "Endüstri Ürünleri Tasarımı",
    "Endüstri Yönetimi Mühendisliği",
    "Endüstriyel Cam ve Seramik",
    "Endüstriyel Hammaddeler İşleme Teknolojisi",
    "Endüstriyel Kalıpçılık",
    "Endüstriyel Tasarım",
    "Endüstriyel Tasarım (Fakülte)",
    "Endüstriyel Tasarım (Yüksekokul)",
    "Endüstriyel Tasarım Mühendisliği",
    "Endüstriyel Tasarım Mühendisliği (M.T.O.K.)",
    "Enerji Bilimi ve Teknolojileri",
    "Enerji Sistemleri Mühendisliği",
    "Enerji Sistemleri Mühendisliği (M.T.O.K.)",
    "Enerji Tesisleri İşletmeciliği",
    "Enerji Yönetimi",
    "Engelli Bakımı ve Rehabilitasyon",
    "Engelli Bakımı ve Rehabilitasyon (Açıköğretim)",
    "Engelliler İçin Gölge Öğreticilik",
    "Ergoterapi",
    "Ermeni Dili ve Kültürü",
    "Eser Koruma",
    "Eski Yunan Dili ve Edebiyatı",
    "Et ve Ürünleri Teknolojisi",
    "Ev İdaresi (Açıköğretim)",
    "Evde Hasta Bakımı",
    "Fars Dili ve Edebiyatı",
    "Farsça Mütercim ve Tercümanlık",
    "Felsefe",
    "Felsefe (Açıköğretim)",
    "Felsefe Grubu Öğretmenliği",
    "Fen Bilgisi Öğretmenliği",
    "Fidan Yetiştiriciliği",
    "Film Tasarımı ve Yazarlığı",
    "Film Tasarımı ve Yönetimi",
    "Film Tasarımı ve Yönetmenliği",
    "Finans ve Bankacılık",
    "Finans ve Bankacılık (Fakülte)",
    "Finans ve Bankacılık (Yüksekokul)",
    "Fındık Eksperliği",
    "Fizik",
    "Fizik Mühendisliği",
    "Fizik Öğretmenliği",
    "Fizyoterapi",
    "Fizyoterapi ve Rehabilitasyon",
    "Fizyoterapi ve Rehabilitasyon (Fakülte)",
    "Fizyoterapi ve Rehabilitasyon (Yüksekokul)",
    "Fotoğraf",
    "Fotoğraf ve Video",
    "Fotoğrafçılık ve Kameramanlık",
    "Fotoğrafçılık ve Kameramanlık (Açıköğretim)",
    "Fotonik",
    "Fransız Dili ve Edebiyatı",
    "Fransızca Mütercim ve Tercümanlık",
    "Fransızca Öğretmenliği",
    "Gastronomi ve Mutfak Sanatları",
    "Gastronomi ve Mutfak Sanatları (Fakülte)",
    "Gastronomi ve Mutfak Sanatları (Fakülte) (M.T.O.K.)",
    "Gastronomi ve Mutfak Sanatları (Yüksekokul)",
    "Gayrimenkul Geliştirme ve Yönetimi",
    "Gazetecilik",
    "Geleneksel El Sanatları",
    "Geleneksel Tekstillerin Korunması ve Restorasyonu",
    "Geleneksel Türk Sanatları",
    "Gemi İnşaatı",
    "Gemi İnşaatı ve Gemi Makineleri Mühendisliği",
    "Gemi Makineleri İşletme Mühendisliği",
    "Gemi Makineleri İşletmeciliği",
    "Gemi ve Deniz Teknolojisi Mühendisliği",
    "Gemi ve Yat Tasarımı",
    "Genetik ve Biyomühendislik",
    "Genetik ve Yaşam Bilimleri Programları",
    "Geomatik Mühendisliği",
    "Geoteknik",
    "Gerontoloji",
    "Gıda Kalite Kontrolü ve Analizi",
    "Gıda Mühendisliği",
    "Gıda Teknolojisi",
    "Gıda Teknolojisi",
    "Gıda Teknolojisi (Fakülte)",
    "Gıda Teknolojisi (Önlisans)",
    "Gıda Teknolojisi (Yüksekokul)",
    "Girişimcilik",
    "Giyim Üretim Teknolojisi",
    "Görsel İletişim",
    "Görsel İletişim Tasarımı",
    "Görsel İletişim Tasarımı (Açıköğretim)",
    "Görsel Sanatlar",
    "Görsel Sanatlar ve İletişim Tasarımı",
    "Grafik",
    "Grafik Sanatlar",
    "Grafik Sanatlar (Açıköğretim)",
    "Grafik Tasarımı",
    "Grafik Tasarımı",
    "Grafik Tasarımı (Açıköğretim)",
    "Grafik Tasarımı (Önlisans)",
    "Gümrük İşletme",
    "Gümrük İşletme (Fakülte)",
    "Gümrük İşletme (Yüksekokul)",
    "Gürcü Dili ve Edebiyatı",
    "Halıcılık ve Kilimcilik",
    "Halkbilimi",
    "Halkla İlişkiler ve Pazarlama İletişimi",
    "Halkla İlişkiler ve Reklamcılık",
    "Halkla İlişkiler ve Reklamcılık (Açıköğretim)",
    "Halkla İlişkiler ve Reklamcılık (Fakülte)",
    "Halkla İlişkiler ve Reklamcılık (Yüksekokul)",
    "Halkla İlişkiler ve Tanıtım",
    "Halkla İlişkiler ve Tanıtım",
    "Halkla İlişkiler ve Tanıtım (Açıköğretim)",
    "Halkla İlişkiler ve Tanıtım (Açıköğretim)",
    "Halkla İlişkiler ve Tanıtım (Önlisans)",
    "Harita Mühendisliği",
    "Harita ve Kadastro",
    "Hasta Bakımı",
    "Hava Aracı İmalat Teknolojileri",
    "Hava Lojistiği",
    "Havacılık Elektrik ve Elektroniği",
    "Havacılık Elektrik ve Elektroniği (Fakülte)",
    "Havacılık Elektrik ve Elektroniği (Yüksekokul)",
    "Havacılık ve Uzay Mühendisliği",
    "Havacılık Yönetimi",
    "Havacılık Yönetimi (Açıköğretim)",
    "Havacılık Yönetimi (Fakülte)",
    "Havacılık Yönetimi (Yüksekokul)",
    "Hayvansal Üretim ve Teknolojileri",
    "Hayvansal Üretim ve Teknolojileri (Fakülte)",
    "Hayvansal Üretim ve Teknolojileri (Yüksekokul)",
    "Hemşirelik (Fakülte)",
    "Hemşirelik (Yüksekokul)",
    "Hibrid ve Elektrikli Taşıtlar Teknolojisi",
    "Hidrojeoloji Mühendisliği",
    "Hindoloji",
    "Hititoloji",
    "Hukuk",
    "Hukuk Büro Yönetimi ve Sekreterliği",
    "Hukuk Büro Yönetimi ve Sekreterliği (Açıköğretim)",
    "Hungaroloji",
    "İbrani Dili ve Kültürü",
    "İç Mekan Tasarımı",
    "İç Mimarlık",
    "İç Mimarlık ve Çevre Tasarımı",
    "İç Mimarlık ve Mobilya Tasarımı",
    "İklim Bilimi ve Meteoroloji Mühendisliği",
    "İklimlendirme ve Soğutma Teknolojisi",
    "İkram Hizmetleri",
    "İktisadi ve İdari Bilimler Programları",
    "İktisadi ve İdari Programlar",
    "İktisat",
    "İktisat (Açıköğretim)",
    "İlahiyat",
    "İlahiyat (Açıköğretim)",
    "İlahiyat (M.T.O.K.)",
    "İletişim",
    "İletişim Bilimleri",
    "İletişim Sanatları",
    "İletişim Tasarımı ve Yönetimi",
    "İletişim ve Tasarımı",
    "İlk ve Acil Yardım",
    "İlköğretim Matematik Öğretmenliği",
    "İmalat Mühendisliği",
    "İmalat Yürütme Sistemleri Operatörlüğü",
    "İngiliz Dilbilimi",
    "İngiliz Dili ve Edebiyatı",
    "İngiliz ve Rus Dilleri ve Edebiyatları",
    "İngilizce Mütercim ve Tercümanlık",
    "İngilizce Mütercim ve Tercümanlık (Fakülte)",
    "İngilizce Mütercim ve Tercümanlık (Yüksekokul)",
    "İngilizce Öğretmenliği",
    "İngilizce Öğretmenliği",
    "İngilizce, Fransızca Mütercim ve Tercümanlık",
    "İnşaat Mühendisliği",
    "İnşaat Mühendisliği (M.T.O.K.)",
    "İnşaat Teknolojisi",
    "İnsan Kaynakları Yönetimi",
    "İnsan Kaynakları Yönetimi",
    "İnsan Kaynakları Yönetimi (Açıköğretim)",
    "İnsan Kaynakları Yönetimi (Açıköğretim)",
    "İnsan Kaynakları Yönetimi (Önlisans)",
    "İnsansız Araç Teknikerliği",
    "İnsansız Hava Aracı Teknolojisi ve Operatörlüğü",
    "İnternet ve Ağ Teknolojileri",
    "İş Makineleri Operatörlüğü",
    "İş Sağlığı ve Güvenliği",
    "İş Sağlığı ve Güvenliği",
    "İş Sağlığı ve Güvenliği (Açıköğretim)",
    "İş Sağlığı ve Güvenliği (Açıköğretim)",
    "İş Sağlığı ve Güvenliği (Fakülte)",
    "İş Sağlığı ve Güvenliği (Önlisans)",
    "İş Sağlığı ve Güvenliği (Yüksekokul)",
    "İş ve Uğraşı Terapisi",
    "İslam Bilimleri",
    "İslam İktisadı ve Finans",
    "İslami İlimler",
    "İslami İlimler (Açıköğretim)",
    "İslami İlimler (M.T.O.K.)",
    "İşletme",
    "İşletme (Açıköğretim)",
    "İşletme Mühendisliği",
    "İşletme Yönetimi",
    "İşletme Yönetimi (Açıköğretim)",
    "İspanyol Dili ve Edebiyatı",
    "İstatistik",
    "İstatistik ve Bilgisayar Bilimleri",
    "İtalyan Dili ve Edebiyatı",
    "Japon Dili ve Edebiyatı",
    "Japonca Mütercim ve Tercümanlık",
    "Japonca Öğretmenliği",
    "Jeofizik Mühendisliği",
    "Jeoloji Mühendisliği",
    "Kamu Yönetimi",
    "Kamu Yönetimi (Açıköğretim)",
    "Kanatlı Hayvan Yetiştiriciliği",
    "Karşılaştırmalı Edebiyat",
    "Kaynak Teknolojisi",
    "Kazak Dili ve Edebiyatı",
    "Kenevir Dokuma Tezgahtarlığı",
    "Kenevir Dokumacılığı",
    "Kentsel Tasarım ve Peyzaj Mimarlığı",
    "Kimya",
    "Kimya Mühendisliği",
    "Kimya Öğretmenliği",
    "Kimya Teknolojisi",
    "Kimya-Biyoloji Mühendisliği",
    "Klasik Arkeoloji",
    "Kontrol ve Otomasyon Mühendisliği",
    "Kontrol ve Otomasyon Teknolojisi",
    "Kooperatifçilik",
    "Kore Dili ve Edebiyatı",
    "Kozmetik Teknolojisi",
    "Kültür Varlıklarını Koruma ve Onarım",
    "Kültür Varlıklarını Koruma ve Onarım (Fakülte)",
    "Kültür Varlıklarını Koruma ve Onarım (Yüksekokul)",
    "Kültür ve İletişim Bilimleri",
    "Kültürel Miras ve Turizm",
    "Kültürel Miras ve Turizm (Açıköğretim)",
    "Kümes Hayvanları Yetiştiriciliği",
    "Küresel Siyaset ve Uluslararası İlişkiler",
    "Kurgu, Ses ve Görüntü Yönetimi",
    "Kürt Dili ve Edebiyatı",
    "Kurumsal Bilişim Uzmanlığı",
    "Kuyumculuk ve Mücevher Tasarımı",
    "Kuyumculuk ve Takı Tasarımı",
    "Laborant ve Veteriner Sağlık",
    "Laborant ve Veteriner Sağlık (Açıköğretim)",
    "Laboratuvar Teknolojisi",
    "Latin Dili ve Edebiyatı",
    "Leh Dili ve Edebiyatı",
    "Lojistik",
    "Lojistik (Açıköğretim)",
    "Lojistik Yönetimi",
    "Lojistik Yönetimi (Fakülte)",
    "Lojistik Yönetimi (Yüksekokul)",
    "Maden Mühendisliği",
    "Madencilik Teknolojisi",
    "Mahkeme Büro Hizmetleri",
    "Makine",
    "Makine Mühendisliği",
    "Makine Mühendisliği (M.T.O.K.)",
    "Makine Resim ve Konstrüksiyonu",
    "Maliye",
    "Maliye",
    "Maliye (Açıköğretim)",
    "Maliye (Önlisans)",
    "Malzeme Bilimi ve Mühendisliği",
    "Malzeme Bilimi ve Nanoteknoloji Mühendisliği",
    "Malzeme Bilimi ve Teknolojileri",
    "Mantarcılık",
    "Marina ve Yat İşletmeciliği",
    "Marka İletişimi (Açıköğretim)",
    "Matematik",
    "Matematik Mühendisliği",
    "Matematik Öğretmenliği",
    "Matematik ve Bilgisayar Bilimleri",
    "Medya ve Görsel Sanatlar",
    "Medya ve İletişim",
    "Medya ve İletişim",
    "Medya ve İletişim (Açıköğretim)",
    "Medya ve İletişim (Önlisans)",
    "Mekatronik",
    "Mekatronik Mühendisliği",
    "Mekatronik Mühendisliği (M.T.O.K.)",
    "Menkul Kıymetler ve Sermaye Piyasası",
    "Menkul Kıymetler ve Sermaye Piyasası (Açıköğretim)",
    "Mermer Teknolojisi",
    "Metalurji",
    "Metalurji ve Malzeme Mühendisliği",
    "Metalurji ve Malzeme Mühendisliği (M.T.O.K.)",
    "Meteoroloji Mühendisliği",
    "Meyve ve Sebze İşleme Teknolojisi",
    "Mimari Dekoratif Sanatlar",
    "Mimari Restorasyon",
    "Mimarlık",
    "Mobil Teknolojileri",
    "Mobilya ve Dekorasyon",
    "Moda Tasarımı",
    "Moda Tasarımı",
    "Moda Tasarımı (Fakülte)",
    "Moda Tasarımı (Fakülte) (M.T.O.K.)",
    "Moda Tasarımı (Önlisans)",
    "Moda Tasarımı (Yüksekokul)",
    "Moda Yönetimi",
    "Moleküler Biyoloji ve Genetik",
    "Moleküler Biyoteknoloji",
    "Muhasebe ve Finans Yönetimi",
    "Muhasebe ve Finans Yönetimi (Fakülte)",
    "Muhasebe ve Finans Yönetimi (Yüksekokul)",
    "Muhasebe ve Vergi Uygulamaları",
    "Muhasebe ve Vergi Uygulamaları (Açıköğretim)",
    "Mühendislik Programları",
    "Mühendislik ve Doğa Bilimleri Programları",
    "Mütercim-Tercümanlık",
    "Müzecilik",
    "Nanobilim ve Nanoteknoloji",
    "Nanoteknoloji Mühendisliği",
    "Nüfus ve Vatandaşlık",
    "Nükleer Enerji Mühendisliği",
    "Nükleer Teknoloji ve Radyasyon Güvenliği",
    "Nükleer Tıp Teknikleri",
    "Odyoloji",
    "Odyoloji (Fakülte)",
    "Odyoloji (Yüksekokul)",
    "Odyometri",
    "Okul Öncesi Öğretmenliği",
    "Optik ve Akustik Mühendisliği",
    "Optisyenlik",
    "Organik Tarım",
    "Organik Tarım İşletmeciliği",
    "Organik Tarım İşletmeciliği (Fakülte)",
    "Organik Tarım İşletmeciliği (Yüksekokul)",
    "Orman Endüstrisi Mühendisliği",
    "Orman Mühendisliği",
    "Ormancılık ve Orman Ürünleri",
    "Ortez ve Protez",
    "Ortopedik Protez ve Ortez",
    "Otel Yöneticiliği",
    "Otobüs Kaptanlığı",
    "Otomotiv Gövde ve Yüzey İşlem Teknolojileri",
    "Otomotiv Mühendisliği",
    "Otomotiv Mühendisliği (M.T.O.K.)",
    "Otomotiv Teknolojisi",
    "Otonom Sistemler Teknikerliği",
    "Otopsi Yardımcılığı",
    "Oyun Geliştirme ve Programlama",
    "Ön-Yüz Yazılım Geliştirme",
    "Özel Eğitim Öğretmenliği",
    "Özel Güvenlik ve Koruma",
    "Pastacılık ve Ekmekçilik",
    "Patoloji Laboratuvar Teknikleri",
    "Pazarlama",
    "Pazarlama",
    "Pazarlama (Fakülte)",
    "Pazarlama (Önlisans)",
    "Pazarlama (Yüksekokul)",
    "Perakende Satış ve Mağaza Yönetimi",
    "Perakende Satış ve Mağaza Yönetimi (Açıköğretim)",
    "Perfüzyon",
    "Petrol ve Doğalgaz Mühendisliği",
    "Peyzaj Mimarlığı",
    "Peyzaj ve Süs Bitkileri Yetiştiriciliği",
    "Pilotaj",
    "Pilotaj (Fakülte)",
    "Pilotaj (Yüksekokul)",
    "Podoloji",
    "Polimer Malzeme Mühendisliği",
    "Polimer Teknolojisi",
    "Politika ve Ekonomi",
    "Posta Hizmetleri",
    "Protohistorya ve Ön Asya Arkeolojisi",
    "Psikoloji",
    "Psikolojik Danışmanlık ve Rehberlik",
    "Psikolojik Danışmanlık ve Rehberlik Öğretmenliği",
    "Radyo ve Televizyon Programcılığı",
    "Radyo ve Televizyon Programcılığı (Açıköğretim)",
    "Radyo ve Televizyon Teknolojisi",
    "Radyo, Televizyon ve Sinema",
    "Radyoterapi",
    "Rafineri ve Petro-Kimya Teknolojisi",
    "Raylı Sistemler Elektrik ve Elektronik",
    "Raylı Sistemler İşletmeciliği",
    "Raylı Sistemler Makine Teknolojisi",
    "Raylı Sistemler Makinistliği",
    "Raylı Sistemler Mühendisliği",
    "Raylı Sistemler Yol Teknolojisi",
    "Rehberlik ve Psikolojik Danışmanlık",
    "Reklam Tasarımı ve İletişimi",
    "Reklamcılık",
    "Reklamcılık",
    "Reklamcılık (Açıköğretim)",
    "Reklamcılık (Açıköğretim)",
    "Reklamcılık (Önlisans)",
    "Rekreasyon",
    "Rekreasyon (Açıköğretim)",
    "Rekreasyon Yönetimi",
    "Rekreasyon Yönetimi (Fakülte)",
    "Rekreasyon Yönetimi (Fakülte) (M.T.O.K.)",
    "Rekreasyon Yönetimi (Yüksekokul)",
    "Robotik ve Otonom Sistemleri Mühendisliği",
    "Robotik ve Yapay Zekâ",
    "Rus Dili ve Edebiyatı",
    "Rus Dili ve Edebiyatı Öğretmenliği",
    "Rus ve İngiliz Dilleri ve Edebiyatları",
    "Rusça Mütercim ve Tercümanlık",
    "Rusça Mütercim ve Tercümanlık (Fakülte)",
    "Saç Bakımı ve Güzellik Hizmetleri",
    "Sağlık Bilgi Sistemleri Teknikerliği",
    "Sağlık Kurumları İşletmeciliği",
    "Sağlık Kurumları İşletmeciliği (Açıköğretim)",
    "Sağlık Turizmi İşletmeciliği",
    "Sağlık Yönetimi",
    "Sağlık Yönetimi (Açıköğretim)",
    "Sağlık Yönetimi (Fakülte)",
    "Sağlık Yönetimi (Yüksekokul)",
    "Sahne Işık ve Ses Teknolojileri",
    "Sahne ve Dekor Tasarımı",
    "Sanal ve Artırılmış Gerçeklik",
    "Sanat Tarihi",
    "Sanat ve Kültür Yönetimi",
    "Sanat ve Sosyal Bilimler Programları",
    "Seracılık",
    "Seramik ve Cam Tasarımı",
    "Sermaye Piyasası",
    "Seyahat İşletmeciliği",
    "Seyahat İşletmeciliği ve Turizm Rehberliği",
    "Siber Güvenlik",
    "Siber Güvenlik Analistliği ve Operatörlüğü",
    "Siber Güvenlik Mühendisliği",
    "Sigortacılık",
    "Sigortacılık (Fakülte)",
    "Sigortacılık (Yüksekokul)",
    "Sigortacılık ve Aktüerya Bilimleri",
    "Sigortacılık ve Risk Yönetimi",
    "Sigortacılık ve Sosyal Güvenlik",
    "Silah Sanayi Teknikerliği",
    "Sinema ve Dijital Medya",
    "Sinema ve Televizyon",
    "Sınıf Öğretmenliği",
    "Sinoloji",
    "Sivil Hava Ulaştırma İşletmeciliği",
    "Sivil Hava Ulaştırma İşletmeciliği (Açıköğretim)",
    "Sivil Havacılık Kabin Hizmetleri",
    "Sivil Savunma ve İtfaiyecilik",
    "Siyasal Bilimler",
    "Siyaset Bilimi",
    "Siyaset Bilimi ve Kamu Yönetimi",
    "Siyaset Bilimi ve Kamu Yönetimi (Açıköğretim)",
    "Siyaset Bilimi ve Uluslararası İlişkiler",
    "Siyaset Bilimi ve Uluslararası İlişkiler (Açıköğretim)",
    "Sondaj Teknolojisi",
    "Sosyal Bilgiler Öğretmenliği",
    "Sosyal Güvenlik",
    "Sosyal Hizmet",
    "Sosyal Hizmet (Açıköğretim)",
    "Sosyal Hizmet (Fakülte)",
    "Sosyal Hizmet (Yüksekokul)",
    "Sosyal Hizmetler",
    "Sosyal Hizmetler (Açıköğretim)",
    "Sosyal Medya Yöneticiliği (Açıköğretim)",
    "Sosyoloji",
    "Sosyoloji (Açıköğretim)",
    "Spor Yöneticiliği",
    "Spor Yöneticiliği (Fakülte)",
    "Spor Yöneticiliği (Yüksekokul)",
    "Spor Yönetimi",
    "Spor Yönetimi (Açıköğretim)",
    "Su Altı Kaynak Teknolojisi",
    "Su Altı Teknolojisi",
    "Su Bilimleri ve Mühendisliği",
    "Su Ürünleri Endüstrisi Mühendisliği",
    "Su Ürünleri İşleme Teknolojisi",
    "Su Ürünleri Mühendisliği",
    "Sulama Teknolojisi",
    "Sümeroloji",
    "Süryani Dili ve Edebiyatı",
    "Süt Teknolojisi",
    "Süt ve Besi Hayvancılığı",
    "Süt ve Ürünleri Teknolojisi",
    "Şarap Üretim Teknolojisi",
    "Şehir ve Bölge Planlama",
    "Tahribatsız Muayene",
    "Takı Tasarımı",
    "Takı Tasarımı (Fakülte)",
    "Takı Tasarımı (Yüksekokul)",
    "Takı Tasarımı ve İmalatı",
    "Tapu Kadastro",
    "Tapu ve Kadastro",
    "Tarih",
    "Tarih (Açıköğretim)",
    "Tarih Öğretmenliği",
    "Tarih Öncesi Arkeolojisi",
    "Tarım Ekonomisi",
    "Tarım Makineleri",
    "Tarım Makineleri ve Teknolojileri Mühendisliği",
    "Tarım Teknolojisi (Açıköğretim)",
    "Tarım Ticareti ve İşletmeciliği",
    "Tarımsal Biyoteknoloji",
    "Tarımsal Genetik Mühendisliği",
    "Tarımsal İşletmecilik",
    "Tarımsal Yapılar ve Sulama",
    "Tarla Bitkileri",
    "Tarla Bitkileri",
    "Tarla Bitkileri (Önlisans)",
    "Teknoloji ve Bilgi Yönetimi",
    "Tekstil Mühendisliği",
    "Tekstil Mühendisliği (M.T.O.K.)",
    "Tekstil Tasarımı",
    "Tekstil Tasarımı (M.T.O.K.)",
    "Tekstil Teknolojisi",
    "Tekstil ve Halı Makineleri",
    "Tekstil ve Moda Tasarımı",
    "Tekstil ve Moda Tasarımı (Açıköğretim)",
    "Tekstil ve Moda Tasarımı (Fakülte)",
    "Tekstil ve Moda Tasarımı (Yüksekokul)",
    "Televizyon Haberciliği ve Programcılığı",
    "Tıbbi Dokümantasyon ve Sekreterlik",
    "Tıbbi Dokümantasyon ve Sekreterlik (Açıköğretim)",
    "Tıbbi Görüntüleme Teknikleri",
    "Tıbbi Laboratuvar Teknikleri",
    "Tıbbi Tanıtım ve Pazarlama",
    "Tıbbi ve Aromatik Bitkiler",
    "Tıp",
    "Tıp Mühendisliği",
    "Tiyatro Eleştirmenliği ve Dramaturji",
    "Tohum Bilimi ve Teknolojisi",
    "Tohumculuk Teknolojisi",
    "Toprak Bilimi ve Bitki Besleme",
    "Turist Rehberliği",
    "Turizm Animasyonu",
    "Turizm İşletmeciliği",
    "Turizm İşletmeciliği (Fakülte)",
    "Turizm İşletmeciliği (Yüksekokul)",
    "Turizm Rehberliği",
    "Turizm Rehberliği (Fakülte)",
    "Turizm Rehberliği (Yüksekokul)",
    "Turizm ve Otel İşletmeciliği",
    "Turizm ve Otel İşletmeciliği",
    "Turizm ve Otel İşletmeciliği (Açıköğretim)",
    "Turizm ve Otel İşletmeciliği (Önlisans)",
    "Turizm ve Seyahat Hizmetleri",
    "Türk Dili ve Edebiyatı",
    "Türk Dili ve Edebiyatı (Açıköğretim)",
    "Türk Dili ve Edebiyatı Öğretmenliği",
    "Türk Halkbilimi",
    "Türk İslam Arkeolojisi",
    "Türkçe Öğretmenliği",
    "Türkçe Öğretmenliği",
    "Türkoloji",
    "Tütün Eksperliği",
    "Uçak Bakım ve Onarım",
    "Uçak Bakım ve Onarım (Fakülte)",
    "Uçak Bakım ve Onarım (Yüksekokul)",
    "Uçak Elektrik ve Elektroniği",
    "Uçak Gövde ve Motor Bakımı",
    "Uçak Gövde ve Motor Bakımı (Fakülte)",
    "Uçak Gövde ve Motor Bakımı (Yüksekokul)",
    "Uçak Mühendisliği",
    "Uçak Teknolojisi",
    "Uçuş Harekat Yöneticiliği",
    "Ukrayna Dili ve Edebiyatı",
    "Ulaştırma ve Trafik Hizmetleri",
    "Uluslararası Ekonomi",
    "Uluslararası Ekonomik İlişkiler",
    "Uluslararası Finans",
    "Uluslararası Finans ve Bankacılık",
    "Uluslararası Girişimcilik",
    "Uluslararası Girişimcilik (Açıköğretim)",
    "Uluslararası İlişkiler",
    "Uluslararası İlişkiler (Açıköğretim)",
    "Uluslararası İşletme Yönetimi",
    "Uluslararası Ticaret",
    "Uluslararası Ticaret (Fakülte)",
    "Uluslararası Ticaret (Yüksekokul)",
    "Uluslararası Ticaret ve Finans",
    "Uluslararası Ticaret ve Finansman",
    "Uluslararası Ticaret ve Finansman (Fakülte)",
    "Uluslararası Ticaret ve Finansman (Yüksekokul)",
    "Uluslararası Ticaret ve İşletmecilik",
    "Uluslararası Ticaret ve İşletmecilik (Fakülte)",
    "Uluslararası Ticaret ve İşletmecilik (Yüksekokul)",
    "Uluslararası Ticaret ve Lojistik",
    "Uluslararası Ticaret ve Lojistik (Açıköğretim)",
    "Uluslararası Ticaret ve Lojistik (Fakülte)",
    "Uluslararası Ticaret ve Lojistik (Yüksekokul)",
    "Un ve Unlu Mamuller Teknolojisi",
    "Urdu Dili ve Edebiyatı",
    "Uygulamalı İngilizce Çevirmenlik",
    "Uygulamalı İspanyolca Çevirmenlik",
    "Uzay Bilimleri ve Teknolojileri",
    "Uzay Mühendisliği",
    "Uzay ve Uydu Mühendisliği",
    "Üretimde Kalite Kontrol",
    "Veri Bilimi ve Analitiği",
    "Veterinerlik",
    "Yaban Hayatı Ekolojisi ve Yönetimi",
    "Yağ Endüstrisi",
    "Yapay Zeka Mühendisliği",
    "Yapay Zekâ Operatörlüğü",
    "Yapay Zeka ve Makine Öğrenmesi",
    "Yapay Zeka ve Veri Mühendisliği",
    "Yapı Denetimi",
    "Yapı Ressamlığı",
    "Yapı Tesisat Teknolojisi",
    "Yapı Yalıtım Teknolojisi",
    "Yaşlı Bakımı",
    "Yaşlı Bakımı (Açıköğretim)",
    "Yat Kaptanlığı",
    "Yazılım Geliştirme",
    "Yazılım Geliştirme (Fakülte)",
    "Yazılım Geliştirme (Yüksekokul)",
    "Yazılım Mühendisliği",
    "Yazılım Mühendisliği (M.T.O.K.)",
    "Yeni Medya",
    "Yeni Medya (Fakülte)",
    "Yeni Medya ve Gazetecilik (Açıköğretim)",
    "Yeni Medya ve İletişim",
    "Yerel Yönetimler",
    "Yerel Yönetimler",
    "Yerel Yönetimler (Açıköğretim)",
    "Yerel Yönetimler (Önlisans)",
    "Yiyecek ve İçecek İşletmeciliği",
    "Yönetim Bilimleri Programları",
    "Yönetim Bilişim Sistemleri",
    "Yönetim Bilişim Sistemleri (Açıköğretim)",
    "Yönetim Bilişim Sistemleri (Fakülte)",
    "Yönetim Bilişim Sistemleri (Yüksekokul)",
    "Yunan Dili ve Edebiyatı",
    "Zaza Dili ve Edebiyatı",
    "Zeytincilik ve Zeytin İşleme Teknolojisi",
    "Ziraat Mühendisliği Programları",
    "Zootekni"
];

// Custom dropdown setup function
function setupCustomDropdowns(eventId) {
    const card = document.querySelector(`[data-event-id="${eventId}"]`);
    if (!card) return;

    const universityInput = card.querySelector('input[name="university"]');
    const departmentInput = card.querySelector('input[name="department"]');
    const universityDropdown = card.querySelector('.university-dropdown');
    const departmentDropdown = card.querySelector('.department-dropdown');

    if (universityInput && universityDropdown) {
        setupCustomDropdown(universityInput, universityDropdown, universities);
    }

    if (departmentInput && departmentDropdown) {
        setupCustomDropdown(departmentInput, departmentDropdown, departments);
    }
}

function setupCustomDropdown(input, dropdown, data) {
    function renderItems(filter = '') {
        dropdown.innerHTML = '';
        const filteredData = data.filter(item => item.toLowerCase().includes(filter.toLowerCase()));
        filteredData.slice(0, 10).forEach(item => {
            const div = document.createElement('div');
            div.textContent = item;
            div.className = 'custom-dropdown-item';
            div.addEventListener('click', () => {
                input.value = item;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(div);
        });
    }

    input.addEventListener('focus', () => {
        renderItems(input.value);
        dropdown.style.display = 'block';
    });
    
    input.addEventListener('input', () => {
        renderItems(input.value);
        if (dropdown.style.display !== 'block') {
            dropdown.style.display = 'block';
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Event registration form handler
async function handleEventRegistration(eventId, formData) {
    const card = document.querySelector(`[data-event-id="${eventId}"]`);
    if (!card) return;

    try {
        // Convert FormData to object
        const data = Object.fromEntries(formData);
        data.eventId = eventId;
        data.registrationDate = new Date().toISOString();
        
        // Create registration
        await DatabaseService.createRegistration(data);
        
        // Show success message
    const regFormContainer = card.querySelector('.registration-form');
    const successMsg = card.querySelector('.success-message');
    
    if (regFormContainer && successMsg) {
        regFormContainer.style.display = 'none';
        successMsg.style.display = 'flex';
        }
        
        // Update participant count display
        const participantCount = card.querySelector('.participant-count');
        if (participantCount) {
            const currentCount = parseInt(participantCount.textContent.match(/\d+/)?.[0] || '0');
            participantCount.innerHTML = `<i class="fas fa-users"></i> ${currentCount + 1} Katılımcı`;
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    loadBlogPosts();
    loadEvents();
    
    // Event registration form handlers
    document.addEventListener('submit', function(e) {
        if (e.target.classList.contains('event-registration-form')) {
            e.preventDefault();
            const eventId = e.target.getAttribute('data-event-id');
            const formData = new FormData(e.target);
            handleEventRegistration(eventId, formData);
        }
    });
    
    // Announcement reaction handlers
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.reaction')) {
            const reaction = e.target.closest('.reaction');
            const announcementCard = reaction.closest('.announcement-card');
            const announcementId = announcementCard.dataset.announcementId;
            const reactionType = reaction.dataset.reaction;
            
            if (!announcementId || !reactionType) return;
            
            const parent = reaction.closest('.reactions');
            const currentlyActive = parent.querySelector('.reaction.active');
            const countSpan = reaction.querySelector('.count');
            let count = parseInt(countSpan.textContent);

            try {
                if (reaction.classList.contains('active')) {
                    // Aynı reaksiyona tekrar tıklandıysa, iptal et
                    await DatabaseService.updateAnnouncementReaction(announcementId, reactionType, false);
                    reaction.classList.remove('active');
                    countSpan.textContent = count - 1;
                } else {
                    // Eski aktif reaksiyonu bul ve sayısını azalt
                    const oldActiveReaction = parent.querySelector('.reaction.active');
                    if (oldActiveReaction && oldActiveReaction !== reaction) {
                        const oldCountSpan = oldActiveReaction.querySelector('.count');
                        const oldCount = parseInt(oldCountSpan.textContent);
                        oldCountSpan.textContent = oldCount - 1;
                        oldActiveReaction.classList.remove('active');
                    }
                    
                    // Yeni reaksiyonu aktif yap ve sayısını artır
                    await DatabaseService.updateAnnouncementReaction(announcementId, reactionType, true);
                    reaction.classList.add('active');
                    countSpan.textContent = count + 1;
                    
                    // Konfeti ve ışık efektlerini tetikle
                    triggerAnnouncementEffects(announcementCard, reactionType);
                }
                
                // Total votes'u ve progress bar'ları güncelle
                updateVoteDisplay(announcementCard);
                
            } catch (error) {
                console.error('Error updating reaction:', error);
                alert('Reaksiyon güncellenirken bir hata oluştu.');
            }
        }
    });
    
    // Konfeti ve ışık efektleri
    function triggerAnnouncementEffects(card, reactionType) {
        const confettiColors = {
            onay: ['#3b5998', '#ffffff', '#cfe2ff'],
            katiliyorum: ['#28a745', '#ffffff', '#a3d9b1'],
            katilamiyorum: ['#dc3545', '#6c757d', '#f8d7da'],
            'sorum_var': ['#ffc107', '#ffffff', '#ffeeba'],
            destek: ['#6c63ff', '#f5d5e4', '#dcd9ff']
        };

        // Konfeti animasyonunu tetikle
        const container = document.createElement('div');
        container.className = 'confetti-container';
        card.appendChild(container);

        const colors = confettiColors[reactionType] || ['#000000'];
        const confettiCount = 250; // DAHA DA ŞEN ŞAKRAK!

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            if (Math.random() > 0.3) {
                const size = Math.random() * 10 + 5;
                confetti.style.width = `${size}px`;
                confetti.style.height = `${size}px`;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            } else {
                confetti.style.width = `${Math.random() * 4 + 3}px`;
                confetti.style.height = `${Math.random() * 15 + 10}px`;
                confetti.style.borderRadius = '0';
            }

            const angle = Math.random() * 2 * Math.PI;
            const velocity = Math.random() * 300 + 200;
            const xEnd = Math.cos(angle) * velocity;
            const yEnd = Math.sin(angle) * velocity + (Math.random() * 150 + 200);
            const rotation = Math.random() * 1080 - 540;
            const duration = Math.random() * 2 + 2.5;

            confetti.style.setProperty('--x-end', `${xEnd}px`);
            confetti.style.setProperty('--y-end', `${yEnd}px`);
            confetti.style.setProperty('--rotation', `${rotation}deg`);
            confetti.style.animation = `confetti-burst ${duration}s cubic-bezier(0.1, 0.9, 0.2, 1) forwards`;
            
            container.appendChild(confetti);
        }

        // Işık animasyonunu tetikle
        const glowClass = 'glow-' + reactionType;
        // Önceki animasyon class'ını temizle ve yenisini ekle
        card.className = card.className.replace(/\bglow-\w+/g, '');
        void card.offsetWidth; // Reflow tetiklemesi animasyonun yeniden çalışmasını sağlar
        card.classList.add(glowClass);

        // Animasyon bittiğinde class'ı temizle
        card.addEventListener('animationend', function handler(e) {
            if (e.animationName === 'glowPulse') {
                card.className = card.className.replace(/\bglow-\w+/g, '');
                card.removeEventListener('animationend', handler);
            }
        });

        // Konfeti container'ını temizle
        setTimeout(() => {
            if (container.parentNode) {
                container.remove();
            }
        }, 4000);
    }
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

// Sayfa tamamen yüklendikten sonra ekstra güvenlik kontrolü
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.announcement-card').forEach(card => {
            updateVoteDisplay(card);
        });
    }, 1500);
});
