// Supabase Edge Function - Gmail SMTP ile E-posta Gönderme
// Bu fonksiyon Gmail SMTP kullanarak doğrulama e-postası gönderir

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Request body'den verileri al
    const { email, firstName, code } = await req.json()

    if (!email || !firstName || !code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gmail SMTP ayarları (Environment variables'dan alınacak)
    const GMAIL_USER = Deno.env.get('GMAIL_USER') || ''
    const GMAIL_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD') || ''
    
    if (!GMAIL_USER || !GMAIL_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Gmail SMTP not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // E-posta şablonu
    const logoUrl = Deno.env.get('LOGO_URL') || 'https://dgdfurkan.github.io/MarmaraUniversityScienceAndInterdisciplinaryCommunity/images/music_logo_cropped.png'
    
    const emailHtml = `
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
    `

    // Gmail SMTP ile e-posta gönder - denomailer kütüphanesi kullanarak
    // Daha güvenilir SMTP kütüphanesi: https://deno.land/x/denomailer
    
    console.log('📧 Gmail SMTP ile e-posta gönderiliyor...', {
      from: GMAIL_USER,
      to: email,
      hasPassword: !!GMAIL_PASSWORD
    })
    
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
    
    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: {
          username: GMAIL_USER,
          password: GMAIL_PASSWORD,
        },
      },
    })
    
    try {
      console.log('📧 SMTP bağlantısı kuruluyor...')
      
      await client.send({
        from: `MUSIC Topluluğu <${GMAIL_USER}>`,
        to: email,
        subject: 'MUSIC Topluluğu - E-posta Doğrulama',
        content: emailHtml,
        html: emailHtml,
      })
      
      console.log('✅ E-posta başarıyla gönderildi:', email)
      
      await client.close()
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'E-posta başarıyla gönderildi'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (sendError) {
      console.error('❌ SMTP gönderme hatası:', sendError)
      await client.close().catch(() => {}) // Close hata verirse de devam et
      throw sendError
    }

  } catch (error) {
    console.error('❌ Edge Function hatası:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || 'No additional details'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

