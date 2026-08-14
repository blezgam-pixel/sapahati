import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE_PATH = path.join(process.cwd(), '.sheets-config.json');

export interface ServiceAccountConfig {
  serviceAccountJson: any | null;
  spreadsheetId: string | null;
  clientEmail?: string | null;
}

let memoryConfig: ServiceAccountConfig = {
  serviceAccountJson: null,
  spreadsheetId: null,
  clientEmail: null,
};

// Load saved config on startup
function parseServiceAccountJson(val: any): any {
  if (!val) return null;
  if (typeof val === 'object' && val !== null) return val;
  if (typeof val !== 'string') return null;

  const trimmed = val.trim();
  if (!trimmed) return null;

  // 1. Try direct JSON.parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (err) {
    // ignore, try base64 decode next
  }

  // 2. Try base64 decoding
  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
    if (decoded.trim().startsWith('{')) {
      const parsed = JSON.parse(decoded.trim());
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (err) {
    // ignore
  }

  return null;
}

export function loadSheetsConfig(): ServiceAccountConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = parseServiceAccountJson(fileData);
      if (parsed) {
        memoryConfig = {
          serviceAccountJson: parsed.serviceAccountJson || null,
          spreadsheetId: parsed.spreadsheetId || null,
          clientEmail: parsed.serviceAccountJson?.client_email || null,
        };
        return memoryConfig;
      }
    }
  } catch (err) {
    console.warn('Could not read .sheets-config.json:', err);
  }

  // Fallback to ENV variables
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const parsed = parseServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    if (parsed) {
      memoryConfig = {
        serviceAccountJson: parsed,
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || memoryConfig.spreadsheetId || null,
        clientEmail: parsed.client_email || null,
      };
    } else {
      console.warn('GOOGLE_SERVICE_ACCOUNT_JSON env variable is not a valid JSON string or base64 encoded JSON object.');
    }
  }

  if (process.env.GOOGLE_SPREADSHEET_ID) {
    memoryConfig.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  } else if (!memoryConfig.spreadsheetId) {
    memoryConfig.spreadsheetId = '1KbuBzd7EBMfisbgqDnscNyxy5RuioVKD7lq1Fg3pyQ8';
  }

  return memoryConfig;
}

export function saveSheetsConfig(serviceAccountJson: any, spreadsheetId: string): ServiceAccountConfig {
  let jsonObj = parseServiceAccountJson(serviceAccountJson);

  if (!jsonObj || !jsonObj.client_email || !jsonObj.private_key) {
    throw new Error('File JSON Service Account tidak valid. Harus berupa JSON object dengan properti "client_email" dan "private_key".');
  }

  // Clean spreadsheetId if user pasted full URL
  let cleanSpreadsheetId = spreadsheetId ? spreadsheetId.trim() : '';
  if (cleanSpreadsheetId.includes('/spreadsheets/d/')) {
    const match = cleanSpreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanSpreadsheetId = match[1];
    }
  }

  memoryConfig = {
    serviceAccountJson: jsonObj,
    spreadsheetId: cleanSpreadsheetId,
    clientEmail: jsonObj.client_email,
  };

  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(memoryConfig, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write .sheets-config.json file:', err);
  }

  return memoryConfig;
}

export function getSheetsAuthClient() {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson) {
    throw new Error('Service Account Google Cloud belum dikonfigurasi.');
  }

  const auth = google.auth.fromJSON(config.serviceAccountJson);
  // Ensure scopes
  if (auth && 'scopes' in auth) {
    (auth as any).scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ];
  }

  return auth;
}

export async function testConnection() {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson) {
    return {
      connected: false,
      message: 'Service Account JSON belum dimasukkan.',
      clientEmail: null,
      spreadsheetId: config.spreadsheetId,
    };
  }

  if (!config.spreadsheetId) {
    return {
      connected: false,
      message: 'Spreadsheet ID belum diisi.',
      clientEmail: config.clientEmail || null,
      spreadsheetId: null,
    };
  }

  try {
    const auth = getSheetsAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    const res = await sheets.spreadsheets.get({
      spreadsheetId: config.spreadsheetId,
    });

    return {
      connected: true,
      title: res.data.properties?.title || 'Spreadsheet Valid',
      clientEmail: config.clientEmail || null,
      spreadsheetId: config.spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`,
    };
  } catch (err: any) {
    console.error('Sheets Connection Test Failed:', err);
    let errMsg = err.message || String(err);
    if (errMsg.includes('404') || errMsg.includes('Requested entity was not found')) {
      errMsg = `Spreadsheet ID tidak ditemukan atau belum dibagikan ke ${config.clientEmail}. Pastikan Anda menambahkan email Service Account tersebut sebagai Editor di file Spreadsheet.`;
    } else if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
      errMsg = `Akses Ditolak! Bagikan (Share) file Google Spreadsheet Anda ke email Service Account: ${config.clientEmail} dengan akses Editor.`;
    }
    return {
      connected: false,
      message: errMsg,
      clientEmail: config.clientEmail || null,
      spreadsheetId: config.spreadsheetId,
    };
  }
}

export async function ensureSheetHeaders() {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) return;

  const auth = getSheetsAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  const bookingHeaders = [
    'ID', 'Nama Pasien', 'Umur', 'WA Pasien', 'ID Psikolog', 'Nama Psikolog',
    'Metode', 'Judul Metode', 'Slot Jadwal', 'Harga', 'Nama Bukti Bayar',
    'URL Bukti Bayar', 'Status', 'Tanggal Dibuat'
  ];

  const psychHeaders = [
    'ID', 'Nama', 'Gelar/Judul', 'Pengalaman(Th)', 'Rating', 'Jumlah Ulasan',
    'Avatar URL', 'Spesialisasi', 'Harga Chat', 'Harga Video', 'Harga Offline',
    'Nama Bank', 'No Rekening', 'Atas Nama', 'QRIS URL', 'WA Psikolog',
    'Slot Jadwal', 'Available'
  ];

  try {
    // Check existing sheets
    const sp = await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheetId });
    const existingTitles = sp.data.sheets?.map((s) => s.properties?.title) || [];

    const chatUserHeaders = [
      'ID', 'Nama', 'Usia', 'PertanyaanDigunakan', 'BatasMaksimal', 'Status', 'TanggalDibuat', 'TerakhirBertanya'
    ];

    const adminHeaders = [
      'Email', 'Password', 'Nama Admin', 'Peran/Role', 'Status'
    ];

    const requests: any[] = [];
    if (!existingTitles.includes('Bookings')) {
      requests.push({ addSheet: { properties: { title: 'Bookings' } } });
    }
    if (!existingTitles.includes('Psychologists')) {
      requests.push({ addSheet: { properties: { title: 'Psychologists' } } });
    }
    if (!existingTitles.includes('CMS Config') && !existingTitles.includes('Pengaturan CMS')) {
      requests.push({ addSheet: { properties: { title: 'CMS Config' } } });
    }
    if (!existingTitles.includes('ChatUsers') && !existingTitles.includes('Pengguna AI Chat')) {
      requests.push({ addSheet: { properties: { title: 'ChatUsers' } } });
    }
    if (!existingTitles.includes('Admin Users') && !existingTitles.includes('Admins') && !existingTitles.includes('Pengelola Admin')) {
      requests.push({ addSheet: { properties: { title: 'Admin Users' } } });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: config.spreadsheetId,
        requestBody: { requests },
      });
    }

    // Set headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: 'Bookings!A1:N1',
      valueInputOption: 'RAW',
      requestBody: { values: [bookingHeaders] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: 'Psychologists!A1:R1',
      valueInputOption: 'RAW',
      requestBody: { values: [psychHeaders] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: 'CMS Config!A1:C1',
      valueInputOption: 'RAW',
      requestBody: { values: [['Kategori', 'Kunci_Properti', 'Nilai_Teks_Atau_URL']] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: 'ChatUsers!A1:H1',
      valueInputOption: 'RAW',
      requestBody: { values: [chatUserHeaders] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: 'Admin Users!A1:E1',
      valueInputOption: 'RAW',
      requestBody: { values: [adminHeaders] },
    });

    // Seed initial default admin row if sheet is empty
    try {
      const adminRowsRes = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: 'Admin Users!A2:E2',
      });
      if (!adminRowsRes.data.values || adminRowsRes.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: config.spreadsheetId,
          range: 'Admin Users!A2:E3',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              ['admin@sapahati.com', 'admin123', 'Super Admin Sapahati', 'Super Admin', 'Aktif'],
              ['admin', 'admin123', 'Super Admin Sapahati', 'Super Admin', 'Aktif'],
            ],
          },
        });
      }
    } catch (seedErr) {
      console.warn('Notice seeding initial Admin Users:', seedErr);
    }
  } catch (err) {
    console.warn('Headers initialization notice:', err);
  }
}

export async function getBookingsFromSheet() {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) return [];

  try {
    const auth = getSheetsAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'Bookings!A2:P1000',
    });

    const rows = res.data.values || [];
    return rows.map((row) => ({
      id: row[0] || '',
      patientName: row[1] || '',
      patientAge: Number(row[2]) || 0,
      patientWhatsapp: row[3] || '',
      psychologistId: row[4] || '',
      psychologistName: row[5] || '',
      method: row[6] || 'chat',
      methodTitle: row[7] || '',
      timeSlot: row[8] || '',
      price: Number(row[9]) || 0,
      paymentReceiptName: row[10] || '',
      paymentReceiptUrl: row[11] || '',
      status: row[12] || 'pending',
      createdAt: row[13] || new Date().toISOString(),
      userId: row[14] || undefined,
      userEmail: row[15] || undefined,
    })).filter((b) => b.id);
  } catch (err) {
    console.warn('Fetch Bookings via Service Account Notice:', err);
    return [];
  }
}

export async function updateBookingsInSheet(bookings: any[]) {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) return;

  const auth = getSheetsAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  // Clear existing range first to ensure deleted rows are completely removed
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: config.spreadsheetId,
      range: 'Bookings!A2:P2000',
    });
  } catch (err) {
    console.warn('Notice clearing Bookings range:', err);
  }

  if (bookings.length === 0) return;

  const rows = bookings.map((b) => [
    b.id,
    b.patientName,
    b.patientAge,
    b.patientWhatsapp,
    b.psychologistId,
    b.psychologistName,
    b.method,
    b.methodTitle,
    b.timeSlot,
    b.price,
    b.paymentReceiptName || '',
    b.paymentReceiptUrl || '',
    b.status,
    b.createdAt,
    b.userId || '',
    b.userEmail || '',
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: `Bookings!A2:P${rows.length + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
}

export async function getPsychologistsFromSheet() {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) return [];

  try {
    const auth = getSheetsAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'Psychologists!A2:R1000',
    });

    const rows = res.data.values || [];
    return rows.map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
      title: row[2] || '',
      experienceYears: Number(row[3]) || 0,
      rating: Number(row[4]) || 5.0,
      reviewCount: Number(row[5]) || 0,
      avatar: row[6] || '',
      specialties: row[7] ? String(row[7]).split(',').map((s) => s.trim()) : [],
      prices: {
        chat: Number(row[8]) || 50000,
        video: Number(row[9]) || 100000,
        offline: Number(row[10]) || 200000,
      },
      bankAccount: {
        bankName: row[11] || 'BCA',
        accountNumber: row[12] || '',
        accountHolder: row[13] || '',
        qrisCodeUrl: row[14] || '',
      },
      whatsapp: row[15] || '081234567890',
      scheduleSlots: row[16] ? String(row[16]).split(';').map((s) => s.trim()) : [],
      available: row[17] !== 'false',
    })).filter((p) => p.id);
  } catch (err) {
    console.warn('Fetch Psychologists via Service Account Notice:', err);
    return [];
  }
}

export async function updatePsychologistsInSheet(psychologists: any[]) {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) return;

  const auth = getSheetsAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  // Clear existing range first to ensure deleted rows are completely removed
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: config.spreadsheetId,
      range: 'Psychologists!A2:R2000',
    });
  } catch (err) {
    console.warn('Notice clearing Psychologists range:', err);
  }

  if (psychologists.length === 0) return;

  const rows = psychologists.map((p) => {
    const qris = String(p.bankAccount?.qrisCodeUrl || '');
    // Ensure cell does not exceed Google Sheets 50,000 char limit
    const safeQris = qris.length > 48000 ? qris.substring(0, 48000) : qris;
    const avatar = String(p.avatar || '');
    const safeAvatar = avatar.length > 48000 ? avatar.substring(0, 48000) : avatar;

    return [
      p.id,
      p.name,
      p.title,
      p.experienceYears || 0,
      p.rating || 5.0,
      p.reviewCount || 0,
      safeAvatar,
      (p.specialties || []).join(', '),
      p.prices?.chat || 50000,
      p.prices?.video || 100000,
      p.prices?.offline || 200000,
      p.bankAccount?.bankName || 'BCA',
      p.bankAccount?.accountNumber || '',
      p.bankAccount?.accountHolder || '',
      safeQris,
      p.whatsapp || '',
      (p.scheduleSlots || []).join(';'),
      p.available ? 'true' : 'false',
    ];
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: `Psychologists!A2:R${rows.length + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
}

export async function getCmsConfigFromSheet() {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) return [];

  try {
    const auth = getSheetsAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'CMS Config!A2:C500',
    });

    return res.data.values || [];
  } catch (err) {
    console.warn('Fetch CMS Config via Service Account Notice:', err);
    return [];
  }
}

export async function updateCmsConfigInSheet(rows: string[][]) {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) return;

  const auth = getSheetsAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  // Ensure 'CMS Config' sheet tab exists first
  try {
    const sp = await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheetId });
    const existingTitles = sp.data.sheets?.map((s) => s.properties?.title) || [];
    if (!existingTitles.includes('CMS Config') && !existingTitles.includes('Pengaturan CMS')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: config.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'CMS Config',
                },
              },
            },
          ],
        },
      });
    }
  } catch (err) {
    console.warn('Notice ensuring CMS sheet:', err);
  }

  // Clear existing range first to ensure deleted rows are completely removed
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: config.spreadsheetId,
      range: 'CMS Config!A2:C2000',
    });
  } catch (err) {
    console.warn('Notice clearing CMS Config range:', err);
  }

  // Set headers row
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: 'CMS Config!A1:C1',
    valueInputOption: 'RAW',
    requestBody: { values: [['Kategori', 'Kunci_Properti', 'Nilai_Teks_Atau_URL']] },
  });

  if (rows.length === 0) return;

  const formattedRows = rows.map((r) => [r[0] || '', r[1] || '', r[2] || '']);

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: `CMS Config!A2:C${formattedRows.length + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: formattedRows },
  });
}

export interface ChatUserRecord {
  id: string;
  nama: string;
  usia: number;
  pertanyaanDigunakan: number;
  batasMaksimal: number;
  status: string;
  tanggalDibuat: string;
  terakhirBertanya: string;
  sheetRowIndex?: number;
}

// In-memory cache & fallback when Google Sheets is syncing or offline
const memoryChatUsers: ChatUserRecord[] = [];

export async function getChatUsersFromSheet(): Promise<ChatUserRecord[]> {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) {
    return memoryChatUsers;
  }

  try {
    const auth = getSheetsAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    let res;
    try {
      res = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: 'ChatUsers!A2:H1000',
      });
    } catch (rangeErr: any) {
      // If ChatUsers tab doesn't exist yet in Google Sheets, create headers & sheet tab then retry
      await ensureSheetHeaders();
      try {
        res = await sheets.spreadsheets.values.get({
          spreadsheetId: config.spreadsheetId,
          range: 'ChatUsers!A2:H1000',
        });
      } catch (retryErr) {
        return memoryChatUsers;
      }
    }

    const rows = res?.data?.values || [];
    const listFromSheet: ChatUserRecord[] = rows.map((row, idx) => ({
      id: row[0] || `usr_${idx}`,
      nama: (row[1] || '').trim(),
      usia: Number(row[2]) || 0,
      pertanyaanDigunakan: Number(row[3]) || 0,
      batasMaksimal: Number(row[4]) || 5,
      status: row[5] || 'Aktif',
      tanggalDibuat: row[6] || new Date().toISOString(),
      terakhirBertanya: row[7] || new Date().toISOString(),
      sheetRowIndex: idx + 2, // Row in Google Sheets (A2 is index 2)
    })).filter((u) => u.nama);

    // Sync memory directly with current Google Sheets rows
    memoryChatUsers.length = 0;
    memoryChatUsers.push(...listFromSheet);

    return memoryChatUsers;
  } catch (err) {
    return memoryChatUsers;
  }
}

export async function checkOrRegisterChatUserInSheet(nama: string, usia: number) {
  const namaClean = nama.trim();
  const usiaNum = Number(usia);

  const allUsers = await getChatUsersFromSheet();

  // Search case-insensitive name & exact age
  const existingIndex = allUsers.findIndex(
    (u) => u.nama.toLowerCase() === namaClean.toLowerCase() && u.usia === usiaNum
  );

  if (existingIndex >= 0) {
    const existingUser = allUsers[existingIndex];
    const canChat = existingUser.pertanyaanDigunakan < existingUser.batasMaksimal;
    const remainingQuestions = Math.max(0, existingUser.batasMaksimal - existingUser.pertanyaanDigunakan);

    return {
      exists: true,
      user: existingUser,
      canChat,
      remainingQuestions,
      message: canChat
        ? `Data ditemukan di database Spreadsheet! Sisa kuota pertanyaan: ${remainingQuestions}/5.`
        : `Data kamu (${existingUser.nama}, ${existingUser.usia} th) sudah terdaftar di database Spreadsheet dan telah mencapai batas maksimal 5/5 pertanyaan.`,
    };
  }

  // Create new user record
  const newRecord: ChatUserRecord = {
    id: `usr_${Date.now()}`,
    nama: namaClean,
    usia: usiaNum,
    pertanyaanDigunakan: 0,
    batasMaksimal: 5,
    status: 'Aktif',
    tanggalDibuat: new Date().toISOString(),
    terakhirBertanya: new Date().toISOString(),
  };

  memoryChatUsers.push(newRecord);

  // Write to Google Sheets if configured
  const config = loadSheetsConfig();
  if (config.serviceAccountJson && config.spreadsheetId) {
    try {
      const auth = getSheetsAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: auth as any });

      await ensureSheetHeaders();

      await sheets.spreadsheets.values.append({
        spreadsheetId: config.spreadsheetId,
        range: 'ChatUsers!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            newRecord.id,
            newRecord.nama,
            newRecord.usia,
            newRecord.pertanyaanDigunakan,
            newRecord.batasMaksimal,
            newRecord.status,
            newRecord.tanggalDibuat,
            newRecord.terakhirBertanya,
          ]],
        },
      });
    } catch (err) {
      console.warn('Failed to append ChatUser to Google Sheets:', err);
    }
  }

  return {
    exists: false,
    user: newRecord,
    canChat: true,
    remainingQuestions: 5,
    message: `Data kamu (${newRecord.nama}, ${newRecord.usia} th) telah berhasil dimasukkan ke database Spreadsheet. Kuota awal: 5/5 pertanyaan.`,
  };
}

export async function incrementChatUserQuestionInSheet(nama: string, usia: number) {
  const namaClean = nama.trim();
  const usiaNum = Number(usia);

  const allUsers = await getChatUsersFromSheet();

  const userIdx = allUsers.findIndex(
    (u) => u.nama.toLowerCase() === namaClean.toLowerCase() && u.usia === usiaNum
  );

  if (userIdx < 0) {
    // Auto-register if missing
    return checkOrRegisterChatUserInSheet(nama, usia);
  }

  const user = allUsers[userIdx];
  user.pertanyaanDigunakan = Math.min(5, user.pertanyaanDigunakan + 1);
  user.terakhirBertanya = new Date().toISOString();
  if (user.pertanyaanDigunakan >= user.batasMaksimal) {
    user.status = 'Batas Tercapai (5/5)';
  }

  memoryChatUsers[userIdx] = user;

  // Write update to Google Sheets
  const config = loadSheetsConfig();
  if (config.serviceAccountJson && config.spreadsheetId && user.sheetRowIndex) {
    try {
      const auth = getSheetsAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: auth as any });

      await sheets.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: `ChatUsers!A${user.sheetRowIndex}:H${user.sheetRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            user.id,
            user.nama,
            user.usia,
            user.pertanyaanDigunakan,
            user.batasMaksimal,
            user.status,
            user.tanggalDibuat,
            user.terakhirBertanya,
          ]],
        },
      });
    } catch (err) {
      console.warn('Failed updating ChatUser question count in Google Sheets:', err);
    }
  }

  return {
    user,
    questionsUsed: user.pertanyaanDigunakan,
    remainingQuestions: Math.max(0, user.batasMaksimal - user.pertanyaanDigunakan),
    isReachedLimit: user.pertanyaanDigunakan >= user.batasMaksimal,
  };
}

// ----------------------------------------------------
// ADMIN USERS SHEET INTEGRATION
// ----------------------------------------------------
export interface AdminUserRecord {
  email: string;
  password: string;
  name: string;
  role: string;
  status: string;
}

const memoryAdminUsers: AdminUserRecord[] = [
  {
    email: 'admin@sapahati.com',
    password: 'admin123',
    name: 'Super Admin Sapahati',
    role: 'Super Admin',
    status: 'Aktif',
  },
  {
    email: 'admin',
    password: 'admin123',
    name: 'Super Admin Sapahati',
    role: 'Super Admin',
    status: 'Aktif',
  },
];

export async function getAdminUsersFromSheet(): Promise<AdminUserRecord[]> {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) {
    return memoryAdminUsers;
  }

  try {
    const auth = getSheetsAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    let res;
    try {
      res = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: 'Admin Users!A2:E500',
      });
    } catch (rangeErr) {
      await ensureSheetHeaders();
      try {
        res = await sheets.spreadsheets.values.get({
          spreadsheetId: config.spreadsheetId,
          range: 'Admin Users!A2:E500',
        });
      } catch (retryErr) {
        return memoryAdminUsers;
      }
    }

    const rows = res?.data?.values || [];
    if (rows.length === 0) {
      await ensureSheetHeaders();
      return memoryAdminUsers;
    }

    const listFromSheet: AdminUserRecord[] = rows
      .map((row) => ({
        email: String(row[0] || '').trim(),
        password: String(row[1] || '').trim(),
        name: String(row[2] || 'Admin Sapahati').trim(),
        role: String(row[3] || 'Admin').trim(),
        status: String(row[4] || 'Aktif').trim(),
      }))
      .filter((a) => a.email);

    if (listFromSheet.length > 0) {
      memoryAdminUsers.length = 0;
      memoryAdminUsers.push(...listFromSheet);
    }

    return memoryAdminUsers;
  } catch (err) {
    console.warn('Fetch Admin Users via Service Account Notice:', err);
    return memoryAdminUsers;
  }
}

export async function updateAdminUsersInSheet(admins: AdminUserRecord[]) {
  const config = loadSheetsConfig();
  if (!config.serviceAccountJson || !config.spreadsheetId) {
    memoryAdminUsers.length = 0;
    memoryAdminUsers.push(...admins);
    return;
  }

  try {
    const auth = getSheetsAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    await ensureSheetHeaders();

    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: config.spreadsheetId,
        range: 'Admin Users!A2:E500',
      });
    } catch (clearErr) {
      console.warn('Notice clearing Admin Users range:', clearErr);
    }

    if (admins.length > 0) {
      const rows = admins.map((a) => [
        a.email,
        a.password,
        a.name || 'Admin Sapahati',
        a.role || 'Admin',
        a.status || 'Aktif',
      ]);

      await sheets.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: `Admin Users!A2:E${rows.length + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows },
      });
    }

    memoryAdminUsers.length = 0;
    memoryAdminUsers.push(...admins);
  } catch (err) {
    console.warn('Update Admin Users Error:', err);
  }
}

export async function verifyAdminLoginInSheet(emailInput: string, passwordInput: string) {
  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const cleanPass = (passwordInput || '').trim();

  const admins = await getAdminUsersFromSheet();

  const found = admins.find(
    (a) => a.email.trim().toLowerCase() === cleanEmail && a.password.trim() === cleanPass
  );

  if (!found || (found.status && found.status.toLowerCase() === 'nonaktif')) {
    return {
      success: false,
      message: 'Email atau Password Salah.',
    };
  }

  return {
    success: true,
    message: 'Login berhasil!',
    admin: {
      email: found.email,
      name: found.name,
      role: found.role,
    },
  };
}


