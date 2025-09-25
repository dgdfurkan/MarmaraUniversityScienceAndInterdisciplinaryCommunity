// Supabase Configuration
// Bu dosyayı gerçek Supabase projenizle değiştirin

const SUPABASE_URL = 'https://dlbrjkhllmkkuregvkcy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYnJqa2hsbG1ra3VyZWd2a2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTA2MjAsImV4cCI6MjA3NDMyNjYyMH0.iVDpxgRlzX0Opr0ZZ8epK6l9HNheab4lmi457tjo7hw';

// Supabase client initialization
let supabase;

// Mock Supabase client for development
supabase = {
    from: (table) => ({
        select: (columns = '*') => ({
            eq: (column, value) => ({
                order: (column, options) => Promise.resolve({ data: [], error: null })
            }),
            gte: (column, value) => ({
                order: (column, options) => Promise.resolve({ data: [], error: null })
            }),
            order: (column, options) => Promise.resolve({ data: [], error: null })
        }),
        insert: (data) => Promise.resolve({ data: [], error: null }),
        update: (data) => ({
            eq: (column, value) => Promise.resolve({ data: [], error: null })
        }),
        delete: () => ({
            eq: (column, value) => Promise.resolve({ data: [], error: null })
        })
    }),
    storage: {
        from: (bucket) => ({
            upload: (fileName, file) => Promise.resolve({ 
                data: { path: `media/${fileName}`, fullPath: `media/${fileName}` }, 
                error: null 
            })
        })
    }
};

// Initialize real Supabase when keys are provided
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
    // Real Supabase initialization would go here
    // import { createClient } from '@supabase/supabase-js'
    // supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log('Real Supabase would be initialized here with URL:', SUPABASE_URL);
}

// Database functions
class DatabaseService {
    // Announcements
    static async getAnnouncements() {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return data;
            }
            return this.getMockAnnouncements();
        } catch (error) {
            console.error('Error fetching announcements:', error);
            return this.getMockAnnouncements();
        }
    }

    static async createAnnouncement(announcementData) {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('announcements')
                    .insert([announcementData]);
                
                if (error) throw error;
                return data;
            }
            return this.mockCreateAnnouncement(announcementData);
        } catch (error) {
            console.error('Error creating announcement:', error);
            throw error;
        }
    }

    // Blog Posts
    static async getBlogPosts() {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return data;
            }
            return this.getMockBlogPosts();
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return this.getMockBlogPosts();
        }
    }

    static async createBlogPost(blogData) {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('blog_posts')
                    .insert([blogData]);
                
                if (error) throw error;
                return data;
            }
            return this.mockCreateBlogPost(blogData);
        } catch (error) {
            console.error('Error creating blog post:', error);
            throw error;
        }
    }

    // Events
    static async getEvents() {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .gte('date', new Date().toISOString())
                    .order('date', { ascending: true });
                
                if (error) throw error;
                return data;
            }
            return this.getMockEvents();
        } catch (error) {
            console.error('Error fetching events:', error);
            return this.getMockEvents();
        }
    }

    static async createEvent(eventData) {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('events')
                    .insert([eventData]);
                
                if (error) throw error;
                return data;
            }
            return this.mockCreateEvent(eventData);
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    // Registrations
    static async createRegistration(registrationData) {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('registrations')
                    .insert([registrationData]);
                
                if (error) throw error;
                return data;
            }
            return this.mockCreateRegistration(registrationData);
        } catch (error) {
            console.error('Error creating registration:', error);
            throw error;
        }
    }

    static async getRegistrations(eventId = null) {
        try {
            if (supabase) {
                let query = supabase
                    .from('registrations')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (eventId) {
                    query = query.eq('event_id', eventId);
                }
                
                const { data, error } = await query;
                
                if (error) throw error;
                return data;
            }
            return this.getMockRegistrations();
        } catch (error) {
            console.error('Error fetching registrations:', error);
            return this.getMockRegistrations();
        }
    }

    // Media
    static async uploadMedia(file) {
        try {
            if (supabase) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                
                const { data, error } = await supabase.storage
                    .from('media')
                    .upload(fileName, file);
                
                if (error) throw error;
                return data;
            }
            return this.mockUploadMedia(file);
        } catch (error) {
            console.error('Error uploading media:', error);
            throw error;
        }
    }

    // Mock data functions (for development without Supabase)
    static getMockAnnouncements() {
        return [
            {
                id: 1,
                title: 'Bilim Şenliği 2024 Başlıyor!',
                content: 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor.',
                category: 'genel',
                status: 'active',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 2,
                title: 'Biyoteknoloji Atölyesi',
                content: 'Kozmetik ürünleri üretimi konusunda uygulamalı bir atölye çalışması düzenliyoruz.',
                category: 'atolye',
                status: 'active',
                created_at: '2024-01-10T14:00:00Z'
            }
        ];
    }

    static getMockBlogPosts() {
        return [
            {
                id: 1,
                title: 'Bilim Şenliği 2024 Başlıyor!',
                content: 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor.',
                excerpt: 'Bu yılki bilim şenliğimizde birbirinden ilginç deneyler ve gösteriler sizi bekliyor.',
                category: 'etkinlik',
                status: 'published',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 2,
                title: 'Biyoteknoloji Atölyesi',
                content: 'Kozmetik ürünleri üretimi konusunda uygulamalı bir atölye çalışması düzenliyoruz.',
                excerpt: 'Kozmetik ürünleri üretimi konusunda uygulamalı bir atölye çalışması düzenliyoruz.',
                category: 'bilim',
                status: 'published',
                created_at: '2024-01-10T14:00:00Z'
            }
        ];
    }

    static getMockEvents() {
        return [
            {
                id: 1,
                title: 'Bilim Şenliği 2024',
                type: 'bilim-senligi',
                date: '2024-02-15T10:00:00Z',
                location: 'Marmara Üniversitesi Göztepe Kampüsü',
                description: 'Ortaokul ve lise öğrencilerine yönelik eğlenceli bilim deneyleri ve gösteriler.',
                price: 0,
                capacity: 100,
                registration_required: true,
                status: 'active'
            },
            {
                id: 2,
                title: 'Biyoteknoloji Atölyesi',
                type: 'atolye',
                date: '2024-02-20T14:00:00Z',
                location: 'Marmara Üniversitesi Laboratuvar',
                description: 'Kozmetik ürünleri üretimi konusunda uygulamalı atölye çalışması.',
                price: 50,
                capacity: 30,
                registration_required: true,
                status: 'active'
            }
        ];
    }

    static getMockRegistrations() {
        return [
            {
                id: 1,
                event_id: 1,
                first_name: 'Ahmet',
                last_name: 'Yılmaz',
                email: 'ahmet@example.com',
                phone: '0555 123 45 67',
                university: 'Marmara Üniversitesi',
                department: 'Biyomühendislik',
                student_id: '123456789',
                grade: '3',
                experience: 'little',
                motivation: 'Bilim alanında kendimi geliştirmek istiyorum.',
                created_at: '2024-01-15T10:00:00Z'
            }
        ];
    }

    static mockCreateAnnouncement(data) {
        console.log('Mock: Creating announcement', data);
        return [{ id: Date.now(), ...data }];
    }

    static mockCreateBlogPost(data) {
        console.log('Mock: Creating blog post', data);
        return [{ id: Date.now(), ...data }];
    }

    static mockCreateEvent(data) {
        console.log('Mock: Creating event', data);
        return [{ id: Date.now(), ...data }];
    }

    static mockCreateRegistration(data) {
        console.log('Mock: Creating registration', data);
        return [{ id: Date.now(), ...data }];
    }

    static mockUploadMedia(file) {
        console.log('Mock: Uploading media', file.name);
        return {
            path: `media/${Date.now()}_${file.name}`,
            fullPath: `media/${Date.now()}_${file.name}`
        };
    }
}

// Export for use in other files
window.DatabaseService = DatabaseService;
