# Sapahati - Platform Layanan Kesehatan Mental & Konsultasi Psikolog Online

**Sapahati** (*Peduli • Dengar • Tumbuh*) adalah platform layanan kesehatan mental inklusif dan terpadu yang menyediakan bantuan emosional, konsultasi psikolog profesional, tes kepribadian, serta pencatatan suasana hati secara online.

---

## 🌟 Fitur Utama

### 1. 💜 Sesi Curhat (Teman Sapa)
- Pendamping emosional 24/7 yang hangat, ramah, dan bebas dari penghakiman.
- Memberikan validasi emosi dan respon yang menenangkan.
- Terintegrasi dengan **Server-Side Gemini API** (`@google/genai`) menggunakan model `gemini-2.5-flash`.

### 2. 👩‍⚕️ Konsultasi Psikolog Profesional
- Direktori psikolog terverifikasi dengan spesialisasi beragam (Kecemasan, Depresi, Hubungan, Karir, dll).
- Pemilihan mode sesi yang fleksibel: **Chat**, **Video Call**, atau **Tatap Muka**.
- Pemilihan jam praktik yang terintegrasi secara real-time dengan Dashboard Psikolog.

### 3. 💳 Pembayaran & Konfirmasi 2 Mode
- **Mode 1 (Unggah File di Web)**: Pasien dapat mengunggah bukti transfer/QRIS langsung melalui formulir pendaftaran di website.
- **Mode 2 (Kirim via WA Admin)**: Pasien dapat langsung mengirimkan bukti pembayaran & rincian pendaftaran otomatis ke WhatsApp Admin (`+6281298765432`) dengan satu klik.

### 4. 🧠 Psikotes & Tes Kepribadian
- Kuis penilaian diri interaktif untuk mengenali kondisi kecemasan, tingkat stres, dan gaya komunikasi emosional.
- Hasil kuis instan beserta saran langkah preventif dan rekomendasi sesi konsultasi.

### 5. 📝 Mood Tracker & Jurnal Emosi
- Pencatatan suasana hati harian pengguna.
- Pemantauan grafik perkembangan emosi dari waktu ke waktu.

### 6. 🤝 Pendaftaran Mitra Psikolog
- Portal registrasi bagi psikolog profesional yang ingin bergabung memperluas jangkauan layanan kesehatan mental di Indonesia.

### 7. ⚙️ Dashboard Management & CMS
- Panel kontrol lengkap untuk mengelola jadwal konsultasi, data pesanan, mitra psikolog, dan konten dinamis.
- Terintegrasi dengan penyimpanan Google Sheets untuk manajemen data terpusat.

---

## 🛠️ Teknologi & Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Motion (`motion/react`)
- **Backend**: Node.js, Express, Google Gen AI SDK (`@google/genai`)
- **Dev & Build System**: Express Middleware + Vite (Development) & bundling CJS dengan `esbuild` (Production)
- **Penyimpanan Data**: Google Sheets API Integration

---

## 🔒 Variabel Lingkungan (.env)

Aplikasi ini menggunakan variabel lingkungan berikut yang didefinisikan pada `.env.example`:

| Variabel | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-Side Secret | API Key Google Gemini AI untuk layanan Teman Sapa |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Server-Side Secret | Kredensial JSON Service Account Google Sheets |
| `GOOGLE_SPREADSHEET_ID` | Server-Side Secret | ID Spreadsheet Google Sheets untuk penyimpanan database |
| `VITE_ADMIN_USERNAME` | Public (Client) | Username login Dashboard Admin (default: `admin`) |
| `VITE_ADMIN_PASSWORD` | Public (Client) | Password login Dashboard Admin (default: `admin123`) |

Untuk mengonfigurasi di lingkungan lokal, salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

---

## 🚀 Panduan Jalankan Aplikasi

### 1. Instalasi Dependencies
```bash
npm install
```

### 2. Mode Pengembangan (Development)
```bash
npm run dev
```
Aplikasi akan berjalan pada `http://localhost:3000`.

### 3. Build & Jalankan Produksi
```bash
# Kompilasi aplikasi & server
npm run build

# Jalankan server produksi
npm start
```

---

## 📄 Lisensi

Hak Cipta © 2026 **Sapahati**. Seluruh hak cipta dilindungi undang-undang.
