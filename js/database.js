// Supabase Configuration
const SUPABASE_URL = 'https://dlbrjkhllmkkuregvkcy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYnJqa2hsbG1ra3VyZWd2a2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTA2MjAsImV4cCI6MjA3NDMyNjYyMH0.iVDpxgRlzX0Opr0ZZ8epK6l9HNheab4lmi457tjo7hw';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // Blog Interactions
    static async incrementBlogView(postId) {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .update({ view_count: supabase.raw('view_count + 1') })
                .eq('id', postId)
                .select();
            
            if (error) throw error;
            
            // Log interaction
            await supabase
                .from('blog_interactions')
                .insert([{
                    blog_id: postId,
                    user_ip: await this.getUserIP(),
                    interaction_type: 'view'
                }]);
            
            return data;
        } catch (error) {
            console.error('Error incrementing blog view:', error);
            throw error;
        }
    }

    static async toggleBlogLike(postId) {
        try {
            const userIP = await this.getUserIP();
            const userFingerprint = await this.getUserFingerprint();
            
            // Check if user already liked this post (IP + Fingerprint kontrolü)
            const { data: existingLike, error: checkError } = await supabase
                .from('blog_interactions')
                .select('*')
                .eq('blog_id', postId)
                .eq('user_ip', userIP)
                .eq('interaction_type', 'like')
                .single();
            
            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }
            
            if (existingLike) {
                // Unlike: remove interaction and decrement count
                await supabase
                    .from('blog_interactions')
                    .delete()
                    .eq('id', existingLike.id);
                
                const { data, error } = await supabase
                    .from('blog_posts')
                    .update({ like_count: supabase.raw('like_count - 1') })
                    .eq('id', postId)
                    .select();
                
                if (error) throw error;
                return { ...data[0], action: 'unliked' };
            } else {
                // Like: add interaction and increment count
                await supabase
                    .from('blog_interactions')
                    .insert([{
                        blog_id: postId,
                        user_ip: userIP,
                        user_fingerprint: userFingerprint,
                        interaction_type: 'like'
                    }]);
                
                const { data, error } = await supabase
                    .from('blog_posts')
                    .update({ like_count: supabase.raw('like_count + 1') })
                    .eq('id', postId)
                    .select();
                
                if (error) throw error;
                return { ...data[0], action: 'liked' };
            }
        } catch (error) {
            console.error('Error toggling blog like:', error);
            throw error;
        }
    }

    static async incrementBlogShare(postId) {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .update({ share_count: supabase.raw('share_count + 1') })
                .eq('id', postId)
                .select();
            
            if (error) throw error;
            
            // Log interaction
            await supabase
                .from('blog_interactions')
                .insert([{
                    blog_id: postId,
                    user_ip: await this.getUserIP(),
                    interaction_type: 'share'
                }]);
            
            return data;
        } catch (error) {
            console.error('Error incrementing blog share:', error);
            throw error;
        }
    }

    // Helper function to get user IP
    static async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            // Fallback to a random IP for development
            return '127.0.0.1';
        }
    }

    // Helper function to get user fingerprint (browser + device info)
    static async getUserFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('MUSIC Blog Fingerprint', 2, 2);
            
            const fingerprint = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset(),
                canvas.toDataURL()
            ].join('|');
            
            // Simple hash function
            let hash = 0;
            for (let i = 0; i < fingerprint.length; i++) {
                const char = fingerprint.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            
            return Math.abs(hash).toString(36);
        } catch (error) {
            // Fallback fingerprint
            return 'fallback_' + Math.random().toString(36).substr(2, 9);
        }
    }
}

// Test Supabase connection and tables
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        
        // Test basic connection
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Supabase connection error:', error);
            console.log('Error details:', error.message);
            console.log('Error code:', error.code);
            console.log('Error hint:', error.hint);
            
            // Try to get table info
            try {
                const { data: tables, error: tablesError } = await supabase
                    .from('information_schema.tables')
                    .select('table_name')
                    .eq('table_schema', 'public');
                
                if (!tablesError && tables) {
                    console.log('Available tables:', tables.map(t => t.table_name));
                }
            } catch (e) {
                console.log('Could not fetch table list');
            }
            
            return false;
        }
        
        console.log('Supabase connection successful!');
        return true;
    } catch (error) {
        console.error('Supabase connection test failed:', error);
        return false;
    }
}

// Test connection on page load
document.addEventListener('DOMContentLoaded', () => {
    testSupabaseConnection();
});