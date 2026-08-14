import { Psychologist, BookingSession, BookingStatus } from '../types';
import {
  pushBookingsToSheets,
  pushPsychologistsToSheets,
  fetchBookingsFromSheets,
  fetchPsychologistsFromSheets,
  fetchCmsConfigFromSheets,
  subscribeSyncState,
  getSyncState,
} from '../services/googleSheets';
import { importCmsConfigRows } from './cmsStore';

export const INITIAL_PSYCHOLOGISTS: Psychologist[] = [];

export const INITIAL_BOOKINGS: BookingSession[] = [];

// Local storage keys
const PSYCHOLOGISTS_KEY = 'sapahati_psychologists';
const BOOKINGS_KEY = 'sapahati_bookings';

export function getPsychologists(): Psychologist[] {
  try {
    const data = localStorage.getItem(PSYCHOLOGISTS_KEY);
    if (!data) {
      return INITIAL_PSYCHOLOGISTS;
    }
    const parsed: Psychologist[] = JSON.parse(data);
    // Remove old dummy default data from local cache if present
    const cleaned = parsed.filter(
      (p) => !['psych_1', 'psych_2', 'psych_3'].includes(p.id)
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return INITIAL_PSYCHOLOGISTS;
  }
}

export function savePsychologist(newPsych: Omit<Psychologist, 'id'>): Psychologist {
  const current = getPsychologists();
  const created: Psychologist = {
    ...newPsych,
    id: 'psych_' + Date.now(),
  };
  const updated = [created, ...current];
  localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify(updated));
  notifyListeners();
  
  // Sync to Google Sheets
  pushPsychologistsToSheets(updated);
  return created;
}

export function deletePsychologist(psychologistId: string): boolean {
  const current = getPsychologists();
  const updated = current.filter((p) => p.id !== psychologistId);
  localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify(updated));
  notifyListeners();

  // Sync to Google Sheets
  pushPsychologistsToSheets(updated);
  return true;
}

export function updatePsychologistSchedules(psychologistId: string, scheduleSlots: string[]): boolean {
  const current = getPsychologists();
  const idx = current.findIndex((p) => p.id === psychologistId);
  if (idx !== -1) {
    current[idx].scheduleSlots = scheduleSlots;
    localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify(current));
    notifyListeners();

    // Sync to Google Sheets
    pushPsychologistsToSheets(current);
    return true;
  }
  return false;
}

export function getBookings(): BookingSession[] {
  try {
    const data = localStorage.getItem(BOOKINGS_KEY);
    if (!data) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export async function createBooking(booking: Omit<BookingSession, 'id' | 'status' | 'createdAt'>): Promise<BookingSession> {
  const created: BookingSession = {
    ...booking,
    id: 'book_' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const state = getSyncState();

  if (state.status === 'connected' && state.spreadsheetId) {
    try {
      // Use atomic server-side append to prevent race conditions with concurrent bookings
      const res = await fetch('/api/sheets/bookings/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking: created }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local cache with the merged list returned by server
        if (Array.isArray(data.bookings)) {
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(data.bookings));
          notifyListeners();
          return created;
        }
      }
    } catch (err) {
      console.warn('Atomic append failed, falling back to local save:', err);
    }
  }

  // Fallback: offline mode or server error → save locally only
  const current = getBookings();
  const updated = [created, ...current];
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  notifyListeners();
  return created;
}

export function updateBookingStatus(bookingId: string, status: BookingStatus): boolean {
  const current = getBookings();
  const idx = current.findIndex((b) => b.id === bookingId);
  if (idx !== -1) {
    current[idx].status = status;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(current));
    notifyListeners();

    // Sync to Google Sheets
    pushBookingsToSheets(current);
    return true;
  }
  return false;
}

export function deleteBooking(bookingId: string): boolean {
  const current = getBookings();
  const updated = current.filter((b) => b.id !== bookingId);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  notifyListeners();

  // Sync to Google Sheets
  pushBookingsToSheets(updated);
  return true;
}

export function clearAllBookings(): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
  notifyListeners();

  // Sync to Google Sheets
  pushBookingsToSheets([]);
}

export function updatePsychologist(psychologistId: string, updatedFields: Partial<Psychologist>): boolean {
  const current = getPsychologists();
  const idx = current.findIndex((p) => p.id === psychologistId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updatedFields };
    localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify(current));
    notifyListeners();

    // Sync to Google Sheets
    pushPsychologistsToSheets(current);
    return true;
  }
  return false;
}

export function resetLocalData(): void {
  localStorage.removeItem(PSYCHOLOGISTS_KEY);
  localStorage.removeItem(BOOKINGS_KEY);
  notifyListeners();

  // Sync empty state to Google Sheets if connected
  const state = getSyncState();
  if (state.status === 'connected') {
    pushPsychologistsToSheets([]);
    pushBookingsToSheets([]);
  }
}

// Perform sync with Google Sheets (Read remote data, write local if empty)
export async function syncWithGoogleSheetsNow(isInitialSetup = false): Promise<void> {
  const state = getSyncState();
  if (state.status !== 'connected' || !state.spreadsheetId) return;

  try {
    // Fetch remote data from Google Sheets (READ)
    const remoteBookings = await fetchBookingsFromSheets();
    const remotePsychologists = await fetchPsychologistsFromSheets();
    const remoteCmsRows = await fetchCmsConfigFromSheets();

    const localBookings = getBookings();
    const localPsychologists = getPsychologists();

    if (Array.isArray(remoteBookings)) {
      if (remoteBookings.length === 0 && localBookings.length > 0 && isInitialSetup) {
        await pushBookingsToSheets(localBookings);
      } else {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(remoteBookings));
      }
    }

    if (Array.isArray(remotePsychologists)) {
      if (remotePsychologists.length === 0 && localPsychologists.length > 0 && isInitialSetup) {
        await pushPsychologistsToSheets(localPsychologists);
      } else {
        localStorage.setItem(PSYCHOLOGISTS_KEY, JSON.stringify(remotePsychologists));
      }
    }

    if (Array.isArray(remoteCmsRows) && remoteCmsRows.length > 0) {
      importCmsConfigRows(remoteCmsRows);
    }

    notifyListeners();
  } catch (err) {
    console.error('Sheets Sync Error:', err);
  }
}

// Simple pub/sub system for reactive UI updates
type Listener = () => void;
const listeners: Listener[] = [];

export function subscribeStore(listener: Listener) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

// Background polling for Realtime Google Sheets Sync every 12 seconds
let pollingInterval: any = null;

subscribeSyncState((state) => {
  if (state.status === 'connected' && state.spreadsheetId) {
    if (!pollingInterval) {
      // Initial sync with setup flag
      syncWithGoogleSheetsNow(true);
      // Start 12-second polling loop
      pollingInterval = setInterval(() => {
        syncWithGoogleSheetsNow(false);
      }, 12000);
    }
  } else {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }
});

