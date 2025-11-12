// Preloader
const preloader = document.getElementById('preloader');

// Hide preloader function
function hidePreloader() {
    if (preloader) {
        preloader.classList.add('hide');
        // Preloader tamamen kapandıktan sonra kaydırmayı etkinleştir
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 800);
    }
}

// Sayfa yüklendiğinde preloader açıkken kaydırmayı engelle ve en üste dön
document.addEventListener('DOMContentLoaded', async function() {
    document.body.style.overflow = 'hidden';
    // Sayfa yenilendiğinde en üste dön
    window.scrollTo(0, 0);
    
    // Check user login status and update UI
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await updateUserUI(user);
    }
    
    // Scroll indicator click handler
    const scrollIndicator = document.querySelector('.scroll-arrow');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('#about')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
});

// Typewriter animation removed - using static text with CSS animations instead

// Mobile Navigation - Hamburger kaldırıldı, artık gerek yok

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        // Boş hash veya sadece # kontrolü
        if (!href || href === '#' || href.length <= 1) {
            return;
        }
        const target = document.querySelector(href);
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
            // Preloader'ı gizle
            hidePreloader();
            return;
        }
        
        // Sort by created_at DESC (newest first)
        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
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
        
        // Preloader'ı gizle
        hidePreloader();
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogContainer.innerHTML = '<p class="no-posts">Blog yazıları yüklenirken bir hata oluştu.</p>';
        // Preloader'ı gizle
        hidePreloader();
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
        
        // Sort by created_at DESC (newest first)
        announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Her duyuru için kullanıcı etkileşimini kontrol et
        const announcementsWithInteractions = await Promise.all(
            announcements.map(async (announcement) => {
                const userInteraction = await DatabaseService.getUserInteraction(announcement.id);
                return { ...announcement, userInteraction };
            })
        );
        
        // Preloader'ı gizle
        hidePreloader();
        
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
        
        // Sort by date DESC (newest first)
        events.sort((a, b) => new Date(b.date) - new Date(a.date));
        
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
async function flipEventCard(eventId) {
    const card = document.querySelector(`[data-event-id="${eventId}"]`);
    if (card) {
        card.classList.add('is-flipped');
        setupCustomDropdowns(eventId);
        // Auto-fill form if user is logged in
        await autoFillEventForm(eventId);
    }
}

// Auto-fill event registration form with user data
async function autoFillEventForm(eventId) {
    try {
        // Check if user is logged in
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return; // User not logged in, skip auto-fill
        }
        
        // Fetch user member data
        const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('first_name, last_name, email, university, department')
            .eq('user_id', user.id)
            .single();
        
        if (memberError || !memberData) {
            return; // No member data found, skip auto-fill
        }
        
        // Find the form in the flipped card
        const form = document.querySelector(`[data-event-id="${eventId}"] .event-registration-form`);
        if (!form) return;
        
        // Fill form fields
        const fullnameInput = form.querySelector('input[name="fullname"]');
        const emailInput = form.querySelector('input[name="email"]');
        const universityInput = form.querySelector('input[name="university"]');
        const departmentInput = form.querySelector('input[name="department"]');
        
        if (fullnameInput && memberData.first_name && memberData.last_name) {
            fullnameInput.value = `${memberData.first_name} ${memberData.last_name}`;
            fullnameInput.classList.add('has-value');
            fullnameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (emailInput && memberData.email) {
            emailInput.value = memberData.email;
            emailInput.classList.add('has-value');
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (universityInput && memberData.university) {
            universityInput.value = memberData.university;
            universityInput.classList.add('has-value');
            universityInput.dispatchEvent(new Event('input', { bubbles: true }));
            // Trigger dropdown setup if needed
            setTimeout(() => {
                const dropdown = form.querySelector('.university-dropdown');
                if (dropdown && universities) {
                    setupCustomDropdown(universityInput, dropdown, universities);
                }
            }, 200);
        }
        
        if (departmentInput && memberData.department) {
            departmentInput.value = memberData.department;
            departmentInput.classList.add('has-value');
            departmentInput.dispatchEvent(new Event('input', { bubbles: true }));
            // Trigger dropdown setup if needed
            setTimeout(() => {
                const dropdown = form.querySelector('.department-dropdown');
                if (dropdown && departments) {
                    setupCustomDropdown(departmentInput, dropdown, departments);
                }
            }, 200);
        }
        
    } catch (error) {
        console.error('Error auto-filling event form:', error);
        // Silently fail - user can still fill manually
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

// Phone country codes
const phoneCountries = [
    { display: '🇹🇷 +90', value: '+90' },
    { display: '🇺🇸 +1', value: '+1' },
    { display: '🇬🇧 +44', value: '+44' },
    { display: '🇩🇪 +49', value: '+49' },
    { display: '🇫🇷 +33', value: '+33' },
    { display: '🇮🇹 +39', value: '+39' },
    { display: '🇪🇸 +34', value: '+34' },
    { display: '🇳🇱 +31', value: '+31' },
    { display: '🇧🇪 +32', value: '+32' },
    { display: '🇨🇭 +41', value: '+41' },
    { display: '🇦🇹 +43', value: '+43' },
    { display: '🇸🇪 +46', value: '+46' },
    { display: '🇳🇴 +47', value: '+47' },
    { display: '🇩🇰 +45', value: '+45' },
    { display: '🇫🇮 +358', value: '+358' },
    { display: '🇷🇺 +7', value: '+7' },
    { display: '🇨🇳 +86', value: '+86' },
    { display: '🇯🇵 +81', value: '+81' },
    { display: '🇰🇷 +82', value: '+82' },
    { display: '🇦🇪 +971', value: '+971' },
    { display: '🇸🇦 +966', value: '+966' }
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

function setupCustomDropdown(input, dropdown, data, valueMapper = null) {
    function renderItems(filter = '') {
        dropdown.innerHTML = '';
        const filteredData = data.filter(item => item.toLowerCase().includes(filter.toLowerCase()));
        filteredData.slice(0, 10).forEach(item => {
            const div = document.createElement('div');
            div.textContent = item;
            div.className = 'custom-dropdown-item';
            div.addEventListener('click', () => {
                input.value = item;
                // Add has-value class when item is selected
                if (input.value.trim()) {
                    input.classList.add('has-value');
                }
                // If valueMapper provided, set a data attribute with the mapped value
                if (valueMapper) {
                    const mappedValue = valueMapper(item);
                    input.setAttribute('data-value', mappedValue);
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(div);
        });
    }

    let isUserInteraction = false;
    
    input.addEventListener('mousedown', () => {
        isUserInteraction = true;
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Enter') {
            isUserInteraction = true;
        }
    });
    
    input.addEventListener('focus', (e) => {
        // Only open dropdown if it's a real user interaction
        if (isUserInteraction) {
        renderItems(input.value);
        dropdown.style.display = 'block';
        }
        isUserInteraction = false;
    });
    
    input.addEventListener('input', () => {
        // Only show dropdown on input if it's already open or user is typing
        if (dropdown.style.display === 'block' || isUserInteraction) {
        renderItems(input.value);
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

// Modern Navbar Scroll Behavior - Hide on scroll down, Show on scroll up or hover (ANLIK/REAL-TIME)
let lastScrollY = window.scrollY || 0;
let ticking = false;

function handleNavbarScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
    const navbar = document.querySelector('.navbar');
            const navMenu = document.querySelector('.nav-menu');
            const notificationsPanel = document.getElementById('notificationsPanel');
            const currentScrollY = window.scrollY;
            
            // Don't hide navbar if mobile menu is open
            const isMenuOpen = navMenu && navMenu.classList.contains('active');
            if (isMenuOpen) {
                ticking = false;
                return;
            }
            
            // Always keep shrunk and scrolled classes (navbar always small)
            navbar.classList.add('shrunk', 'scrolled');
            
            // Update notifications panel position based on navbar state
            if (notificationsPanel) {
                notificationsPanel.style.top = '56px';
            }
            
            // Determine scroll direction - ANLIK (real-time)
            const scrollingDown = currentScrollY > lastScrollY;
            const scrollingUp = currentScrollY < lastScrollY;
            
            // Hide/show behavior: ANLIK olarak işle
            if (currentScrollY <= 50) {
                // At top of page - always visible
                navbar.classList.remove('hidden');
                navbar.classList.add('visible');
            } else if (scrollingDown) {
                // Scrolling down - ANLIK gizle
                navbar.classList.remove('visible');
                navbar.classList.add('hidden');
            } else if (scrollingUp) {
                // Scrolling up - ANLIK göster
                navbar.classList.remove('hidden');
                navbar.classList.add('visible');
            }
            
            // Update last scroll position
            lastScrollY = currentScrollY;
            ticking = false;
        });
        
        ticking = true;
    }
}

// Main scroll event listener - ANLIK işleme
window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// Close notifications panel on scroll
window.addEventListener('scroll', () => {
    const notificationsPanel = document.getElementById('notificationsPanel');
    if (notificationsPanel && notificationsPanel.classList.contains('active')) {
        notificationsPanel.classList.remove('active');
    }
}, { passive: true });

// Show navbar on hover
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    
    navbar.addEventListener('mouseenter', () => {
        navbar.classList.remove('hidden');
        navbar.classList.add('visible');
    });
});

// Handle window resize - reset scroll behavior
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const navbar = document.querySelector('.navbar');
        // Always keep shrunk and scrolled
        navbar.classList.add('shrunk', 'scrolled');
        // Reset navbar visibility state on resize
        if (window.scrollY <= 50) {
            navbar.classList.remove('hidden');
            navbar.classList.add('visible');
        }
        lastScrollY = window.scrollY || 0;
    }, 250);
}, { passive: true });

// Intersection Observer for Scroll Reveal Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Legacy support for old animation style
            if (entry.target.style.opacity === '0') {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            }
        }
    });
}, observerOptions);

// Observe elements for scroll reveal animation
document.addEventListener('DOMContentLoaded', () => {
    // New scroll reveal classes
    const scrollRevealElements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );
    scrollRevealElements.forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Legacy animated elements
    const animatedElements = document.querySelectorAll('.about-card, .event-card, .blog-card');
    animatedElements.forEach(el => {
        if (!el.classList.contains('scroll-reveal')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            scrollObserver.observe(el);
        }
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

// ============================================
// NOTIFICATIONS SYSTEM - IP/USER BASED
// ============================================

let notifications = [];
let unreadCount = 0;
let userIdentifier = null; // IP veya user ID
let visitedSections = new Set(); // Ziyaret edilen bölümler
let clickedItems = new Set(); // Tıklanan öğeler (blog post, event, announcement)

// Get user identifier (IP or user ID)
async function getUserIdentifier() {
    if (userIdentifier) return userIdentifier;
    
    try {
        // Check if user is logged in - use global supabase from database.js
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            userIdentifier = `user-${user.id}`;
        } else {
            // Get IP from localStorage or generate fingerprint
            userIdentifier = localStorage.getItem('userFingerprint');
            if (!userIdentifier) {
                const fingerprint = await DatabaseService.getUserFingerprint();
                userIdentifier = `ip-${fingerprint}`;
                localStorage.setItem('userFingerprint', userIdentifier);
            }
        }
        
        return userIdentifier;
    } catch (error) {
        console.error('Error getting user identifier:', error);
        return 'anonymous';
    }
}

// Load visited sections and clicked items from localStorage
function loadUserState() {
    if (!userIdentifier) return;
    const savedVisited = localStorage.getItem(`visitedSections-${userIdentifier}`);
    const savedClicked = localStorage.getItem(`clickedItems-${userIdentifier}`);
    
    if (savedVisited) {
        visitedSections = new Set(JSON.parse(savedVisited));
    }
    if (savedClicked) {
        clickedItems = new Set(JSON.parse(savedClicked));
    }
}

// Save user state to localStorage
function saveUserState() {
    if (!userIdentifier) return;
    localStorage.setItem(`visitedSections-${userIdentifier}`, JSON.stringify([...visitedSections]));
    localStorage.setItem(`clickedItems-${userIdentifier}`, JSON.stringify([...clickedItems]));
}

// Check if section is visited using Intersection Observer
function setupSectionObserver() {
    const sections = {
        'announcements': document.querySelector('#announcements'),
        'events': document.querySelector('#events'),
        'blog': document.querySelector('#blog')
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                const sectionId = entry.target.id;
                visitedSections.add(sectionId);
                saveUserState();
                
                // Mark related notifications as read
                markNotificationsAsReadBySection(sectionId);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px'
    });
    
    Object.values(sections).forEach(section => {
        if (section) observer.observe(section);
    });
}

// Mark notifications as read when section is visited
function markNotificationsAsReadBySection(sectionId) {
    let marked = false;
    notifications.forEach(notif => {
        if (notif.unread && notif.link === `#${sectionId}`) {
            notif.unread = false;
            unreadCount = Math.max(0, unreadCount - 1);
            marked = true;
        }
    });
    
    if (marked) {
        updateNotificationBadge();
        renderNotifications();
    }
}

// Track clicks on blog posts, events, announcements
function setupClickTracking() {
    // Blog posts
    document.addEventListener('click', (e) => {
        const blogCard = e.target.closest('.blog-card');
        if (blogCard) {
            const blogId = blogCard.dataset.blogId;
            if (blogId) {
                clickedItems.add(`blog-${blogId}`);
                saveUserState();
                markNotificationAsRead(`blog-${blogId}`);
            }
        }
        
        // Announcements
        const announcementCard = e.target.closest('.announcement-card');
        if (announcementCard) {
            const announcementId = announcementCard.dataset.announcementId;
            if (announcementId) {
                clickedItems.add(`announcement-${announcementId}`);
                saveUserState();
                markNotificationAsRead(`announcement-${announcementId}`);
            }
        }
        
        // Events
        const eventCard = e.target.closest('.event-card');
        if (eventCard) {
            const eventId = eventCard.dataset.eventId;
            if (eventId) {
                clickedItems.add(`event-${eventId}`);
                saveUserState();
                markNotificationAsRead(`event-${eventId}`);
            }
        }
    });
}

// Notifications Panel Toggle
const notificationsBtn = document.querySelector('.notifications-btn');
const notificationsPanel = document.getElementById('notificationsPanel');
const notificationsClose = document.querySelector('.notifications-close');
const notificationsList = document.getElementById('notificationsList');
const notificationBadge = document.querySelector('.notification-badge');

if (notificationsBtn && notificationsPanel) {
    notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationsPanel.classList.toggle('active');
    });

    if (notificationsClose) {
        notificationsClose.addEventListener('click', () => {
            notificationsPanel.classList.remove('active');
        });
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationsPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
            notificationsPanel.classList.remove('active');
        }
    });
}

// Check for new notifications
async function checkNotifications() {
    try {
        await getUserIdentifier();
        loadUserState();
        
        // Get new announcements, events, and blog posts
        const announcements = await DatabaseService.getAnnouncements();
        const events = await DatabaseService.getEvents();
        const blogPosts = await DatabaseService.getBlogPosts();
        
        const newNotifications = [];
        
        // Check announcements
        announcements.forEach(announcement => {
            const notifId = `announcement-${announcement.id}`;
            const isClicked = clickedItems.has(notifId);
            const isVisited = visitedSections.has('announcements');
            
            // Only add if not clicked and section not visited
            if (!isClicked && !isVisited) {
                newNotifications.push({
                    id: notifId,
                    type: 'announcement',
                    title: 'Yeni Duyuru',
                    message: announcement.title,
                    icon: 'fa-bullhorn',
                    time: announcement.created_at,
                    link: '#announcements',
                    itemId: announcement.id
                });
            }
        });
        
        // Check events
        events.forEach(event => {
            const notifId = `event-${event.id}`;
            const isClicked = clickedItems.has(notifId);
            const isVisited = visitedSections.has('events');
            
            if (!isClicked && !isVisited) {
                newNotifications.push({
                    id: notifId,
                    type: 'event',
                    title: 'Yeni Etkinlik',
                    message: event.title,
                    icon: 'fa-calendar-alt',
                    time: event.created_at,
                    link: '#events',
                    itemId: event.id
                });
            }
        });
        
        // Check blog posts
        blogPosts.forEach(post => {
            const notifId = `blog-${post.id}`;
            const isClicked = clickedItems.has(notifId);
            const isVisited = visitedSections.has('blog');
            
            if (!isClicked && !isVisited) {
                newNotifications.push({
                    id: notifId,
                    type: 'blog',
                    title: 'Yeni Blog',
                    message: post.title,
                    icon: 'fa-blog',
                    time: post.created_at,
                    link: '#blog',
                    itemId: post.id
                });
            }
        });
        
        // Add new notifications (only if not already exists)
        newNotifications.forEach(notif => {
            if (!notifications.find(n => n.id === notif.id)) {
                notif.unread = true;
                notifications.unshift(notif);
                unreadCount++;
            }
        });
        
        // Update UI
        updateNotificationBadge();
        renderNotifications();
        
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

// Update notification badge
function updateNotificationBadge() {
    if (notificationBadge) {
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            notificationBadge.classList.add('show');
            notificationBadge.classList.add('pulse');
            setTimeout(() => {
                notificationBadge.classList.remove('pulse');
            }, 600);
        } else {
            notificationBadge.classList.remove('show');
        }
    }
}

// Render notifications
function renderNotifications() {
    if (!notificationsList) return;
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>Henüz bildirim yok</p>
            </div>
        `;
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notif => {
        const timeAgo = getTimeAgo(notif.time);
        const unreadClass = notif.unread ? 'unread' : '';
        return `
            <div class="notification-item ${unreadClass}" data-notification-id="${notif.id}">
                <div class="notification-icon">
                    <i class="fas ${notif.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    notificationsList.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notifId = item.dataset.notificationId;
            const notif = notifications.find(n => n.id === notifId);
            if (notif && notif.link) {
                // Scroll to section
                const targetSection = document.querySelector(notif.link);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Mark as read after scroll
                    setTimeout(() => {
                        markNotificationAsRead(notifId);
                    }, 500);
                }
            }
        });
    });
}

// Mark notification as read
function markNotificationAsRead(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (notif && notif.unread) {
        notif.unread = false;
        unreadCount = Math.max(0, unreadCount - 1);
        updateNotificationBadge();
        renderNotifications();
    }
}

// Get time ago string
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk`;
    if (diffHours < 24) return `${diffHours} sa`;
    if (diffDays < 7) return `${diffDays} gün`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', async () => {
    await getUserIdentifier();
    loadUserState();
    setupSectionObserver();
    setupClickTracking();
    checkNotifications();
    // Check for new notifications every 5 minutes
    setInterval(checkNotifications, 5 * 60 * 1000);
});

// ============================================
// PROFILE MODAL - AUTHENTICATION SYSTEM
// ============================================

const profileBtn = document.querySelector('.profile-btn');
const profileModal = document.getElementById('profileModal');
const profileModalBackdrop = document.getElementById('profileModalBackdrop');
const profileModalClose = document.getElementById('profileModalClose');
const profileModalTitle = document.getElementById('profileModalTitle');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');

// Open/Close Profile Modal
if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', async () => {
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // User is logged in - show profile page
            showProfilePage(user);
        } else {
            // User is not logged in - show login/signup
            showAuthForms();
        }
        
        profileModal.classList.add('active');
        profileModalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    function closeProfileModal() {
        // Close avatar selection modal if open
        if (avatarSelectionModal && avatarSelectionModal.style.display !== 'none') {
            avatarSelectionModal.style.display = 'none';
        }
        
        profileModal.classList.remove('active');
        profileModalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        
        // Scroll profile page to top AFTER modal closes (user won't see the scroll)
        setTimeout(() => {
            const profilePage = document.getElementById('profilePage');
            if (profilePage && profilePage.style.display !== 'none') {
                const profilePageContainer = profilePage.closest('.modal-body');
                if (profilePageContainer) {
                    profilePageContainer.scrollTop = 0;
                }
            }
        }, 300); // Wait for modal close animation to complete
    }

    if (profileModalClose) {
        profileModalClose.addEventListener('click', closeProfileModal);
    }

    if (profileModalBackdrop) {
        profileModalBackdrop.addEventListener('click', closeProfileModal);
    }

    // Switch between login and signup
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            profileModalTitle.textContent = 'Üye Ol';
            // Setup dropdowns when signup form is shown
            setTimeout(() => {
                setupProfileDropdowns();
            }, 100);
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            profileModalTitle.textContent = 'Giriş Yap';
        });
    }
    
    // Setup dropdowns when profile modal opens
    profileBtn.addEventListener('click', () => {
        setTimeout(() => {
            if (signupForm.style.display !== 'none') {
                setupProfileDropdowns();
            }
        }, 100);
    });
    
    // Setup profile dropdowns
    function setupProfileDropdowns() {
        const universityInput = document.getElementById('signupUniversity');
        const departmentInput = document.getElementById('signupDepartment');
        const universityDropdown = document.querySelector('.university-dropdown-profile');
        const departmentDropdown = document.querySelector('.department-dropdown-profile');
        
        if (universityInput && universityDropdown) {
            setupCustomDropdown(universityInput, universityDropdown, universities);
        }
        
        if (departmentInput && departmentDropdown) {
            setupCustomDropdown(departmentInput, departmentDropdown, departments);
        }
    }
    
    // Setup all input fields for has-value class (label animation) - global setup
    function setupInputLabelAnimations(container = document) {
        const allInputs = container.querySelectorAll('.animated-form-control input');
        allInputs.forEach(input => {
            // Skip if already has listener (check for data attribute)
            if (input.dataset.hasLabelListener === 'true') return;
            
            // Mark as having listener
            input.dataset.hasLabelListener = 'true';
            
            // For password and tel inputs, always start without has-value (they should be empty)
            if (input.type === 'password' || input.type === 'tel') {
                input.classList.remove('has-value');
                // Ensure label is in default position if empty
                if (!input.value.trim()) {
                    input.dispatchEvent(new Event('blur', { bubbles: true }));
                }
            } else {
                // Check initial value for other inputs
                if (input.value.trim()) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            }
            
            // Add event listener for input changes
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.add('has-value');
                } else {
                    this.classList.remove('has-value');
                }
            });
            
            // Also handle focus/blur for readonly inputs
            if (input.readOnly && input.value.trim()) {
                input.classList.add('has-value');
            }
        });
    }
    
    // Setup input animations when modal opens
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            setTimeout(() => {
                setupInputLabelAnimations(profileModal);
            }, 100);
        });
    }
    
    // Setup input animations on page load
    document.addEventListener('DOMContentLoaded', () => {
        setupInputLabelAnimations();
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetId = toggle.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.classList.remove('fa-eye');
                    toggle.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    toggle.classList.remove('fa-eye-slash');
                    toggle.classList.add('fa-eye');
                }
            }
        });
    });
    
    // Handle select change for label animation
    const signupGrade = document.getElementById('signupGrade');
    if (signupGrade) {
        signupGrade.addEventListener('change', function() {
            // Add/remove class to trigger label animation
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    }

    // Login Form Submit
    if (loginFormElement) {
        let isLoginSubmitting = false; // Prevent double submission
        
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Prevent double submission
            if (isLoginSubmitting) {
                return;
            }
            
            const loginSubmitButton = loginFormElement.querySelector('button[type="submit"]');
            const originalLoginButtonText = loginSubmitButton ? loginSubmitButton.innerHTML : '';
            
            // Disable button and show loading state
            if (loginSubmitButton) {
                loginSubmitButton.disabled = true;
                loginSubmitButton.setAttribute('aria-busy', 'true');
                loginSubmitButton.classList.add('disabled');
                loginSubmitButton.style.transform = 'none';
                loginSubmitButton.style.boxShadow = 'none';
                loginSubmitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
            }
            
            isLoginSubmitting = true;
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                // Supabase authentication - use global supabase from database.js
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                
                // Success - show beautiful notification
                const { data: memberData } = await supabase
                    .from('members')
                    .select('first_name, last_name')
                    .eq('user_id', data.user.id)
                    .single();
                
                const userName = memberData ? `${memberData.first_name} ${memberData.last_name}` : data.user?.email?.split('@')[0] || 'Kullanıcı';
                showAlert('success', '🎉 Giriş Başarılı!', `Hoş geldiniz, ${userName}! Hesabınıza başarıyla giriş yaptınız.`);
                closeProfileModal();
                loginFormElement.reset();
                
                // Update UI to show logged in state
                await updateUserUI(data.user);
                
                // Re-enable button
                if (loginSubmitButton) {
                    loginSubmitButton.disabled = false;
                    loginSubmitButton.removeAttribute('aria-busy');
                    loginSubmitButton.classList.remove('disabled');
                    loginSubmitButton.style.transform = '';
                    loginSubmitButton.style.boxShadow = '';
                    loginSubmitButton.innerHTML = originalLoginButtonText;
                }
                isLoginSubmitting = false;
                
            } catch (error) {
                let errorMessage = 'E-posta veya şifre hatalı.';
                if (error.message) {
                    if (error.message.includes('Invalid login credentials')) {
                        errorMessage = 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
                    } else if (error.message.includes('Email not confirmed')) {
                        errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor. Lütfen e-postanızı kontrol edin.';
                    } else {
                        errorMessage = error.message;
                    }
                }
                showAlert('error', '❌ Giriş Hatası', errorMessage);
                
                // Re-enable button on error
                if (loginSubmitButton) {
                    loginSubmitButton.disabled = false;
                    loginSubmitButton.removeAttribute('aria-busy');
                    loginSubmitButton.classList.remove('disabled');
                    loginSubmitButton.style.transform = '';
                    loginSubmitButton.style.boxShadow = '';
                    loginSubmitButton.innerHTML = originalLoginButtonText;
                }
                isLoginSubmitting = false;
            }
        });
    }

    // Signup Form Submit
    if (signupFormElement) {
        let isSubmitting = false; // Prevent double submission
        
        signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Prevent double submission
            if (isSubmitting) {
                return;
            }
            
            const submitButton = signupFormElement.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.innerHTML : '';
            
            // Disable button and show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.setAttribute('aria-busy', 'true');
                submitButton.classList.add('disabled');
                submitButton.style.transform = 'none';
                submitButton.style.boxShadow = 'none';
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
            }
            
            isSubmitting = true;
            
            const password = document.getElementById('signupPassword').value;
            const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
            
                if (password !== passwordConfirm) {
                    showAlert('error', 'Şifre hatası', 'Şifreler eşleşmiyor.');
                    // Re-enable button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.removeAttribute('aria-busy');
                        submitButton.classList.remove('disabled');
                        submitButton.style.transform = '';
                        submitButton.style.boxShadow = '';
                        submitButton.innerHTML = originalButtonText;
                    }
                    isSubmitting = false;
                    return;
                }
            
            // Get and validate email (sadece format kontrolü, domain'e karışmıyoruz)
            const emailInput = document.getElementById('signupEmail');
            const emailValue = emailInput.value.trim();
            
            // Sadece temel format kontrolü (boşluk, @ işareti, nokta kontrolü)
            // Domain validasyonu yapmıyoruz - her domain geçerli olabilir
            if (!emailValue || !emailValue.includes('@') || !emailValue.includes('.')) {
                showAlert('error', '❌ Geçersiz E-posta Formatı', 'Lütfen geçerli bir e-posta formatı girin. Örnek: kullanici@domain.com');
                emailInput.focus();
                return;
            }
            
            // HTML5 native validation'a güveniyoruz (type="email" zaten var)
            if (!emailInput.checkValidity()) {
                showAlert('error', '❌ Geçersiz E-posta Formatı', emailInput.validationMessage || 'Lütfen geçerli bir e-posta adresi girin.');
                emailInput.focus();
                return;
            }
            
            const formData = {
                email: emailValue,
                password: password,
                firstName: document.getElementById('signupFirstName').value.trim(),
                lastName: document.getElementById('signupLastName').value.trim(),
                phone: document.getElementById('signupPhone').value.trim(),
                university: document.getElementById('signupUniversity').value.trim(),
                department: document.getElementById('signupDepartment').value.trim()
            };
            
            try {
                // E-posta doğrulama sistemi tamamen kapatıldı
                // Artık e-posta doğrulama yapılmıyor - direkt kayıt ve giriş
                const emailVerificationEnabled = false; // Her zaman kapalı
                
                console.log('📧 E-posta doğrulama durumu: KAPALI (sistem iptal edildi)');
                
                // Create user in Supabase Auth - use global supabase from database.js
                // If email verification is disabled, we need to set email_confirm to true
                const signUpOptions = {
                    email: formData.email,
                    password: formData.password
                };
                
                // If email verification is disabled, we can try to auto-confirm
                // Note: This might require Supabase dashboard settings
                if (!emailVerificationEnabled) {
                    // Try to sign up without email confirmation requirement
                    signUpOptions.options = {
                        emailRedirectTo: undefined,
                        data: {
                            email_verified: true
                        }
                    };
                }
                
                const { data: authData, error: authError } = await supabase.auth.signUp(signUpOptions);
                
                if (authError) throw authError;
                
                console.log('👤 Auth Data:', {
                    user: authData.user ? 'Var' : 'Yok',
                    session: authData.session ? 'Var' : 'Yok',
                    needsEmailConfirmation: authData.user && !authData.session
                });
                
                // Save user details to members table (if table exists)
                // Upsert kullanarak email zaten kayıtlıysa güncelle, yoksa ekle
                try {
                    const { error: dbError } = await supabase
                        .from('members')
                        .upsert([{
                            email: formData.email,
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                            phone: formData.phone,
                            university: formData.university,
                            department: formData.department,
                            user_id: authData.user?.id
                        }], {
                            onConflict: 'email',
                            ignoreDuplicates: false
                        });
                    
                    if (dbError) {
                        // 409 conflict hatası normal (email zaten kayıtlı), diğer hataları logla
                        if (dbError.code !== '23505') { // Unique violation
                            console.warn('Members table error:', dbError);
                        }
                        // Continue anyway - user created in auth
                    }
                } catch (dbErr) {
                    console.warn('Could not save to members table:', dbErr);
                    // Continue anyway - user created in auth
                }
                
                // Check if user is already signed in (session exists)
                // If email verification is disabled and user has session, they're already logged in
                if (!emailVerificationEnabled && authData.session) {
                    // User is already logged in, show success and close modal
                    showAlert('success', '🎉 Kayıt Başarılı!', `Hoş geldiniz, ${formData.firstName}! Hesabınız başarıyla oluşturuldu ve giriş yaptınız.`);
                    closeProfileModal();
                    signupFormElement.reset();
                    
                    // Update UI to show logged in state
                    await updateUserUI(authData.user);
                    
                    // Re-enable button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.removeAttribute('aria-busy');
                        submitButton.classList.remove('disabled');
                        submitButton.style.transform = '';
                        submitButton.style.boxShadow = '';
                        submitButton.innerHTML = originalButtonText;
                    }
                    isSubmitting = false;
                    return;
                }
                
                // E-posta doğrulama sistemi tamamen kapatıldı - direkt giriş akışı
                // E-posta doğrulama formu gösterilmiyor, direkt login formuna yönlendiriliyor
                // Kullanıcı oluşturuldu, şimdi giriş yapmayı dene
                // Supabase'de e-posta doğrulama kapalı olsa bile, bazen session oluşmuyor
                // Bu durumda manuel olarak giriş yapmayı deneyelim
                
                let loggedIn = false;
                
                // Eğer session varsa, zaten giriş yapılmış
                if (authData.session) {
                    loggedIn = true;
                    showAlert('success', '🎉 Kayıt Başarılı!', `Hoş geldiniz, ${formData.firstName}! Hesabınız başarıyla oluşturuldu ve giriş yaptınız.`);
                    closeProfileModal();
                    signupFormElement.reset();
                    await updateUserUI(authData.user);
                } else {
                    // Session yoksa, manuel olarak giriş yapmayı dene
                    try {
                        console.log('🔄 Oturum yok, manuel giriş deneniyor...');
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: formData.email,
                            password: formData.password
                        });
                        
                        if (signInError) {
                            console.warn('⚠️ Otomatik giriş başarısız:', signInError);
                            // Giriş başarısız, kullanıcıyı login formuna yönlendir
                            loggedIn = false;
                        } else {
                            console.log('✅ Manuel giriş başarılı!');
                            loggedIn = true;
                            showAlert('success', '🎉 Kayıt Başarılı!', `Hoş geldiniz, ${formData.firstName}! Hesabınız başarıyla oluşturuldu ve giriş yaptınız.`);
                            closeProfileModal();
                            signupFormElement.reset();
                            await updateUserUI(signInData.user);
                        }
                    } catch (signInErr) {
                        console.warn('⚠️ Giriş hatası:', signInErr);
                        loggedIn = false;
                    }
                }
                
                // Eğer giriş yapılamadıysa, login formuna yönlendir
                if (!loggedIn) {
                    // Hide signup form and show login form with email pre-filled
                    signupForm.style.display = 'none';
                    const emailVerificationForm = document.getElementById('emailVerificationForm');
                    if (emailVerificationForm) {
                        emailVerificationForm.style.display = 'none';
                    }
                    loginForm.style.display = 'block';
                    profileModalTitle.textContent = 'Giriş Yap';
                    
                    // Pre-fill email in login form
                    const loginEmailInput = document.getElementById('loginEmail');
                    if (loginEmailInput) {
                        loginEmailInput.value = formData.email;
                        // Trigger label animation if needed
                        if (loginEmailInput.value) {
                            loginEmailInput.classList.add('has-value');
                        }
                    }
                    
                    // Reset signup form
                    signupFormElement.reset();
                    
                    // Show success message
                    showAlert('success', '🎉 Kayıt Başarılı!', `Hoş geldiniz, ${formData.firstName}! Hesabınız başarıyla oluşturuldu. Şifrenizi girerek giriş yapabilirsiniz.`);
                    
                    // Focus on password field
                    setTimeout(() => {
                        const loginPasswordInput = document.getElementById('loginPassword');
                        if (loginPasswordInput) {
                            loginPasswordInput.focus();
                        }
                    }, 300);
                }
                
                // Re-enable button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.removeAttribute('aria-busy');
                    submitButton.classList.remove('disabled');
                    submitButton.style.transform = '';
                    submitButton.style.boxShadow = '';
                    submitButton.innerHTML = originalButtonText;
                }
                isSubmitting = false;
                
            } catch (error) {
                console.error('❌ Kayıt hatası detayları:', error);
                let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
                if (error.message) {
                    if (error.message.includes('Signups not allowed') || error.message.includes('signups not allowed')) {
                        errorMessage = 'Yeni kullanıcı kayıtları şu anda kapalı. Lütfen site yöneticisi ile iletişime geçin veya daha sonra tekrar deneyin.';
                    } else if (error.message.includes('User already registered') || error.message.includes('already registered')) {
                        errorMessage = 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin.';
                    } else if (error.message.includes('Password') || error.message.includes('password')) {
                        errorMessage = 'Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin (en az 6 karakter).';
                    } else if (error.message.includes('Email') || error.message.includes('email') || error.message.includes('invalid')) {
                        // E-posta validasyon hatası - daha genel mesaj
                        errorMessage = `E-posta adresi kabul edilmedi: "${formData.email}". Lütfen farklı bir e-posta adresi deneyin.`;
                    } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
                        errorMessage = 'Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.';
                    } else {
                        errorMessage = `Hata: ${error.message}`;
                    }
                }
                showAlert('error', '❌ Kayıt Hatası', errorMessage);
                
                // Re-enable button on error
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.style.cursor = 'pointer';
                    submitButton.innerHTML = originalButtonText;
                }
                isSubmitting = false;
            }
        });
    }
    
    // Back to signup button
    const backToSignupBtn = document.getElementById('backToSignupBtn');
    if (backToSignupBtn) {
        backToSignupBtn.addEventListener('click', () => {
            document.getElementById('emailVerificationForm').style.display = 'none';
            signupForm.style.display = 'block';
            profileModalTitle.textContent = 'Üye Ol';
        });
    }
    
    // Email verification form submit
    const emailVerificationFormElement = document.getElementById('emailVerificationFormElement');
    if (emailVerificationFormElement) {
        emailVerificationFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const codeInputs = document.querySelectorAll('.code-input');
            const code = Array.from(codeInputs).map(input => input.value).join('');
            
            if (code.length !== 6) {
                showAlert('error', '❌ Hata', 'Lütfen 6 haneli kodu eksiksiz girin.');
                return;
            }
            
            if (!window.pendingVerification) {
                showAlert('error', '❌ Hata', 'Doğrulama bilgileri bulunamadı. Lütfen tekrar kayıt olun.');
                return;
            }
            
            try {
                const result = await DatabaseService.verifyCode(window.pendingVerification.email, code);
                
                if (result.valid) {
                    // Confirm email in Supabase Auth
                    const { error: confirmError } = await supabase.auth.updateUser({
                        email: window.pendingVerification.email
                    });
                    
                    // Mark user as verified in members table if exists
                    if (window.pendingVerification.userId) {
                        try {
                            await supabase
                                .from('members')
                                .update({ email_verified: true })
                                .eq('user_id', window.pendingVerification.userId);
                        } catch (err) {
                            console.warn('Could not update members table:', err);
                        }
                    }
                    
                    showAlert('success', '🎉 Doğrulama Başarılı!', `Merhaba ${window.pendingVerification.firstName}! E-posta adresiniz doğrulandı. Artık giriş yapabilirsiniz.`);
                    
                    document.getElementById('emailVerificationForm').style.display = 'none';
                    loginForm.style.display = 'block';
                    profileModalTitle.textContent = 'Giriş Yap';
                    emailVerificationFormElement.reset();
                    window.pendingVerification = null;
                    
                } else {
                    showAlert('error', '❌ Geçersiz Kod', result.error || 'Girdiğiniz kod hatalı veya süresi dolmuş.');
                    // Clear inputs
                    codeInputs.forEach(input => input.value = '');
                    codeInputs[0].focus();
                }
            } catch (error) {
                showAlert('error', '❌ Hata', 'Kod doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
            }
        });
    }
    
    // Code input auto-focus and paste handling
    // This will be set up when verification form is shown
    let codeInputsSetup = false;
    function setupCodeInputs() {
        if (codeInputsSetup) return; // Already set up
        const codeInputs = document.querySelectorAll('.code-input');
        if (codeInputs.length === 0) return;
        
        codeInputsSetup = true;
        codeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.inputType === 'insertFromPaste') {
                const pastedData = e.clipboardData.getData('text').slice(0, 6);
                pastedData.split('').forEach((char, i) => {
                    if (codeInputs[i] && /[0-9]/.test(char)) {
                        codeInputs[i].value = char;
                    }
                });
                codeInputs[Math.min(pastedData.length - 1, 5)].focus();
                return;
            }
            
            if (/[0-9]/.test(input.value)) {
                if (index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            } else {
                input.value = '';
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        }); // Close forEach
    }
    
    // Setup code inputs when verification form is shown
    const originalEmailVerificationDisplay = document.getElementById('emailVerificationForm');
    if (originalEmailVerificationDisplay) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const form = document.getElementById('emailVerificationForm');
                    if (form && form.style.display !== 'none') {
                        setTimeout(() => {
                            setupCodeInputs();
                            // Focus first input
                            const firstInput = document.querySelector('.code-input');
                            if (firstInput) firstInput.focus();
                        }, 100);
                    }
                }
            });
        });
        observer.observe(originalEmailVerificationDisplay, { attributes: true });
    }
    
    // Resend code button
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', async () => {
            if (!window.pendingVerification) return;
            
            try {
                const verificationData = await DatabaseService.generateVerificationCode(
                    window.pendingVerification.email, 
                    window.pendingVerification.userId
                );
                
                if (typeof window.sendVerificationEmail === 'function') {
                    await window.sendVerificationEmail(
                        window.pendingVerification.email, 
                        window.pendingVerification.firstName, 
                        verificationData.code
                    );
                } else {
                    console.log(`📧 Yeni Doğrulama Kodu: ${verificationData.code}`);
                }
                
                showAlert('success', '✅ Kod Tekrar Gönderildi', 'Yeni doğrulama kodu e-posta adresinize gönderildi.');
                startVerificationTimer(600); // Reset timer
            } catch (error) {
                showAlert('error', '❌ Hata', 'Kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        });
    }
}

// Verification timer function
function startVerificationTimer(seconds) {
    const timerElement = document.getElementById('verificationTimer');
    if (!timerElement) return;
    
    let remaining = seconds;
    const updateTimer = () => {
        const minutes = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerElement.textContent = `Kod ${minutes}:${secs.toString().padStart(2, '0')} dakika geçerlidir`;
        
        if (remaining <= 0) {
            timerElement.textContent = 'Kodun süresi doldu. Yeni kod göndermek için "Kodu Tekrar Gönder" butonuna tıklayın.';
            timerElement.style.color = 'var(--color-accent-error)';
            return;
        }
        
        remaining--;
        setTimeout(updateTimer, 1000);
    };
    
    timerElement.style.color = 'var(--color-text-secondary)';
    updateTimer();
}

// Update user UI after login
async function updateUserUI(user) {
    if (user) {
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            // Get user data from members table
            const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('first_name, last_name, avatar_url')
                .eq('user_id', user.id)
                .maybeSingle();
            
            // Ignore errors if column doesn't exist yet (migration not run)
            if (memberError && memberError.code !== 'PGRST204' && memberError.code !== 'PGRST116') {
                console.warn('Error fetching member data:', memberError);
            }
            
            const userName = memberData ? `${memberData.first_name} ${memberData.last_name}` : user.email?.split('@')[0] || 'Kullanıcı';
            profileBtn.setAttribute('aria-label', `Profil - ${userName}`);
            
            // Update profile button with avatar or icon
            const profileIcon = profileBtn.querySelector('i');
            let profileAvatar = profileBtn.querySelector('.profile-avatar-img');
            
            if (memberData?.avatar_url) {
                // Show avatar
                if (profileIcon) profileIcon.style.display = 'none';
                if (!profileAvatar) {
                    const img = document.createElement('img');
                    img.src = memberData.avatar_url;
                    img.alt = userName;
                    img.className = 'profile-avatar-img';
                    profileBtn.appendChild(img);
                } else {
                    profileAvatar.src = memberData.avatar_url;
                }
                profileBtn.classList.add('has-avatar');
            } else {
                // Show icon with logged in indicator
                if (profileIcon) profileIcon.style.display = 'block';
                if (profileAvatar) profileAvatar.remove();
                profileBtn.classList.add('logged-in');
                profileBtn.classList.remove('has-avatar');
            }
        }
    } else {
        // User logged out - reset button
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            const profileIcon = profileBtn.querySelector('i');
            const profileAvatar = profileBtn.querySelector('.profile-avatar-img');
            if (profileIcon) profileIcon.style.display = 'block';
            if (profileAvatar) profileAvatar.remove();
            profileBtn.classList.remove('logged-in', 'has-avatar');
            profileBtn.setAttribute('aria-label', 'Profil');
        }
    }
}

// Show profile page (when logged in)
async function showProfilePage(user) {
    // Hide auth forms
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    const emailVerificationForm = document.getElementById('emailVerificationForm');
    if (emailVerificationForm) {
        emailVerificationForm.style.display = 'none';
    }
    
    // Show profile page
    const profilePage = document.getElementById('profilePage');
    if (profilePage) {
        profilePage.style.display = 'block';
        profileModalTitle.textContent = 'Profil';
        
        // Load user data
        const { data: memberData } = await supabase
            .from('members')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        // Populate form
        if (memberData) {
            const firstNameInput = document.getElementById('profileFirstName');
            const lastNameInput = document.getElementById('profileLastName');
            const emailInput = document.getElementById('profileEmail');
            const phoneInput = document.getElementById('profilePhone');
            const universityInput = document.getElementById('profileUniversity');
            const departmentInput = document.getElementById('profileDepartment');
            
            if (firstNameInput) {
                firstNameInput.value = memberData.first_name || '';
                if (firstNameInput.value.trim()) {
                    firstNameInput.classList.add('has-value');
                }
                firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (lastNameInput) {
                lastNameInput.value = memberData.last_name || '';
                if (lastNameInput.value.trim()) {
                    lastNameInput.classList.add('has-value');
                }
                lastNameInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (emailInput) {
                emailInput.value = memberData.email || user.email || '';
                // Trigger animation for readonly email
                if (emailInput.value.trim()) {
                    emailInput.classList.add('has-value');
                }
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                emailInput.dispatchEvent(new Event('focus', { bubbles: true }));
                emailInput.blur();
            }
            if (phoneInput) {
                const phoneValue = memberData.phone || '';
                // Extract country code if exists
                if (phoneValue.startsWith('+')) {
                    const parts = phoneValue.split(' ');
                    if (parts.length > 1) {
                        const countryCode = parts[0];
                        const phoneNumber = parts.slice(1).join(' ');
                        const countryInput = document.getElementById('profilePhoneCountry');
                        if (countryInput) {
                            // Find matching country display
                            const country = phoneCountries.find(c => c.value === countryCode);
                            if (country) {
                                countryInput.value = country.display;
                                countryInput.setAttribute('data-value', country.value);
                            } else {
                                countryInput.value = countryCode;
                                countryInput.setAttribute('data-value', countryCode);
                            }
                        }
                        phoneInput.value = phoneNumber;
                    } else {
                        phoneInput.value = phoneValue;
                    }
                } else {
                    phoneInput.value = phoneValue;
                }
                // Trigger label animation if value exists
                if (phoneInput.value && phoneInput.value.trim()) {
                    phoneInput.classList.add('has-value');
                    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    phoneInput.classList.remove('has-value');
                    // Ensure label is in default position
                    phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
                }
            }
            if (universityInput) {
                universityInput.value = memberData.university || '';
                if (universityInput.value.trim()) {
                    universityInput.classList.add('has-value');
                }
                // Don't trigger input event to avoid opening dropdown
            }
            if (departmentInput) {
                departmentInput.value = memberData.department || '';
                if (departmentInput.value.trim()) {
                    departmentInput.classList.add('has-value');
                }
                // Don't trigger input event to avoid opening dropdown
            }
            
            // Update header
            const userNameEl = document.getElementById('profileUserName');
            const userEmailEl = document.getElementById('profileUserEmail');
            if (userNameEl) userNameEl.textContent = `${memberData.first_name} ${memberData.last_name}`;
            if (userEmailEl) userEmailEl.textContent = memberData.email || user.email || '';
            
            // Update avatar preview
            if (memberData.avatar_url) {
                const avatarPreviewImg = document.getElementById('avatarPreviewImg');
                const avatarPreviewIcon = document.getElementById('avatarPreviewIcon');
                if (avatarPreviewImg) {
                    avatarPreviewImg.src = memberData.avatar_url;
                    avatarPreviewImg.style.display = 'block';
                }
                if (avatarPreviewIcon) avatarPreviewIcon.style.display = 'none';
            }
        } else {
            // Fallback to user email
            const userNameEl = document.getElementById('profileUserName');
            const userEmailEl = document.getElementById('profileUserEmail');
            if (userNameEl) userNameEl.textContent = user.email?.split('@')[0] || 'Kullanıcı';
            if (userEmailEl) userEmailEl.textContent = user.email || '';
            const emailInput = document.getElementById('profileEmail');
            if (emailInput) emailInput.value = user.email || '';
        }
        
        // Setup dropdowns
        setTimeout(() => {
            setupProfileEditDropdowns();
        }, 100);
        
        // Setup all input fields for has-value class (label animation)
        const allInputs = profilePage.querySelectorAll('.animated-form-control input');
        allInputs.forEach(input => {
            // Skip if already has listener (check for data attribute)
            if (input.dataset.hasLabelListener === 'true') return;
            
            // Mark as having listener
            input.dataset.hasLabelListener = 'true';
            
            // For password and tel inputs, always start without has-value (they should be empty)
            if (input.type === 'password' || input.type === 'tel') {
                input.classList.remove('has-value');
                // Ensure label is in default position
                if (!input.value.trim()) {
                    input.dispatchEvent(new Event('blur', { bubbles: true }));
                }
            } else {
                // Check initial value for other inputs
                if (input.value.trim()) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            }
            
            // Add event listener for input changes
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.add('has-value');
                } else {
                    this.classList.remove('has-value');
                }
            });
            
            // Also handle focus/blur for readonly inputs
            if (input.readOnly && input.value.trim()) {
                input.classList.add('has-value');
            }
        });
    }
}

// Show auth forms (when not logged in)
function showAuthForms() {
    const profilePage = document.getElementById('profilePage');
    if (profilePage) profilePage.style.display = 'none';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    const emailVerificationForm = document.getElementById('emailVerificationForm');
    if (emailVerificationForm) emailVerificationForm.style.display = 'none';
    profileModalTitle.textContent = 'Giriş Yap';
}

// ============================================
// PROFILE PAGE FUNCTIONALITY
// ============================================

// Avatar listesi - kulübe uygun avatarlar (mutlu ve deneysel bilimler)
// Not: DiceBear API'de mutlu yüzler için özel seed'ler kullanıyoruz
const AVATAR_LIST = [
    // Mutlu Genel Avatarlar (pozitif seed'ler)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile5',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=smile8',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=happy1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=happy2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=happy3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=happy4',
    
    // Biyoloji Temalı (gözlüklü, bilimsel görünüm)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology1&accessories=prescription02',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology2&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology3&accessories=prescription01',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology4&accessories=prescription02',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology5&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology6&accessories=prescription01',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology7&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=biology8&accessories=prescription02',
    
    // Fizik Temalı (çeşitli saç stilleri, bilimsel)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics1&accessories=prescription01',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics2&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics3&accessories=prescription02',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics4&accessories=prescription01',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics5&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics6&accessories=prescription02',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics7&accessories=prescription01',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=physics8&accessories=round',
    
    // Kimya Temalı (laboratuvar görünümü)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry1&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry2&accessories=prescription01',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry3&accessories=prescription02',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry4&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry5&accessories=prescription01',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry6&accessories=prescription02',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry7&accessories=round',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry8&accessories=prescription01',
    
    // Müzik/Bilim Topluluğu Temalı (çeşitli)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music5',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music8',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music10',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music11',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=music12'
];

// Setup profile edit dropdowns
function setupProfileEditDropdowns() {
    const universityInput = document.getElementById('profileUniversity');
    const departmentInput = document.getElementById('profileDepartment');
    const universityDropdown = document.querySelector('.university-dropdown-profile-edit');
    const departmentDropdown = document.querySelector('.department-dropdown-profile-edit');
    const phoneCountryInput = document.getElementById('profilePhoneCountry');
    const phoneCountryDropdown = document.querySelector('.phone-country-dropdown');
    
    if (universityInput && universityDropdown) {
        setupCustomDropdown(universityInput, universityDropdown, universities);
    }
    
    if (departmentInput && departmentDropdown) {
        setupCustomDropdown(departmentInput, departmentDropdown, departments);
    }
    
    // Setup phone country dropdown
    if (phoneCountryInput && phoneCountryDropdown) {
        setupPhoneCountryDropdown(phoneCountryInput, phoneCountryDropdown);
    }
}

// Setup phone country dropdown
function setupPhoneCountryDropdown(input, dropdown) {
    let isOpen = false;
    
    function renderItems(filter = '') {
        dropdown.innerHTML = '';
        const filteredData = phoneCountries.filter(item => 
            item.display.toLowerCase().includes(filter.toLowerCase()) ||
            item.value.includes(filter)
        );
        
        filteredData.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.display;
            div.className = 'custom-dropdown-item';
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                input.value = item.display;
                input.setAttribute('data-value', item.value);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                dropdown.style.display = 'none';
                isOpen = false;
            });
            dropdown.appendChild(div);
        });
    }
    
    // Make input clickable to open dropdown (readonly input can still be clicked)
    input.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Use setTimeout to ensure click event is processed
        setTimeout(() => {
            if (isOpen) {
                dropdown.style.display = 'none';
                isOpen = false;
            } else {
                renderItems('');
                dropdown.style.display = 'block';
                isOpen = true;
            }
        }, 0);
    });
    
    input.addEventListener('focus', (e) => {
        e.preventDefault();
        if (!isOpen) {
            renderItems('');
            dropdown.style.display = 'block';
            isOpen = true;
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
            isOpen = false;
        }
    });
    
    // Also close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            dropdown.style.display = 'none';
            isOpen = false;
        }
    });
}

// Avatar selection
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const avatarSelectionModal = document.getElementById('avatarSelectionModal');
const avatarGrid = document.getElementById('avatarGrid');
const avatarSelectionClose = document.getElementById('avatarSelectionClose');

if (changeAvatarBtn && avatarSelectionModal) {
    changeAvatarBtn.addEventListener('click', () => {
        avatarSelectionModal.style.display = 'block';
        loadAvatarGrid();
    });
}

if (avatarSelectionClose) {
    avatarSelectionClose.addEventListener('click', () => {
        avatarSelectionModal.style.display = 'none';
        // Scroll profile page to top AFTER modal closes (user won't see the scroll)
        setTimeout(() => {
            const profilePage = document.getElementById('profilePage');
            if (profilePage && profilePage.style.display !== 'none') {
                const profilePageContainer = profilePage.closest('.modal-body');
                if (profilePageContainer) {
                    profilePageContainer.scrollTop = 0;
                }
            }
        }, 300);
    });
}

// Close avatar modal when clicking outside
if (avatarSelectionModal) {
    document.addEventListener('click', (e) => {
        if (avatarSelectionModal.style.display !== 'none' && 
            !avatarSelectionModal.contains(e.target) && 
            !changeAvatarBtn.contains(e.target)) {
            avatarSelectionModal.style.display = 'none';
            // Scroll profile page to top AFTER modal closes (user won't see the scroll)
            setTimeout(() => {
                const profilePage = document.getElementById('profilePage');
                if (profilePage && profilePage.style.display !== 'none') {
                    const profilePageContainer = profilePage.closest('.modal-body');
                    if (profilePageContainer) {
                        profilePageContainer.scrollTop = 0;
                    }
                }
            }, 300);
        }
    });
}

// Load avatar grid
async function loadAvatarGrid() {
    if (!avatarGrid) return;
    
    // Get current user's avatar
    const { data: { user } } = await supabase.auth.getUser();
    let currentAvatarUrl = null;
    
    if (user) {
        const { data: memberData } = await supabase
            .from('members')
            .select('avatar_url')
            .eq('user_id', user.id)
            .maybeSingle();
        
        if (memberData?.avatar_url) {
            currentAvatarUrl = memberData.avatar_url;
        }
    }
    
    avatarGrid.innerHTML = '';
    
    AVATAR_LIST.forEach((avatarUrl, index) => {
        const avatarItem = document.createElement('div');
        const isSelected = currentAvatarUrl === avatarUrl;
        avatarItem.className = `avatar-item ${isSelected ? 'selected' : ''}`;
        avatarItem.innerHTML = `
            <img src="${avatarUrl}" alt="Avatar ${index + 1}" loading="lazy">
            <div class="avatar-item-overlay">
                <i class="fas fa-check"></i>
            </div>
            ${isSelected ? '<div class="avatar-item-selected-badge"><i class="fas fa-check-circle"></i></div>' : ''}
        `;
        
        avatarItem.addEventListener('click', async () => {
            await selectAvatar(avatarUrl);
        });
        
        avatarGrid.appendChild(avatarItem);
    });
}

// Select avatar
async function selectAvatar(avatarUrl) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showAlert('error', '❌ Hata', 'Giriş yapmanız gerekiyor.');
        return;
    }
    
    try {
        // First check if member record exists
        const { data: existingMember, error: checkError } = await supabase
            .from('members')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
        
        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is fine
            throw checkError;
        }
        
        if (existingMember) {
            // Update existing member
            const { error } = await supabase
                .from('members')
                .update({ avatar_url: avatarUrl })
                .eq('user_id', user.id);
            
            if (error) {
                // Check if it's because avatar_url column doesn't exist
                if (error.code === 'PGRST204' || error.message?.includes('avatar_url')) {
                    showAlert('error', '❌ Veritabanı Hatası', 'Avatar kolonu henüz eklenmemiş. Lütfen Supabase Dashboard\'da migration dosyasını çalıştırın: database-migrations/add-avatar-url-to-members.sql');
                    return;
                }
                throw error;
            }
        } else {
            // Create member record if it doesn't exist
            const { error: insertError } = await supabase
                .from('members')
                .insert({
                    user_id: user.id,
                    email: user.email || '',
                    first_name: user.email?.split('@')[0] || 'Kullanıcı',
                    last_name: '',
                    avatar_url: avatarUrl
                });
            
            if (insertError) {
                // Check if it's because avatar_url column doesn't exist
                if (insertError.code === 'PGRST204' || insertError.message?.includes('avatar_url')) {
                    showAlert('error', '❌ Veritabanı Hatası', 'Avatar kolonu henüz eklenmemiş. Lütfen Supabase Dashboard\'da migration dosyasını çalıştırın: database-migrations/add-avatar-url-to-members.sql');
                    return;
                }
                throw insertError;
            }
        }
        
        // Update preview
        const avatarPreviewImg = document.getElementById('avatarPreviewImg');
        const avatarPreviewIcon = document.getElementById('avatarPreviewIcon');
        if (avatarPreviewImg) {
            avatarPreviewImg.src = avatarUrl;
            avatarPreviewImg.style.display = 'block';
        }
        if (avatarPreviewIcon) avatarPreviewIcon.style.display = 'none';
        
        // Update navbar
        await updateUserUI(user);
        
        // Reload avatar grid to show selected badge
        await loadAvatarGrid();
        
        // Close modal
        avatarSelectionModal.style.display = 'none';
        
        // Scroll profile page to top AFTER modal closes (user won't see the scroll)
        setTimeout(() => {
            const profilePage = document.getElementById('profilePage');
            if (profilePage && profilePage.style.display !== 'none') {
                const profilePageContainer = profilePage.closest('.modal-body');
                if (profilePageContainer) {
                    profilePageContainer.scrollTop = 0;
                }
            }
        }, 300);
        
        showAlert('success', '✅ Avatar Güncellendi', 'Avatarınız başarıyla güncellendi!');
    } catch (error) {
        console.error('Avatar güncelleme hatası:', error);
        let errorMessage = 'Avatar güncellenirken bir hata oluştu.';
        
        if (error.code === 'PGRST204' || error.message?.includes('avatar_url')) {
            errorMessage = 'Avatar kolonu henüz eklenmemiş. Lütfen Supabase Dashboard\'da migration dosyasını çalıştırın: database-migrations/add-avatar-url-to-members.sql';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert('error', '❌ Hata', errorMessage);
    }
}

// Profile edit form submit
const profileEditForm = document.getElementById('profileEditForm');
if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showAlert('error', '❌ Hata', 'Giriş yapmanız gerekiyor.');
            return;
        }
        
        const submitButton = profileEditForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
        
        try {
            // Get phone with country code
            const phoneInput = document.getElementById('profilePhone');
            const countryInput = document.getElementById('profilePhoneCountry');
            let phoneValue = phoneInput.value.trim();
            
            // Validate phone number
            if (phoneValue) {
                // Remove all non-digit characters for validation
                const digitsOnly = phoneValue.replace(/\D/g, '');
                
                // Basic validation: at least 10 digits
                if (digitsOnly.length < 10) {
                    showAlert('error', '❌ Geçersiz Telefon', 'Telefon numarası en az 10 haneli olmalıdır.');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    return;
                }
                
                // Get country code from data-value attribute or default to +90
                const countryCode = countryInput ? (countryInput.getAttribute('data-value') || '+90') : '+90';
                phoneValue = `${countryCode} ${phoneValue}`;
            }
            
            const formData = {
                first_name: document.getElementById('profileFirstName').value.trim(),
                last_name: document.getElementById('profileLastName').value.trim(),
                phone: phoneValue,
                university: document.getElementById('profileUniversity').value.trim(),
                department: document.getElementById('profileDepartment').value.trim()
            };
            
            // Update members table
            const { error: memberError } = await supabase
                .from('members')
                .update(formData)
                .eq('user_id', user.id);
            
            if (memberError) throw memberError;
            
            // Update password if provided
            const currentPassword = document.getElementById('profileCurrentPassword').value;
            const newPassword = document.getElementById('profileNewPassword').value;
            
            if (newPassword && currentPassword) {
                // Verify current password first
                const { error: verifyError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword
                });
                
                if (verifyError) {
                    throw new Error('Mevcut şifre hatalı.');
                }
                
                // Update password
                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword
                });
                
                if (passwordError) throw passwordError;
            }
            
            // Update UI
            await updateUserUI(user);
            await showProfilePage(user);
            
            showAlert('success', '✅ Profil Güncellendi', 'Profil bilgileriniz başarıyla güncellendi!');
            
            // Clear password fields
            const currentPasswordInput = document.getElementById('profileCurrentPassword');
            const newPasswordInput = document.getElementById('profileNewPassword');
            if (currentPasswordInput) {
                currentPasswordInput.value = '';
                currentPasswordInput.classList.remove('has-value');
            }
            if (newPasswordInput) {
                newPasswordInput.value = '';
                newPasswordInput.classList.remove('has-value');
            }
            
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            showAlert('error', '❌ Hata', error.message || 'Profil güncellenirken bir hata oluştu.');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            await updateUserUI(null);
            closeProfileModal();
            showAlert('success', '👋 Çıkış Yapıldı', 'Başarıyla çıkış yaptınız.');
        } catch (error) {
            console.error('Çıkış hatası:', error);
            showAlert('error', '❌ Hata', 'Çıkış yapılırken bir hata oluştu.');
        }
    });
}

// Modern & Beautiful Alert helper function
function showAlert(type, title, message) {
    // Remove existing alerts first with smooth animation
    document.querySelectorAll('.alert').forEach(existingAlert => {
        existingAlert.style.animation = 'alertSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => existingAlert.remove(), 300);
    });
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    alert.innerHTML = `
        <div class="alert-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close" aria-label="Kapat" type="button">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Insert at top of body
    document.body.insertBefore(alert, document.body.firstChild);
    
    // Trigger animation after a tiny delay for smooth entrance
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            alert.style.animation = 'alertSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        });
    });
    
    // Auto remove after 6 seconds (success) or 8 seconds (error)
    const autoRemoveTime = type === 'success' ? 6000 : type === 'error' ? 8000 : 7000;
    const autoRemoveTimeout = setTimeout(() => {
        alert.style.animation = 'alertSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 300);
    }, autoRemoveTime);
    
    // Close button handler
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemoveTimeout);
        alert.style.animation = 'alertSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 300);
    });
}
