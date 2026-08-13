import React, { useEffect, useState } from 'react';
import {
  initGoogleAuth,
  saveServiceAccountConfig,
  getSyncState,
  subscribeSyncState,
  SyncState,
} from '../../services/googleSheets';
import { syncWithGoogleSheetsNow, resetLocalData } from '../../data/psychologistStore';
import {
  Database,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileCode,
  Copy,
  Check,
  X,
  Upload,
  Trash2,
} from 'lucide-react';

export const GoogleSheetsSyncBar: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Form inputs for Service Account
  const [jsonInput, setJsonInput] = useState('');
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    initGoogleAuth();
    const unsubscribe = subscribeSyncState((st) => {
      setSyncState(st);
      if (st.spreadsheetId && !spreadsheetIdInput) {
        setSpreadsheetIdInput(st.spreadsheetId);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    await syncWithGoogleSheetsNow();
    setTimeout(() => setIsSyncingManual(false), 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonInput(content);
        setFormError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!jsonInput.trim()) {
      setFormError('Silakan tempel atau unggah file JSON Service Account Google Cloud Anda.');
      return;
    }

    if (!spreadsheetIdInput.trim()) {
      setFormError('Silakan masukkan Spreadsheet ID atau URL Google Spreadsheet Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveServiceAccountConfig(jsonInput, spreadsheetIdInput);
      await syncWithGoogleSheetsNow();
      setShowConfigModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal terhubung ke Google Spreadsheet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Helper to extract email from json input preview
  let detectedEmail = syncState.clientEmail || '';
  if (!detectedEmail && jsonInput) {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.client_email) detectedEmail = parsed.client_email;
    } catch (e) {
      // ignore
    }
  }

  return (
    <>
      <div className="w-full bg-[#120B2E] border-b border-[#261754] text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Left: Status info */}
          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 font-bold text-purple-300 text-xs shrink-0">
              <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="hidden xs:inline sm:inline">Google Sheets DB:</span>
              <span className="xs:hidden sm:hidden">Sheets DB:</span>
            </div>

            {syncState.status === 'connected' ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  Terhubung
                </span>
                {syncState.lastSyncedAt && (
                  <span className="text-purple-200/60 text-[10px] hidden md:inline">
                    Sync: {syncState.lastSyncedAt.toLocaleTimeString()}
                  </span>
                )}
              </div>
            ) : syncState.status === 'connecting' ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                Memverifikasi...
              </span>
            ) : syncState.status === 'error' ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 max-w-[200px] sm:max-w-none truncate">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{syncState.errorMessage || 'Belum Dikonfigurasi'}</span>
                </span>
              </div>
            ) : (
              <span className="text-purple-200/60 text-[10px] sm:text-[11px]">
                Belum Terhubung
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {syncState.status === 'connected' && syncState.spreadsheetUrl && (
              <a
                href={syncState.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-[#6C47FF] hover:bg-[#5835FF] text-white font-bold rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Spreadsheet</span>
              </a>
            )}

            {syncState.status === 'connected' && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncingManual}
                className="px-2.5 py-1 bg-[#22144B] hover:bg-[#2B1A5E] text-purple-100 border border-[#38227B] font-bold rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingManual ? 'animate-spin text-purple-300' : ''}`} />
                <span>Sync</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bersihkan semua data simpanan lokal (Local Storage) agar tidak ada data dumi tersisa?')) {
                  resetLocalData();
                }
              }}
              title="Hapus data dumi lokal"
              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] flex items-center gap-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">Bersihkan Data Dumi</span>
              <span className="sm:hidden">Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-2.5 py-1 bg-[#6C47FF] hover:bg-[#5835FF] text-white font-bold rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <KeyRound className="w-3 h-3" />
              <span>{syncState.status === 'connected' ? 'Ubah JSON' : 'Atur JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CONFIGURATION SERVICE ACCOUNT */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#0A061B]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#180E3B] border border-[#2B1B61] text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 p-2 text-purple-300 hover:text-white bg-[#261754] rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Atur Service Account Google Cloud</h3>
                <p className="text-purple-200/70 text-xs">
                  Hubungkan Google Spreadsheet menggunakan Service Account Key JSON tanpa perlu login OAuth browser.
                </p>
              </div>
            </div>

            {/* Instruction Steps */}
            <div className="bg-[#10092B]/80 rounded-2xl p-4 border border-[#2B1B61] mb-5 space-y-2.5 text-xs text-purple-100">
              <span className="font-bold text-purple-300 block uppercase tracking-wider text-[10px]">
                📌 Langkah Cepat Menghubungkan:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-purple-200/90">
                <li>Buka file Google Spreadsheet yang ingin Anda gunakan.</li>
                <li>
                  Klik tombol <strong className="text-white">Bagikan / Share</strong> di Google Spreadsheet.
                </li>
                <li>
                  Tambahkan email Service Account ini sebagai <strong className="text-purple-300">Editor (Penyunting)</strong>:
                </li>
              </ol>

              {detectedEmail ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-[#180E3B] rounded-xl border border-purple-500/30 text-purple-300 font-mono text-[11px] mt-1">
                  <span className="truncate">{detectedEmail}</span>
                  <button
                    type="button"
                    onClick={() => copyEmailToClipboard(detectedEmail)}
                    className="px-2 py-1 bg-teal-500 text-slate-950 font-bold rounded-lg hover:bg-teal-400 flex items-center gap-1 text-[10px] shrink-0"
                  >
                    {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? 'Tersalin' : 'Salin Email'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic bg-slate-900/50 p-2 rounded-xl">
                  (Email Service Account akan otomatis muncul di sini setelah Anda menempelkan isi JSON di bawah)
                </p>
              )}
            </div>

            <form onSubmit={handleConfigSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Input Spreadsheet ID / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. Spreadsheet ID atau URL Google Spreadsheet
                </label>
                <input
                  type="text"
                  placeholder="Contoh: https://docs.google.com/spreadsheets/d/1A2b3C.../edit atau ID saja"
                  value={spreadsheetIdInput}
                  onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-hidden focus:border-teal-400"
                  required
                />
              </div>

              {/* Upload or Paste JSON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-purple-200">
                    2. Script / Isi JSON Service Account Key
                  </label>
                  <label className="text-[11px] text-purple-300 hover:underline cursor-pointer flex items-center gap-1 font-bold">
                    <Upload className="w-3 h-3" />
                    <span>Unggah file .json</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={6}
                  placeholder='Tempelkan isi file JSON di sini. Contoh:
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "..."
}'
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#10092B] border border-[#2B1B61] rounded-xl text-purple-200 font-mono text-[11px] focus:outline-hidden focus:border-[#6C47FF] leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-[#261754] hover:bg-[#311E6A] text-purple-200 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#6C47FF] hover:bg-[#5835FF] text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-600/30"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifikasi & Menghubungkan...</span>
                    </>
                  ) : (
                    <span>Simpan & Test Koneksi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
