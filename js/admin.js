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
                    <p>${(item.metadata?.size / 1024).toFixed(1) || '0'} KB • ${new Date(item.created_at).toLocaleDateString('tr-TR')}</p>
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
            await DatabaseService.deleteAnnouncement(id);
            alert('Duyuru silindi!');
            loadAnnouncements();
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
            await DatabaseService.deleteBlogPost(id);
            alert('Blog yazısı silindi!');
            loadBlogPosts();
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

async function deleteEvent(id) {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
        try {
            await DatabaseService.deleteEvent(id);
            alert('Etkinlik silindi!');
            loadEvents();
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
        const activities = await DatabaseService.getRecentActivities(15);
        
        if (activities.length === 0) {
            activitiesContainer.innerHTML = '<p class="no-activities">Henüz aktivite bulunmuyor.</p>';
            return;
        }

        activitiesContainer.innerHTML = activities.map(activity => {
            const timeAgo = getTimeAgo(activity.created_at);
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
                        <span class="activity-time">${timeAgo}</span>
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

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadAnnouncements();
    loadBlogPosts();
    loadEvents();
    loadRegistrations();
    loadMedia();
    
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
