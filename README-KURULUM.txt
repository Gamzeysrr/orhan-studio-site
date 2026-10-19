ORHAN STUDIO — RESEND E-POSTA KURULUMU

Bu paket, mevcut Cloudflare Worker olan “divine-dawn-3382” üzerindeki siteyi koruyup form gönderimini Resend'e bağlar. Form gönderileri gamzeysr6@gmail.com adresine gider. Dosya ekleri de e-postaya eklenir. Resend API anahtarı sayfa dosyalarına yazılmaz.

1) Resend'de alan adını doğrula
- Resend hesabında Domains bölümünden orhanstudio.com.tr alan adını ekle.
- Resend'in gösterdiği DNS kayıtlarını Cloudflare > orhanstudio.com.tr > DNS bölümüne ekle. Kayıt adlarını ve içeriklerini Resend'den aynen kopyala; e-posta için mevcut kayıtların varsa silme/değiştirme.
- Resend alan adının durumunu “Verified” gösterene kadar bekle.

2) API anahtarını oluştur
- Resend Dashboard > API Keys bölümünden yeni bir anahtar oluştur. Seçenek varsa yalnızca e-posta gönderme izni ver.
- Anahtar oluşturulduğunda kopyala; daha sonra Resend anahtarın tamamını tekrar göstermeyebilir. Bu anahtarı sohbete gönderme.

3) Paketi aç ve Wrangler'ı çalıştır
- Bu ZIP dosyasını bilgisayarında bir klasöre çıkar.
- O klasörde PowerShell aç. Klasörün içinde wrangler.toml, src ve public klasörleri görünmeli.
- Node.js kurulu değilse önce https://nodejs.org/ adresinden LTS sürümünü kur.
- PowerShell'de sırasıyla şu komutları çalıştır:

  npx wrangler login
  npx wrangler secret put RESEND_API_KEY
  npx wrangler deploy

- Secret komutu API anahtarını güvenli bir giriş alanında ister; az önce kopyaladığın anahtarı oraya yapıştır. Anahtar HTML dosyasına veya sohbete yazılmaz.
- Cloudflare hesabı seçimi sorulursa mevcut Worker'ın bulunduğu hesabı seç.
- Deploy, aynı adlı “divine-dawn-3382” Worker'ını günceller. Özel alan adı zaten bu Worker'a bağlıysa ona dokunmadan mevcut yayına Worker kodunu ekler.

4) Gönderimi dene
- orhanstudio.com.tr/basvuru.html sayfasını açıp kısa bir deneme başvurusu gönder.
- Başarı mesajını gör ve gamzeysr6@gmail.com Gelen Kutusu/Spam klasörünü kontrol et.
- Resend Dashboard > Emails/Logs bölümünde gönderim sonucunu görebilirsin.

Notlar
- Gönderici adresi varsayılan olarak basvuru@orhanstudio.com.tr. Bu adresin çalışması için orhanstudio.com.tr alan adı Resend'de doğrulanmış olmalı; bu işlem bir gelen kutusu (mailbox) oluşturmaz.
- Form, en fazla 5 ek ve toplam 10 MB dosya kabul eder. Kabul edilenler: PDF, PNG, JPG, WEBP, DOC, DOCX ve ZIP.
- Siteyi file:// adresinden açarak formu deneme; API yalnızca yayımlanmış site üzerinden çalışır.
