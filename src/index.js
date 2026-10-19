const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = 12 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "zip"]);

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function toBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function submitApplication(request, env) {
  if (request.method !== "POST") return json({ message: "Bu adres yalnızca form gönderimini kabul eder." }, 405);

  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ message: "İstek kaynağı doğrulanamadı." }, 403);
  }

  if (!env.RESEND_API_KEY) return json({ message: "E-posta gönderimi henüz yapılandırılmadı." }, 503);

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ message: "Form ve ekleri izin verilen boyutu aşıyor. Dosyaları küçültüp yeniden deneyin." }, 413);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ message: "Form okunamadı. Sayfayı yenileyip yeniden deneyin." }, 400);
  }

  // Honeypot: silently accept bots without sending email.
  if (String(form.get("_honey") || "").trim()) return json({ ok: true });

  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const message = String(form.get("message") || "").trim();

  if (!name || name.length > 160) return json({ message: "Ad soyad alanını kontrol edin." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ message: "Geçerli bir e-posta adresi girin." }, 400);
  }
  if (phone.length > 60) return json({ message: "Telefon numarası çok uzun." }, 400);
  if (!message || message.length > 10000) return json({ message: "Proje açıklamasını kontrol edin." }, 400);

  const files = form.getAll("attachments[]").filter((entry) => entry instanceof File && entry.name && entry.size > 0);
  if (files.length > MAX_FILES) return json({ message: `En fazla ${MAX_FILES} dosya ekleyebilirsiniz.` }, 400);

  let totalFileBytes = 0;
  const attachments = [];
  for (const file of files) {
    totalFileBytes += file.size;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      return json({ message: "PDF, PNG, JPG, WEBP, DOC, DOCX veya ZIP dosyası ekleyebilirsiniz." }, 400);
    }
    if (totalFileBytes > MAX_FILE_BYTES) {
      return json({ message: "Dosyaların toplam boyutu en fazla 10 MB olabilir." }, 413);
    }
    const safeFilename = file.name.replace(/[\r\n"/\\]/g, "_").slice(0, 180);
    attachments.push({ filename: safeFilename, content: toBase64(new Uint8Array(await file.arrayBuffer())) });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Belirtilmedi");
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
  const payload = {
    from: env.RESEND_FROM || "ORHAN Studio <basvuru@orhanstudio.com.tr>",
    to: ["gamzeysr6@gmail.com"],
    reply_to: email,
    subject: "ORHAN Studio — Yeni proje başvurusu",
    text: `Yeni proje başvurusu\n\nAd soyad: ${name}\nE-posta: ${email}\nTelefon: ${phone || "Belirtilmedi"}\n\nProje açıklaması:\n${message}`,
    html: `<h2>Yeni proje başvurusu</h2><p><strong>Ad soyad:</strong> ${safeName}<br><strong>E-posta:</strong> ${safeEmail}<br><strong>Telefon:</strong> ${safePhone}</p><p><strong>Proje açıklaması:</strong><br>${safeMessage}</p>`,
  };
  if (attachments.length) payload.attachments = attachments;

  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return json({ message: "E-posta servisine ulaşılamadı. Lütfen biraz sonra yeniden deneyin." }, 502);
  }

  if (!response.ok) {
    // Keep applicant details, API keys, and provider diagnostics out of public responses.
    console.error("Resend email request failed with status", response.status);
    return json({ message: "Başvuru gönderilemedi. Lütfen biraz sonra yeniden deneyin." }, 502);
  }

  return json({ ok: true, message: "Başvurunuz gönderildi. Teşekkür ederiz." });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/submit") return submitApplication(request, env);
    return env.ASSETS.fetch(request);
  },
};
