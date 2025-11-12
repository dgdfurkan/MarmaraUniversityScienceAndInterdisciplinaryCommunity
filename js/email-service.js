// ============================================
// E-POSTA SERVİSİ - Gmail SMTP (Supabase Edge Function)
// ============================================

// Gmail SMTP Configuration
// Ücretsiz: Günlük 500 e-posta
// Domain doğrulaması gerektirmez!

// Supabase Edge Function URL'i
// Supabase Dashboard > Edge Functions > send-verification-email > URL'i kopyalayın
const SUPABASE_FUNCTION_URL = 'https://dlbrjkhllmkkuregvkcy.supabase.co/functions/v1/send-verification-email';

// Supabase anon key'i database.js'den al (database.js yüklendikten sonra kullanılacak)
// database.js dosyasında zaten tanımlı, burada tekrar tanımlamıyoruz

// Global function - e-posta gönderme fonksiyonu (Gmail SMTP via Supabase Edge Function)
window.sendVerificationEmail = async function(email, firstName, code) {
    try {
        // Supabase Edge Function URL kontrolü
        if (!SUPABASE_FUNCTION_URL || SUPABASE_FUNCTION_URL === 'YOUR_SUPABASE_FUNCTION_URL') {
            console.log('📧 E-posta Gönderimi (Test Modu)');
            console.log('═══════════════════════════════════════');
            console.log(`Alıcı: ${email}`);
            console.log(`Konu: MUSIC Topluluğu - E-posta Doğrulama`);
            console.log(`Doğrulama Kodu: ${code}`);
            console.log('═══════════════════════════════════════');
            console.log('⚠️  Supabase Edge Function URL ayarlanmadı.');
            console.log('Gmail SMTP kullanmak için:');
            console.log('1. Supabase Dashboard > Edge Functions > send-verification-email');
            console.log('2. Function URL\'ini kopyalayın');
            console.log('3. js/email-service.js dosyasında SUPABASE_FUNCTION_URL değişkenini güncelleyin');
            console.log('4. Supabase Dashboard > Settings > Edge Functions > Secrets');
            console.log('   GMAIL_USER ve GMAIL_APP_PASSWORD ekleyin');
            return { success: true, testMode: true, code: code };
        }
        
        // Supabase anon key'i database.js'den al (global scope'ta)
        const anonKey = typeof SUPABASE_ANON_KEY !== 'undefined' 
            ? SUPABASE_ANON_KEY 
            : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYnJqa2hsbG1ra3VyZWd2a2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTA2MjAsImV4cCI6MjA3NDMyNjYyMH0.iVDpxgRlzX0Opr0ZZ8epK6l9HNheab4lmi457tjo7hw';
        
        // Supabase Edge Function'a istek gönder
        console.log('📧 E-posta gönderiliyor...', {
            url: SUPABASE_FUNCTION_URL,
            email: email,
            firstName: firstName
        });
        
        const response = await fetch(SUPABASE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                firstName: firstName,
                code: code
            })
        });
        
        console.log('📧 Edge Function yanıtı:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            
            const errorMessage = errorData.error || errorData.message || 'E-posta gönderilemedi';
            
            console.error('❌ Edge Function Hatası:', {
                status: response.status,
                statusText: response.statusText,
                error: errorMessage,
                fullError: errorData
            });
            
            // Gmail SMTP ayarları eksikse test moduna geç
            if (errorMessage.includes('not configured') || errorMessage.includes('Gmail SMTP')) {
                console.warn('⚠️  Gmail SMTP Ayarları Eksik');
                console.log('═══════════════════════════════════════');
                console.log('Test modu aktif - E-posta gönderilmedi');
                console.log(`Alıcı: ${email}`);
                console.log(`Doğrulama Kodu: ${code}`);
                console.log('═══════════════════════════════════════');
                console.log('📧 Gmail SMTP ayarları yapmak için:');
                console.log('1. Supabase Dashboard > Settings > Edge Functions > Secrets');
                console.log('2. GMAIL_USER: Gmail adresiniz (örn: example@gmail.com)');
                console.log('3. GMAIL_APP_PASSWORD: Gmail App Password (16 haneli)');
                console.log('   (Google Account > Security > 2-Step Verification > App Passwords)');
                console.log('4. LOGO_URL: Logo URL\'iniz (opsiyonel)');
                console.log('═══════════════════════════════════════');
                
                // Test modu olarak devam et
                return { success: true, testMode: true, code: code };
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('✅ E-posta başarıyla gönderildi:', data);
        return { success: true, message: data.message };
        
    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        
        // Gmail SMTP ayarları hatasıysa test moduna geç
        if (error.message && (error.message.includes('not configured') || error.message.includes('Gmail SMTP'))) {
            console.warn('⚠️  Test modu aktif - Kod console\'da görüntüleniyor');
            return { success: true, testMode: true, code: code };
        }
        
        // Diğer hatalar için false döndür
        return { success: false, error: error.message };
    }
};

// Global function - E-posta şablonu oluşturma
window.getVerificationEmailTemplate = function(firstName, code) {
    // GitHub Pages URL (GitHub Pages aktif olmalı)
    // Alternatif: Raw GitHub URL kullanmak isterseniz:
    // const logoUrl = 'https://raw.githubusercontent.com/dgdfurkan/MarmaraUniversityScienceAndInterdisciplinaryCommunity/main/images/music_logo_cropped.png';
    const logoUrl = 'https://dgdfurkan.github.io/MarmaraUniversityScienceAndInterdisciplinaryCommunity/images/music_logo_cropped.png';
    
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-posta Doğrulama - MUSIC</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 600px;">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
                            <img src="${logoUrl}" alt="MUSIC Logo" style="max-width: 140px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">MUSIC Topluluğu</h1>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Marmara Üniversitesi Bilim ve Disiplinlerarası Topluluğu</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 40px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Merhaba ${firstName}! 👋</h2>
                            <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.7;">
                                MUSIC Topluluğu'na hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki <strong>6 haneli doğrulama kodunu</strong> kullanın:
                            </p>
                            
                            <!-- Code Display Box -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 40px 30px; display: inline-block; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);">
                                            <div style="font-size: 52px; font-weight: 700; color: #ffffff; letter-spacing: 12px; font-family: 'Courier New', monospace; text-align: center; line-height: 1;">
                                                ${code}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions -->
                            <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 30px 0;">
                                <p style="color: #374151; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">📋 Nasıl Kullanılır?</p>
                                <ol style="color: #6b7280; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                                    <li>Yukarıdaki 6 haneli kodu kopyalayın</li>
                                    <li>Web sitesindeki doğrulama formuna girin</li>
                                    <li>"Doğrula" butonuna tıklayın</li>
                                </ol>
                            </div>
                            
                            <!-- Important Info -->
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                                    ⏰ <strong>Kodun süresi:</strong> 10 dakika
                                </p>
                                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                                    🔒 <strong>Güvenlik:</strong> Bu kodu kimseyle paylaşmayın
                                </p>
                                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                                    🔄 <strong>Kod gelmedi mi?</strong> Spam klasörünüzü kontrol edin veya "Kodu Tekrar Gönder" butonuna tıklayın
                                </p>
                            </div>
                            
                            <!-- Security Notice -->
                            <div style="margin-top: 40px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;">
                                    <strong>⚠️ Güvenlik Uyarısı:</strong> Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz. Hesabınız otomatik olarak silinecektir.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 35px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 15px; font-weight: 600;">
                                Marmara Üniversitesi Bilim ve Disiplinlerarası Topluluğu
                            </p>
                            <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 12px;">
                                Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
                            </p>
                            <p style="color: #9ca3af; margin: 0; font-size: 11px;">
                                © ${new Date().getFullYear()} MUSIC. Tüm hakları saklıdır.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

