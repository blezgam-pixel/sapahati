import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  saveSheetsConfig,
  testConnection,
  ensureSheetHeaders,
  getBookingsFromSheet,
  updateBookingsInSheet,
  getPsychologistsFromSheet,
  updatePsychologistsInSheet,
  getCmsConfigFromSheet,
  updateCmsConfigInSheet,
  getAdminUsersFromSheet,
  updateAdminUsersInSheet,
  verifyAdminLoginInSheet,
} from '../server/sheetsService.js';

const app = express();

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Sapahati' });
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

app.post('/api/admin/login', async (req, res) => {
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

      return res.json({ reply: fallbackText, turn: currentTurn });
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

    let turnInstruction = `ATURAN UTAMA KEPRIBADIAN & GAYA BAHASA (ALA GEN Z BESTIE HANGAT):
1. PERSONALITAS: Kamu adalah "Sesi Curhat" — bestie paling peka, ramah, super empati, humble, dan tempat aman buat cerita tanpa di-judge sama sekali (zero judgment zone).
2. GAYA BAHASA GEN Z CASUAL & EKSPRESIF:
   - Gunakan kata sapaan & bahasa gaul halus Indonesia khas Gen Z (contoh: 'aku' & 'kamu', 'bestie', 'i feel you bgt', 'real bgt sih', 'spill aja', 'valid bgt', 'take your time', 'relate bgt', 'overthinking', 'pukpuk 🫂', 'proud of you', 'sending warm virtual hug 🫂', 'slowly but surely').
   - Sisipkan 1-2 emoji hangat yang bervariasi (💜, 🫂, ✨, 🥹, 🫶, 🌸, 🌿) di posisi yang tepat.
3. HINDARI REPETISI & SIFAT MONOTON (SANGAT PENTING):
   - JANGAN PERNAH mengulang-ulang kalimat pembuka yang sama persis seperti "Sini aku peluk dulu" atau "Wajar banget kok" di setiap pesan. Variasikan pembukamu secara kreatif dan segar sesuai konteks!
   - Pahami seluruh riwayat percakapan sebelumnya. HINDARI MENANYAKAN ULANG hal yang sudah dijelaskan pengguna! (Misal jika pengguna sudah bilang capek tugas, jangan tanya lagi "kenapa capek?").
4. ANKORING KONTEKS & EMOSI:
   - Langsung tanggapi poin spesifik & emosi yang disampaikan pengguna dengan sudut pandang teman yang beneran paham & peduli.
   - Jika pengguna cuma curhat emosi/perasaan, fokus berikan rasa aman, validasi emosi, dan ketenangan (tidak wajib mengakhiri dengan pertanyaan).
5. PANJANG RESPONS: 2-3 kalimat yang natural, mengalir santai, dan hangat (bukan seperti balasan bot template). (Ini respons ke-${currentTurn} dari 5).`;

    if (currentTurn >= 5) {
      turnInstruction = `Ini pesan ke-5 (SESI TERAKHIR dari 5 pertanyaan). Jawab dengan gaya Gen Z bestie yang super hangat, manis, dan menguatkan bgt! Apresiasi keberaniannya cerita ("You did so well today, proud of you bgt! Makasih yaa udah mau terbuka bgt ke aku 💜✨"), sampaikan secara sangat lembut kalau sesi AI 5 pertanyaan ini udah selesai, lalu beri ajakan hangat untuk lanjut ngobrol bareng Psikolog Profesional biar dapet pendampingan yang lebih dalam, tepat, & lega bgt!`;
    }

    const systemPrompt = `Kamu adalah Sesi Curhat — sahabat dekat, teman cerita, dan pendengar setia yang super friendly, hangat, humble, dan empati banget. Kamu selalu mendengarkan dengan peka tanpa menghakimi, dan SELALU INGAT konteks percakapan sebelumnya.

${turnInstruction}

${formattedHistory ? `[RIWAYAT PERCAKAPAN SEBELUMNYA]:\n${formattedHistory}\n` : ''}
[PESAN TERBARU PENGGUNA]:
${prompt}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ]
      });
    } catch (modelErr) {
      console.warn('Primary model gemini-3.6-flash failed, trying fallback model gemini-3.1-flash-lite...', modelErr);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ]
      });
    }

    const reply = response.text || `Makasih yaa udah mau cerita ke aku. Aku selalu di sini siap dengerin kamu kapan aja 💜`;
    return res.json({ reply });

  } catch (error) {
    console.error('Curhat API Error:', error);
    return res.json({
      reply: 'Makasih yaa udah mau cerita ke aku 💜. Aku paham bgt perasaanmu saat ini valid banget. Pelan-pelan aja yaa, kamu gak sendirian kok.'
    });
  }
});

// Vercel akan memanggil "app" ini langsung sebagai handler request.
// TIDAK ADA app.listen() di sini -- itu yang membedakan dari server.ts biasa.
export default app;