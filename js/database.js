// Supabase Configuration
const SUPABASE_URL = 'https://dlbrjkhllmkkuregvkcy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYnJqa2hsbG1ra3VyZWd2a2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTA2MjAsImV4cCI6MjA3NDMyNjYyMH0.iVDpxgRlzX0Opr0ZZ8epK6l9HNheab4lmi457tjo7hw';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database functions
class DatabaseService {
    // Announcements
    static async getAnnouncements() {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching announcements:', error);
            return [];
        }
    }

    static async createAnnouncement(announcementData) {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .insert([announcementData])
                .select();
            
            if (error) throw error;
            console.log('Announcement created:', data);
            return data;
        } catch (error) {
            console.error('Error creating announcement:', error);
            throw error;
        }
    }

    static async updateAnnouncement(id, updateData) {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .update(updateData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating announcement:', error);
            throw error;
        }
    }

    static async deleteAnnouncement(id) {
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting announcement:', error);
            throw error;
        }
    }

    // Blog Posts
    static async getBlogPosts() {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
    }

    static async createBlogPost(blogData) {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .insert([blogData])
                .select();
            
            if (error) throw error;
            console.log('Blog post created:', data);
            return data;
        } catch (error) {
            console.error('Error creating blog post:', error);
            throw error;
        }
    }

    static async updateBlogPost(id, updateData) {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .update(updateData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating blog post:', error);
            throw error;
        }
    }

    static async deleteBlogPost(id) {
        try {
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting blog post:', error);
            throw error;
        }
    }

    // Events
    static async getEvents() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .gte('date', new Date().toISOString())
                .eq('status', 'active')
                .order('date', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    static async createEvent(eventData) {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert([eventData])
                .select();
            
            if (error) throw error;
            console.log('Event created:', data);
            return data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    static async updateEvent(id, updateData) {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updateData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    static async deleteEvent(id) {
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    // Registrations
    static async createRegistration(registrationData) {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .insert([registrationData])
                .select();
            
            if (error) throw error;
            console.log('Registration created:', data);
            return data;
        } catch (error) {
            console.error('Error creating registration:', error);
            throw error;
        }
    }

    static async getRegistrations(eventId = null) {
        try {
            let query = supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (eventId) {
                query = query.eq('event_id', eventId);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching registrations:', error);
            return [];
        }
    }

    static async deleteRegistration(id) {
        try {
            const { error } = await supabase
                .from('registrations')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting registration:', error);
            throw error;
        }
    }

    // Media
    static async uploadMedia(file) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabase.storage
                .from('media')
                .upload(fileName, file);
            
            if (error) throw error;
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('media')
                .getPublicUrl(fileName);
            
            console.log('Media uploaded:', data);
            return {
                path: data.path,
                fullPath: urlData.publicUrl
            };
        } catch (error) {
            console.error('Error uploading media:', error);
            throw error;
        }
    }

    static async getMedia() {
        try {
            const { data, error } = await supabase.storage
                .from('media')
                .list();
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching media:', error);
            return [];
        }
    }

    static async deleteMedia(fileName) {
        try {
            const { error } = await supabase.storage
                .from('media')
                .remove([fileName]);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting media:', error);
            throw error;
        }
    }
}

// Export for use in other files
window.DatabaseService = DatabaseService;