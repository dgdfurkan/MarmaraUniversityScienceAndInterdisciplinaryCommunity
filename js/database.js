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
                .select(`
                    *,
                    blog_interactions(count)
                `)
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            
            if (error) throw error;

            // Get user fingerprint for like status
            const userFingerprint = await this.getUserFingerprint();
            const userIP = await this.getUserIP();

            // Process the data to add interaction counts and user like status
            const processedData = (data || []).map(post => {
                const interactions = post.blog_interactions || [];
                const viewCount = interactions.filter(i => i.interaction_type === 'view').length;
                const likeCount = interactions.filter(i => i.interaction_type === 'like').length;
                const shareCount = interactions.filter(i => i.interaction_type === 'share').length;
                
                // Check if current user has liked this post
                const userLiked = interactions.some(i => 
                    i.interaction_type === 'like' && 
                    (i.user_ip === userIP || i.user_fingerprint === userFingerprint)
                );

                return {
                    ...post,
                    view_count: viewCount,
                    like_count: likeCount,
                    share_count: shareCount,
                    user_liked: userLiked
                };
            });

            return processedData;
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
    static async getEvents(includePast = false) {
        try {
            let query = supabase
                .from('events')
                .select('*')
                .eq('status', 'active');
            
            if (!includePast) {
                query = query.gte('date', new Date().toISOString());
            }
            
            query = query.order('date', { ascending: true });
            
            const { data, error } = await query;
            
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
            
            // Update event registered count
            if (registrationData.eventId) {
                await this.updateEventRegisteredCount(registrationData.eventId);
            }
            
            console.log('Registration created:', data);
            return data;
        } catch (error) {
            console.error('Error creating registration:', error);
            throw error;
        }
    }

    static async updateEventRegisteredCount(eventId) {
        try {
            // Get current registration count for this event
            const { count, error: countError } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('eventId', eventId);
            
            if (countError) throw countError;
            
            // Update event's registered count
            const { error: updateError } = await supabase
                .from('events')
                .update({ registered: count || 0 })
                .eq('id', eventId);
            
            if (updateError) throw updateError;
            
            console.log(`Updated event ${eventId} registered count to ${count || 0}`);
        } catch (error) {
            console.error('Error updating event registered count:', error);
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

    // Blog Interactions - IP Based (One per IP)
    static async incrementBlogView(postId) {
        try {
            const userIP = await this.getUserIP();
            const userFingerprint = await this.getUserFingerprint();
            
            // Check if this IP already viewed this post
            const { data: existingView, error: checkError } = await supabase
                .from('blog_interactions')
                .select('id')
                .eq('blog_id', postId)
                .eq('interaction_type', 'view')
                .or(`user_ip.eq.${userIP},user_fingerprint.eq.${userFingerprint}`)
                .limit(1);
            
            if (checkError) throw checkError;
            
            // If already viewed by this IP, don't increment
            if (existingView && existingView.length > 0) {
                console.log('Post already viewed by this IP:', userIP);
                return { alreadyViewed: true };
            }
            
            // Add new view interaction
            const { error: insertError } = await supabase
                .from('blog_interactions')
                .insert([{
                    blog_id: postId,
                    interaction_type: 'view',
                    user_ip: userIP,
                    user_fingerprint: userFingerprint
                }]);
            
            if (insertError) throw insertError;
            
            console.log('Blog view incremented for IP:', userIP);
            return { success: true };
            
        } catch (error) {
            console.error('Error incrementing blog view:', error);
            return { error: error.message };
        }
    }

    static async toggleBlogLike(postId) {
        try {
            const userIP = await this.getUserIP();
            const userFingerprint = await this.getUserFingerprint();
            
            // Check if this IP already liked this post
            const { data: existingLike, error: checkError } = await supabase
                .from('blog_interactions')
                .select('id')
                .eq('blog_id', postId)
                .eq('interaction_type', 'like')
                .or(`user_ip.eq.${userIP},user_fingerprint.eq.${userFingerprint}`)
                .limit(1);
            
            if (checkError) throw checkError;
            
            if (existingLike && existingLike.length > 0) {
                // Unlike: Remove the like
                const { error: deleteError } = await supabase
                    .from('blog_interactions')
                    .delete()
                    .eq('id', existingLike[0].id);
                
                if (deleteError) throw deleteError;
                
                console.log('Blog like removed for IP:', userIP);
                return { action: 'unliked', success: true };
            } else {
                // Like: Add new like
                const { error: insertError } = await supabase
                    .from('blog_interactions')
                    .insert([{
                        blog_id: postId,
                        interaction_type: 'like',
                        user_ip: userIP,
                        user_fingerprint: userFingerprint
                    }]);
                
                if (insertError) throw insertError;
                
                console.log('Blog like added for IP:', userIP);
                return { action: 'liked', success: true };
            }
            
        } catch (error) {
            console.error('Error toggling blog like:', error);
            return { error: error.message };
        }
    }

    static async incrementBlogShare(postId) {
        try {
            const userIP = await this.getUserIP();
            const userFingerprint = await this.getUserFingerprint();
            
            // Check if this IP already shared this post
            const { data: existingShare, error: checkError } = await supabase
                .from('blog_interactions')
                .select('id')
                .eq('blog_id', postId)
                .eq('interaction_type', 'share')
                .or(`user_ip.eq.${userIP},user_fingerprint.eq.${userFingerprint}`)
                .limit(1);
            
            if (checkError) throw checkError;
            
            // If already shared by this IP, don't increment
            if (existingShare && existingShare.length > 0) {
                console.log('Post already shared by this IP:', userIP);
                return { alreadyShared: true };
            }
            
            // Add new share interaction
            const { error: insertError } = await supabase
                .from('blog_interactions')
                .insert([{
                    blog_id: postId,
                    interaction_type: 'share',
                    user_ip: userIP,
                    user_fingerprint: userFingerprint
                }]);
            
            if (insertError) throw insertError;
            
            console.log('Blog share incremented for IP:', userIP);
            return { success: true };
            
        } catch (error) {
            console.error('Error incrementing blog share:', error);
            return { error: error.message };
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

// Activity Tracking Functions
DatabaseService.logActivity = async function(actionType, tableName, recordId, recordTitle, oldData = null, newData = null) {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                action_type: actionType,
                table_name: tableName,
                record_id: String(recordId), // Convert to string to avoid UUID issues
                record_title: recordTitle,
                old_data: oldData,
                new_data: newData,
                admin_user: 'admin'
            });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error to prevent breaking the main operation
    }
};

DatabaseService.saveVersionHistory = async function(tableName, recordId, data, changeSummary = null) {
    try {
        // Get current version number
        const { data: versions, error: countError } = await supabase
            .from('version_history')
            .select('version_number')
            .eq('table_name', tableName)
            .eq('record_id', recordId)
            .order('version_number', { ascending: false })
            .limit(1);
        
        if (countError) throw countError;
        
        const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;
        
        const { error } = await supabase
            .from('version_history')
            .insert({
                table_name: tableName,
                record_id: recordId,
                version_number: nextVersion,
                data: data,
                change_summary: changeSummary
            });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error saving version history:', error);
    }
};

DatabaseService.getVersionHistory = async function(tableName, recordId) {
    try {
        const { data, error } = await supabase
            .from('version_history')
            .select('*')
            .eq('table_name', tableName)
            .eq('record_id', recordId)
            .order('version_number', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching version history:', error);
        return [];
    }
};

DatabaseService.restoreVersion = async function(tableName, recordId, versionNumber) {
    try {
        // Get the version data
        const { data: versionData, error: fetchError } = await supabase
            .from('version_history')
            .select('data')
            .eq('table_name', tableName)
            .eq('record_id', recordId)
            .eq('version_number', versionNumber)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Update the record with version data
        const { error: updateError } = await supabase
            .from(tableName)
            .update(versionData.data)
            .eq('id', recordId);
        
        if (updateError) throw updateError;
        
        // Log the restore activity
        await this.logActivity('restore', tableName, recordId, versionData.data.title || 'Unknown', null, versionData.data);
        
        return true;
    } catch (error) {
        console.error('Error restoring version:', error);
        return false;
    }
};

DatabaseService.saveDraft = async function(tableName, recordId, title, data) {
    try {
        const { error } = await supabase
            .from('drafts')
            .insert({
                table_name: tableName,
                record_id: recordId,
                title: title,
                data: data,
                admin_user: 'admin'
            });
        
        if (error) throw error;
        
        // Log draft save activity
        await this.logActivity('draft', tableName, recordId || 'new', title, null, data);
        
        return true;
    } catch (error) {
        console.error('Error saving draft:', error);
        return false;
    }
};

DatabaseService.getDrafts = async function(tableName) {
    try {
        const { data, error } = await supabase
            .from('drafts')
            .select('*')
            .eq('table_name', tableName)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return [];
    }
};

DatabaseService.deleteDraft = async function(draftId) {
    try {
        const { error } = await supabase
            .from('drafts')
            .delete()
            .eq('id', draftId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting draft:', error);
        return false;
    }
};

DatabaseService.getRecentActivities = async function(limit = 10) {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
    }
};

// IP tabanlı kullanıcı etkileşimleri
DatabaseService.getUserIP = async function() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting user IP:', error);
        return '127.0.0.1'; // Fallback IP
    }
};

DatabaseService.getUserInteraction = async function(announcementId) {
    try {
        const userIP = await this.getUserIP();
        
        const { data, error } = await supabase
            .from('user_interactions')
            .select('*')
            .eq('user_ip', userIP)
            .eq('announcement_id', announcementId)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            if (error.code === '42P01' || error.status === 406) { // Table doesn't exist or RLS issue
                return null;
            }
            throw error;
        }
        
        return data || null;
    } catch (error) {
        if (error.status === 406) {
            return null;
        }
        console.error('Error getting user interaction:', error);
        return null;
    }
};

DatabaseService.markAnnouncementAsViewed = async function(announcementId) {
    try {
        const userIP = await this.getUserIP();
        
        // Önce mevcut etkileşimi kontrol et
        const existingInteraction = await this.getUserInteraction(announcementId);
        
        if (existingInteraction && existingInteraction.has_viewed) {
            return { already_viewed: true };
        }
        
        // User interactions tablosu varsa güncelle
        if (existingInteraction !== null) {
            try {
                if (existingInteraction) {
                    // Mevcut etkileşimi güncelle
                    const { data, error } = await supabase
                        .from('user_interactions')
                        .update({ has_viewed: true })
                        .eq('user_ip', userIP)
                        .eq('announcement_id', announcementId)
                        .select();
                    
                    if (error) throw error;
                    return data;
                } else {
                    // Yeni etkileşim oluştur
                    const { data, error } = await supabase
                        .from('user_interactions')
                        .insert({
                            user_ip: userIP,
                            announcement_id: announcementId,
                            has_viewed: true
                        })
                        .select();
                    
                    if (error) throw error;
                    return data;
                }
            } catch (interactionError) {
                if (interactionError.status === 406) {
                    return { already_viewed: false };
                }
                console.warn('User interactions table not available, skipping view tracking');
                return { already_viewed: false };
            }
        }
        
        return { already_viewed: false };
    } catch (error) {
        console.error('Error marking announcement as viewed:', error);
        return { already_viewed: false };
    }
};

// Announcement reactions - IP tracking version
DatabaseService.updateAnnouncementReaction = async function(announcementId, reactionType, increment = true) {
    try {
        const userIP = await this.getUserIP();
        const fieldName = `reaction_${reactionType}`;
        
        // Önce mevcut etkileşimi kontrol et
        const existingInteraction = await this.getUserInteraction(announcementId);
        
        if (increment) {
            // Yeni reaksiyon ekleme
            if (existingInteraction && existingInteraction.reaction_type) {
                // Eski reaksiyonu kaldır
                const oldFieldName = `reaction_${existingInteraction.reaction_type}`;
                const { data: oldData, error: oldError } = await supabase
                    .from('announcements')
                    .select(oldFieldName)
                    .eq('id', announcementId)
                    .single();
                
                if (oldError) throw oldError;
                
                const oldValue = oldData[oldFieldName] || 0;
                const newOldValue = Math.max(0, oldValue - 1);
                
                // Eski reaksiyonu azalt
                await supabase
                    .from('announcements')
                    .update({ [oldFieldName]: newOldValue })
                    .eq('id', announcementId);
            }
            
            // Yeni reaksiyonu ekle
            const { data: newData, error: newError } = await supabase
                .from('announcements')
                .select(fieldName)
                .eq('id', announcementId)
                .single();
            
            if (newError) throw newError;
            
            const newValue = (newData[fieldName] || 0) + 1;
            
            await supabase
                .from('announcements')
                .update({ [fieldName]: newValue })
                .eq('id', announcementId);
            
            // User interaction'ı güncelle
            try {
                if (existingInteraction) {
                    await supabase
                        .from('user_interactions')
                        .update({ reaction_type: reactionType })
                        .eq('user_ip', userIP)
                        .eq('announcement_id', announcementId);
                } else {
                    await supabase
                        .from('user_interactions')
                        .insert({
                            user_ip: userIP,
                            announcement_id: announcementId,
                            reaction_type: reactionType,
                            has_viewed: true
                        });
                }
            } catch (interactionError) {
                if (interactionError.status === 406) {
                    // Sessizce devam et
                } else {
                    console.warn('User interactions table not available:', interactionError);
                }
            }
        } else {
            // Reaksiyonu kaldırma
            if (existingInteraction && existingInteraction.reaction_type === reactionType) {
                const { data: currentData, error: fetchError } = await supabase
                    .from('announcements')
                    .select(fieldName)
                    .eq('id', announcementId)
                    .single();
                
                if (fetchError) throw fetchError;
                
                const currentValue = currentData[fieldName] || 0;
                const newValue = Math.max(0, currentValue - 1);
                
                await supabase
                    .from('announcements')
                    .update({ [fieldName]: newValue })
                    .eq('id', announcementId);
                
                // User interaction'dan reaksiyonu kaldır
                try {
                    await supabase
                        .from('user_interactions')
                        .update({ reaction_type: null })
                        .eq('user_ip', userIP)
                        .eq('announcement_id', announcementId);
                } catch (interactionError) {
                    if (interactionError.status === 406) {
                        // Sessizce devam et
                    } else {
                        console.warn('User interactions table not available:', interactionError);
                    }
                }
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error updating announcement reaction:', error);
        throw error;
    }
};

DatabaseService.incrementAnnouncementViewCount = async function(announcementId) {
    try {
        // IP tabanlı görüntüleme takibi
        const result = await this.markAnnouncementAsViewed(announcementId);
        
        if (result.already_viewed) {
            return { already_viewed: true };
        }
        
        // Görüntüleme sayısını artır
        const { data: currentData, error: fetchError } = await supabase
            .from('announcements')
            .select('view_count')
            .eq('id', announcementId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const currentValue = currentData.view_count || 0;
        const newValue = currentValue + 1;
        
        // Yeni değeri güncelle
        const { data, error } = await supabase
            .from('announcements')
            .update({ 
                view_count: newValue
            })
            .eq('id', announcementId)
            .select();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        throw error;
    }
};