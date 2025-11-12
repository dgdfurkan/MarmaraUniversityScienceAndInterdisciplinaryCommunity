# ⚠️ ACİL: Supabase'de Yeni Kullanıcı Kayıtlarını AÇMANIZ GEREKİYOR!

"Signups not allowed for this instance" hatası alıyorsanız, **Supabase Dashboard'dan yeni kullanıcı kayıtlarını açmanız GEREKLİ!**

## 🚨 ÖNEMLİ: Bu hatayı çözmek için Supabase Dashboard'dan ayar yapmanız ZORUNLU!

**Kod tarafından bu hatayı çözemeyiz** - bu Supabase'in güvenlik ayarıdır ve **sadece Dashboard'dan** kontrol edilir.

**ŞU ANDA BU HATAYI ALIYORSANIZ, AŞAĞIDAKİ ADIMLARI TAKİP EDİN:**

## Adım Adım Çözüm

### Yöntem 1: Authentication Settings (ÖNERİLEN - İLK BUNU DENEYİN!)

1. **Tarayıcınızda yeni bir sekme açın** ve **Supabase Dashboard**'a gidin: 
   👉 **https://supabase.com/dashboard**

2. **Giriş yapın** (eğer giriş yapmadıysanız)

3. **Projenizi seçin** (MarmaraUniversityScienceAndInterdisciplinaryCommunity veya proje adınız)

4. **Sol menüden** (yan tarafta) **"Authentication"** sekmesine tıklayın
   - İkon: 🔐 (kilit simgesi) veya "Authentication" yazısı

5. **Üst menüden** (sayfanın üst kısmında) **"Settings"** sekmesine tıklayın
   - "Users", "Policies", "Settings" gibi sekmeler olacak - **"Settings"**'e tıklayın

6. Sayfayı aşağı kaydırın ve **"Enable email signups"** veya **"Enable signups"** toggle'ını bulun
   - Bu bir açma/kapama düğmesi olacak (switch/toggle)
   - Şu anda **KAPALI** (OFF/gri) durumda olmalı

7. **Toggle'ı AÇIN** (yeşil/aktif konuma getirin)
   - Toggle'a tıklayın veya sürükleyin
   - Yeşil/aktif hale gelmeli

8. Sayfanın altındaki **"Save"** veya **"Update"** butonuna tıklayın
   - Genellikle sayfanın en altında veya sağ üst köşede olur

9. **Başarı mesajını bekleyin**
   - "Settings updated" veya benzer bir mesaj görmelisiniz

10. **5-10 saniye bekleyin** (ayarların aktif olması için)

11. **Ana sayfanıza geri dönün** ve **sayfayı yenileyin** (Ctrl+F5 veya Cmd+Shift+R)

12. **Tekrar "Üye Ol" formunu deneyin**

### Yöntem 2: Providers Settings

Eğer Yöntem 1'de seçenek yoksa:

1. **Supabase Dashboard** > **Authentication** > **Providers** sekmesine gidin
2. **Email** provider'ını bulun (genellikle en üstte)
3. **"Enable email provider"** toggle'ını **AÇIN** (ON)
4. **"Save"** butonuna tıklayın

### Yöntem 3: API Settings (Son Çare)

Eğer yukarıdaki yöntemler çalışmazsa:

1. **Supabase Dashboard** > **Settings** (sol menüden) > **API** sekmesine gidin
2. **"Enable signups"** veya benzer bir ayar arayın
3. Ayarı **AÇIN** (ON)
4. **"Save"** butonuna tıklayın

## Kontrol Listesi

- [ ] Supabase Dashboard'a giriş yaptınız mı?
- [ ] Doğru projeyi seçtiniz mi?
- [ ] Authentication > Settings'e gittiniz mi?
- [ ] "Enable email signups" toggle'ını AÇTINIZ mı?
- [ ] "Save" butonuna tıkladınız mı?
- [ ] Başarı mesajını gördünüz mü?
- [ ] Sayfayı yenilediniz mi (Ctrl+F5)?

## Notlar

- ⚠️ **Bu ayar değişikliği 5-10 saniye içinde aktif olur**
- ✅ Ayarları değiştirdikten sonra **mutlaka sayfayı yenileyin** (Ctrl+F5 veya Cmd+Shift+R)
- 🔄 Hata devam ederse, **birkaç dakika bekleyin** ve tekrar deneyin
- 📧 Eğer hala çalışmıyorsa, Supabase Dashboard'da **Settings** > **General** bölümünden proje ayarlarını kontrol edin

## Test

Ayarları değiştirdikten sonra:

1. **5-10 saniye bekleyin** (ayarların aktif olması için)
2. **Sayfayı yenileyin** (Ctrl+F5 veya Cmd+Shift+R)
3. **"Üye Ol"** formunu tekrar doldurun
4. **Kayıt işlemini deneyin**

## Hala Çalışmıyorsa?

Eğer yukarıdaki adımları takip ettikten sonra hala aynı hatayı alıyorsanız:

1. **Supabase Dashboard**'da **Settings** > **General** sekmesine gidin
2. Proje durumunun **"Active"** olduğundan emin olun
3. **Authentication** > **Settings**'e tekrar gidin ve tüm toggle'ları kontrol edin
4. **Browser console**'u açın (F12) ve başka hata var mı kontrol edin
5. **Supabase Status Page**'i kontrol edin: https://status.supabase.com/

## Ek Bilgi

Bu hata genellikle şu durumlarda oluşur:
- Supabase projesinde signup'lar manuel olarak kapatılmış
- Proje ayarlarında bir değişiklik yapılmış
- Supabase'in güvenlik politikaları nedeniyle geçici olarak kapatılmış

**Çözüm her zaman Supabase Dashboard'dan ayar yapmaktır.**

