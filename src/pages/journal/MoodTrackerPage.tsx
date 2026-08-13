import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Sparkles, Check, Bookmark, HeartPulse, BookOpen, Trash2 } from 'lucide-react';
import { MoodEntry } from '../../types';
import { getMoodHistory, saveMoodEntry, deleteMoodEntry } from '../../data/moodStore';
import { Header } from '../../components/user/Header';
import { MobileHeader } from '../../components/user/MobileHeader';
import { MobileBottomNav } from '../../components/user/MobileBottomNav';
import { NavigationDrawer } from '../../components/user/NavigationDrawer';

interface MoodTrackerPageProps {
  onBackToHome: () => void;
  onOpenPsikolog: () => void;
  onOpenPsikotes: () => void;
  onStartCurhat: () => void;
  onOpenDashboard: () => void;
  onOpenJournal?: () => void;
  onOpenMitra?: () => void;
}

const MOOD_OPTIONS = [
  { id: 'sangat_baik', label: 'Sangat Baik', emoji: '😄', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'baik', label: 'Baik', emoji: '😊', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'biasa', label: 'Biasa Saja', emoji: '😐', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'sedih', label: 'Sedih', emoji: '😔', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'cemas', label: 'Cemas / Stres', emoji: '😰', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

const FACTORS = [
  'Pekerjaan / Tugas',
  'Hubungan & Asmara',
  'Kualitas Tidur',
  'Keluarga',
  'Kesehatan Fisik',
  'Keuangan',
  'Cuaca',
];

export const MoodTrackerPage: React.FC<MoodTrackerPageProps> = ({
  onBackToHome,
  onOpenPsikolog,
  onOpenPsikotes,
  onStartCurhat,
  onOpenDashboard,
  onOpenJournal,
  onOpenMitra,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('baik');
  const [selectedFactors, setSelectedFactors] = useState<string[]>(['Pekerjaan / Tugas']);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [history, setHistory] = useState<MoodEntry[]>(() => getMoodHistory());

  useEffect(() => {
    setHistory(getMoodHistory());
  }, []);

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter(f => f !== factor));
    } else {
      setSelectedFactors([...selectedFactors, factor]);
    }
  };

  const handleSaveMood = () => {
    saveMoodEntry(selectedMood as any, note, selectedFactors);
    setHistory(getMoodHistory());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setNote('');
    }, 2000);
  };

  const handleDeleteMood = (id: string) => {
    const updated = deleteMoodEntry(id);
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D123B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-purple-200 overflow-x-hidden w-full pb-24 md:pb-10">
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header
          onOpenNav={() => setIsNavOpen(true)}
          onStartCurhat={onStartCurhat}
          onOpenPsikolog={onOpenPsikolog}
          onOpenDashboard={onOpenDashboard}
          onOpenMoodTracker={onOpenJournal}
          onOpenPsikotes={onOpenPsikotes}
          onGoHome={onBackToHome}
        />
      </div>

      {/* Mobile Top Header */}
      <div className="block md:hidden">
        <MobileHeader onGoHome={onBackToHome} onOpenNav={() => setIsNavOpen(true)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-20 px-3 sm:px-4 max-w-3xl mx-auto w-full space-y-4">
        
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-[#6C47FF] p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full w-fit">
              <BookOpen className="w-3 h-3" /> Jurnal Refleksi Diri
            </div>
            <h1 className="text-base sm:text-lg font-black leading-snug">
              Bagaimana perasaamu hari ini?
            </h1>
            <p className="text-xs text-purple-100">
              Mengenali dan mencatat suasana hati membantumu mengelola kesehatan emosional.
            </p>
          </div>
        </div>

        {/* Mood Form Box */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-purple-100 shadow-2xs space-y-5">
          
          {/* Mood Options Grid */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#1D123B] block">
              1. Pilih Suasana Hati
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {MOOD_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMood(item.id)}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedMood === item.id
                      ? `${item.color} border-2 shadow-sm scale-105 font-bold`
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl mb-1">{item.emoji}</span>
                  <span className="text-[9.5px] sm:text-[11px] text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Factors Chips */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#1D123B] block">
              2. Faktor yang Mempengaruhi Mood
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FACTORS.map((factor) => {
                const isSelected = selectedFactors.includes(factor);
                return (
                  <button
                    key={factor}
                    onClick={() => toggleFactor(factor)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6C47FF] text-white shadow-2xs'
                        : 'bg-purple-50 text-purple-800 border border-purple-100 hover:bg-purple-100'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {factor}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Journal Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#1D123B] block">
              3. Catatan Jurnal Hari Ini
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ceritakan peristiwa atau perasaan yang ingin kamu simpan dalam jurnal..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 transition-all"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveMood}
            disabled={saved}
            className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform cursor-pointer ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#6C47FF] to-[#5034D4] text-white active:scale-[0.98]'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Jurnal Berhasil Disimpan!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simpan Catatan Mood</span>
              </>
            )}
          </button>
        </div>

        {/* History Stream */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#1D123B]">Riwayat Catatan Mood Saya</h2>
            <span className="text-[11px] font-medium text-slate-400">Total: {history.length} Catatan</span>
          </div>
          
          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-purple-200 space-y-1">
                <p className="text-xs font-semibold text-slate-500">Belum ada catatan mood yang tersimpan.</p>
                <p className="text-[11px] text-slate-400">Silakan pilih suasana hati dan simpan catatan pertamamu di atas.</p>
              </div>
            ) : (
              history.map((entry) => {
                const moodObj = MOOD_OPTIONS.find((m) => m.id === entry.mood) || MOOD_OPTIONS[1];
                return (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-white rounded-2xl border border-purple-100 shadow-2xs flex items-start gap-3 group transition-all hover:border-purple-200"
                  >
                    <div className="text-2xl p-2 rounded-xl bg-purple-50 shrink-0">
                      {moodObj.emoji}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1D123B]">{moodObj.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{entry.date}</span>
                          <button
                            onClick={() => handleDeleteMood(entry.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Catatan Mood"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {entry.note}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onGoHome={onBackToHome}
        onStartCurhat={onStartCurhat}
        onOpenPsikolog={onOpenPsikolog}
        onOpenDashboard={onOpenDashboard}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onOpenPsikotes={onOpenPsikotes}
      />

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav
        activeTab="journal"
        onGoHome={onBackToHome}
        onOpenJournal={() => {}}
        onOpenMitra={onOpenMitra}
        onOpenPsikolog={onOpenPsikolog}
        onStartCurhat={onStartCurhat}
        onOpenPsikotes={onOpenPsikotes}
        onOpenNav={onBackToHome}
      />
    </div>
  );
};
