// Admin Panel JavaScript

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.getAttribute('data-section');
        showSection(sectionId);
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
    });
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
    
    // Load section data
    loadSectionData(sectionId);
}

function updatePageTitle(sectionId) {
    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Genel bakış ve istatistikler' },
        'announcements': { title: 'Duyuru Yönetimi', subtitle: 'Duyuruları yönetin' },
        'blog': { title: 'Blog Yönetimi', subtitle: 'Blog yazılarını yönetin' },
        'events': { title: 'Etkinlik Yönetimi', subtitle: 'Etkinlikleri yönetin' },
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
        case 'registrations':
            loadRegistrations();
            break;
        case 'media':
            loadMedia();
            break;
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
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
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        await DatabaseService.createAnnouncement(data);
        alert('Duyuru başarıyla eklendi!');
        closeModal('announcement-modal');
        loadAnnouncements();
    } catch (error) {
        console.error('Error creating announcement:', error);
        alert('Duyuru eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

async function handleBlogSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        await DatabaseService.createBlogPost(data);
        alert('Blog yazısı başarıyla eklendi!');
        closeModal('blog-modal');
        loadBlogPosts();
    } catch (error) {
        console.error('Error creating blog post:', error);
        alert('Blog yazısı eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

async function handleEventSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        await DatabaseService.createEvent(data);
        alert('Etkinlik başarıyla eklendi!');
        closeModal('event-modal');
        loadEvents();
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Etkinlik eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    console.log('Settings data:', data);
    
    alert('Ayarlar başarıyla kaydedildi!');
}

// Data Loading Functions
async function loadAnnouncements() {
    const tableBody = document.getElementById('announcements-table');
    if (!tableBody) return;
    
    try {
        const announcements = await DatabaseService.getAnnouncements();
        
        tableBody.innerHTML = announcements.map(announcement => `
            <tr>
                <td>${announcement.title}</td>
                <td><span class="category-badge category-${announcement.category}">${getCategoryName(announcement.category)}</span></td>
                <td>${new Date(announcement.created_at).toLocaleDateString('tr-TR')}</td>
                <td><span class="status-badge status-${announcement.status}">${getStatusName(announcement.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editAnnouncement(${announcement.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${announcement.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Duyurular yüklenirken bir hata oluştu.</td></tr>';
    }
}

async function loadBlogPosts() {
    const tableBody = document.getElementById('blog-table');
    if (!tableBody) return;
    
    try {
        const blogPosts = await DatabaseService.getBlogPosts();
        
        tableBody.innerHTML = blogPosts.map(post => `
            <tr>
                <td>${post.title}</td>
                <td><span class="category-badge category-${post.category}">${getCategoryName(post.category)}</span></td>
                <td>${new Date(post.created_at).toLocaleDateString('tr-TR')}</td>
                <td><span class="status-badge status-${post.status}">${getStatusName(post.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editBlogPost(${post.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBlogPost(${post.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading blog posts:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Blog yazıları yüklenirken bir hata oluştu.</td></tr>';
    }
}

async function loadEvents() {
    const tableBody = document.getElementById('events-table');
    if (!tableBody) return;
    
    try {
        const events = await DatabaseService.getEvents();
        
        tableBody.innerHTML = events.map(event => `
            <tr>
                <td>${event.title}</td>
                <td><span class="category-badge category-${event.type}">${getEventTypeName(event.type)}</span></td>
                <td>${new Date(event.date).toLocaleDateString('tr-TR')}</td>
                <td>${event.registered || 0}/${event.capacity}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Etkinlikler yüklenirken bir hata oluştu.</td></tr>';
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
                <td>${new Date(registration.created_at).toLocaleDateString('tr-TR')}</td>
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

function loadMedia() {
    const mediaGrid = document.getElementById('media-grid');
    if (!mediaGrid) return;
    
    const mediaItems = [
        {
            id: 1,
            name: 'bilim-senligi-2024.jpg',
            type: 'image',
            size: '2.5 MB',
            date: '2024-01-15'
        },
        {
            id: 2,
            name: 'atolye-video.mp4',
            type: 'video',
            size: '15.2 MB',
            date: '2024-01-10'
        },
        {
            id: 3,
            name: 'konferans-foto.jpg',
            type: 'image',
            size: '1.8 MB',
            date: '2024-01-05'
        }
    ];
    
    mediaGrid.innerHTML = mediaItems.map(item => `
        <div class="media-item">
            <div class="media-preview">
                ${item.type === 'image' ? 
                    '<i class="fas fa-image" style="font-size: 3rem; color: #6b7280; display: flex; align-items: center; justify-content: center; height: 150px;"></i>' :
                    '<i class="fas fa-video" style="font-size: 3rem; color: #6b7280; display: flex; align-items: center; justify-content: center; height: 150px;"></i>'
                }
            </div>
            <div class="media-item-content">
                <h4>${item.name}</h4>
                <p>${item.size} • ${new Date(item.date).toLocaleDateString('tr-TR')}</p>
                <div class="media-actions">
                    <button class="btn btn-sm btn-secondary" onclick="downloadMedia(${item.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMedia(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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

// Action Functions (placeholder implementations)
function editAnnouncement(id) {
    console.log('Edit announcement:', id);
    alert('Duyuru düzenleme özelliği yakında eklenecek!');
}

function deleteAnnouncement(id) {
    if (confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
        console.log('Delete announcement:', id);
        alert('Duyuru silindi!');
        loadAnnouncements();
    }
}

function editBlogPost(id) {
    console.log('Edit blog post:', id);
    alert('Blog yazısı düzenleme özelliği yakında eklenecek!');
}

function deleteBlogPost(id) {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        console.log('Delete blog post:', id);
        alert('Blog yazısı silindi!');
        loadBlogPosts();
    }
}

function editEvent(id) {
    console.log('Edit event:', id);
    alert('Etkinlik düzenleme özelliği yakında eklenecek!');
}

function deleteEvent(id) {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
        console.log('Delete event:', id);
        alert('Etkinlik silindi!');
        loadEvents();
    }
}

function viewRegistration(id) {
    console.log('View registration:', id);
    alert('Kayıt detayları yakında eklenecek!');
}

function deleteRegistration(id) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        console.log('Delete registration:', id);
        alert('Kayıt silindi!');
        loadRegistrations();
    }
}

function downloadMedia(id) {
    console.log('Download media:', id);
    alert('Medya indirme özelliği yakında eklenecek!');
}

function deleteMedia(id) {
    if (confirm('Bu medya dosyasını silmek istediğinizden emin misiniz?')) {
        console.log('Delete media:', id);
        alert('Medya dosyası silindi!');
        loadMedia();
    }
}

// Media Upload
document.getElementById('media-upload').addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        console.log('Files selected:', files);
        alert(`${files.length} dosya seçildi. Yükleme özelliği yakında eklenecek!`);
    }
});

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    loadBlogPosts();
    loadEvents();
    loadRegistrations();
    loadMedia();
});
