# Gmail SMTP Kurulum Rehberi

Bu rehber Gmail SMTP kullanarak e-posta doğrulama sistemini kurmanızı sağlar.

## 🎯 Avantajlar

- ✅ **Ücretsiz**: Günlük 500 e-posta gönderebilirsiniz
- ✅ **Domain Doğrulaması Gerektirmez**: Hemen kullanmaya başlayabilirsiniz
- ✅ **Güvenli**: Gmail App Password ile güvenli bağlantı
- ✅ **Kolay Kurulum**: Sadece birkaç adım

## 📋 Adım 1: Gmail App Password Oluşturma

Gmail App Password, Gmail hesabınızı güvenli bir şekilde kullanmak için özel bir şifredir. Ana şifrenizi kullanmak yerine bu özel şifreyi kullanırsınız.

### 🔐 Adım Adım:

**1. Google Account Sayfasına Gidin:**
- Tarayıcınızda şu adresi açın: https://myaccount.google.com
- Gmail hesabınızla giriş yapın

**2. Güvenlik Sekmesine Gidin:**
- Sol menüden **"Security"** (Güvenlik) sekmesine tıklayın
- Sayfanın ortasında güvenlik ayarları görünecek

**3. 2 Adımlı Doğrulamayı Açın (Eğer Açık Değilse):**
- **"2-Step Verification"** (2 Adımlı Doğrulama) bölümünü bulun
- Eğer kapalıysa, **"Turn on"** (Aç) butonuna tıklayın
- Telefon numaranızı doğrulayın (SMS veya telefon araması ile)
- ⚠️ **ÖNEMLİ:** App Password oluşturmak için 2 Adımlı Doğrulama **mutlaka açık** olmalı!

**4. App Passwords Sayfasına Gidin:**
- 2 Adımlı Doğrulama açıldıktan sonra, aynı sayfada **"App Passwords"** (Uygulama Şifreleri) linkini bulun
- Veya direkt şu adrese gidin: https://myaccount.google.com/apppasswords
- Gerekirse tekrar şifrenizi girmeniz istenebilir

**5. Yeni App Password Oluşturun:**
- **"Select app"** (Uygulama seçin) dropdown'ına tıklayın
- Listeden **"Mail"** seçeneğini seçin
- **"Select device"** (Cihaz seçin) dropdown'ına tıklayın
- Listeden **"Other (Custom name)"** (Diğer - Özel isim) seçeneğini seçin
- Açılan kutucuğa: `MUSIC Website` yazın
- **"Generate"** (Oluştur) butonuna tıklayın

**6. 16 Haneli Şifreyi Kopyalayın:**
- Ekranda **16 haneli bir şifre** görünecek
- Şifre şu formatta olacak: `abcd efgh ijkl mnop` (4'er haneli gruplar halinde)
- ⚠️ **ÇOK ÖNEMLİ:** Bu şifre sadece **bir kez** gösterilir! Kopyalayın ve güvenli bir yere kaydedin
- **"Done"** (Tamam) butonuna tıklayın

**7. Şifreyi Kullanın:**
- Bu 16 haneli şifreyi (boşluklar olmadan) Supabase secrets'a ekleyeceksiniz
- Örnek: `abcdefghijklmnop` (boşlukları kaldırın)

### 📝 Örnek Görünüm:

```
┌─────────────────────────────────────┐
│  App Password                      │
├─────────────────────────────────────┤
│  MUSIC Website                     │
│  abcd efgh ijkl mnop               │ ← Bu 16 haneli şifreyi kopyalayın
│                                    │
│  [Copy]  [Done]                   │
└─────────────────────────────────────┘
```

### ⚠️ Önemli Notlar:

- ✅ App Password, ana Gmail şifrenizden **farklıdır**
- ✅ App Password sadece **bir kez** gösterilir, kaydedin!
- ✅ Şifreyi kopyalarken **boşlukları kaldırın**: `abcdefghijklmnop`
- ✅ Bu şifreyi kimseyle paylaşmayın
- ✅ İstediğiniz zaman App Passwords sayfasından silebilirsiniz

## 📋 Adım 2: Supabase Edge Function Oluşturma

⚠️ **ÖNEMLİ:** Bu adımlar **Terminal/Komut Satırı**'nda çalıştırılacak komutlardır. **SQL Editor'da değil!**

### 2.1. Terminal'i Açın

- **macOS**: `Cmd + Space` → "Terminal" yazın → Enter
- **Windows**: `Win + R` → "cmd" yazın → Enter
- **Linux**: `Ctrl + Alt + T`

### 2.2. Proje Klasörüne Gidin

⚠️ **ÇOK ÖNEMLİ:** Tüm komutları proje klasöründe çalıştırmanız gerekiyor!

Terminal'de şu komutu çalıştırın:

```bash
cd /Users/furkangunduz/CursorProjects/MarmaraUniversityScienceAndInterdisciplinaryCommunity
```

Kontrol edin (şu çıktıyı görmelisiniz):
```bash
furkangunduz@192 MarmaraUniversityScienceAndInterdisciplinaryCommunity %
```

Eğer `~` veya başka bir klasördeyseniz, yukarıdaki `cd` komutunu çalıştırın!

### 2.3. Supabase CLI Kurulumu (İlk Kez)

**Seçenek 1: npx ile (Önerilen - Kurulum Gerektirmez)**

Terminal'de direkt şu komutu çalıştırın (kurulum gerektirmez):

```bash
npx supabase --version
```

Eğer çalışıyorsa, tüm komutlarda `supabase` yerine `npx supabase` kullanın.

**Seçenek 2: Homebrew ile (Eğer Homebrew Yüklüyse)**

```bash
brew install supabase/tap/supabase
```

**Seçenek 3: npm ile (İzin Hatası Varsa)**

Eğer izin hatası alıyorsanız, `sudo` kullanın:

```bash
sudo npm install -g supabase
```

⚠️ **ÖNEMLİ:** Aşağıdaki tüm komutlarda, eğer `npx` kullanıyorsanız `supabase` yerine `npx supabase` yazın!

### 2.4. Supabase'e Giriş Yapın

⚠️ **ÖNEMLİ:** Önce proje klasöründe olduğunuzdan emin olun!

Terminal'de şu komutu çalıştırın:

```bash
npx supabase login
```

**"Press Enter to open browser and login automatically"** mesajını görünce **Enter** tuşuna basın.

Tarayıcı açılacak, Gmail hesabınızla giriş yapın.

⚠️ **DİKKAT:** 
- Komut `npx supabase login` şeklinde olmalı (başında `npx` var!)
- `px supabase` ❌ (yanlış - n eksik)
- `supabase login` ❌ (yanlış - npx yok)

### 2.5. Projeyi Bağlayın

⚠️ **ÖNEMLİ:** 
1. Önce proje klasöründe olduğunuzdan emin olun!
2. Login işlemi tamamlanmış olmalı!

Terminal'de şu komutu çalıştırın:

```bash
npx supabase link --project-ref dlbrjkhllmkkuregvkcy
```

⚠️ **DİKKAT:** 
- Komut `npx supabase link` şeklinde olmalı (başında `npx` var!)
- `px supabase link` ❌ (yanlış - n eksik)
- `supabase link` ❌ (yanlış - npx yok)

`dlbrjkhllmkkuregvkcy` sizin Supabase proje referansınız. Eğer farklıysa, Supabase Dashboard > Settings > General > Reference ID'den kontrol edin.

**Eğer hata alırsanız:**
- Önce `cd /Users/furkangunduz/CursorProjects/MarmaraUniversityScienceAndInterdisciplinaryCommunity` komutunu çalıştırın
- Sonra tekrar `npx supabase link` komutunu deneyin

### 2.6. Edge Function'ı Deploy Edin

Terminal'de şu komutu çalıştırın:

```bash
npx supabase functions deploy send-verification-email
```

⚠️ **Not:** Eğer `npx` kullanmıyorsanız, `npx` olmadan `supabase functions deploy` yazın.

Bu komut `supabase/functions/send-verification-email/index.ts` dosyasını Supabase'e yükler.

### 2.7. Secrets (Gizli Bilgiler) Ekleyin

Terminal'de şu komutları çalıştırın (kendi bilgilerinizle değiştirin):

```bash
npx supabase secrets set GMAIL_USER=your-email@gmail.com
npx supabase secrets set GMAIL_APP_PASSWORD=abcdefghijklmnop
npx supabase secrets set LOGO_URL=https://dgdfurkan.github.io/MarmaraUniversityScienceAndInterdisciplinaryCommunity/images/music_logo_cropped.png
```

**Örnek (Sizin Bilgilerinizle):**
```bash
npx supabase secrets set GMAIL_USER=frkngndz60@gmail.com
npx supabase secrets set GMAIL_APP_PASSWORD=pdfxrusvfmlvwjgd
npx supabase secrets set LOGO_URL=https://dgdfurkan.github.io/MarmaraUniversityScienceAndInterdisciplinaryCommunity/images/music_logo_cropped.png
```

⚠️ **DİKKAT:** 
- `GMAIL_APP_PASSWORD` değerinde **boşluk olmamalı**: `pdfxrusvfmlvwjgd` ✅ (doğru)
- `pdfx rusv fmlv wjgd` ❌ (yanlış - boşluk var)
- Komutları **tek tek** çalıştırın, yorum satırları (# ile başlayanlar) yazmayın!

### 2.8. Secrets'ları Kontrol Edin

Terminal'de şu komutu çalıştırın:

```bash
npx supabase secrets list
```

Tüm secrets'ların doğru ayarlandığını kontrol edin.

## 📋 Adım 3: Frontend Ayarları

### 3.1. Edge Function URL'ini Bulun

1. Supabase Dashboard'a gidin
2. **Edge Functions** sekmesine tıklayın
3. **send-verification-email** function'ını bulun
4. **URL**'i kopyalayın
   - Örnek: `https://xxxxx.supabase.co/functions/v1/send-verification-email`

### 3.2. email-service.js Dosyasını Güncelleyin

`js/email-service.js` dosyasını açın ve şu satırı güncelleyin:

```javascript
const SUPABASE_FUNCTION_URL = 'https://xxxxx.supabase.co/functions/v1/send-verification-email';
```

`xxxxx` yerine kendi Supabase project ref'inizi yazın.

## 📋 Adım 4: Test Etme

1. Web sitenizde kayıt olun
2. E-posta adresinize doğrulama kodu gönderilmesi gerekir
3. E-postayı kontrol edin (spam klasörünü de kontrol edin)

## 🔧 Sorun Giderme

### E-posta Gönderilmiyor

1. **Gmail App Password Kontrolü:**
   - App Password'un doğru kopyalandığından emin olun
   - Boşluklar olmadan yazın: `abcdefghijklmnop`

2. **Supabase Secrets Kontrolü:**
   - **Terminal'de** (SQL Editor'da değil!) şu komutu çalıştırın:
   ```bash
   supabase secrets list
   ```
   Tüm secrets'ların doğru ayarlandığından emin olun

3. **Edge Function Logları:**
   - Supabase Dashboard > Edge Functions > send-verification-email > Logs
   - Hata mesajlarını kontrol edin

4. **Gmail Güvenlik Ayarları:**
   - "Less secure app access" kapalı olmalı (App Password kullanıyorsanız)
   - 2-Step Verification açık olmalı

### "Gmail SMTP not configured" Hatası

- Supabase secrets'ların doğru ayarlandığından emin olun
- Secrets'ları tekrar ekleyin:
  ```bash
  supabase secrets set GMAIL_USER=your-email@gmail.com
  supabase secrets set GMAIL_APP_PASSWORD=your-app-password
  ```

### "Function not found" Hatası

- Edge Function'ın deploy edildiğinden emin olun:
  ```bash
  supabase functions deploy send-verification-email
  ```

## 📊 Günlük Limit

Gmail günlük **500 e-posta** gönderme limiti uygular. Bu limiti aşarsanız:
- 24 saat bekleyin
- Veya Mailgun/SendGrid gibi servislere geçin

## 🔒 Güvenlik Notları

- ✅ Gmail App Password kullanın (ana şifrenizi değil)
- ✅ App Password'u kimseyle paylaşmayın
- ✅ Supabase secrets'ları güvenli tutun
- ✅ Edge Function URL'ini public repository'de paylaşmayın

## ✅ Kurulum Kontrol Listesi

- [ ] Gmail App Password oluşturuldu
- [ ] Supabase CLI kuruldu ve login yapıldı
- [ ] Proje bağlandı (`supabase link`)
- [ ] Edge Function deploy edildi
- [ ] Secrets eklendi (GMAIL_USER, GMAIL_APP_PASSWORD, LOGO_URL)
- [ ] Frontend'de SUPABASE_FUNCTION_URL güncellendi
- [ ] Test e-postası gönderildi ve kontrol edildi

## 🎉 Tamamlandı!

Artık Gmail SMTP ile e-posta gönderebilirsiniz! Sistem günlük 500 e-posta gönderebilir ve domain doğrulaması gerektirmez.

