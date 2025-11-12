# Supabase E-posta Validasyonunu Kapatma

Supabase'in e-posta validasyonunu (domain kontrolü, disposable email kontrolü vb.) kapatmak için:

## Yöntem 1: Supabase Dashboard'dan (Önerilen)

1. **Supabase Dashboard**'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. **Authentication** > **Settings** sekmesine gidin
4. **Email Auth** bölümünde:
   - **"Enable email confirmations"** seçeneğini **KAPATIN** (OFF)
   - **"Secure email change"** seçeneğini **KAPATIN** (OFF) - opsiyonel
5. **"Save"** butonuna tıklayın

## Yöntem 2: E-posta Domain Whitelist (Sadece belirli domain'lere izin)

Eğer sadece belirli domain'lere izin vermek istiyorsanız:

1. **Supabase Dashboard** > **Authentication** > **Settings**
2. **"Email Auth"** bölümünde **"Email Domain Whitelist"** ekleyin
3. İzin vermek istediğiniz domain'leri ekleyin (örn: `cdnripple.com`)

## Yöntem 3: Disposable Email Kontrolünü Kapatma

Supabase bazen disposable email servislerini (geçici e-posta) engelleyebilir:

1. **Supabase Dashboard** > **Authentication** > **Settings**
2. **"Email Auth"** bölümünde **"Disposable Email Detection"** seçeneğini **KAPATIN**

## Notlar

- ⚠️ **Güvenlik Uyarısı**: E-posta validasyonunu tamamen kapatmak güvenlik riski oluşturabilir
- ✅ **Önerilen**: Sadece gerekli kontrolleri kapatın, tamamen kapatmayın
- 🔄 **Değişiklikler**: Ayarları değiştirdikten sonra birkaç dakika bekleyin, değişikliklerin aktif olması zaman alabilir

## Test

Ayarları değiştirdikten sonra:
1. Sayfayı yenileyin (Ctrl+F5)
2. Aynı e-posta adresiyle tekrar kayıt olmayı deneyin
3. Hata devam ederse, console'daki tam hata mesajını kontrol edin

