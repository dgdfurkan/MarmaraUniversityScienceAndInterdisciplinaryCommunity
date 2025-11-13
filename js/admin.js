// Admin Panel JavaScript

// Prevent redirect loop
let adminPageRedirecting = false;

// Check authentication and admin status on page load
async function checkAdminAccess() {
    // Prevent multiple simultaneous checks
    if (adminPageRedirecting) {
        return false;
    }
    
    try {
        // Check Supabase auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('Error getting session:', sessionError);
            if (!adminPageRedirecting) {
                adminPageRedirecting = true;
            window.location.href = 'index.html';
            }
            return false;
        }
        
        if (!session || !session.user) {
            // Not logged in, redirect to main page (not admin-login to prevent loop)
            if (!adminPageRedirecting) {
                adminPageRedirecting = true;
            window.location.href = 'index.html';
            }
            return false;
        }
        
        // Check if user is admin
        const isAdmin = await DatabaseService.checkAdminStatus(session.user.id);
        
        if (!isAdmin) {
            // Not admin, redirect to main page
            if (!adminPageRedirecting) {
                adminPageRedirecting = true;
            alert('Bu sayfaya erişim yetkiniz bulunmamaktadır.');
            window.location.href = 'index.html';
            }
            return false;
        }
        
        // User is admin, continue loading admin panel
        console.log('Admin panel access granted');
        
        // Update user info in header
        const member = await DatabaseService.getMemberById(session.user.id);
        if (member) {
            const userName = document.querySelector('.user-name');
            if (userName) {
                userName.textContent = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Admin';
            }
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar && member.avatar_url) {
                userAvatar.innerHTML = `<img src="${member.avatar_url}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = 'index.html';
        return false;
    }
}

// Logout function
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Redirect to main page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Çıkış yapılırken bir hata oluştu.');
    }
}

// Make logout function global
window.logout = logout;

// Bottom Navigation Scroll Handler
let lastScrollY = 0;
let ticking = false;

function handleBottomNavScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const bottomNav = document.getElementById('bottomNav');
            if (!bottomNav) {
                ticking = false;
                return;
            }
            
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY;
            const scrollingUp = currentScrollY < lastScrollY;
            
            if (currentScrollY <= 50) {
                bottomNav.classList.remove('hidden');
                bottomNav.classList.add('visible');
            } else if (scrollingDown && currentScrollY > 50) {
                bottomNav.classList.add('hidden');
                bottomNav.classList.remove('visible');
            } else if (scrollingUp) {
                bottomNav.classList.remove('hidden');
                bottomNav.classList.add('visible');
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        });
        ticking = true;
    }
}

// Store scroll handler reference for proper cleanup
let scrollHandlerAttached = false;

function setupBottomNavigation() {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;
    
    // Only setup scroll handler if window width <= 800px
    function setupScrollHandler() {
        if (window.innerWidth <= 800) {
            // Add scroll handler if not already attached
            if (!scrollHandlerAttached) {
    window.addEventListener('scroll', handleBottomNavScroll, { passive: true });
                scrollHandlerAttached = true;
            }
            // Initial state
            handleBottomNavScroll();
        } else {
            // Remove scroll handler on desktop
            if (scrollHandlerAttached) {
                window.removeEventListener('scroll', handleBottomNavScroll);
                scrollHandlerAttached = false;
            }
            // Always visible on desktop (if shown)
            bottomNav.classList.remove('hidden');
            bottomNav.classList.add('visible');
        }
    }
    
    // Initial setup
    setupScrollHandler();
    
    // Re-setup on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setupScrollHandler();
        }, 100);
    });
    
    // Show on hover (for desktop if visible)
    bottomNav.addEventListener('mouseenter', () => {
        if (window.innerWidth > 800) {
        bottomNav.classList.remove('hidden');
        bottomNav.classList.add('visible');
        }
    });
    
    // Click handlers for bottom nav items
    const bottomNavItems = bottomNav.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section) {
                showSection(section);
                // Update active state
                updateBottomNavActive(section);
            }
        });
    });
}

// Update bottom navigation active state
function updateBottomNavActive(sectionId) {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;
    
    const bottomNavItems = bottomNav.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(navItem => {
        navItem.classList.remove('active');
        if (navItem.getAttribute('data-section') === sectionId) {
            navItem.classList.add('active');
        }
    });
    
    // Also update sidebar nav items
    if (navItems) {
        navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-section') === sectionId) {
                nav.classList.add('active');
            }
        });
    }
}

// Navigation - Initialize after DOM loads - sidebar_2.txt mantığı
let navItems, contentSections, sidebar, sidebarOverlay;

document.addEventListener('DOMContentLoaded', () => {
    navItems = document.querySelectorAll('.nav-item');
    contentSections = document.querySelectorAll('.content-section');
    sidebar = document.querySelector('.sidebar');
    sidebarOverlay = document.getElementById('sidebarOverlay');

    // Sidebar_2.txt mantığı: hover ile açılır/kapanır
    if (sidebar) {
        // Başlangıçta dar mod
        sidebar.classList.add('close');
        
        // Mouse enter - genişlet
        sidebar.addEventListener('mouseenter', () => {
            sidebar.classList.remove('close');
        });
        
        // Mouse leave - daralt
        sidebar.addEventListener('mouseleave', () => {
            sidebar.classList.add('close');
        });
    }

    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
            sidebarOverlay.classList.remove('active');
        });
    }

    // Close sidebar when clicking a nav item
    navItems.forEach(item => {
        const link = item.querySelector('.link');
        if (link) {
            link.addEventListener('click', (e) => {
                // Allow external links (like "Siteyi Görüntüle") to work normally
                if (item.classList.contains('view-site-link')) {
                    return; // Don't prevent default, let the link work
                }
                
                e.preventDefault();
                const sectionId = item.getAttribute('data-section');
                if (sectionId) {
                    showSection(sectionId);
                    
                    // Update active nav item
                    navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                    
                    // Update bottom nav active state
                    updateBottomNavActive(sectionId);
                    
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth <= 768) {
                        if (sidebar) {
                            sidebar.classList.remove('mobile-open');
                        }
                        if (sidebarOverlay) {
                            sidebarOverlay.classList.remove('active');
                        }
                    }
                }
            });
        }
    });

    // Handle responsive sidebar visibility (800px breakpoint)
    function handleResponsiveSidebar() {
        if (window.innerWidth <= 800) {
            if (sidebar) {
                sidebar.style.display = 'none';
            }
        } else {
            if (sidebar) {
                sidebar.style.display = '';
            }
        }
    }

    // Initial check
    handleResponsiveSidebar();

    // Listen for window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveSidebar();
        }, 100);
    });

    // Initialize bottom navigation
    setupBottomNavigation();
});

function showSection(sectionId) {
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    updatePageTitle(sectionId);
    
    // Update navigation active states (both sidebar and bottom nav)
    updateBottomNavActive(sectionId);
    
    // Load section data
    loadSectionData(sectionId);
    
    // Load admin members if settings section
    if (sectionId === 'settings') {
        loadAdminMembers();
    }
}

function updatePageTitle(sectionId) {
    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Genel bakış ve istatistikler' },
        'announcements': { title: 'Duyuru Yönetimi', subtitle: 'Duyuruları yönetin' },
        'blog': { title: 'Blog Yönetimi', subtitle: 'Blog yazılarını yönetin' },
        'events': { title: 'Etkinlik Yönetimi', subtitle: 'Etkinlikleri yönetin' },
        'members': { title: 'Üye Yönetimi', subtitle: 'Site üyelerini görüntüleyin ve yönetin' },
        'registrations': { title: 'Kayıt Yönetimi', subtitle: 'Etkinlik kayıtlarını görüntüleyin' },
        'media': { title: 'Medya Yönetimi', subtitle: 'Medya dosyalarını yönetin' },
        'settings': { title: 'Site Ayarları', subtitle: 'Site ayarlarını düzenleyin' }
    };
    
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    if (titles[sectionId]) {
        pageTitle.textContent = titles[sectionId].title;
        pageSubtitle.textContent = titles[sectionId].subtitle;
    }
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'announcements':
            loadAnnouncements();
            break;
        case 'blog':
            loadBlogPosts();
            break;
        case 'events':
            loadEvents();
            break;
        case 'members':
            loadMembers();
            break;
        case 'registrations':
            loadRegistrations();
            break;
        case 'media':
            loadMedia();
            break;
        case 'settings':
            loadSiteSettings();
            break;
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add event listeners to editors when modal opens
        if (modalId === 'blog-modal') {
            // Blog modal için biraz bekle - DOM hazır olsun
            setTimeout(() => {
                addEditorListeners('blog-content-editor');
                console.log('Blog modal opened, listeners added');
                
                // Test: Editor'a odaklan ve test yazısı ekle
                const editor = document.getElementById('blog-content-editor');
                if (editor) {
                    editor.focus();
                    console.log('Blog editor focused for testing');
                    
                    // DEBUG: Editor hazır, test yazısı KALDIRıLDı
                    console.log('🔥 DEBUG: Editor hazır, yazmaya başlayabilirsiniz');
                }
            }, 100);
        } else if (modalId === 'announcement-modal') {
            setTimeout(() => {
                addEditorListeners('announcement-content-editor');
                console.log('Announcement modal opened, listeners added');
            }, 100);
        } else if (modalId === 'event-modal') {
            setTimeout(() => {
                addEditorListeners('event-content-editor');
                console.log('Event modal opened, listeners added');
            }, 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Form Submissions
document.addEventListener('DOMContentLoaded', () => {
    // Announcement form
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', handleAnnouncementSubmit);
    }
    
    // Blog form
    const blogForm = document.getElementById('blog-form');
    if (blogForm) {
        blogForm.addEventListener('submit', handleBlogSubmit);
    }
    
    // Event form
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }
    
    // Settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
});

async function handleAnnouncementSubmit(e) {
    e.preventDefault();
    
    // Sync editor content before submitting
    syncEditorContent();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Handle image upload
    let imageUrl = null;
    let imageFile = null;
    
    if (data.image_type === 'url' && data.image_url) {
        imageUrl = data.image_url;
    } else if (data.image_type === 'file' && data.image_file) {
        try {
            const file = e.target.image_file.files[0];
            if (file) {
                const uploadResult = await DatabaseService.uploadMedia(file);
                imageFile = uploadResult.fullPath;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Fotoğraf yüklenirken bir hata oluştu.');
            return;
        }
    }
    
    // Get content from RichTextEditor
    const contentHTML = getEditorContent('announcement');
    
    // Clean data - content'i RichTextEditor'dan al
    const cleanData = {
        title: data.title,
        content: contentHTML,
        category: data.category,
        status: data.status || 'active'
    };
    
    // Debug yardımcıları
    console.log('Announcement content (final):', cleanData.content);
    console.log('Len:', cleanData.content ? cleanData.content.length : '0');
    
    // Add image data only if provided
    if (imageUrl) {
        cleanData.image_url = imageUrl;
    }
    if (imageFile) {
        cleanData.image_file = imageFile;
    }
    
    try {
        const result = await DatabaseService.createAnnouncement(cleanData);
        const newRecord = result[0];
        
        // Log activity
        await DatabaseService.logActivity('create', 'announcements', newRecord.id, newRecord.title, null, newRecord);
        
        // Save version history
        await DatabaseService.saveVersionHistory('announcements', newRecord.id, newRecord, 'Initial version');
        
        alert('Duyuru başarıyla eklendi!');
        closeModal('announcement-modal');
        loadAnnouncements();
        loadRecentActivities();
        
        // Clear editor
        const announcementEditor = document.getElementById('announcement-content-editor');
        if (announcementEditor) {
            announcementEditor.innerHTML = '';
            syncEditorContent();
        }
        
    } catch (error) {
        console.error('Error creating announcement:', error);
        alert('Duyuru eklenirken bir hata oluştu: ' + error.message);
    }
}

// -----------------------------------------------------------------------------
// BLOG: Submit — Boş content push problemini çözen versiyon
// -----------------------------------------------------------------------------
async function handleBlogSubmit(e) {
  e.preventDefault();

  // Get content from RichTextEditor
  const contentHTML = getEditorContent('blog');
  
  console.log('Blog content from RichTextEditor:', contentHTML);
  console.log('Content length:', contentHTML.length);

  // GEÇICI: Boş kontrol kapatıldı - debug için
  /*
  if (!contentHTML || contentHTML.trim() === '<p><br></p>' || contentHTML.trim() === '') {
      alert('Blog içeriği boş olamaz. Lütfen içerik ekleyin.');
      return; 
  }
  */

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Görsel yükleme mantığı (mevcut kodunla aynı)
  let imageUrl = null;
  let imageFile = null;

  if (data.image_type === 'url' && data.image_url) {
    imageUrl = data.image_url;
  } else if (data.image_type === 'file' && data.image_file) {
    try {
      const file = e.target.image_file?.files?.[0];
      if (file) {
        const uploadResult = await DatabaseService.uploadMedia(file);
        imageFile = uploadResult.fullPath;
      }
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Fotoğraf yüklenirken bir hata oluştu.');
      return;
    }
  }

  // 2. ADIM: Supabase'e gönderilecek veriyi oluştur.
  // 'content' alanına FormData'dan gelen değeri değil, doğrudan editörden aldığımız 'contentHTML'i ata.
  const cleanData = {
    title: data.title,
    content: contentHTML, // <-- EN KRİTİK NOKTA BURASI
    excerpt: data.excerpt,
    category: data.category,
    status: data.status || 'published'
  };

  // Görsel alanlarını ekle
  if (imageUrl) cleanData.image_url = imageUrl;
  if (imageFile) cleanData.image_file = imageFile;

  try {
    // Mevcut bir ID varsa güncelle, yoksa yeni kayıt oluştur.
    // Bu kısım düzenleme (edit) fonksiyonu için de çalışmasını sağlar.
    const result = currentEditId
      ? await DatabaseService.updateBlogPost(currentEditId, cleanData)
      : await DatabaseService.createBlogPost(cleanData);
    
    const newRecord = result[0];
    
    // Log activity
    await DatabaseService.logActivity(
        currentEditId ? 'update' : 'create', 
        'blog_posts', 
        newRecord.id, 
        newRecord.title, 
        currentEditId ? null : null, 
        newRecord
    );

    alert(`Blog yazısı başarıyla ${currentEditId ? 'güncellendi' : 'eklendi'}!`);
    closeModal('blog-modal');
    loadBlogPosts(); // Listeyi yenile
    loadRecentActivities(); // Aktiviteleri yenile
    currentEditId = null; // Edit ID'sini sıfırla

    // Formu ve editörü temizle
    document.getElementById('blog-form').reset();
    if (blogEditor) {
      blogEditor.innerHTML = '';
    }

  } catch (error) {
    console.error('Blog yazısı kaydedilirken hata:', error);
    alert('Blog yazısı kaydedilirken bir hata oluştu: ' + error.message);
  }
}

// -----------------------------------------------------------------------------
// BLOG: Formu doldur — Hem editor hem hidden alanları doldur
// -----------------------------------------------------------------------------
function populateBlogForm(blogPost) {
  const form = document.getElementById('blog-form');
  form.querySelector('[name="title"]').value = blogPost.title || '';
  form.querySelector('[name="category"]').value = blogPost.category || '';
  form.querySelector('[name="excerpt"]').value = blogPost.excerpt || '';
  form.querySelector('[name="status"]').value = blogPost.status || 'published';

  // Hem görünür editörü hem de (varsa) gizli alanı güncelle.
  const editor = document.getElementById('blog-content-editor');
  const hiddenInput = document.getElementById('blog-content-hidden');
  const htmlContent = blogPost.content || '';

  if (editor) {
    editor.innerHTML = htmlContent;
  }
  if (hiddenInput) {
    hiddenInput.value = htmlContent;
  }
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    // Sync editor content before submitting
    syncEditorContent();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Handle image upload
    let imageUrl = null;
    let imageFile = null;
    
    if (data.image_type === 'url' && data.image_url) {
        imageUrl = data.image_url;
    } else if (data.image_type === 'file' && data.image_file) {
        try {
            const file = e.target.image_file.files[0];
            if (file) {
                const uploadResult = await DatabaseService.uploadMedia(file);
                imageFile = uploadResult.fullPath;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Fotoğraf yüklenirken bir hata oluştu.');
            return;
        }
    }
    
    // Get content from RichTextEditor
    const contentHTML = getEditorContent('event');
    
    // Clean data - content'i RichTextEditor'dan al
    const cleanData = {
        title: data.title,
        type: data.type,
        date: data.date,
        location: data.location,
        description: data.description,
        content: contentHTML,
        price: parseFloat(data.price) || 0,
        capacity: parseInt(data.capacity) || 0,
        registration_required: data.registration_required === 'on',
        status: data.status || 'active'
    };
    
    // Debug yardımcıları
    console.log('Event content (final):', cleanData.content);
    console.log('Len:', cleanData.content ? cleanData.content.length : '0');
    
    // Add image data only if provided
    if (imageUrl) {
        cleanData.image_url = imageUrl;
    }
    if (imageFile) {
        cleanData.image_file = imageFile;
    }
    
    try {
        const result = await DatabaseService.createEvent(cleanData);
        const newRecord = result[0];
        
        // Log activity
        await DatabaseService.logActivity('create', 'events', newRecord.id, newRecord.title, null, newRecord);
        
        // Save version history
        await DatabaseService.saveVersionHistory('events', newRecord.id, newRecord, 'Initial version');
        
        alert('Etkinlik başarıyla eklendi!');
        closeModal('event-modal');
        loadEvents();
        loadRecentActivities();
        
        // Clear editor
        const eventEditor = document.getElementById('event-content-editor');
        if (eventEditor) {
            eventEditor.innerHTML = '';
            syncEditorContent();
        }
        
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Etkinlik eklenirken bir hata oluştu: ' + error.message);
    }
}

async function handleSettingsSubmit(e) {
    e.preventDefault();
    
    try {
        // E-posta doğrulama sistemi kaldırıldı - artık bu ayar yok
        // Sadece genel ayarları kaydediyoruz (site_title, site_description, vb.)
        const formData = new FormData(e.target);
        const settingsUpdates = {};
        
        // Genel ayarları topla (e-posta doğrulama hariç)
        for (const [key, value] of formData.entries()) {
            if (key !== 'email_verification_enabled') {
                settingsUpdates[key] = value;
            }
        }
        
        console.log('Saving settings:', settingsUpdates);
        
        // Update site settings (eğer varsa)
        if (Object.keys(settingsUpdates).length > 0) {
            await DatabaseService.updateSiteSettings(settingsUpdates);
            
            // Log activity
            await DatabaseService.logActivity('update', 'site_settings', null, 'Site ayarları güncellendi', null, settingsUpdates);
        }
        
        alert('Ayarlar başarıyla kaydedildi!');
        
        // Reload settings to reflect changes
        loadSiteSettings();
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Ayarlar kaydedilirken bir hata oluştu: ' + error.message);
    }
}

// Load site settings into form
async function loadSiteSettings() {
    try {
        const settings = await DatabaseService.getSiteSettings();
        
        // E-posta doğrulama sistemi kaldırıldı - toggle artık yok
        // const emailVerificationToggle = document.getElementById('email_verification_enabled');
        // if (emailVerificationToggle) {
        //     emailVerificationToggle.checked = settings.email_verification_enabled !== false;
        // }
        
        console.log('Site settings loaded:', settings);
    } catch (error) {
        console.error('Error loading site settings:', error);
    }
}

// Data Loading Functions
async function loadAnnouncements() {
    const tableBody = document.getElementById('announcements-table');
    if (!tableBody) return;
    
    try {
        const announcements = await DatabaseService.getAnnouncements();
        
        tableBody.innerHTML = announcements.map(announcement => {
            // Determine row status class based on status and dates
            let statusClass = 'row-status-';
            if (announcement.status === 'active') {
                statusClass += 'active'; // Soft green
            } else if (announcement.status === 'draft') {
                statusClass += 'scheduled'; // Soft orange
            } else {
                statusClass += 'inactive'; // Soft red
            }
            
            return `
                <tr class="clickable-row ${statusClass}" onclick="editAnnouncement(${announcement.id})" style="cursor: pointer;">
                    <td>${announcement.title}</td>
                    <td><span class="category-badge category-${announcement.category}">${getCategoryName(announcement.category)}</span></td>
                    <td>${new Date(announcement.created_at).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                })}</td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        tableBody.innerHTML = '<tr><td colspan="3">Duyurular yüklenirken bir hata oluştu.</td></tr>';
    }
}

async function loadBlogPosts() {
    const tableBody = document.getElementById('blog-table');
    if (!tableBody) return;
    
    try {
        const blogPosts = await DatabaseService.getBlogPosts();
        
        tableBody.innerHTML = blogPosts.map(post => {
            // Determine row status class based on status
            let statusClass = 'row-status-';
            if (post.status === 'published') {
                statusClass += 'active'; // Soft green
            } else if (post.status === 'draft') {
                statusClass += 'scheduled'; // Soft orange
            } else {
                statusClass += 'inactive'; // Soft red
            }
            
            return `
                <tr class="clickable-row ${statusClass}" onclick="editBlogPost(${post.id})" style="cursor: pointer;">
                    <td>${post.title}</td>
                    <td><span class="category-badge category-${post.category}">${getCategoryName(post.category)}</span></td>
                    <td>${new Date(post.created_at).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                })}</td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading blog posts:', error);
        tableBody.innerHTML = '<tr><td colspan="3">Blog yazıları yüklenirken bir hata oluştu.</td></tr>';
    }
}

async function loadEvents() {
    const tableBody = document.getElementById('events-table');
    if (!tableBody) return;
    
    try {
        const events = await DatabaseService.getEvents(true); // Include past events for admin
        const now = new Date();
        
        tableBody.innerHTML = events.map(event => {
            // Determine row status class based on event date
            let statusClass = 'row-status-';
            const eventDate = new Date(event.date);
            
            if (eventDate > now) {
                // Future event - scheduled (soft orange)
                statusClass += 'scheduled';
            } else if (eventDate <= now && eventDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
                // Active/Recent event (soft green)
                statusClass += 'active';
            } else {
                // Past event (soft red)
                statusClass += 'inactive';
            }
            
            return `
                <tr class="clickable-row ${statusClass}" onclick="editEvent(${event.id})" style="cursor: pointer;">
                    <td>${event.title}</td>
                    <td><span class="category-badge category-${event.type}">${getEventTypeName(event.type)}</span></td>
                    <td>${new Date(event.date).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                })}</td>
                    <td>${event.registered || 0}/${event.capacity || '∞'}</td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        tableBody.innerHTML = '<tr><td colspan="4">Etkinlikler yüklenirken bir hata oluştu.</td></tr>';
    }
}

async function loadRegistrations() {
    const tableBody = document.getElementById('registrations-table');
    if (!tableBody) return;
    
    try {
        const registrations = await DatabaseService.getRegistrations();
        
        tableBody.innerHTML = registrations.map(registration => `
            <tr>
                <td>${registration.first_name} ${registration.last_name}</td>
                <td>${registration.email}</td>
                <td>${registration.phone}</td>
                <td>${registration.event_title || 'Etkinlik Bulunamadı'}</td>
                <td>${new Date(registration.created_at).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                })}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewRegistration(${registration.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRegistration(${registration.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading registrations:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Kayıtlar yüklenirken bir hata oluştu.</td></tr>';
    }
}

async function loadMedia() {
    const mediaGrid = document.getElementById('media-grid');
    if (!mediaGrid) return;
    
    try {
        const mediaItems = await DatabaseService.getMedia();
        
        mediaGrid.innerHTML = mediaItems.map(item => `
            <div class="media-item">
                <div class="media-preview">
                    ${item.name.includes('.jpg') || item.name.includes('.jpeg') || item.name.includes('.png') || item.name.includes('.gif') ? 
                        `<img src="${supabase.storage.from('media').getPublicUrl(item.name).data.publicUrl}" alt="${item.name}" style="width: 100%; height: 150px; object-fit: cover;">` :
                        `<i class="fas fa-file" style="font-size: 3rem; color: #6b7280; display: flex; align-items: center; justify-content: center; height: 150px;"></i>`
                    }
                </div>
                <div class="media-item-content">
                    <h4>${item.name}</h4>
                    <p>${(item.metadata?.size / 1024).toFixed(1) || '0'} KB • ${new Date(item.created_at).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Europe/Istanbul'
                    })}</p>
                    <div class="media-actions">
                        <button class="btn btn-sm btn-secondary" onclick="downloadMedia('${item.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMedia('${item.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading media:', error);
        mediaGrid.innerHTML = '<p>Medya dosyaları yüklenirken bir hata oluştu.</p>';
    }
}

// Helper Functions
function getCategoryName(category) {
    const categories = {
        'genel': 'Genel',
        'konuk': 'Konuk',
        'yarisma': 'Yarışma',
        'atolye': 'Atölye',
        'konferans': 'Konferans',
        'bilim': 'Bilim',
        'teknoloji': 'Teknoloji',
        'etkinlik': 'Etkinlik',
        'duyuru': 'Duyuru'
    };
    return categories[category] || category;
}

function getStatusName(status) {
    const statuses = {
        'active': 'Aktif',
        'draft': 'Taslak',
        'published': 'Yayınlandı'
    };
    return statuses[status] || status;
}

function getEventTypeName(type) {
    const types = {
        'bilim-senligi': 'Bilim Şenliği',
        'atolye': 'Atölye',
        'konferans': 'Konferans',
        'teknik-gezi': 'Teknik Gezi'
    };
    return types[type] || type;
}

// Action Functions
let currentEditId = null;

async function editAnnouncement(id) {
    currentEditId = id;
    // Get announcement data and populate form
    const announcement = await getAnnouncementById(id);
    if (announcement) {
        populateAnnouncementForm(announcement);
        openModal('announcement-modal');
    }
}

function populateAnnouncementForm(announcement) {
    const form = document.getElementById('announcement-form');
    form.querySelector('[name="title"]').value = announcement.title || '';
    form.querySelector('[name="category"]').value = announcement.category || '';
    form.querySelector('[name="content"]').value = announcement.content || '';
    form.querySelector('[name="status"]').value = announcement.status || 'active';
}

async function deleteAnnouncement(id) {
    if (confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
        try {
            // Get announcement title before deletion for activity log
            const announcement = await getAnnouncementById(id);
            const title = announcement?.title || 'Unknown';
            
            await DatabaseService.deleteAnnouncement(id);
            
            // Log activity
            await DatabaseService.logActivity('delete', 'announcements', id, title);
            
            alert('Duyuru silindi!');
            loadAnnouncements();
            loadRecentActivities();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Duyuru silinirken bir hata oluştu.');
        }
    }
}

async function editBlogPost(id) {
    currentEditId = id;
    const blogPost = await getBlogPostById(id);
    if (blogPost) {
        populateBlogForm(blogPost);
        openModal('blog-modal');
    }
}

function populateBlogForm(blogPost) {
    const form = document.getElementById('blog-form');
    form.querySelector('[name="title"]').value = blogPost.title || '';
    form.querySelector('[name="category"]').value = blogPost.category || '';
    form.querySelector('[name="excerpt"]').value = blogPost.excerpt || '';
    form.querySelector('[name="status"]').value = blogPost.status || 'published';
    
    // Set content in RichTextEditor
    setEditorContent('blog', blogPost.content || '');
}

async function deleteBlogPost(id) {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        try {
            // Get blog post title before deletion for activity log
            const blogPost = await getBlogPostById(id);
            const title = blogPost?.title || 'Unknown';
            
            await DatabaseService.deleteBlogPost(id);
            
            // Log activity
            await DatabaseService.logActivity('delete', 'blog_posts', id, title);
            
            alert('Blog yazısı silindi!');
            loadBlogPosts();
            loadRecentActivities();
        } catch (error) {
            console.error('Error deleting blog post:', error);
            alert('Blog yazısı silinirken bir hata oluştu.');
        }
    }
}

async function editEvent(id) {
    currentEditId = id;
    const event = await getEventById(id);
    if (event) {
        populateEventForm(event);
        openModal('event-modal');
    }
}

function populateEventForm(event) {
    const form = document.getElementById('event-form');
    if (!form) {
        console.error('Event form not found');
        return;
    }
    
    // Safely populate form fields
    const titleField = form.querySelector('[name="title"]');
    const typeField = form.querySelector('[name="type"]');
    const locationField = form.querySelector('[name="location"]');
    const descriptionField = form.querySelector('[name="description"]');
    const capacityField = form.querySelector('[name="capacity"]');
    const registrationField = form.querySelector('[name="registration_required"]');
    const dateField = form.querySelector('[name="date"]');
    
    if (titleField) titleField.value = event.title || '';
    if (typeField) typeField.value = event.type || '';
    if (locationField) locationField.value = event.location || '';
    if (descriptionField) descriptionField.value = event.description || '';
    if (capacityField) capacityField.value = event.capacity || '';
    if (registrationField) registrationField.value = event.registration_required ? 'yes' : 'no';
    
    // Format date for datetime-local input
    if (dateField && event.date) {
        const date = new Date(event.date);
        const formattedDate = date.toISOString().slice(0, 16);
        dateField.value = formattedDate;
    }
    
    // Populate RichTextEditor content
    if (event.content) {
        setTimeout(() => {
            const editor = document.getElementById('event-content-editor');
            if (editor && editor.innerHTML) {
                editor.innerHTML = event.content;
            }
        }, 500);
    }
}

async function deleteEvent(id) {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
        try {
            // Get event title before deletion for activity log
            const event = await getEventById(id);
            const title = event?.title || 'Unknown';
            
            await DatabaseService.deleteEvent(id);
            
            // Log activity
            await DatabaseService.logActivity('delete', 'events', id, title);
            
            alert('Etkinlik silindi!');
            loadEvents();
            loadRecentActivities();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Etkinlik silinirken bir hata oluştu.');
        }
    }
}

async function viewRegistration(id) {
    const registration = await getRegistrationById(id);
    if (registration) {
        showRegistrationDetails(registration);
    }
}

function showRegistrationDetails(registration) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Kayıt Detayları</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="registration-details">
                <div class="detail-group">
                    <h4>Kişisel Bilgiler</h4>
                    <p><strong>Ad Soyad:</strong> ${registration.first_name} ${registration.last_name}</p>
                    <p><strong>E-posta:</strong> ${registration.email}</p>
                    <p><strong>Telefon:</strong> ${registration.phone}</p>
                    <p><strong>Üniversite:</strong> ${registration.university || 'Belirtilmemiş'}</p>
                    <p><strong>Bölüm:</strong> ${registration.department || 'Belirtilmemiş'}</p>
                    <p><strong>Öğrenci No:</strong> ${registration.student_id || 'Belirtilmemiş'}</p>
                    <p><strong>Sınıf:</strong> ${registration.grade || 'Belirtilmemiş'}</p>
                </div>
                <div class="detail-group">
                    <h4>Ek Bilgiler</h4>
                    <p><strong>Deneyim:</strong> ${registration.experience || 'Belirtilmemiş'}</p>
                    <p><strong>Motivasyon:</strong> ${registration.motivation || 'Belirtilmemiş'}</p>
                    <p><strong>Beslenme:</strong> ${registration.dietary || 'Yok'}</p>
                    <p><strong>Erişilebilirlik:</strong> ${registration.accessibility || 'Yok'}</p>
                </div>
                <div class="detail-group">
                    <h4>İletişim Tercihleri</h4>
                    <p><strong>E-posta Bildirimleri:</strong> ${registration.email_notifications ? 'Evet' : 'Hayır'}</p>
                    <p><strong>SMS Bildirimleri:</strong> ${registration.sms_notifications ? 'Evet' : 'Hayır'}</p>
                    <p><strong>Bülten:</strong> ${registration.newsletter ? 'Evet' : 'Hayır'}</p>
                </div>
                <div class="detail-group">
                    <h4>Kayıt Bilgileri</h4>
                    <p><strong>Kayıt Tarihi:</strong> ${new Date(registration.created_at).toLocaleString('tr-TR')}</p>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Kapat</button>
                <button class="btn btn-primary" onclick="exportRegistration(${registration.id})">
                    <i class="fas fa-download"></i> PDF İndir
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function deleteRegistration(id) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        try {
            await DatabaseService.deleteRegistration(id);
            alert('Kayıt silindi!');
            loadRegistrations();
        } catch (error) {
            console.error('Error deleting registration:', error);
            alert('Kayıt silinirken bir hata oluştu.');
        }
    }
}

async function downloadMedia(fileName) {
    const media = await getMediaById(fileName);
    if (media) {
        // Create download link
        const link = document.createElement('a');
        link.href = media.url;
        link.download = fileName;
        link.click();
    }
}

async function deleteMedia(fileName) {
    if (confirm('Bu medya dosyasını silmek istediğinizden emin misiniz?')) {
        try {
            await DatabaseService.deleteMedia(fileName);
            alert('Medya dosyası silindi!');
            loadMedia();
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('Medya dosyası silinirken bir hata oluştu.');
        }
    }
}

async function exportRegistration(id) {
    const registration = await getRegistrationById(id);
    if (registration) {
        // Create PDF content
        const content = `
            <h1>Etkinlik Kayıt Detayları</h1>
            <h2>${registration.first_name} ${registration.last_name}</h2>
            <p><strong>E-posta:</strong> ${registration.email}</p>
            <p><strong>Telefon:</strong> ${registration.phone}</p>
            <p><strong>Kayıt Tarihi:</strong> ${new Date(registration.created_at).toLocaleString('tr-TR')}</p>
        `;
        
        // In real app, use a PDF library like jsPDF
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Kayıt Detayları</title></head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Helper functions to get data by ID
async function getAnnouncementById(id) {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting announcement:', error);
        return null;
    }
}

async function getBlogPostById(id) {
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting blog post:', error);
        return null;
    }
}

async function getEventById(id) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting event:', error);
        return null;
    }
}

async function getRegistrationById(id) {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting registration:', error);
        return null;
    }
}

async function getMediaById(fileName) {
    try {
        const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);
        
        return {
            fileName: fileName,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error getting media:', error);
        return null;
    }
}

// Media Upload
document.getElementById('media-upload').addEventListener('change', async function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        try {
            for (let file of files) {
                await DatabaseService.uploadMedia(file);
            }
            alert(`${files.length} dosya başarıyla yüklendi!`);
            loadMedia();
        } catch (error) {
            console.error('Error uploading media:', error);
            alert('Dosya yüklenirken bir hata oluştu.');
        }
    }
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Get real data from Supabase
        const [announcements, blogPosts, events, registrations] = await Promise.all([
            DatabaseService.getAnnouncements(),
            DatabaseService.getBlogPosts(),
            DatabaseService.getEvents(),
            DatabaseService.getRegistrations()
        ]);

        // Update statistics
        document.getElementById('announcements-count').textContent = announcements.length;
        document.getElementById('blog-count').textContent = blogPosts.length;
        document.getElementById('events-count').textContent = events.length;
        document.getElementById('registrations-count').textContent = registrations.length;

        // Load recent activities
        loadRecentActivities();

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Set default values if error
        document.getElementById('announcements-count').textContent = '0';
        document.getElementById('blog-count').textContent = '0';
        document.getElementById('events-count').textContent = '0';
        document.getElementById('registrations-count').textContent = '0';
    }
}

// Load recent activities
async function loadRecentActivities() {
    const activitiesContainer = document.getElementById('recent-activities');
    if (!activitiesContainer) return;

    try {
        const activities = await DatabaseService.getRecentActivities(10);
        
        if (activities.length === 0) {
            activitiesContainer.innerHTML = '<p class="no-activities">Henüz aktivite bulunmuyor.</p>';
            return;
        }

        activitiesContainer.innerHTML = activities.map(activity => {
            const timeAgo = getTimeAgo(activity.created_at);
            const exactTime = new Date(activity.created_at).toLocaleString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Istanbul'
            });
            
            let icon = 'fas fa-plus';
            let message = '';
            let actionClass = '';

            switch(activity.action_type) {
                case 'create':
                    icon = 'fas fa-plus';
                    message = `Yeni ${getTableDisplayName(activity.table_name)} eklendi: "${activity.record_title}"`;
                    actionClass = 'create';
                    break;
                case 'update':
                    icon = 'fas fa-edit';
                    message = `${getTableDisplayName(activity.table_name)} güncellendi: "${activity.record_title}"`;
                    actionClass = 'update';
                    break;
                case 'delete':
                    icon = 'fas fa-trash';
                    message = `${getTableDisplayName(activity.table_name)} silindi: "${activity.record_title}"`;
                    actionClass = 'delete';
                    break;
                case 'draft':
                    icon = 'fas fa-save';
                    message = `Taslak kaydedildi: "${activity.record_title}"`;
                    actionClass = 'draft';
                    break;
                case 'restore':
                    icon = 'fas fa-undo';
                    message = `Versiyon geri yüklendi: "${activity.record_title}"`;
                    actionClass = 'restore';
                    break;
                default:
                    icon = 'fas fa-info';
                    message = `Aktivite: "${activity.record_title}"`;
                    actionClass = 'info';
            }

            return `
                <div class="activity-item ${actionClass}">
                    <div class="activity-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${message}</p>
                        <span class="activity-time" title="${exactTime}">${timeAgo}</span>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading recent activities:', error);
        activitiesContainer.innerHTML = '<p class="no-activities">Aktiviteler yüklenirken bir hata oluştu.</p>';
    }
}

function getTableDisplayName(tableName) {
    switch(tableName) {
        case 'announcements': return 'duyuru';
        case 'blog_posts': return 'blog yazısı';
        case 'events': return 'etkinlik';
        case 'registrations': return 'kayıt';
        default: return tableName;
    }
}

// Helper function to get time ago
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Az önce';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} dakika önce`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} saat önce`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} gün önce`;
    }
}

// Open all activities modal
async function openAllActivitiesModal() {
    try {
        const allActivities = await DatabaseService.getRecentActivities(100); // Get more activities
        
        const modal = document.createElement('div');
        modal.className = 'modal all-activities-modal active';
        modal.id = 'all-activities-modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Tüm Aktiviteler</h2>
                    <button class="modal-close" onclick="closeAllActivitiesModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="activity-list-full" id="all-activities-list">
                        ${allActivities.length === 0 ? '<p class="no-activities">Henüz aktivite bulunmuyor.</p>' : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        const activitiesList = document.getElementById('all-activities-list');
        if (activitiesList && allActivities.length > 0) {
            activitiesList.innerHTML = allActivities.map(activity => {
                const timeAgo = getTimeAgo(activity.created_at);
                const exactTime = new Date(activity.created_at).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                });
                
                let icon = 'fas fa-plus';
                let message = '';
                let actionClass = '';

                switch(activity.action_type) {
                    case 'create':
                        icon = 'fas fa-plus';
                        message = `Yeni ${getTableDisplayName(activity.table_name)} eklendi: "${activity.record_title}"`;
                        actionClass = 'create';
                        break;
                    case 'update':
                        icon = 'fas fa-edit';
                        message = `${getTableDisplayName(activity.table_name)} güncellendi: "${activity.record_title}"`;
                        actionClass = 'update';
                        break;
                    case 'delete':
                        icon = 'fas fa-trash';
                        message = `${getTableDisplayName(activity.table_name)} silindi: "${activity.record_title}"`;
                        actionClass = 'delete';
                        break;
                    case 'draft':
                        icon = 'fas fa-save';
                        message = `Taslak kaydedildi: "${activity.record_title}"`;
                        actionClass = 'draft';
                        break;
                    case 'restore':
                        icon = 'fas fa-undo';
                        message = `Versiyon geri yüklendi: "${activity.record_title}"`;
                        actionClass = 'restore';
                        break;
                    default:
                        icon = 'fas fa-info';
                        message = `Aktivite: "${activity.record_title}"`;
                        actionClass = 'info';
                }

                return `
                    <div class="activity-item ${actionClass}">
                        <div class="activity-icon">
                            <i class="${icon}"></i>
                        </div>
                        <div class="activity-content">
                            <p>${message}</p>
                            <span class="activity-time" title="${exactTime}">${timeAgo}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Close modal on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllActivitiesModal();
            }
        });
    } catch (error) {
        console.error('Error loading all activities:', error);
        alert('Aktiviteler yüklenirken bir hata oluştu.');
    }
}

function closeAllActivitiesModal() {
    const modal = document.getElementById('all-activities-modal') || document.querySelector('.all-activities-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Make functions global
window.openAllActivitiesModal = openAllActivitiesModal;
window.closeAllActivitiesModal = closeAllActivitiesModal;

// Load admin members for settings page
async function loadAdminMembers() {
    const adminMembersList = document.getElementById('admin-members-list');
    if (!adminMembersList) return;
    
    try {
        const members = await DatabaseService.getAllMembers();
        
        // Filter to show only admins in the list
        const adminMembers = members.filter(member => member.is_admin === true);
        
        if (adminMembers.length === 0) {
            adminMembersList.innerHTML = '<p class="no-members">Henüz admin bulunmuyor.</p>';
            return;
        }
        
        // Show only admin members
        adminMembersList.innerHTML = adminMembers.map(member => {
            const avatarUrl = member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}`;
            const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'İsimsiz';
            const isAdmin = member.is_admin || false;
            
            return `
                <div class="admin-member-item" data-member-id="${member.user_id || member.id}">
                    <div class="admin-member-avatar">
                        <img src="${avatarUrl}" alt="${fullName}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}'">
                    </div>
                    <div class="admin-member-info">
                        <h4>${fullName} ${isAdmin ? '<span class="admin-badge"><i class="fas fa-shield-alt"></i> Admin</span>' : ''}</h4>
                        <p>${member.email || '-'}</p>
                    </div>
                    <div class="admin-member-actions">
                        ${!isAdmin ? `
                            <button type="button" class="btn btn-warning" onclick="makeAdmin('${member.user_id || member.id}', '${fullName.replace(/'/g, "\\'")}')" title="Admin Yap">
                                <i class="fas fa-user-shield"></i>
                                <span>Admin Yap</span>
                            </button>
                        ` : `
                            <span class="admin-status">Admin</span>
                        `}
                    </div>
                </div>
            `;
        }).join('');
        
        // Ensure search input has event listener
        const searchInput = document.getElementById('admin-member-search');
        if (searchInput && !searchInput.hasAttribute('data-listener-added')) {
            searchInput.setAttribute('data-listener-added', 'true');
            searchInput.addEventListener('input', filterAdminMembers);
        }
    } catch (error) {
        console.error('Error loading admin members:', error);
        adminMembersList.innerHTML = '<p class="error-message">Üyeler yüklenirken bir hata oluştu.</p>';
    }
}

// Filter admin members - search from all members, not just admins
async function filterAdminMembers() {
    const searchInput = document.getElementById('admin-member-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const adminMembersList = document.getElementById('admin-members-list');
    
    if (!searchTerm) {
        // If search is empty, show only admins
        loadAdminMembers();
        return;
    }
    
    try {
        // Search from all members
        const members = await DatabaseService.getAllMembers();
        const filteredMembers = members.filter(member => {
            const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim().toLowerCase();
            const email = (member.email || '').toLowerCase();
            const phone = (member.phone || '').toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
        });
        
        if (filteredMembers.length === 0) {
            adminMembersList.innerHTML = '<p class="no-members">Arama sonucu bulunamadı.</p>';
            return;
        }
        
        // Show filtered members (both admin and non-admin)
        adminMembersList.innerHTML = filteredMembers.map(member => {
            const avatarUrl = member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}`;
            const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'İsimsiz';
            const isAdmin = member.is_admin || false;
            
            return `
                <div class="admin-member-item" data-member-id="${member.user_id || member.id}">
                    <div class="admin-member-avatar">
                        <img src="${avatarUrl}" alt="${fullName}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}'">
                    </div>
                    <div class="admin-member-info">
                        <h4>${fullName} ${isAdmin ? '<span class="admin-badge"><i class="fas fa-shield-alt"></i> Admin</span>' : ''}</h4>
                        <p>${member.email || '-'}</p>
                    </div>
                    <div class="admin-member-actions">
                        ${!isAdmin ? `
                            <button type="button" class="btn btn-warning" onclick="makeAdmin('${member.user_id || member.id}', '${fullName.replace(/'/g, "\\'")}')" title="Admin Yap">
                                <i class="fas fa-user-shield"></i>
                                <span>Admin Yap</span>
                            </button>
                        ` : `
                            <span class="admin-status">Admin</span>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error filtering admin members:', error);
        adminMembersList.innerHTML = '<p class="error-message">Arama yapılırken bir hata oluştu.</p>';
    }
}

// Make admin with 3-step confirmation (Apple-style)
let makeAdminStep = 0;
let makeAdminMemberId = null;
let makeAdminMemberName = null;

async function makeAdmin(memberId, memberName) {
    makeAdminMemberId = memberId;
    makeAdminMemberName = memberName;
    makeAdminStep = 1;
    
    showMakeAdminConfirmation();
}

function showMakeAdminConfirmation() {
    // Remove existing modal if any
    const existingModal = document.getElementById('make-admin-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal make-admin-modal active';
    modal.id = 'make-admin-modal';
    
    // 3 aşamalı onay sistemi - her aşamada farklı sorular
    const questions = [
        `${makeAdminMemberName} kullanıcısına admin yetkisi vermek istediğinizden emin misiniz?`,
        `Bu kullanıcı admin yetkisi aldığında tüm site ayarlarına erişebilecek. Devam etmek istiyor musunuz?`,
        `Son onay: ${makeAdminMemberName} kullanıcısına admin yetkisi verilecek. Bu işlem geri alınamaz. Onaylıyor musunuz?`
    ];
    
    const stepTitles = ['İlk Onay', 'İkinci Onay', 'Son Onay'];
    const buttonPositions = ['left', 'right', 'left']; // Alternating positions
    const confirmTexts = ['Evet, Eminim', 'Evet, Devam Et', 'Evet, Onaylıyorum'];
    const cancelTexts = ['Hayır, İptal', 'Hayır, Vazgeç', 'Hayır, İptal'];
    
    const currentStep = makeAdminStep - 1;
    const confirmText = confirmTexts[currentStep];
    const cancelText = cancelTexts[currentStep];
    const question = questions[currentStep];
    const stepTitle = stepTitles[currentStep];
    
    modal.innerHTML = `
        <div class="modal-content make-admin-modal-content">
            <div class="modal-header">
                <h2>Admin Yetkisi Verme</h2>
                <button class="modal-close" onclick="closeMakeAdminModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="make-admin-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>${stepTitle}</h3>
                    <p><strong>${question}</strong></p>
                    <p class="warning-text">Bu işlem geri alınamaz. Admin yetkisi olan kullanıcılar tüm site ayarlarına erişebilir.</p>
                </div>
                <div class="make-admin-buttons" style="flex-direction: ${buttonPositions[currentStep] === 'left' ? 'row' : 'row-reverse'};">
                    <button class="btn btn-danger" onclick="confirmMakeAdmin()" style="order: ${buttonPositions[currentStep] === 'left' ? '1' : '2'};">
                        ${confirmText}
                    </button>
                    <button class="btn btn-secondary" onclick="cancelMakeAdmin()" style="order: ${buttonPositions[currentStep] === 'right' ? '1' : '2'};">
                        ${cancelText}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function confirmMakeAdmin() {
    makeAdminStep++;
    
    if (makeAdminStep <= 3) {
        const modal = document.getElementById('make-admin-modal');
        if (modal) {
            modal.remove();
        }
        showMakeAdminConfirmation();
    } else {
        // Final confirmation - actually make admin
        executeMakeAdmin();
    }
}

function cancelMakeAdmin() {
    closeMakeAdminModal();
}

function closeMakeAdminModal() {
    const modal = document.getElementById('make-admin-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';
    makeAdminStep = 0;
    makeAdminMemberId = null;
    makeAdminMemberName = null;
}

async function executeMakeAdmin() {
    try {
        // Try to update by user_id first, then by id
        let updateResult = null;
        let error = null;
        
        // First try with user_id
        const { data: dataByUserId, error: errorByUserId } = await supabase
            .from('members')
            .update({ is_admin: true })
            .eq('user_id', makeAdminMemberId)
            .select();
        
        if (errorByUserId) {
            // If user_id doesn't work, try with id
            const { data: dataById, error: errorById } = await supabase
                .from('members')
                .update({ is_admin: true })
                .eq('id', makeAdminMemberId)
                .select();
            
            if (errorById) {
                throw errorById;
            }
            updateResult = dataById;
        } else {
            updateResult = dataByUserId;
        }
        
        if (!updateResult || updateResult.length === 0) {
            throw new Error('Üye bulunamadı.');
        }
        
        alert(`${makeAdminMemberName} kullanıcısına admin yetkisi verildi!`);
        closeMakeAdminModal();
        
        // Reload admin members list
        loadAdminMembers();
        // Reload members table
        loadMembers();
    } catch (error) {
        console.error('Error making admin:', error);
        alert('Admin yetkisi verilirken bir hata oluştu: ' + (error.message || error));
        closeMakeAdminModal();
    }
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    // First check admin access
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
        return; // Redirect will happen in checkAdminAccess
    }
    
    // User has admin access, continue loading
    loadDashboardStats();
    loadAnnouncements();
    loadBlogPosts();
    loadEvents();
    loadRegistrations();
    loadMedia();
    loadSiteSettings();
    
    // Load admin user info for sidebar
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const member = await DatabaseService.getMemberById(user.id);
            if (member) {
                const adminUserName = document.getElementById('adminUserName');
                const adminUserAvatar = document.getElementById('adminUserAvatar');
                
                if (adminUserName) {
                    adminUserName.textContent = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Admin';
                }
                
                if (adminUserAvatar) {
                    if (member.avatar_url) {
                        adminUserAvatar.src = member.avatar_url;
                        adminUserAvatar.style.display = 'block';
                        // Hide placeholder when avatar is loaded
                        const placeholder = adminUserAvatar.nextElementSibling;
                        if (placeholder && placeholder.classList.contains('user-profile-avatar-placeholder')) {
                            placeholder.style.display = 'none';
                        }
                    } else {
                        // Show placeholder if no avatar
                        adminUserAvatar.style.display = 'none';
                        const placeholder = adminUserAvatar.nextElementSibling;
                        if (placeholder && placeholder.classList.contains('user-profile-avatar-placeholder')) {
                            placeholder.style.display = 'flex';
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading admin user info:', error);
    }
    
    // Setup bottom navigation
    setupBottomNavigation();
    
    // Initialize RichTextEditor instances
    setTimeout(() => {
        initializeRichTextEditors();
    }, 500); // Wait for DOM to be fully loaded
});

// RichTextEditor Integration
let announcementEditor, blogEditor, eventEditor;

// Initialize RichTextEditor instances
function initializeRichTextEditors() {
    try {
        // Initialize Announcement Editor
        announcementEditor = new RichTextEditor("#announcement-content-editor");
        
        // Initialize Blog Editor
        blogEditor = new RichTextEditor("#blog-content-editor");
        
        // Initialize Event Editor
        eventEditor = new RichTextEditor("#event-content-editor");
        
        console.log('RichTextEditor instances initialized successfully');
    } catch (error) {
        console.error('Error initializing RichTextEditor:', error);
    }
}

// Get HTML content from RichTextEditor
function getEditorContent(editorType) {
    try {
        switch(editorType) {
            case 'announcement':
                return announcementEditor ? announcementEditor.getHTMLCode() : '';
            case 'blog':
                return blogEditor ? blogEditor.getHTMLCode() : '';
            case 'event':
                return eventEditor ? eventEditor.getHTMLCode() : '';
            default:
                return '';
        }
    } catch (error) {
        console.error('Error getting editor content:', error);
        return '';
    }
}

// Set HTML content to RichTextEditor
function setEditorContent(editorType, htmlContent) {
    try {
        switch(editorType) {
            case 'announcement':
                if (announcementEditor) announcementEditor.setHTMLCode(htmlContent || '');
                break;
            case 'blog':
                if (blogEditor) blogEditor.setHTMLCode(htmlContent || '');
                break;
            case 'event':
                if (eventEditor) eventEditor.setHTMLCode(htmlContent || '');
                break;
        }
    } catch (error) {
        console.error('Error setting editor content:', error);
    }
}

// Clear RichTextEditor content
function clearEditorContent(editorType) {
    setEditorContent(editorType, '');
}

// Legacy Rich Text Editor Functions (for backward compatibility)
function formatText(command) {
    // Get the currently focused editor
    const activeEditor = document.activeElement;
    if (!activeEditor || !activeEditor.classList.contains('editor-content')) {
        // If no active editor, try to find any visible editor
        const visibleEditor = document.querySelector('.editor-content:not([style*="display: none"])');
        if (visibleEditor) {
            visibleEditor.focus();
        } else {
            console.log('No active editor found');
            return;
        }
    }
    
    // Modern Selection API approach
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    switch(command) {
        case 'bold':
            // Check if cursor/selection is already within bold formatting
            const container = range.commonAncestorContainer;
            const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
            const existingStrong = element?.closest('strong') || element?.closest('b');
            
            if (existingStrong) {
                // Remove bold formatting
                const parent = existingStrong.parentNode;
                while (existingStrong.firstChild) {
                    parent.insertBefore(existingStrong.firstChild, existingStrong);
                }
                parent.removeChild(existingStrong);
            } else {
                // Add bold formatting
                const strong = document.createElement('strong');
                try {
                    range.surroundContents(strong);
                } catch (e) {
                    // If can't surround, insert at cursor
                    const text = selection.toString() || 'Bold text';
                    strong.textContent = text;
                    range.deleteContents();
                    range.insertNode(strong);
                }
            }
            break;
            
        case 'italic':
            // Check if cursor/selection is already within italic formatting
            const containerItalic = range.commonAncestorContainer;
            const elementItalic = containerItalic.nodeType === Node.TEXT_NODE ? containerItalic.parentElement : containerItalic;
            const existingEm = elementItalic?.closest('em') || elementItalic?.closest('i');
            
            if (existingEm) {
                // Remove italic formatting
                const parent = existingEm.parentNode;
                while (existingEm.firstChild) {
                    parent.insertBefore(existingEm.firstChild, existingEm);
                }
                parent.removeChild(existingEm);
            } else {
                // Add italic formatting
                const em = document.createElement('em');
                try {
                    range.surroundContents(em);
                } catch (e) {
                    const text = selection.toString() || 'Italic text';
                    em.textContent = text;
                    range.deleteContents();
                    range.insertNode(em);
                }
            }
            break;
            
        case 'underline':
            // Check if cursor/selection is already within underline formatting
            const containerUnderline = range.commonAncestorContainer;
            const elementUnderline = containerUnderline.nodeType === Node.TEXT_NODE ? containerUnderline.parentElement : containerUnderline;
            const existingU = elementUnderline?.closest('u');
            
            if (existingU) {
                // Remove underline formatting
                const parent = existingU.parentNode;
                while (existingU.firstChild) {
                    parent.insertBefore(existingU.firstChild, existingU);
                }
                parent.removeChild(existingU);
            } else {
                // Add underline formatting
                const u = document.createElement('u');
                try {
                    range.surroundContents(u);
                } catch (e) {
                    const text = selection.toString() || 'Underlined text';
                    u.textContent = text;
                    range.deleteContents();
                    range.insertNode(u);
                }
            }
            break;
            
        case 'h1':
            // Wrap selection in <h1> tag
            const h1 = document.createElement('h1');
            try {
                range.surroundContents(h1);
            } catch (e) {
                h1.textContent = selection.toString();
                range.deleteContents();
                range.insertNode(h1);
            }
            break;
            
        case 'h2':
            // Wrap selection in <h2> tag
            const h2 = document.createElement('h2');
            try {
                range.surroundContents(h2);
            } catch (e) {
                h2.textContent = selection.toString();
                range.deleteContents();
                range.insertNode(h2);
            }
            break;
            
        case 'ul':
            // Create unordered list
            const ul = document.createElement('ul');
            const li = document.createElement('li');
            li.textContent = selection.toString() || 'List item';
            ul.appendChild(li);
            range.deleteContents();
            range.insertNode(ul);
            break;
            
        case 'ol':
            // Create ordered list
            const ol = document.createElement('ol');
            const oli = document.createElement('li');
            oli.textContent = selection.toString() || 'List item';
            ol.appendChild(oli);
            range.deleteContents();
            range.insertNode(ol);
            break;
            
        case 'quote':
            // Wrap selection in <blockquote> tag
            const blockquote = document.createElement('blockquote');
            try {
                range.surroundContents(blockquote);
            } catch (e) {
                blockquote.textContent = selection.toString();
                range.deleteContents();
                range.insertNode(blockquote);
            }
            break;
            
        case 'link':
            const url = prompt('Link URL\'sini girin:');
            if (url) {
                const a = document.createElement('a');
                a.href = url;
                a.textContent = selection.toString() || url;
                range.deleteContents();
                range.insertNode(a);
            }
            break;
    }
    
    // Clear selection and update toolbar
    selection.removeAllRanges();
    updateToolbarButtons();
}

function changeTextColor(color) {
    if (color) {
        // Get the currently focused editor
        const activeEditor = document.activeElement;
        if (!activeEditor || !activeEditor.classList.contains('editor-content')) {
            // If no active editor, try to find any visible editor
            const visibleEditor = document.querySelector('.editor-content:not([style*="display: none"])');
            if (visibleEditor) {
                visibleEditor.focus();
            } else {
                console.log('No active editor found for color change');
                return;
            }
        }
        
        // Modern Selection API approach
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        
        // Wrap selection in <span> with color style
        const span = document.createElement('span');
        span.style.color = color;
        
        try {
            range.surroundContents(span);
        } catch (e) {
            // If can't surround, insert at cursor
            span.textContent = selection.toString();
            range.deleteContents();
            range.insertNode(span);
        }
        
        // Clear selection
        selection.removeAllRanges();
    }
}

function insertImage() {
    const url = prompt('Resim URL\'sini girin:');
    if (url) {
        // Get the currently focused editor
        const activeEditor = document.activeElement;
        if (!activeEditor || !activeEditor.classList.contains('editor-content')) {
            // If no active editor, try to find any visible editor
            const visibleEditor = document.querySelector('.editor-content:not([style*="display: none"])');
            if (visibleEditor) {
                visibleEditor.focus();
            } else {
                console.log('No active editor found for image insert');
                return;
            }
        }
        
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.margin = '1rem 0';
        
        // Wait for image to load, then wrap with resize container
        img.onload = () => {
            wrapImageWithResizeContainer(img);
        };
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(img);
        } else {
            document.activeElement.appendChild(img);
        }
    }
}

function insertVideo() {
    const url = prompt('Video URL\'sini girin (YouTube, Vimeo, vb.):');
    if (url) {
        // Get the currently focused editor
        const activeEditor = document.activeElement;
        if (!activeEditor || !activeEditor.classList.contains('editor-content')) {
            // If no active editor, try to find any visible editor
            const visibleEditor = document.querySelector('.editor-content:not([style*="display: none"])');
            if (visibleEditor) {
                visibleEditor.focus();
            } else {
                console.log('No active editor found for video insert');
                return;
            }
        }
        
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.height = 'auto';
        video.style.borderRadius = '8px';
        video.style.margin = '1rem 0';
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(video);
        } else {
            document.activeElement.appendChild(video);
        }
    }
}

function updateToolbarButtons() {
    // Get the currently focused editor
    const activeEditor = document.activeElement;
    if (!activeEditor || !activeEditor.classList.contains('editor-content')) {
        return;
    }
    
    // Remove active class from all buttons in this editor's toolbar
    const toolbar = activeEditor.closest('.rich-text-editor')?.querySelector('.editor-toolbar');
    if (!toolbar) return;
    
    const buttons = toolbar.querySelectorAll('.toolbar-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Check current formatting - Modern Selection API
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Check if we're in the current editor
        const editor = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
        
        if (editor && editor.closest('.editor-content') === activeEditor) {
            let startElement, endElement;
            
            if (selection.isCollapsed) {
                // Cursor (imleç) durumu - cursor'un bulunduğu element'i kontrol et
                const cursorContainer = range.startContainer;
                startElement = cursorContainer.nodeType === Node.TEXT_NODE ? cursorContainer.parentElement : cursorContainer;
                endElement = startElement; // Cursor için aynı element
            } else {
                // Text selection durumu - seçili metnin başlangıç ve bitiş element'lerini kontrol et
                const startContainer = range.startContainer;
                const endContainer = range.endContainer;
                startElement = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentElement : startContainer;
                endElement = endContainer.nodeType === Node.TEXT_NODE ? endContainer.parentElement : endContainer;
            }
            
            // Check bold formatting - cursor or selection within strong/b tags
            const boldBtn = toolbar.querySelector('[onclick*="bold"]');
            if (boldBtn) {
                const isBold = startElement.closest('strong') || startElement.closest('b') ||
                              endElement.closest('strong') || endElement.closest('b');
                boldBtn.classList.toggle('active', !!isBold);
            }
            
            // Check italic formatting - cursor or selection within em/i tags
            const italicBtn = toolbar.querySelector('[onclick*="italic"]');
            if (italicBtn) {
                const isItalic = startElement.closest('em') || startElement.closest('i') ||
                                endElement.closest('em') || endElement.closest('i');
                italicBtn.classList.toggle('active', !!isItalic);
            }
            
            // Check underline formatting - cursor or selection within u tags
            const underlineBtn = toolbar.querySelector('[onclick*="underline"]');
            if (underlineBtn) {
                const isUnderline = startElement.closest('u') || endElement.closest('u');
                underlineBtn.classList.toggle('active', !!isUnderline);
            }
        }
    }
}

// -----------------------------------------------------------------------------
// Image Resize Functionality
// -----------------------------------------------------------------------------
function wrapImageWithResizeContainer(img) {
    // Check if already wrapped
    if (img.parentElement.classList.contains('image-resize-container')) {
        return img.parentElement;
    }
    
    // Create container
    const container = document.createElement('div');
    container.className = 'image-resize-container';
    
    // Create handles
    const handles = document.createElement('div');
    handles.className = 'image-resize-handles';
    
    // Create resize info
    const info = document.createElement('div');
    info.className = 'image-resize-info';
    info.textContent = `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height}`;
    
    // Create handles
    const handlePositions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
    handlePositions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `image-resize-handle ${pos}`;
        handle.dataset.direction = pos;
        handles.appendChild(handle);
    });
    
    // Wrap image
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
    container.appendChild(handles);
    container.appendChild(info);
    
    // Add event listeners
    addImageResizeListeners(container);
    
    return container;
}

function addImageResizeListeners(container) {
    const img = container.querySelector('img');
    const handles = container.querySelectorAll('.image-resize-handle');
    const info = container.querySelector('.image-resize-info');
    
    // Image click to select
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        selectImage(container);
    });
    
    // Handle drag events
    handles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startResize(e, container, handle.dataset.direction);
        });
    });
    
    // Update info on resize
    const observer = new ResizeObserver(() => {
        if (info) {
            info.textContent = `${Math.round(img.offsetWidth)} × ${Math.round(img.offsetHeight)}`;
        }
    });
    observer.observe(img);
}

function selectImage(container) {
    // Remove selection from other images
    document.querySelectorAll('.image-resize-container').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('img').classList.remove('selected');
    });
    
    // Select current image
    container.classList.add('selected');
    container.querySelector('img').classList.add('selected');
}

function startResize(e, container, direction) {
    const img = container.querySelector('img');
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const aspectRatio = startWidth / startHeight;
    
    let isResizing = false;
    
    function handleMouseMove(e) {
        if (!isResizing) {
            isResizing = true;
            document.body.style.cursor = getResizeCursor(direction);
        }
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        // Calculate new dimensions based on direction
        switch (direction) {
            case 'se': // Bottom-right
                newWidth = Math.max(50, startWidth + deltaX);
                newHeight = newWidth / aspectRatio;
                break;
            case 'sw': // Bottom-left
                newWidth = Math.max(50, startWidth - deltaX);
                newHeight = newWidth / aspectRatio;
                break;
            case 'ne': // Top-right
                newWidth = Math.max(50, startWidth + deltaX);
                newHeight = newWidth / aspectRatio;
                break;
            case 'nw': // Top-left
                newWidth = Math.max(50, startWidth - deltaX);
                newHeight = newWidth / aspectRatio;
                break;
            case 'e': // Right
                newWidth = Math.max(50, startWidth + deltaX);
                newHeight = newWidth / aspectRatio;
                break;
            case 'w': // Left
                newWidth = Math.max(50, startWidth - deltaX);
                newHeight = newWidth / aspectRatio;
                break;
            case 's': // Bottom
                newHeight = Math.max(50, startHeight + deltaY);
                newWidth = newHeight * aspectRatio;
                break;
            case 'n': // Top
                newHeight = Math.max(50, startHeight - deltaY);
                newWidth = newHeight * aspectRatio;
                break;
        }
        
        // Apply constraints
        const maxWidth = container.parentElement.offsetWidth;
        const maxHeight = 800;
        
        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
        }
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }
        
        // Apply new dimensions
        img.style.width = newWidth + 'px';
        img.style.height = newHeight + 'px';
    }
    
    function handleMouseUp() {
        isResizing = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function getResizeCursor(direction) {
    const cursors = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        's': 's-resize',
        'w': 'w-resize',
        'e': 'e-resize'
    };
    return cursors[direction] || 'default';
}

function initializeImageResize() {
    // Wrap existing images
    document.querySelectorAll('.editor-content img').forEach(img => {
        wrapImageWithResizeContainer(img);
    });
    
    // Watch for new images
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'IMG') {
                        wrapImageWithResizeContainer(node);
                    } else {
                        const images = node.querySelectorAll('img');
                        images.forEach(img => wrapImageWithResizeContainer(img));
                    }
                }
            });
        });
    });
    
    document.querySelectorAll('.editor-content').forEach(editor => {
        observer.observe(editor, { childList: true, subtree: true });
    });
}

// -----------------------------------------------------------------------------
// Yardımcı: Editör HTML'ini güvenle al (contenteditable veya hidden textarea)
// -----------------------------------------------------------------------------
function getEditorHtmlSafely(editorId, hiddenId) {
  const editorEl = document.getElementById(editorId);
  const hiddenEl = document.getElementById(hiddenId);

  // Eğer editor varsa, HTML'ini al
  let htmlFromEditor = editorEl ? editorEl.innerHTML : '';

  console.log('getEditorHtmlSafely - Editor HTML:', htmlFromEditor);
  console.log('getEditorHtmlSafely - Editor element:', editorEl);

  // Hidden alanı da editörle senkron tutalım
  if (hiddenEl) hiddenEl.value = htmlFromEditor;
  
  // Direkt editörden HTML'i döndür - boş kontrolü kaldırıldı
  return htmlFromEditor;
}

// Sync editor content with hidden textarea
function syncEditorContent() {
    // Sync announcement editor
    const announcementEditor = document.getElementById('announcement-content-editor');
    const announcementHidden = document.getElementById('announcement-content-hidden');
    if (announcementEditor && announcementHidden) {
        announcementHidden.value = announcementEditor.innerHTML;
        console.log('Announcement editor synced:', announcementEditor.innerHTML);
    }
    
    // Blog - AGGRESSIVE SYNC
    const blogEditor = document.getElementById('blog-content-editor');
    const blogHidden = document.getElementById('blog-content-hidden');
    if (blogEditor && blogHidden) {
        const html = blogEditor.innerHTML;
        blogHidden.value = html;
        console.log('Blog editor synced:', html);
        console.log('Blog editor element:', blogEditor);
        console.log('Blog editor contentEditable:', blogEditor.contentEditable);
        console.log('Blog editor isContentEditable:', blogEditor.isContentEditable);
    }
    
    // Sync event editor
    const eventEditor = document.getElementById('event-content-editor');
    const eventHidden = document.getElementById('event-content-hidden');
    if (eventEditor && eventHidden) {
        eventHidden.value = eventEditor.innerHTML;
        console.log('Event editor synced:', eventEditor.innerHTML);
    }
}

// Add event listeners to editor
function addEditorListeners(editorId) {
    const editor = document.getElementById(editorId);
    console.log('addEditorListeners called for:', editorId);
    console.log('Editor element found:', editor);
    
    if (editor) {
        // Remove existing listeners first to avoid duplicates
        editor.removeEventListener('input', syncEditorContent);
        editor.removeEventListener('keyup', syncEditorContent);
        editor.removeEventListener('blur', syncEditorContent);
        
        // Add input event listener - AGRESIF DEBUG VERSION
        editor.addEventListener('input', (e) => {
            console.log('🔥🔥🔥 INPUT EVENT TRIGGERED for:', editorId);
            console.log('🔥🔥🔥 Editor innerHTML:', editor.innerHTML);
            console.log('🔥🔥🔥 Editor textContent:', editor.textContent);
            console.log('🔥🔥🔥 Editor innerText:', editor.innerText);
            syncEditorContent();
        });
        
        // Add keydown for debugging
        editor.addEventListener('keydown', (e) => {
            console.log('🔥 KEYDOWN EVENT TRIGGERED for:', editorId, 'Key:', e.key);
        });
        
        // Only add keyup for special keys
        editor.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
                console.log('KEYUP EVENT TRIGGERED for:', editorId, 'Key:', e.key);
                syncEditorContent();
            }
        });
        
        // AGGRESSIVE TEST: Click event
        editor.addEventListener('click', () => {
            console.log('CLICK EVENT TRIGGERED for:', editorId);
            editor.focus();
        });
        
        // AGGRESSIVE TEST: Mouse events
        editor.addEventListener('mousedown', () => {
            console.log('MOUSEDOWN EVENT TRIGGERED for:', editorId);
        });
        
        editor.addEventListener('mouseup', () => {
            console.log('MOUSEUP EVENT TRIGGERED for:', editorId);
        });
        
        // Add paste event listener
        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
            console.log('PASTE EVENT TRIGGERED for:', editorId);
            syncEditorContent();
        });
        
        // Add focus event listener
        editor.addEventListener('focus', () => {
            console.log('Editor focused:', editorId);
            updateToolbarButtons();
        });
        
        // Add blur event listener
        editor.addEventListener('blur', () => {
            console.log('Editor blurred:', editorId);
            syncEditorContent();
        });
        
        // Add selection change listener for toolbar updates
        editor.addEventListener('mouseup', () => {
            setTimeout(updateToolbarButtons, 10);
        });
        
        editor.addEventListener('keyup', () => {
            setTimeout(updateToolbarButtons, 10);
        });
        
        // Add keyup event listener
        editor.addEventListener('keyup', () => {
            console.log('KEYUP EVENT TRIGGERED for:', editorId);
            syncEditorContent();
        });
        
        console.log('Event listeners added to:', editorId);
        
        // Initialize image resize functionality
        initializeImageResize();
    } else {
        console.error('Editor element not found:', editorId);
    }
}

// ============================================
// MEMBERS MANAGEMENT
// ============================================

let allMembers = [];
let filteredMembers = [];

async function loadMembers() {
    try {
        allMembers = await DatabaseService.getAllMembers();
        filteredMembers = [...allMembers];
        renderMembersTable();
        setupMemberFilters();
    } catch (error) {
        console.error('Error loading members:', error);
        document.getElementById('members-table').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #ef4444;">
                    Üyeler yüklenirken bir hata oluştu.
                </td>
            </tr>
        `;
    }
}

function renderMembersTable() {
    const tbody = document.getElementById('members-table');
    if (!tbody) return;
    
    if (filteredMembers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #6b7280;">
                    Henüz üye bulunmuyor.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredMembers.map(member => {
        const avatarUrl = member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}`;
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'İsimsiz';
        const phone = member.phone ? `${member.phone_country || '+90'} ${member.phone}` : '-';
        const university = member.university || '-';
        const department = member.department || '-';
        const createdAt = member.created_at ? new Date(member.created_at).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '-';
        
        return `
            <tr>
                <td>
                    <div class="member-avatar-cell">
                        <img src="${avatarUrl}" alt="${fullName}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}'">
                    </div>
                </td>
                <td><strong>${fullName}</strong> ${member.is_admin ? '<span class="admin-badge"><i class="fas fa-shield-alt"></i> Admin</span>' : ''}</td>
                <td>${member.email || '-'}</td>
                <td>${phone}</td>
                <td>${university}</td>
                <td>${department}</td>
                <td>${createdAt}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="openMemberDetailModal('${member.user_id || member.id}')" title="Detaylar">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupMemberFilters() {
    const searchInput = document.getElementById('member-search');
    const universityFilter = document.getElementById('member-filter-university');
    const departmentFilter = document.getElementById('member-filter-department');
    
    // Populate university and department filters
    const universities = [...new Set(allMembers.map(m => m.university).filter(Boolean))].sort();
    const departments = [...new Set(allMembers.map(m => m.department).filter(Boolean))].sort();
    
    if (universityFilter) {
        universities.forEach(uni => {
            const option = document.createElement('option');
            option.value = uni;
            option.textContent = uni;
            universityFilter.appendChild(option);
        });
        
        universityFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    
    if (departmentFilter) {
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });
        
        departmentFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }
}

function applyFilters() {
    const searchInput = document.getElementById('member-search');
    const universityFilter = document.getElementById('member-filter-university');
    const departmentFilter = document.getElementById('member-filter-department');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedUniversity = universityFilter ? universityFilter.value : '';
    const selectedDepartment = departmentFilter ? departmentFilter.value : '';
    
    filteredMembers = allMembers.filter(member => {
        // Search filter
        if (searchTerm) {
            const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
            const email = (member.email || '').toLowerCase();
            const phone = (member.phone || '').toLowerCase();
            const university = (member.university || '').toLowerCase();
            const department = (member.department || '').toLowerCase();
            
            const matchesSearch = fullName.includes(searchTerm) ||
                                 email.includes(searchTerm) ||
                                 phone.includes(searchTerm) ||
                                 university.includes(searchTerm) ||
                                 department.includes(searchTerm);
            
            if (!matchesSearch) return false;
        }
        
        // University filter
        if (selectedUniversity && member.university !== selectedUniversity) {
            return false;
        }
        
        // Department filter
        if (selectedDepartment && member.department !== selectedDepartment) {
            return false;
        }
        
        return true;
    });
    
    renderMembersTable();
}

async function openMemberDetailModal(memberId) {
    try {
        // Try to get member by user_id first, then by id
        let member = await DatabaseService.getMemberById(memberId);
        if (!member) {
            // Try to find by user_id if memberId is a UUID
            const allMembers = await DatabaseService.getAllMembers();
            member = allMembers.find(m => m.user_id === memberId || m.id === memberId);
        }
        
        if (!member) {
            alert('Üye bulunamadı.');
            return;
        }
        
        // Use user_id for content views and reactions
        const userId = member.user_id || member.id;
        const contentViews = await DatabaseService.getMemberContentViews(userId);
        const reactions = await DatabaseService.getMemberReactions(userId);
        
        await renderMemberDetails(member, contentViews, reactions);
        
        const modal = document.getElementById('member-detail-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Error opening member detail modal:', error);
        alert('Üye detayları yüklenirken bir hata oluştu.');
    }
}

function closeMemberDetailModal() {
    const modal = document.getElementById('member-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function renderMemberDetails(member, contentViews, reactions) {
    const title = document.getElementById('member-detail-title');
    const content = document.getElementById('member-detail-content');
    
    if (title) {
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'İsimsiz';
        title.textContent = `${fullName} - Detaylar`;
    }
    
    if (!content) return;
    
    const avatarUrl = member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}`;
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'İsimsiz';
    const phone = member.phone ? `${member.phone_country || '+90'} ${member.phone}` : '-';
    const createdAt = member.created_at ? new Date(member.created_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '-';
    
    // Group content views by type
    const viewsByType = {
        announcement: contentViews.filter(v => v.content_type === 'announcement'),
        event: contentViews.filter(v => v.content_type === 'event'),
        blog: contentViews.filter(v => v.content_type === 'blog')
    };
    
    // Group reactions by type
    const reactionsByType = {
        announcement: reactions.filter(r => r.content_type === 'announcement'),
        event: reactions.filter(r => r.content_type === 'event'),
        blog: reactions.filter(r => r.content_type === 'blog')
    };
    
    // Fetch content titles for views
    const contentTitlesMap = new Map();
    const uniqueContentIds = {
        announcement: [...new Set(viewsByType.announcement.map(v => v.content_id))],
        event: [...new Set(viewsByType.event.map(v => v.content_id))],
        blog: [...new Set(viewsByType.blog.map(v => v.content_id))]
    };
    
    // Fetch all announcement titles
    for (const id of uniqueContentIds.announcement) {
        try {
            const announcement = await getAnnouncementById(id);
            if (announcement) {
                contentTitlesMap.set(`announcement-${id}`, announcement.title || 'Başlıksız Duyuru');
            }
        } catch (error) {
            console.error(`Error fetching announcement ${id}:`, error);
            contentTitlesMap.set(`announcement-${id}`, `Duyuru #${id}`);
        }
    }
    
    // Fetch all event titles
    for (const id of uniqueContentIds.event) {
        try {
            const event = await getEventById(id);
            if (event) {
                contentTitlesMap.set(`event-${id}`, event.title || 'Başlıksız Etkinlik');
            }
        } catch (error) {
            console.error(`Error fetching event ${id}:`, error);
            contentTitlesMap.set(`event-${id}`, `Etkinlik #${id}`);
        }
    }
    
    // Fetch all blog post titles
    for (const id of uniqueContentIds.blog) {
        try {
            const blogPost = await getBlogPostById(id);
            if (blogPost) {
                contentTitlesMap.set(`blog-${id}`, blogPost.title || 'Başlıksız Blog');
            }
        } catch (error) {
            console.error(`Error fetching blog post ${id}:`, error);
            contentTitlesMap.set(`blog-${id}`, `Blog #${id}`);
        }
    }
    
    // Fetch content titles for reactions
    const reactionContentIds = {
        announcement: [...new Set(reactionsByType.announcement.map(r => r.content_id))],
        event: [...new Set(reactionsByType.event.map(r => r.content_id))],
        blog: [...new Set(reactionsByType.blog.map(r => r.content_id))]
    };
    
    // Fetch missing announcement titles for reactions
    for (const id of reactionContentIds.announcement) {
        if (!contentTitlesMap.has(`announcement-${id}`)) {
            try {
                const announcement = await getAnnouncementById(id);
                if (announcement) {
                    contentTitlesMap.set(`announcement-${id}`, announcement.title || 'Başlıksız Duyuru');
                }
            } catch (error) {
                console.error(`Error fetching announcement ${id}:`, error);
                contentTitlesMap.set(`announcement-${id}`, `Duyuru #${id}`);
            }
        }
    }
    
    // Fetch missing event titles for reactions
    for (const id of reactionContentIds.event) {
        if (!contentTitlesMap.has(`event-${id}`)) {
            try {
                const event = await getEventById(id);
                if (event) {
                    contentTitlesMap.set(`event-${id}`, event.title || 'Başlıksız Etkinlik');
                }
            } catch (error) {
                console.error(`Error fetching event ${id}:`, error);
                contentTitlesMap.set(`event-${id}`, `Etkinlik #${id}`);
            }
        }
    }
    
    // Fetch missing blog post titles for reactions
    for (const id of reactionContentIds.blog) {
        if (!contentTitlesMap.has(`blog-${id}`)) {
            try {
                const blogPost = await getBlogPostById(id);
                if (blogPost) {
                    contentTitlesMap.set(`blog-${id}`, blogPost.title || 'Başlıksız Blog');
                }
            } catch (error) {
                console.error(`Error fetching blog post ${id}:`, error);
                contentTitlesMap.set(`blog-${id}`, `Blog #${id}`);
            }
        }
    }
    
    content.innerHTML = `
        <div class="member-detail-grid">
            <div class="member-detail-section">
                <h3><i class="fas fa-user"></i> Kişisel Bilgiler</h3>
                <div class="member-info-card">
                    <div class="member-avatar-large">
                        <img src="${avatarUrl}" alt="${fullName}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || 'default'}'">
                    </div>
                    <div class="member-info-list">
                        <div class="info-item">
                            <span class="info-label">Ad Soyad:</span>
                            <span class="info-value">${fullName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">E-posta:</span>
                            <span class="info-value">${member.email || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Telefon:</span>
                            <span class="info-value">${phone}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Üniversite:</span>
                            <span class="info-value">${member.university || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Bölüm:</span>
                            <span class="info-value">${member.department || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Kayıt Tarihi:</span>
                            <span class="info-value">${createdAt}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="member-detail-section">
                <h3><i class="fas fa-eye"></i> Görüntülenen İçerikler (${contentViews.length})</h3>
                <div class="content-views-summary">
                    <div class="summary-item">
                        <span class="summary-label">Duyurular:</span>
                        <span class="summary-value">${viewsByType.announcement.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Etkinlikler:</span>
                        <span class="summary-value">${viewsByType.event.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Blog Yazıları:</span>
                        <span class="summary-value">${viewsByType.blog.length}</span>
                    </div>
                </div>
                ${contentViews.length > 0 ? `
                    <div class="content-views-table-container">
                        <table class="content-views-table">
                            <thead>
                                <tr>
                                    <th>İçerik Türü</th>
                                    <th>İçerik Başlığı</th>
                                    <th>Görüntülenme Tarihi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${contentViews.slice(0, 20).map(view => {
                                    const titleKey = `${view.content_type}-${view.content_id}`;
                                    const contentTitle = contentTitlesMap.get(titleKey) || `${view.content_type === 'announcement' ? 'Duyuru' : view.content_type === 'event' ? 'Etkinlik' : 'Blog'} #${view.content_id}`;
                                    return `
                                        <tr>
                                            <td>${view.content_type === 'announcement' ? 'Duyuru' : view.content_type === 'event' ? 'Etkinlik' : 'Blog'}</td>
                                            <td><strong>${contentTitle}</strong></td>
                                            <td>${new Date(view.viewed_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                        ${contentViews.length > 20 ? `<p style="text-align: center; color: #6b7280; margin-top: 1rem;">Ve ${contentViews.length - 20} tane daha...</p>` : ''}
                    </div>
                ` : '<p style="text-align: center; color: #6b7280; padding: 2rem;">Henüz içerik görüntülenmemiş.</p>'}
            </div>
            
            <div class="member-detail-section">
                <h3><i class="fas fa-heart"></i> Tepkiler (${reactions.length})</h3>
                <div class="reactions-summary">
                    <div class="summary-item">
                        <span class="summary-label">Duyurular:</span>
                        <span class="summary-value">${reactionsByType.announcement.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Etkinlikler:</span>
                        <span class="summary-value">${reactionsByType.event.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Blog Yazıları:</span>
                        <span class="summary-value">${reactionsByType.blog.length}</span>
                    </div>
                </div>
                ${reactions.length > 0 ? `
                    <div class="reactions-table-container">
                        <table class="reactions-table">
                            <thead>
                                <tr>
                                    <th>İçerik Türü</th>
                                    <th>İçerik Başlığı</th>
                                    <th>Tepki</th>
                                    <th>Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reactions.slice(0, 20).map(reaction => {
                                    const reactionIcons = {
                                        'like': '👍',
                                        'dislike': '👎',
                                        'love': '❤️',
                                        'laugh': '😂',
                                        'wow': '😮',
                                        'sad': '😢'
                                    };
                                    const titleKey = `${reaction.content_type}-${reaction.content_id}`;
                                    const contentTitle = contentTitlesMap.get(titleKey) || `${reaction.content_type === 'announcement' ? 'Duyuru' : reaction.content_type === 'event' ? 'Etkinlik' : 'Blog'} #${reaction.content_id}`;
                                    return `
                                        <tr>
                                            <td>${reaction.content_type === 'announcement' ? 'Duyuru' : reaction.content_type === 'event' ? 'Etkinlik' : 'Blog'}</td>
                                            <td><strong>${contentTitle}</strong></td>
                                            <td>${reactionIcons[reaction.reaction_type] || reaction.reaction_type}</td>
                                            <td>${new Date(reaction.created_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                        ${reactions.length > 20 ? `<p style="text-align: center; color: #6b7280; margin-top: 1rem;">Ve ${reactions.length - 20} tane daha...</p>` : ''}
                    </div>
                ` : '<p style="text-align: center; color: #6b7280; padding: 2rem;">Henüz tepki verilmemiş.</p>'}
            </div>
        </div>
    `;
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('member-detail-modal');
    if (modal && e.target === modal) {
        closeMemberDetailModal();
    }
});

// Add event listener to all editors
document.addEventListener('DOMContentLoaded', () => {
    const editors = [
        'announcement-content-editor',
        'blog-content-editor', 
        'event-content-editor'
    ];
    
    editors.forEach(editorId => {
        addEditorListeners(editorId);
    });
});
