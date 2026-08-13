import { MoodEntry } from '../types';

const STORAGE_KEY = 'sapahati_mood_history_v1';

const INITIAL_MOOD_HISTORY: MoodEntry[] = [
  {
    id: '1',
    date: 'Kemarin, 20:00 WIB',
    mood: 'baik',
    note: 'Berhasil menyelesaikan deadline pekerjaan tepat waktu dan jalan sore sejenak.',
  },
  {
    id: '2',
    date: '2 Hari lalu',
    mood: 'cemas',
    note: 'Merasa kurang tidur karena memikirkan beban tugas minggu depan.',
  }
];

export const getMoodHistory = (): MoodEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOOD_HISTORY));
      return INITIAL_MOOD_HISTORY;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load mood history from localStorage:', err);
    return INITIAL_MOOD_HISTORY;
  }
};

export const saveMoodEntry = (mood: MoodEntry['mood'], note: string, factors: string[] = []): MoodEntry => {
  const current = getMoodHistory();
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const formattedNote = factors.length > 0 
    ? `[Faktor: ${factors.join(', ')}] ${note}`.trim()
    : note;

  const newEntry: MoodEntry = {
    id: Date.now().toString(),
    date: `Hari Ini, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    mood,
    note: formattedNote || 'Catatan mood harian tersimpan.',
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save mood entry:', err);
  }
  return newEntry;
};

export const deleteMoodEntry = (id: string): MoodEntry[] => {
  const current = getMoodHistory();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete mood entry:', err);
  }
  return updated;
};

export const clearMoodHistory = (): MoodEntry[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear mood history:', err);
  }
  return [];
};
