import React, { useState, useEffect } from 'react';
import { TransparentImage } from '../common/TransparentImage';
import {
  getCmsConfig,
  saveCmsConfig,
  resetCmsConfig,
  exportCmsConfigToCsv,
  exportCmsConfigRows,
  CmsConfig,
  SponsorItem,
  TestimonialItem,
} from '../../data/cmsStore';
import {
  pushCmsConfigToSheets,
  fetchCmsConfigFromSheets,
  fetchAdminUsersFromSheets,
  pushAdminUsersToSheets,
  AdminUser,
} from '../../services/googleSheets';
import {
  Save,
  RotateCcw,
  Upload,
  Download,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
  Heart,
  UserCheck,
  Building2,
  Smile,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  UserPlus,
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';

export const CmsAdminTab: React.FC = () => {
  const [config, setConfig] = useState<CmsConfig>(() => getCmsConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncSheetsSuccess, setSyncSheetsSuccess] = useState<string | null>(null);
  const [activeSubSection, setActiveSubSection] = useState<'branding' | 'sponsors' | 'cards' | 'quotes' | 'spreadsheet' | 'admins'>('branding');

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [adminSaveMessage, setAdminSaveMessage] = useState<string | null>(null);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('admin123');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Admin');

  useEffect(() => {
    loadAdminsFromSheets();
  }, []);

  const loadAdminsFromSheets = async () => {
    setIsLoadingAdmins(true);
    try {
      const list = await fetchAdminUsersFromSheets();
      setAdminUsers(list);
    } catch (err) {
      console.warn('Load admin users error:', err);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) {
      alert('Email dan Password admin wajib diisi.');
      return;
    }

    const emailClean = newAdminEmail.trim();
    if (adminUsers.some((a) => a.email.toLowerCase() === emailClean.toLowerCase())) {
      alert('Email admin ini sudah terdaftar!');
      return;
    }

    const updated = [
      ...adminUsers,
      {
        email: emailClean,
        password: newAdminPassword.trim(),
        name: newAdminName.trim() || 'Admin Sapahati',
        role: newAdminRole.trim() || 'Admin',
        status: 'Aktif',
      },
    ];

    setAdminUsers(updated);
    setNewAdminEmail('');
    setNewAdminPassword('admin123');
    setNewAdminName('');

    setIsLoadingAdmins(true);
    const ok = await pushAdminUsersToSheets(updated);
    setIsLoadingAdmins(false);
    if (ok) {
      setAdminSaveMessage('Admin baru berhasil didaftarkan ke sheet "Admin Users"!');
      setTimeout(() => setAdminSaveMessage(null), 4000);
    }
  };

  const handleDeleteAdminUser = async (emailToDelete: string) => {
    if (adminUsers.length <= 1) {
      alert('Terdapat minimal 1 admin terdaftar agar sistem tidak terkeleduk!');
      return;
    }
    if (!window.confirm(`Hapus akses admin untuk ${emailToDelete}?`)) return;

    const updated = adminUsers.filter((a) => a.email.toLowerCase() !== emailToDelete.toLowerCase());
    setAdminUsers(updated);

    setIsLoadingAdmins(true);
    const ok = await pushAdminUsersToSheets(updated);
    setIsLoadingAdmins(false);
    if (ok) {
      setAdminSaveMessage('Akses admin berhasil diperbarui di Google Sheets!');
      setTimeout(() => setAdminSaveMessage(null), 4000);
    }
  };

  const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1KbuBzd7EBMfisbgqDnscNyxy5RuioVKD7lq1Fg3pyQ8/edit?gid=1745853689#gid=1745853689';

  const handleSave = async () => {
    saveCmsConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    // Auto push to Google Sheets in background
    try {
      const rows = exportCmsConfigRows(config);
      await pushCmsConfigToSheets(rows);
    } catch (e) {
      console.warn('Auto sync to sheets failed:', e);
    }
  };

  const handleSyncToSheets = async () => {
    setIsSyncingSheets(true);
    setSyncSheetsSuccess(null);
    try {
      const rows = exportCmsConfigRows(config);
      const ok = await pushCmsConfigToSheets(rows);
      if (ok) {
        setSyncSheetsSuccess('Sheet baru "CMS Config" berhasil dibuat & diperbarui di Google Sheets!');
      } else {
        setSyncSheetsSuccess('Pembaruan dikirim ke Google Sheets API.');
      }
    } catch (err: any) {
      alert('Gagal mengirim data ke Google Sheets: ' + (err.message || 'Error'));
    } finally {
      setIsSyncingSheets(false);
      setTimeout(() => setSyncSheetsSuccess(null), 5000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan semua tampilan & kata/kalimat ke pengaturan awal (default)?')) {
      resetCmsConfig();
      setConfig(getCmsConfig());
    }
  };

  // Image Upload Helper
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onCompressed: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 300, 300, 0.7);
      onCompressed(compressed);
    } catch (err) {
      alert('Gagal memproses gambar. Pastikan format file berupa PNG/JPG.');
    }
  };

  // Download CSV Spreadsheet Format
  const handleDownloadCsv = () => {
    const csvContent = exportCmsConfigToCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sapahati_cms_database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner & Control Actions */}
      <div className="bg-gradient-to-r from-purple-900 via-[#1C1145] to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-lg border border-purple-500/20 space-y-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/25 border border-purple-400/30 text-purple-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pengaturan Tampilan &amp; Database Spreadsheet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            CMS Pengelola Tampilan &amp; Konten Website
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-4xl leading-relaxed">
            Atur seluruh kata/kalimat, gambar logo, hero, banner, sponsor, card layanan, tes kepribadian, ulasan pasien, motivasi psikolog, hingga nomor WhatsApp secara fleksibel.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="pt-3 border-t border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Buka Google Sheets di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span>Buka Google Sheets</span>
            </a>

            <button
              onClick={handleSyncToSheets}
              disabled={isSyncingSheets}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Sinkronkan sheet baru 'CMS Config' ke Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheets ? 'Menyinkronkan...' : 'Sync Google Sheets'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="Download database tampilan dalam format CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#6C47FF] hover:bg-[#5833E0] text-white font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Berhasil menyimpan perubahan tampilan ke database lokal dan mengirim pembaruan ke Google Sheets!</span>
        </div>
      )}

      {syncSheetsSuccess && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
          <span>{syncSheetsSuccess}</span>
        </div>
      )}

      {/* Sub-Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveSubSection('branding')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubSection === 'branding'
              ? 'bg-[#6C47FF] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Logo, Judul Logo &amp; Kontak</span>
        </button>

        <button
          onClick={() => setActiveSubSection('sponsors')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubSection === 'sponsors'
              ? 'bg-[#6C47FF] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Sponsor &amp; Mitra Ticker</span>
        </button>

        <button
          onClick={() => setActiveSubSection('cards')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubSection === 'cards'
              ? 'bg-[#6C47FF] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Cards &amp; Banner Utamanya</span>
        </button>

        <button
          onClick={() => setActiveSubSection('quotes')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubSection === 'quotes'
              ? 'bg-[#6C47FF] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Ulasan &amp; Pesan Motivasi</span>
        </button>

        <button
          onClick={() => setActiveSubSection('spreadsheet')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubSection === 'spreadsheet'
              ? 'bg-[#6C47FF] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Spreadsheet</span>
        </button>

        <button
          onClick={() => setActiveSubSection('admins')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubSection === 'admins'
              ? 'bg-[#6C47FF] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Pengelola Akses Admin (Sheet)</span>
        </button>
      </div>

      {/* 1. BRANDING, LOGO, JUDUL LOGO & KONTAK */}
      {activeSubSection === 'branding' && (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <span>Pengaturan Branding, Logo, &amp; Kontak WhatsApp</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Logo Image */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Foto Logo Website</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#f0f3f8] border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                  <TransparentImage src={config.branding.logoImage} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={config.branding.logoImage}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, logoImage: e.target.value },
                      })
                    }
                    placeholder="URL Logo (https://...)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (url) =>
                          setConfig({
                            ...config,
                            branding: { ...config.branding, logoImage: url },
                          })
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* App Icon / Favicon */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">App Icon / Favicon Browser</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#f0f3f8] border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                  <TransparentImage src={config.branding.appIcon} alt="App Icon" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={config.branding.appIcon}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, appIcon: e.target.value },
                      })
                    }
                    placeholder="URL App Icon"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Icon Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (url) =>
                          setConfig({
                            ...config,
                            branding: { ...config.branding, appIcon: url },
                          })
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Judul Logo / Brand Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Judul Logo (Nama Brand)</label>
              <input
                type="text"
                value={config.branding.brandName}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    branding: { ...config.branding, brandName: e.target.value },
                  })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Subtitle / Tagline */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Sub-Judul Logo (Tagline)</label>
              <input
                type="text"
                value={config.branding.brandSubtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    branding: { ...config.branding, brandSubtitle: e.target.value },
                  })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* WhatsApp Contact */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Nomor WhatsApp Kontak Admin &amp; Mitra Psikolog</span>
              </label>
              <input
                type="text"
                value={config.branding.contactWhatsapp}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    branding: { ...config.branding, contactWhatsapp: e.target.value },
                  })
                }
                placeholder="6281298765432"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 font-medium">
                Terkoneksi langsung ke Google Sheets (Row: Branding -&gt; contactWhatsapp) dan tombol WA Mitra Psikolog di web.
              </p>
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Email Resmi Kontak</label>
              <input
                type="email"
                value={config.branding.contactEmail}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    branding: { ...config.branding, contactEmail: e.target.value },
                  })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

          </div>
        </div>
      )}

      {/* 2. SPONSOR & MITRA TICKER */}
      {activeSubSection === 'sponsors' && (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Sponsor &amp; Mitra Logo Grid</span>
            </h3>

            <button
              onClick={() => {
                const newSponsor: SponsorItem = {
                  id: 's_' + Date.now(),
                  name: 'Sponsor Baru',
                  logoUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=120',
                };
                setConfig({ ...config, sponsors: [...config.sponsors, newSponsor] });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6C47FF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sponsor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.sponsors.map((sponsor, idx) => (
              <div key={sponsor.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group">
                <button
                  onClick={() => {
                    const updated = config.sponsors.filter((_, i) => i !== idx);
                    setConfig({ ...config, sponsors: updated });
                  }}
                  className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus Sponsor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {sponsor.logoUrl ? (
                      <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <input
                      type="text"
                      value={sponsor.name}
                      onChange={(e) => {
                        const updated = [...config.sponsors];
                        updated[idx].name = e.target.value;
                        setConfig({ ...config, sponsors: updated });
                      }}
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="Nama Sponsor"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">URL Logo Sponsor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sponsor.logoUrl}
                      onChange={(e) => {
                        const updated = [...config.sponsors];
                        updated[idx].logoUrl = e.target.value;
                        setConfig({ ...config, sponsors: updated });
                      }}
                      placeholder="https://..."
                      className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C47FF] text-[11px] font-bold cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e, (url) => {
                            const updated = [...config.sponsors];
                            updated[idx].logoUrl = url;
                            setConfig({ ...config, sponsors: updated });
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CARDS & BANNERS */}
      {activeSubSection === 'cards' && (
        <div className="space-y-6">
          
          {/* HERO SECTION EDITOR */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              <span>Gambar &amp; Kalimat Banner Hero Utama</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Judul Utama Hero</label>
                <textarea
                  rows={2}
                  value={config.hero.title}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Sub-Judul Hero</label>
                <textarea
                  rows={2}
                  value={config.hero.subtitle}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Text Tombol Utama</label>
                <input
                  type="text"
                  value={config.hero.primaryBtnText}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, primaryBtnText: e.target.value } })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Text Tombol Kedua</label>
                <input
                  type="text"
                  value={config.hero.secondaryBtnText}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, secondaryBtnText: e.target.value } })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">Foto / Ilustrasi Banner Hero Utama</label>
              <div className="flex items-center gap-4">
                <img src={config.hero.heroImage} alt="Hero" className="w-28 h-20 object-contain rounded-xl border p-1 bg-slate-50" />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={config.hero.heroImage}
                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heroImage: e.target.value } })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Gambar Hero</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (url) => setConfig({ ...config, hero: { ...config.hero, heroImage: url } }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* CARD "KAMI HADIR UNTUKMU" */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-3">
              Card &amp; Seksi "Kami Hadir Untukmu"
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Seksi</label>
                <input
                  type="text"
                  value={config.kamiHadir.sectionTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      kamiHadir: { ...config.kamiHadir, sectionTitle: e.target.value },
                    })
                  }
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Sub-Judul Seksi</label>
                <input
                  type="text"
                  value={config.kamiHadir.sectionSubtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      kamiHadir: { ...config.kamiHadir, sectionSubtitle: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {config.kamiHadir.items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 inline-block">
                    Card {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...config.kamiHadir.items];
                      updated[idx].title = e.target.value;
                      setConfig({ ...config, kamiHadir: { ...config.kamiHadir, items: updated } });
                    }}
                    className="w-full text-xs font-bold p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="Judul Card"
                  />
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...config.kamiHadir.items];
                      updated[idx].description = e.target.value;
                      setConfig({ ...config, kamiHadir: { ...config.kamiHadir, items: updated } });
                    }}
                    className="w-full text-[11px] p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="Deskripsi Card"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CARD "KAMU TIDAK SENDIRI" */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-3">
              Card &amp; Banner "Kamu Tidak Sendiri"
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Banner</label>
                <input
                  type="text"
                  value={config.kamuTidakSendiri.sectionTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      kamuTidakSendiri: { ...config.kamuTidakSendiri, sectionTitle: e.target.value },
                    })
                  }
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Banner</label>
                <input
                  type="text"
                  value={config.kamuTidakSendiri.sectionSubtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      kamuTidakSendiri: { ...config.kamuTidakSendiri, sectionSubtitle: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">URL Gambar Banner</label>
                <input
                  type="text"
                  value={config.kamuTidakSendiri.bannerImage || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      kamuTidakSendiri: { ...config.kamuTidakSendiri, bannerImage: e.target.value },
                    })
                  }
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* CARD "KUIS TIPE KEPRIBADIAN" */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-3">
              Card "Kuis Tipe Kepribadian"
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Headline Kuis</label>
                <input
                  type="text"
                  value={config.personalityQuiz.headline}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      personalityQuiz: { ...config.personalityQuiz, headline: e.target.value },
                    })
                  }
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Kuis</label>
                <input
                  type="text"
                  value={config.personalityQuiz.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      personalityQuiz: { ...config.personalityQuiz, description: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* BANNER "MITRA & KARIR PSIKOLOG" */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-3">
              Banner "Mitra &amp; Karir Psikolog"
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Banner Karir</label>
                <input
                  type="text"
                  value={config.mitraKarir.bannerTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      mitraKarir: { ...config.mitraKarir, bannerTitle: e.target.value },
                    })
                  }
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Text Tombol Kontak WA</label>
                <input
                  type="text"
                  value={config.mitraKarir.buttonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      mitraKarir: { ...config.mitraKarir, buttonText: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Banner Karir</label>
                <textarea
                  rows={2}
                  value={config.mitraKarir.bannerDescription}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      mitraKarir: { ...config.mitraKarir, bannerDescription: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. ULASAN & PESAN MOTIVASI */}
      {activeSubSection === 'quotes' && (
        <div className="space-y-6">
          
          {/* PESAN DARI TIM PSIKOLOG (BALON MOTIVASI) */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Gambar &amp; Pesan Motivasi dari Tim Psikolog</span>
            </h3>

            {/* Psikolog Kiri */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
              <span className="text-xs font-extrabold text-purple-900">Psikolog Kiri (Dengan Balon Kata)</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={config.motivationalPsychologists.leftName}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        leftName: e.target.value,
                      },
                    })
                  }
                  placeholder="Nama Psikolog Kiri"
                  className="text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  value={config.motivationalPsychologists.leftTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        leftTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Gelar & Spesialisasi"
                  className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Kata Motivasi di Dalam Balon Pesan</label>
                <textarea
                  rows={3}
                  value={config.motivationalPsychologists.leftQuote}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        leftQuote: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <img
                  src={config.motivationalPsychologists.leftPhoto}
                  alt="Foto Kiri"
                  className="w-12 h-12 rounded-xl object-cover border shrink-0 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={config.motivationalPsychologists.leftPhoto}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        leftPhoto: e.target.value,
                      },
                    })
                  }
                  placeholder="URL Foto (https://...)"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6C47FF] text-xs font-bold cursor-pointer transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(e, (url) =>
                        setConfig({
                          ...config,
                          motivationalPsychologists: {
                            ...config.motivationalPsychologists,
                            leftPhoto: url,
                          },
                        })
                      )
                    }
                  />
                </label>
              </div>
            </div>

            {/* Psikolog Kanan */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-3">
              <span className="text-xs font-extrabold text-teal-900">Psikolog Kanan</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={config.motivationalPsychologists.rightName}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        rightName: e.target.value,
                      },
                    })
                  }
                  placeholder="Nama Psikolog Kanan"
                  className="text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  value={config.motivationalPsychologists.rightTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        rightTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Gelar & Spesialisasi"
                  className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Pesan Singkat Psikolog Kanan</label>
                <textarea
                  rows={2}
                  value={config.motivationalPsychologists.rightQuote}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        rightQuote: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <img
                  src={config.motivationalPsychologists.rightPhoto}
                  alt="Foto Kanan"
                  className="w-12 h-12 rounded-xl object-cover border shrink-0 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={config.motivationalPsychologists.rightPhoto}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      motivationalPsychologists: {
                        ...config.motivationalPsychologists,
                        rightPhoto: e.target.value,
                      },
                    })
                  }
                  placeholder="URL Foto (https://...)"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 text-xs font-bold cursor-pointer transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(e, (url) =>
                        setConfig({
                          ...config,
                          motivationalPsychologists: {
                            ...config.motivationalPsychologists,
                            rightPhoto: url,
                          },
                        })
                      )
                    }
                  />
                </label>
              </div>
            </div>

          </div>

          {/* ULASAN "APA KATA MEREKA" */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Daftar Card Ulasan "Apa Kata Mereka"
              </h3>
              <button
                onClick={() => {
                  const newTesti: TestimonialItem = {
                    id: 't_' + Date.now(),
                    name: 'Pasien Baru',
                    role: 'Pengguna Sapahati',
                    service: 'Sesi Chat Psikolog',
                    comment: 'Sangat terbantu dengan konseling ini. Merasa lebih tenang dan lega.',
                    rating: 5,
                    date: 'Baru saja',
                    avatarBg: 'bg-teal-600 text-white',
                  };
                  setConfig({
                    ...config,
                    testimonials: {
                      ...config.testimonials,
                      items: [...config.testimonials.items, newTesti],
                    },
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-100 text-[#6C47FF] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ulasan</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.testimonials.items.map((item, idx) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                  <button
                    onClick={() => {
                      const updated = config.testimonials.items.filter((_, i) => i !== idx);
                      setConfig({
                        ...config,
                        testimonials: { ...config.testimonials, items: updated },
                      });
                    }}
                    className="absolute top-3 right-3 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...config.testimonials.items];
                        updated[idx].name = e.target.value;
                        setConfig({
                          ...config,
                          testimonials: { ...config.testimonials, items: updated },
                        });
                      }}
                      className="text-xs font-bold p-2 rounded-lg border bg-white"
                      placeholder="Nama Pasien"
                    />
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => {
                        const updated = [...config.testimonials.items];
                        updated[idx].role = e.target.value;
                        setConfig({
                          ...config,
                          testimonials: { ...config.testimonials, items: updated },
                        });
                      }}
                      className="text-xs p-2 rounded-lg border bg-white"
                      placeholder="Profesi/Peran"
                    />
                    <input
                      type="text"
                      value={item.service}
                      onChange={(e) => {
                        const updated = [...config.testimonials.items];
                        updated[idx].service = e.target.value;
                        setConfig({
                          ...config,
                          testimonials: { ...config.testimonials, items: updated },
                        });
                      }}
                      className="text-xs p-2 rounded-lg border bg-white"
                      placeholder="Layanan"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={item.comment}
                    onChange={(e) => {
                      const updated = [...config.testimonials.items];
                      updated[idx].comment = e.target.value;
                      setConfig({
                        ...config,
                        testimonials: { ...config.testimonials, items: updated },
                      });
                    }}
                    className="w-full text-xs p-2 rounded-lg border bg-white"
                    placeholder="Isi Ulasan"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 5. DATABASE SPREADSHEET */}
      {activeSubSection === 'spreadsheet' && (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Penyimpanan Database Spreadsheet &amp; Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Seluruh kata, kalimat, gambar, dan konfigurasi dapat disimpan dan diexport langsung ke spreadsheet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Action */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Export Database ke Spreadsheet (CSV)</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Unduh file spreadsheet berformat `.csv` yang berisi seluruh data logo, gambar, hero, banner, card, ulasan, dan nomor WhatsApp. File ini dapat langsung dibuka di Google Sheets atau Microsoft Excel.
              </p>
              <button
                onClick={handleDownloadCsv}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Spreadsheet CSV</span>
              </button>
            </div>

            {/* Info Google Sheets Direct Sync */}
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Database className="w-4 h-4 text-purple-700" />
                <span>Integrasi Direct Google Sheets API</span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                Aplikasi terhubung langsung dengan Google Sheets target. Klik tombol di bawah untuk membuat tab sheet baru <code className="bg-purple-200 text-purple-900 px-1 py-0.5 rounded font-mono font-bold">CMS Config</code> dan menyimpan seluruh data tampilan ke dalamnya.
              </p>
              
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  onClick={handleSyncToSheets}
                  disabled={isSyncingSheets}
                  className="py-2.5 px-4 rounded-xl bg-[#6C47FF] hover:bg-[#5833E0] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheets ? 'Menyinkronkan...' : 'Buat & Sync Sheet "CMS Config"'}</span>
                </button>

                <a
                  href={SPREADSHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-white border border-purple-300 text-purple-900 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                  <span>Buka Spreadsheet Google Docs</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-white border border-purple-200 text-[11px] text-purple-900 font-mono break-all">
                URL: {SPREADSHEET_URL}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. PENGELOLA AKSES ADMIN (GOOGLE SHEETS: Admin Users) */}
      {activeSubSection === 'admins' && (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Pengelola Admin (Sheet "Admin Users")
                </h3>
                <p className="text-xs text-slate-500">
                  Akses login dashboard hanya diberikan kepada email &amp; password yang terdaftar langsung di Google Spreadsheet ini.
                </p>
              </div>
            </div>

            <button
              onClick={loadAdminsFromSheets}
              disabled={isLoadingAdmins}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
              <span>Muat Ulang Data Sheet</span>
            </button>
          </div>

          {adminSaveMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{adminSaveMessage}</span>
            </div>
          )}

          {/* Add Admin Form */}
          <form onSubmit={handleAddAdminUser} className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
            <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>Tambah / Daftarkan Admin Baru Ke Spreadsheet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Admin *</label>
                <input
                  type="text"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@sapahati.com"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Password admin"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap Admin</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Siti Rahma, M.Psi"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Peran / Jabatan</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Psikolog Admin">Psikolog Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAdmins}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan &amp; Daftarkan ke Sheet "Admin Users"</span>
            </button>
          </form>

          {/* Admin Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Daftar Email Admin Aktif Terdaftar ({adminUsers.length})</span>
            </h4>

            {adminUsers.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                Belum ada admin terdaftar. Klik "Muat Ulang Data Sheet" atau tambahkan admin baru di atas.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Email Admin</th>
                      <th className="p-3">Password</th>
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3">Peran</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {adminUsers.map((a, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{a.email}</td>
                        <td className="p-3 font-mono text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {a.password}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{a.name || '-'}</td>
                        <td className="p-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                            {a.role || 'Admin'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            a.status?.toLowerCase() === 'nonaktif' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {a.status || 'Aktif'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteAdminUser(a.email)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Akses Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
