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

// Action Functions
let currentEditId = null;

function editAnnouncement(id) {
    currentEditId = id;
    // Get announcement data and populate form
    const announcement = getAnnouncementById(id);
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

function deleteAnnouncement(id) {
    if (confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
        try {
            // In real app, call API to delete
            console.log('Delete announcement:', id);
            alert('Duyuru silindi!');
            loadAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Duyuru silinirken bir hata oluştu.');
        }
    }
}

function editBlogPost(id) {
    currentEditId = id;
    const blogPost = getBlogPostById(id);
    if (blogPost) {
        populateBlogForm(blogPost);
        openModal('blog-modal');
    }
}

function populateBlogForm(blogPost) {
    const form = document.getElementById('blog-form');
    form.querySelector('[name="title"]').value = blogPost.title || '';
    form.querySelector('[name="category"]').value = blogPost.category || '';
    form.querySelector('[name="content"]').value = blogPost.content || '';
    form.querySelector('[name="excerpt"]').value = blogPost.excerpt || '';
    form.querySelector('[name="status"]').value = blogPost.status || 'published';
}

function deleteBlogPost(id) {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        try {
            console.log('Delete blog post:', id);
            alert('Blog yazısı silindi!');
            loadBlogPosts();
        } catch (error) {
            console.error('Error deleting blog post:', error);
            alert('Blog yazısı silinirken bir hata oluştu.');
        }
    }
}

function editEvent(id) {
    currentEditId = id;
    const event = getEventById(id);
    if (event) {
        populateEventForm(event);
        openModal('event-modal');
    }
}

function populateEventForm(event) {
    const form = document.getElementById('event-form');
    form.querySelector('[name="title"]').value = event.title || '';
    form.querySelector('[name="type"]').value = event.type || '';
    form.querySelector('[name="location"]').value = event.location || '';
    form.querySelector('[name="description"]').value = event.description || '';
    form.querySelector('[name="max_participants"]').value = event.capacity || '';
    form.querySelector('[name="registration_required"]').value = event.registration_required ? 'yes' : 'no';
    
    // Format date for datetime-local input
    if (event.date) {
        const date = new Date(event.date);
        const formattedDate = date.toISOString().slice(0, 16);
        form.querySelector('[name="date"]').value = formattedDate;
    }
}

function deleteEvent(id) {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
        try {
            console.log('Delete event:', id);
            alert('Etkinlik silindi!');
            loadEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Etkinlik silinirken bir hata oluştu.');
        }
    }
}

function viewRegistration(id) {
    const registration = getRegistrationById(id);
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

function deleteRegistration(id) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        try {
            console.log('Delete registration:', id);
            alert('Kayıt silindi!');
            loadRegistrations();
        } catch (error) {
            console.error('Error deleting registration:', error);
            alert('Kayıt silinirken bir hata oluştu.');
        }
    }
}

function downloadMedia(id) {
    const media = getMediaById(id);
    if (media) {
        // Create download link
        const link = document.createElement('a');
        link.href = media.file_path;
        link.download = media.original_name;
        link.click();
    }
}

function deleteMedia(id) {
    if (confirm('Bu medya dosyasını silmek istediğinizden emin misiniz?')) {
        try {
            console.log('Delete media:', id);
            alert('Medya dosyası silindi!');
            loadMedia();
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('Medya dosyası silinirken bir hata oluştu.');
        }
    }
}

function exportRegistration(id) {
    const registration = getRegistrationById(id);
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
function getAnnouncementById(id) {
    // In real app, this would fetch from database
    return { id, title: 'Test Duyuru', category: 'genel', content: 'Test içerik', status: 'active' };
}

function getBlogPostById(id) {
    return { id, title: 'Test Blog', category: 'bilim', content: 'Test içerik', excerpt: 'Test özet', status: 'published' };
}

function getEventById(id) {
    return { id, title: 'Test Etkinlik', type: 'konferans', date: new Date().toISOString(), location: 'Test Konum', description: 'Test açıklama', capacity: 50, registration_required: true };
}

function getRegistrationById(id) {
    return {
        id,
        first_name: 'Test',
        last_name: 'Kullanıcı',
        email: 'test@example.com',
        phone: '0555 123 45 67',
        university: 'Marmara Üniversitesi',
        department: 'Biyomühendislik',
        student_id: '123456789',
        grade: '3',
        experience: 'little',
        motivation: 'Test motivasyon',
        dietary: '',
        accessibility: '',
        email_notifications: true,
        sms_notifications: false,
        newsletter: true,
        created_at: new Date().toISOString()
    };
}

function getMediaById(id) {
    return { id, filename: 'test.jpg', original_name: 'test.jpg', file_path: '/path/to/file', file_type: 'image' };
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
