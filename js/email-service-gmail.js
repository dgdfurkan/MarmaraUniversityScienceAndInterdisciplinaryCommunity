// ============================================
// E-POSTA SERVİSİ - Gmail SMTP Entegrasyonu
// ============================================

// Gmail SMTP Configuration
// Ücretsiz: Günlük 500 e-posta
// Domain doğrulaması gerektirmez!

const GMAIL_SMTP_CONFIG = {
    enabled: false, // Gmail SMTP'yi aktif etmek için true yapın
    user: 'your-email@gmail.com', // Gmail adresiniz
    password: 'your-app-password', // Gmail App Password (16 haneli)
    from: 'MUSIC Topluluğu <your-email@gmail.com>', // Gönderen adres
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587
};

// Gmail SMTP ile e-posta gönderme fonksiyonu
async function sendEmailViaGmailSMTP(email, firstName, code) {
    // Gmail SMTP aktif değilse false döndür
    if (!GMAIL_SMTP_CONFIG.enabled) {
        return { success: false, error: 'Gmail SMTP is not enabled' };
    }
    
    try {
        // E-posta şablonunu al
        const emailHtml = window.getVerificationEmailTemplate(firstName, code);
        
        // SMTP gönderimi için backend endpoint gerekiyor
        // Frontend'den direkt SMTP gönderilemez (güvenlik nedeniyle)
        // Bu yüzden bir backend servisi (Node.js, Python, vb.) kullanmalısınız
        
        // Alternatif: Supabase Edge Function kullanabilirsiniz
        // veya basit bir Node.js backend servisi
        
        console.warn('⚠️  Gmail SMTP için backend servisi gerekiyor');
        console.log('Frontend\'den direkt SMTP gönderilemez.');
        console.log('Seçenekler:');
        console.log('1. Supabase Edge Function oluşturun');
        console.log('2. Node.js backend servisi kurun');
        console.log('3. Resend API kullanın (daha kolay)');
        
        return { success: false, error: 'Backend service required for SMTP' };
        
    } catch (error) {
        console.error('Gmail SMTP hatası:', error);
        return { success: false, error: error.message };
    }
}

// Not: Gmail SMTP için backend servisi gerekiyor
// Frontend'den direkt SMTP gönderilemez (CORS ve güvenlik nedeniyle)

