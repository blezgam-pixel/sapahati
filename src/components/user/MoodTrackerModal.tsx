import React, { useState, useEffect } from 'react';
import { X, Smile, Frown, Meh, HeartPulse, Sparkles, Check, Trash2 } from 'lucide-react';
import { MoodEntry } from '../../types';
import { getMoodHistory, saveMoodEntry, deleteMoodEntry } from '../../data/moodStore';

interface MoodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOOD_OPTIONS = [
  { id: 'sangat_baik', label: 'Sangat Baik', emoji: '😄', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'baik', label: 'Baik', emoji: '😊', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'biasa', label: 'Biasa Saja', emoji: '😐', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'sedih', label: 'Sedih', emoji: '😔', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'cemas', label: 'Cemas / Stres', emoji: '😰', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

export const MoodTrackerModal: React.FC<MoodTrackerModalProps> = ({ isOpen, onClose }) => {
  const [selectedMood, setSelectedMood] = useState<string>('baik');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getMoodHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveMood = () => {
    saveMoodEntry(selectedMood as any, note);
    setHistory(getMoodHistory());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setNote('');
    }, 1500);
  };

  const handleDeleteMood = (id: string) => {
    const updated = deleteMoodEntry(id);
    setHistory(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Kenali Dirimu - Pantau Mood</h3>
            <p className="text-xs text-amber-100 mt-0.5">Catat suasana hatimu dan temukan pola emosi diri</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Bagaimana perasaanmu saat ini?
            </label>

            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMood(item.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                    selectedMood === item.id
                      ? `${item.color} border-2 shadow-sm scale-105 font-bold`
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-[10px] text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Singkat Perasaan (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Apa yang membuatmu merasa seperti ini hari ini?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 text-sm rounded-2xl border border-slate-200 focus:outline-hidden focus:border-amber-500 transition-all bg-slate-50/50"
            />
          </div>

          <button
            onClick={handleSaveMood}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                <span>Mood Berhasil Dicatat!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simpan Catatan Mood Hari Ini</span>
              </>
            )}
          </button>

          {/* Mood History Logs */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Riwayat Jurnal Mood
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                {history.length} Catatan
              </span>
            </div>

            <div className="space-y-2.5">
              {history.length === 0 ? (
                <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">Belum ada catatan mood.</p>
                </div>
              ) : (
                history.map((entry) => {
                  const opt = MOOD_OPTIONS.find((m) => m.id === entry.mood);
                  return (
                    <div
                      key={entry.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-2xl shrink-0">{opt?.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{opt?.label}</span>
                            <span className="text-[10px] text-slate-400">• {entry.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">{entry.note}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMood(entry.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                        title="Hapus Catatan Mood"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
