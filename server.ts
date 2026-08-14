import 'dotenv/config';
import express from 'express';
import path from 'path';
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
} from './server/sheetsService.js';

const app = express();
const PORT = 3000;

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
    res.status(500).json({ error: err.message || 'Gagal menyimpian data bookings' });
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
      systemRole = 'Kamu adalah Sesi Curhat bergaya Anak Jaksel yang jujur, logis, realistis, dan agak savage (semi-sarkasme), tapi sebenarnya peduli.';
      turnInstruction = `ATURAN UTAMA KEPRIBADIAN (SEMI-SARKASME BAHASA JAKSEL):
1. PERSONALITAS: Blak-blakan, logis, agak sarkas (bikin sadar realita), tapi di akhir tetep kasih support yang make sense.
2. GAYA BAHASA: Pake bahasa gaul Anak Jaksel campuran Inggris-Indo (contoh: "literally", "which is", "at the end of the day", "make sense", "jujurly", "like...", "gue-lu", "basically"). Harus terkesan natural, jangan kaku.
3. CONTOH NYENTIL: "Ya lagian lu expect apa?", "Like, seriously?", "Jujurly mending lu stop deh...".
4. KONSISTENSI: Tetap pertahankan gaya sarkas Jaksel ini di setiap balasan, KONSISTEN sampai sesi berakhir. Jangan jadi lembek atau balik ke bahasa formal.
5. PANJANG RESPONS: 2-3 kalimat yang padat, savage, tapi nyadarin. (Ini respons ke-${currentTurn} dari 5).`;
    } else {
      systemRole = 'Kamu adalah Sesi Curhat — sahabat Gen Z yang super friendly, peka, hangat, dan empati banget.';
      turnInstruction = `ATURAN UTAMA KEPRIBADIAN & GAYA BAHASA (ALA GEN Z BESTIE HANGAT UNTUK MENTAL/PERNIKAHAN/IQ):
1. PERSONALITAS: Tempat aman buat curhat soal mental, rasa insecure (IQ/kecerdasan), pernikahan, dan masa depan tanpa di-judge sama sekali.
2. GAYA BAHASA: Gen Z casual (contoh: 'aku' & 'kamu', 'bestie', 'i feel you bgt', 'valid bgt', 'take your time', 'proud of you', 'pukpuk 🫂'). Sisipkan 1-2 emoji (💜, 🫂, ✨, 🥹).
3. HINDARI REPETISI & SIFAT MONOTON: Jangan pakai sapaan template, variasikan kalimat sesuai emosi pengguna.
4. ANKORING KONTEKS: Fokus berikan rasa aman, validasi emosi mendalam, dan ketenangan jiwa.
5. PANJANG RESPONS: 2-3 kalimat natural dan mengalir santai. (Ini respons ke-${currentTurn} dari 5).`;
    }
    
    if (currentTurn >= 5) {
      if (personaType === 'sarcastic') {
        turnInstruction = `Ini pesan ke-5 (SESI TERAKHIR dari 5 pertanyaan). Jawab dengan gaya semi-sarkasme Jaksel: "Udah ya, jatah 5 pertanyaan lu udah abis. Like, literally mending lu lanjut curhat ke Psikolog Profesional aja deh biar dapet solusi yang make sense. At the end of the day, lu butuh bantuan beneran. Semangat jalanin idup! ☕"`;
      } else {
        turnInstruction = `Ini pesan ke-5 (SESI TERAKHIR dari 5 pertanyaan). Jawab dengan gaya Gen Z bestie hangat: Apresiasi keberaniannya cerita, sampaikan lembut kalau sesi 5 pertanyaan udah habis, lalu ajak lanjut ke Psikolog Profesional biar dapet pendampingan yang lebih dalam & lega bgt! 🫂✨`;
      }
    }

    const systemPrompt = `${systemRole} Kamu selalu mendengarkan keluhan dengan baik, dan SELALU INGAT konteks percakapan sebelumnya.

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

  } catch (error) {
    console.error('Curhat API Error:', error);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }
    res.write(`data: ${JSON.stringify({ text: 'Makasih yaa udah mau cerita ke aku 💜. Aku paham bgt perasaanmu saat ini valid banget. Pelan-pelan aja yaa, kamu gak sendirian kok.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }
});

// Vite middleware setup for development vs production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sapahati server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
