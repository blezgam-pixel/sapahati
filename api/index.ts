import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  saveSheetsConfig,
  testConnection,
  ensureSheetHeaders,
  getBookingsFromSheet,
  updateBookingsInSheet,
  appendBookingToSheet,
  getPsychologistsFromSheet,
  updatePsychologistsInSheet,
  getCmsConfigFromSheet,
  updateCmsConfigInSheet,
  getAdminUsersFromSheet,
  updateAdminUsersInSheet,
  verifyAdminLoginInSheet,
  getAdminNotificationEmail,
  updateAdminNotificationEmail,
} from '../server/sheetsService.js';

const app = express();

app.use(express.json({ limit: '10mb' }));

// ============================================================
// 🔒 KEAMANAN: Rate Limiter (Gratis, tanpa paket tambahan)
// ============================================================
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
  }
  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count, resetIn: entry.resetAt - now };
}

// ============================================================
// 🔒 KEAMANAN: Verifikasi Token Firebase (Gratis, pakai REST API)
// ============================================================
const FIREBASE_API_KEY = 'AIzaSyAHKJbF6-S76TFYCZTMZkd0GMa0JJeReeY';

async function verifyFirebaseToken(idToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.users?.[0]?.localId as string) || null;
  } catch {
    return null;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Sapahati' });
});

// ⚡ BATCH ENDPOINT: Ambil semua data sekaligus dalam 1 request (paralel)
// Menggantikan 3 request sequential menjadi 1 request dengan Promise.all
app.get('/api/sheets/init-data', async (req, res) => {
  try {
    const [cmsRows, psychologists, bookings] = await Promise.all([
      getCmsConfigFromSheet().catch(() => []),
      getPsychologistsFromSheet().catch(() => []),
      getBookingsFromSheet().catch(() => []),
    ]);
    res.json({ cmsRows, psychologists, bookings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil data awal' });
  }
});


// Google Sheets Service Account Endpoints
app.get('/api/sheets/status', async (req, res) => {
  try {
    const status = await testConnection();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ connected: false, message: err.message || 'Error checking sheets status' });
  }
});

app.post('/api/sheets/config', async (req, res) => {
  try {
    const { serviceAccountJson, spreadsheetId } = req.body;
    if (!serviceAccountJson || !spreadsheetId) {
      return res.status(400).json({ connected: false, message: 'JSON Service Account dan Spreadsheet ID wajib diisi.' });
    }

    saveSheetsConfig(serviceAccountJson, spreadsheetId);
    await ensureSheetHeaders();
    const status = await testConnection();

    if (!status.connected) {
      return res.status(400).json(status);
    }

    return res.json(status);
  } catch (err: any) {
    return res.status(400).json({ connected: false, message: err.message || 'Gagal menyalin konfigurasi Service Account.' });
  }
});

app.get('/api/sheets/bookings', async (req, res) => {
  try {
    const bookings = await getBookingsFromSheet();
    res.json({ bookings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil data bookings' });
  }
});

app.post('/api/sheets/bookings', async (req, res) => {
  try {
    const { bookings } = req.body;
    if (!Array.isArray(bookings)) {
      return res.status(400).json({ error: 'Data bookings harus berupa array' });
    }
    await updateBookingsInSheet(bookings);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyimpan data bookings' });
  }
});

// Atomic append: langsung tulis 1 baris baru ke Sheets tanpa baca semua dulu
// values.append di Google Sheets API bersifat atomik - aman untuk request paralel
app.post('/api/sheets/bookings/append', async (req, res) => {
  // 🔒 Verifikasi token Firebase
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    return res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }
  const uid = await verifyFirebaseToken(idToken);
  if (!uid) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.' });
  }

  try {
    const { booking } = req.body;
    if (!booking || !booking.id) {
      return res.status(400).json({ error: 'Data booking tidak valid' });
    }
    if (booking.userId && booking.userId !== uid) {
      return res.status(403).json({ error: 'Data booking tidak sesuai dengan akun yang login.' });
    }
    await appendBookingToSheet(booking);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menambah booking' });
  }
});

app.get('/api/sheets/psychologists', async (req, res) => {
  try {
    const psychologists = await getPsychologistsFromSheet();
    res.json({ psychologists });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil data psikolog' });
  }
});

app.post('/api/sheets/psychologists', async (req, res) => {
  try {
    const { psychologists } = req.body;
    if (!Array.isArray(psychologists)) {
      return res.status(400).json({ error: 'Data psychologists harus berupa array' });
    }
    await updatePsychologistsInSheet(psychologists);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyimpan data psikolog' });
  }
});

app.get('/api/sheets/cms', async (req, res) => {
  try {
    const rows = await getCmsConfigFromSheet();
    res.json({ rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil data CMS dari Spreadsheet' });
  }
});

app.post('/api/sheets/cms', async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: 'Data rows harus berupa array' });
    }
    await updateCmsConfigInSheet(rows);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyimpan data CMS ke Spreadsheet' });
  }
});

// Admin Users Endpoints
app.get('/api/sheets/admins', async (req, res) => {
  try {
    const admins = await getAdminUsersFromSheet();
    res.json({ admins });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil data Admin Users dari Spreadsheet' });
  }
});

app.post('/api/sheets/admins', async (req, res) => {
  try {
    const { admins } = req.body;
    if (!Array.isArray(admins)) {
      return res.status(400).json({ error: 'Data admins harus berupa array' });
    }
    await updateAdminUsersInSheet(admins);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyimpan data Admin Users ke Spreadsheet' });
  }
});

// Settings: Email Notifikasi Admin
app.get('/api/settings/admin-email', async (req, res) => {
  try {
    const email = await getAdminNotificationEmail();
    res.json({ email });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil email notifikasi admin' });
  }
});

app.post('/api/settings/admin-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }
    await updateAdminNotificationEmail(email);
    res.json({ success: true, email });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyimpan email notifikasi admin' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  // 🔒 Rate limiting: max 5 percobaan per 15 menit per IP
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  const limit = checkRateLimit(clientIp, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    const minutesLeft = Math.ceil(limit.resetIn / 60000);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan login. Coba lagi dalam ${minutesLeft} menit.`
    });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }
    const result = await verifyAdminLoginInSheet(email, password);
    if (!result.success) {
      return res.status(401).json(result);
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Terjadi kesalahan pada server saat login.' });
  }
});

// Curhat AI Endpoint
app.post('/api/curhat', async (req, res) => {
  try {
    const { prompt, turn = 1, history = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const currentTurn = Math.min(Math.max(Number(turn || 1), 1), 5);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Gen Z style dynamic empathetic fallback when API key is not set
      const lowerPrompt = prompt.toLowerCase();
      let fallbackText = '';

      if (currentTurn >= 5) {
        fallbackText = `Makasih banyak yaa udah tumpahin ceritamu di 5 sesi curhat AI ini! 💜✨ You're doing so great, proud of you! Karena sesi AI terbatas 5 pertanyaan, yuk lanjutin obrolan hangat ini bareng Psikolog Profesional biar dapet pendampingan yang lebih pas & lega bgt! 🫂`;
      } else if (lowerPrompt.includes('lelah') || lowerPrompt.includes('capek') || lowerPrompt.includes('cemas') || lowerPrompt.includes('anxiety')) {
        const capekReplies = [
          `I feel you bgt, rasa capek & cemas tuh emang beneran nguras energi bgt 🥹. Pull up a chair & take a deep breath dulu yaa bestie. Kamu udah bertahan sehebat ini kok! Mau cerita lebih lanjut bagian mana yang paling berat?`,
          `Real bgt sih... kalau emosi lagi numpuk, wajar banget kalo raga & pikiran rasanya mau break dulu 💜. Inget ya, it's totally okay not to be okay. Pelan-pelan aja tumpahin ke aku, zero pressure sama sekali...`,
          `Sending warm virtual hug for you! 🫂✨ capeknya kamu tuh valid banget dan gak usah dipaksain buat tahan sendirian. Tarik napas dulu, kamu hebat banget udah mau jujur sama perasaanmu hari ini.`,
          `Proud of you bgt udah mau berani terbuka! 🫶 Intinya kamu gak sendirian kok. Langkah kecil apa nih yang bikin kamu ngerasa agak lega hari ini?`
        ];
        fallbackText = capekReplies[(currentTurn - 1) % capekReplies.length];
      } else if (lowerPrompt.includes('tugas') || lowerPrompt.includes('kerja') || lowerPrompt.includes('numpuk') || lowerPrompt.includes('beban')) {
        const tugasReplies = [
          `Waduh, kalau urusan tugas atau kerjaan lagi ngeroyok emang bikin pala pusing bgt yaa 📚🥹! Tapi inget bestie, kerjain satu per satu aja, gak harus kelar detik ini juga. Mana nih yang paling bikin kamu pusing?`,
          `Relate bgt sih... burnout gara-gara deadline/tugas numpuk tuh bener-bener gak enak. Istirahat sejenak dulu yuk, minum air putih, & tumpahin keselinmu di sini! Aku dengerin kok 💜`,
          `Kamu udah kerja keras bgt hari ini, proud of you! 🫶 Tugas emang penting, tapi kesehatan mentalmu jauh lebih utama. Pelan-pelan aja yaa, slowly but surely!`,
          `I feel you... Jangan lupa napas sejenak yaa. Mau cerita hal apa lagi yang bisa bikin beban pikiranmu berkurang sedikit?`
        ];
        fallbackText = tugasReplies[(currentTurn - 1) % tugasReplies.length];
      } else if (lowerPrompt.includes('sepi') || lowerPrompt.includes('sendiri') || lowerPrompt.includes('lonely')) {
        fallbackText = `Kamu gak sendirian kok, ada aku di sini 24/7 yang selalu siap dengerin kamu 🫂💜. Tumpahin aja semuanya, jangan dipendam sendiri yaa. Aku nemenin kamu terus!`;
      } else {
        const generalReplies = [
          `Haii bestie! 💜✨ I feel you bgt, cerita kamu valid banget kok. Spill aja pelan-pelan yaa, hal apa yang paling bikin kamu overthinking atau kepikiran hari ini?`,
          `Thank you udah berani cerita jujur sama aku 🌸. Situasi ini pasti gak mudah buat kamu, tapi kamu hebat bgt bisa ngelewatinnya. Boleh cerita lebih lanjut?`,
          `Relate bgt sih... Pelan-pelan aja yaa take your time 🫂. Aku di sini gak bakal nge-judge sama sekali. Tumpahin aja semuanya!`,
          `Proud of you bgt udah berani terbuka! 🫶 Intinya kamu gak sendirian kok. Langkah kecil apa nih yang bikin kamu ngerasa agak lega hari ini?`
        ];
        fallbackText = generalReplies[(currentTurn - 1) % generalReplies.length];
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    
    // Format conversation history for context
    let formattedHistory = '';
    if (Array.isArray(history) && history.length > 0) {
      formattedHistory = history
        .map((m: any) => `${m.sender === 'user' ? 'Pengguna' : 'Sesi Curhat'}: ${m.text}`)
        .join('\n');
    }

    const fullContextText = (history.map((m: any) => m.text).join(' ') + ' ' + prompt).toLowerCase();
    const isSarcasticTopic = ['kerja', 'karir', 'capek', 'tugas', 'percinta', 'cinta', 'pacar', 'putus', 'pustus', 'sosial', 'temen', 'teman', 'toxic', 'hubunga', 'mantan', 'jomblo'].some(kw => fullContextText.includes(kw));
    const isGenZTopic = ['nikah', 'pernikahan', 'mental', 'iq', 'pintar', 'bodoh', 'stres', 'depresi', 'insecure'].some(kw => fullContextText.includes(kw));
    
    let personaType = 'gen_z'; // default
    if (isSarcasticTopic && !isGenZTopic) {
      personaType = 'sarcastic';
    } else if (isGenZTopic) {
      personaType = 'gen_z';
    }

    let turnInstruction = '';
    let systemRole = '';

    if (personaType === 'sarcastic') {
      systemRole = 'Kamu adalah Sesi Curhat bergaya Anak Jaksel yang nyinyir, sangat sarkas, savage, logis, dan realistik (menampar dengan fakta).';
      turnInstruction = `ATURAN UTAMA KEPRIBADIAN (SARKASME LEVEL TINGGI & BAHASA JAKSEL):
1. PERSONALITAS: Sangat blak-blakan, nyinyir, plenger, sarkas (bikin sadar realita dengan pedas), kasih "tough love" yang bener-bener nonjok. Jangan kasihan atau lembek.
2. FORMAT TEKS: DILARANG KERAS menggunakan tanda bintang (*) atau italic formatting. Tulis teks polos biasa saja tanpa format miring.
3. GAYA BAHASA: Pake bahasa gaul Anak Jaksel campuran Inggris-Indo (contoh: "literally", "which is", "at the end of the day", "make sense", "jujurly", "like...", "gue-lu").
4. CONTOH NYENTIL: "Ya lagian lu expect apa? Nunggu keajaiban?", "Jujurly otak lu dipake gak sih mikir gitu?", "Stop playing victim deh, gak ada yang peduli juga.".
5. PANJANG RESPONS: 2-3 kalimat yang padat, savage, ngena, tapi logis. (Ini respons ke-${currentTurn} dari 5).`;
    } else {
      systemRole = `PERSONALITAS: Kamu adalah "Sesi Curhat" — bestie paling peka, ramah, super empati, humble, dan tempat aman buat cerita tanpa di-judge sama sekali.`;
      turnInstruction = `ATURAN UTAMA KEPRIBADIAN & GAYA BAHASA (ALA GEN Z BESTIE HANGAT):
1. GAYA BAHASA: Kasual & ekspresif ala Gen Z (contoh: 'bestie', 'i feel you bgt', 'take your time').
2. Sisipkan emoji hangat (💜, 🫂, ✨).
3. HINDARI REPETISI pembuka yang sama persis.
4. PANJANG RESPONS: 2-3 kalimat.`;
    }

    if (currentTurn >= 5) {
      if (personaType === 'sarcastic') {
        turnInstruction = `Ini pesan ke-5 (SESI TERAKHIR dari 5 pertanyaan). Jawab dengan gaya super sarkas Jaksel (DILARANG PAKAI TANDA BINTANG): "Udah ya, jatah 5 pertanyaan lu udah abis, capek gue nanggapin drama lu. Literally mending lu lanjut curhat ke Psikolog Profesional di aplikasi Sapa Hati ini aja deh biar lu dikasih solusi beneran. At the end of the day, lu butuh bantuan nyata, bukan cuma ngeluh doang. Semangat jalanin idup! ☕"`;
      } else {
        turnInstruction = `Ini pesan ke-5 (SESI TERAKHIR). Apresiasi keberaniannya cerita, sampaikan secara lembut kalau sesi AI 5 pertanyaan ini udah selesai, lalu ajak ngobrol bareng Psikolog Profesional biar dapet pendampingan yang lebih dalam!`;
      }
    }

    const safetyInstruction = `ATURAN REKOMENDASI PENTING:
1. JANGAN PERNAH menyebut atau merekomendasikan aplikasi kompetitor (seperti Halodoc, Riliv, Alodokter, dll) atau Halo Jiwa.
2. JANGAN langsung merekomendasikan psikolog atau aplikasi Sapa Hati di awal obrolan KECUALI ini adalah sesi terakhir (pertanyaan ke-5) ATAU pengguna yang memintanya secara eksplisit. Biarkan obrolan mengalir natural dulu.
3. Kejahatan/Kekerasan: Jika ada indikasi kriminalitas, pelecehan, kekerasan fisik/seksual, wajib arahkan lapor ke polisi (Call Center Polri 110).`;

    const systemPrompt = `${systemRole}
Kamu SELALU INGAT konteks percakapan sebelumnya.

${safetyInstruction}

${turnInstruction}

${formattedHistory ? `[RIWAYAT PERCAKAPAN SEBELUMNYA]:\n${formattedHistory}\n` : ''}
[PESAN TERBARU PENGGUNA]:
${prompt}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let stream;
    try {
      stream = await ai.models.generateContentStream({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ]
      });
    } catch (modelErr: any) {
      console.warn('Primary model gemini-3.6-flash failed:', modelErr.message);
      try {
        stream = await ai.models.generateContentStream({
          model: 'gemini-3.1-flash-lite',
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }]
            }
          ]
        });
      } catch (liteErr: any) {
        console.warn('Fallback gemini-3.1-flash-lite failed:', liteErr.message);
      }
    }

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    return res.end();

  } catch (error: any) {
    console.error('Curhat API Error:', error);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ text: 'Sapa hati sedang tidur, harap menunggu bangun 😴' })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }
});

// Vercel akan memanggil "app" ini langsung sebagai handler request.
// TIDAK ADA app.listen() di sini -- itu yang membedakan dari server.ts biasa.
// ----------------------------------------------------
// TELEGRAM NOTIFICATION ENDPOINT
// ----------------------------------------------------
app.post('/api/telegram/notify', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn('[Telegram] Token atau Chat ID belum diatur di .env');
      return res.status(500).json({ error: 'Telegram belum dikonfigurasi di server' });
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.description || 'Gagal kirim ke Telegram');
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('[Telegram] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default app;