// Local Storage Database Service
// Supabase yerine localStorage kullanarak basit bir veritabanı sistemi

class DatabaseService {
    // Storage keys
    static STORAGE_KEYS = {
        ANNOUNCEMENTS: 'music_announcements',
        BLOG_POSTS: 'music_blog_posts',
        EVENTS: 'music_events',
        REGISTRATIONS: 'music_registrations',
        MEDIA: 'music_media'
    };

    // Helper methods
    static getStorageData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return [];
        }
    }

    static setStorageData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    static generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Announcements
    static async getAnnouncements() {
        try {
            const announcements = this.getStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS);
            return announcements.filter(announcement => announcement.status === 'active');
        } catch (error) {
            console.error('Error fetching announcements:', error);
            return [];
        }
    }

    static async createAnnouncement(announcementData) {
        try {
            const announcements = this.getStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS);
            const newAnnouncement = {
                id: this.generateId(),
                ...announcementData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            announcements.push(newAnnouncement);
            this.setStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS, announcements);
            
            console.log('Announcement created:', newAnnouncement);
            return [newAnnouncement];
        } catch (error) {
            console.error('Error creating announcement:', error);
            throw error;
        }
    }

    static async updateAnnouncement(id, updateData) {
        try {
            const announcements = this.getStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS);
            const index = announcements.findIndex(a => a.id == id);
            
            if (index !== -1) {
                announcements[index] = {
                    ...announcements[index],
                    ...updateData,
                    updated_at: new Date().toISOString()
                };
                this.setStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS, announcements);
                return [announcements[index]];
            }
            return [];
        } catch (error) {
            console.error('Error updating announcement:', error);
            throw error;
        }
    }

    static async deleteAnnouncement(id) {
        try {
            const announcements = this.getStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS);
            const filtered = announcements.filter(a => a.id != id);
            this.setStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS, filtered);
            return true;
        } catch (error) {
            console.error('Error deleting announcement:', error);
            throw error;
        }
    }

    // Blog Posts
    static async getBlogPosts() {
        try {
            const blogPosts = this.getStorageData(this.STORAGE_KEYS.BLOG_POSTS);
            return blogPosts.filter(post => post.status === 'published');
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
    }

    static async createBlogPost(blogData) {
        try {
            const blogPosts = this.getStorageData(this.STORAGE_KEYS.BLOG_POSTS);
            const newPost = {
                id: this.generateId(),
                ...blogData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            blogPosts.push(newPost);
            this.setStorageData(this.STORAGE_KEYS.BLOG_POSTS, blogPosts);
            
            console.log('Blog post created:', newPost);
            return [newPost];
        } catch (error) {
            console.error('Error creating blog post:', error);
            throw error;
        }
    }

    static async updateBlogPost(id, updateData) {
        try {
            const blogPosts = this.getStorageData(this.STORAGE_KEYS.BLOG_POSTS);
            const index = blogPosts.findIndex(p => p.id == id);
            
            if (index !== -1) {
                blogPosts[index] = {
                    ...blogPosts[index],
                    ...updateData,
                    updated_at: new Date().toISOString()
                };
                this.setStorageData(this.STORAGE_KEYS.BLOG_POSTS, blogPosts);
                return [blogPosts[index]];
            }
            return [];
        } catch (error) {
            console.error('Error updating blog post:', error);
            throw error;
        }
    }

    static async deleteBlogPost(id) {
        try {
            const blogPosts = this.getStorageData(this.STORAGE_KEYS.BLOG_POSTS);
            const filtered = blogPosts.filter(p => p.id != id);
            this.setStorageData(this.STORAGE_KEYS.BLOG_POSTS, filtered);
            return true;
        } catch (error) {
            console.error('Error deleting blog post:', error);
            throw error;
        }
    }

    // Events
    static async getEvents() {
        try {
            const events = this.getStorageData(this.STORAGE_KEYS.EVENTS);
            const now = new Date().toISOString();
            return events.filter(event => event.date >= now && event.status === 'active');
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    static async createEvent(eventData) {
        try {
            const events = this.getStorageData(this.STORAGE_KEYS.EVENTS);
            const newEvent = {
                id: this.generateId(),
                ...eventData,
                registered: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            events.push(newEvent);
            this.setStorageData(this.STORAGE_KEYS.EVENTS, events);
            
            console.log('Event created:', newEvent);
            return [newEvent];
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    static async updateEvent(id, updateData) {
        try {
            const events = this.getStorageData(this.STORAGE_KEYS.EVENTS);
            const index = events.findIndex(e => e.id == id);
            
            if (index !== -1) {
                events[index] = {
                    ...events[index],
                    ...updateData,
                    updated_at: new Date().toISOString()
                };
                this.setStorageData(this.STORAGE_KEYS.EVENTS, events);
                return [events[index]];
            }
            return [];
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    static async deleteEvent(id) {
        try {
            const events = this.getStorageData(this.STORAGE_KEYS.EVENTS);
            const filtered = events.filter(e => e.id != id);
            this.setStorageData(this.STORAGE_KEYS.EVENTS, filtered);
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    // Registrations
    static async createRegistration(registrationData) {
        try {
            const registrations = this.getStorageData(this.STORAGE_KEYS.REGISTRATIONS);
            const newRegistration = {
                id: this.generateId(),
                ...registrationData,
                created_at: new Date().toISOString()
            };
            
            registrations.push(newRegistration);
            this.setStorageData(this.STORAGE_KEYS.REGISTRATIONS, registrations);
            
            // Update event registration count
            if (registrationData.eventId) {
                const events = this.getStorageData(this.STORAGE_KEYS.EVENTS);
                const eventIndex = events.findIndex(e => e.id == registrationData.eventId);
                if (eventIndex !== -1) {
                    events[eventIndex].registered = (events[eventIndex].registered || 0) + 1;
                    this.setStorageData(this.STORAGE_KEYS.EVENTS, events);
                }
            }
            
            console.log('Registration created:', newRegistration);
            return [newRegistration];
        } catch (error) {
            console.error('Error creating registration:', error);
            throw error;
        }
    }

    static async getRegistrations(eventId = null) {
        try {
            const registrations = this.getStorageData(this.STORAGE_KEYS.REGISTRATIONS);
            if (eventId) {
                return registrations.filter(r => r.eventId == eventId);
            }
            return registrations;
        } catch (error) {
            console.error('Error fetching registrations:', error);
            return [];
        }
    }

    static async deleteRegistration(id) {
        try {
            const registrations = this.getStorageData(this.STORAGE_KEYS.REGISTRATIONS);
            const registration = registrations.find(r => r.id == id);
            const filtered = registrations.filter(r => r.id != id);
            this.setStorageData(this.STORAGE_KEYS.REGISTRATIONS, filtered);
            
            // Update event registration count
            if (registration && registration.eventId) {
                const events = this.getStorageData(this.STORAGE_KEYS.EVENTS);
                const eventIndex = events.findIndex(e => e.id == registration.eventId);
                if (eventIndex !== -1) {
                    events[eventIndex].registered = Math.max(0, (events[eventIndex].registered || 0) - 1);
                    this.setStorageData(this.STORAGE_KEYS.EVENTS, events);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting registration:', error);
            throw error;
        }
    }

    // Media
    static async uploadMedia(file) {
        try {
            // Convert file to base64 for storage
            const base64 = await this.fileToBase64(file);
            const mediaItem = {
                id: this.generateId(),
                filename: file.name,
                original_name: file.name,
                file_type: file.type,
                file_size: file.size,
                file_path: base64,
                created_at: new Date().toISOString()
            };
            
            const media = this.getStorageData(this.STORAGE_KEYS.MEDIA);
            media.push(mediaItem);
            this.setStorageData(this.STORAGE_KEYS.MEDIA, media);
            
            console.log('Media uploaded:', mediaItem);
            return {
                path: mediaItem.file_path,
                fullPath: mediaItem.file_path
            };
        } catch (error) {
            console.error('Error uploading media:', error);
            throw error;
        }
    }

    static async getMedia() {
        try {
            return this.getStorageData(this.STORAGE_KEYS.MEDIA);
        } catch (error) {
            console.error('Error fetching media:', error);
            return [];
        }
    }

    static async deleteMedia(id) {
        try {
            const media = this.getStorageData(this.STORAGE_KEYS.MEDIA);
            const filtered = media.filter(m => m.id != id);
            this.setStorageData(this.STORAGE_KEYS.MEDIA, filtered);
            return true;
        } catch (error) {
            console.error('Error deleting media:', error);
            throw error;
        }
    }

    // Helper function to convert file to base64
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Initialize with sample data if empty
    static initializeSampleData() {
        const announcements = this.getStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS);
        if (announcements.length === 0) {
            const sampleAnnouncements = [
                {
                    id: this.generateId(),
                    title: 'MUSIC Topluluğu Hoş Geldiniz!',
                    content: 'Marmara Üniversitesi Bilim ve Disiplinlerarası Topluluğu\'na hoş geldiniz. Bilimi her yaştan insana sevdiriyoruz.',
                    category: 'genel',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            this.setStorageData(this.STORAGE_KEYS.ANNOUNCEMENTS, sampleAnnouncements);
        }

        const blogPosts = this.getStorageData(this.STORAGE_KEYS.BLOG_POSTS);
        if (blogPosts.length === 0) {
            const sampleBlogPosts = [
                {
                    id: this.generateId(),
                    title: 'Bilim Şenliği 2024 Başlıyor!',
                    content: 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor. Detaylı içerik burada...',
                    excerpt: 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor.',
                    category: 'etkinlik',
                    status: 'published',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            this.setStorageData(this.STORAGE_KEYS.BLOG_POSTS, sampleBlogPosts);
        }

        const events = this.getStorageData(this.STORAGE_KEYS.EVENTS);
        if (events.length === 0) {
            const sampleEvents = [
                {
                    id: this.generateId(),
                    title: 'Bilim Şenliği 2024',
                    type: 'bilim-senligi',
                    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                    location: 'Marmara Üniversitesi Göztepe Kampüsü',
                    description: 'Ortaokul ve lise öğrencilerine yönelik eğlenceli bilim deneyleri ve gösteriler.',
                    price: 0,
                    capacity: 100,
                    registered: 0,
                    registration_required: true,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            this.setStorageData(this.STORAGE_KEYS.EVENTS, sampleEvents);
        }
    }
}

// Initialize sample data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    DatabaseService.initializeSampleData();
});

// Export for use in other files
window.DatabaseService = DatabaseService;