import { BookingSession, Psychologist, BookingStatus } from '../types';

export interface SyncState {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  clientEmail: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastSyncedAt: Date | null;
  errorMessage: string | null;
}

let syncState: SyncState = {
  spreadsheetId: null,
  spreadsheetUrl: null,
  clientEmail: null,
  status: 'disconnected',
  lastSyncedAt: null,
  errorMessage: null,
};

type SyncListener = (state: SyncState) => void;
const listeners: SyncListener[] = [];

export function subscribeSyncState(listener: SyncListener) {
  listeners.push(listener);
  listener(syncState);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function updateSyncState(partial: Partial<SyncState>) {
  syncState = { ...syncState, ...partial };
  listeners.forEach((fn) => fn(syncState));
}

export function getSyncState(): SyncState {
  return syncState;
}

// Check status from server on startup
export async function initGoogleAuth(): Promise<SyncState> {
  updateSyncState({ status: 'connecting', errorMessage: null });
  try {
    const res = await fetch('/api/sheets/status');
    const data = await res.json();

    if (data.connected) {
      updateSyncState({
        status: 'connected',
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl,
        clientEmail: data.clientEmail,
        lastSyncedAt: new Date(),
        errorMessage: null,
      });
    } else {
      updateSyncState({
        status: 'disconnected',
        clientEmail: data.clientEmail || null,
        spreadsheetId: data.spreadsheetId || null,
        errorMessage: data.message || null,
      });
    }
  } catch (err: any) {
    updateSyncState({
      status: 'error',
      errorMessage: 'Gagal terhubung ke server backend Sapahati.',
    });
  }

  return syncState;
}

// Save Service Account Configuration via Server
export async function saveServiceAccountConfig(
  serviceAccountJsonInput: string | any,
  spreadsheetIdInput: string
): Promise<SyncState> {
  updateSyncState({ status: 'connecting', errorMessage: null });

  let parsedJson = serviceAccountJsonInput;
  if (typeof serviceAccountJsonInput === 'string') {
    try {
      parsedJson = JSON.parse(serviceAccountJsonInput.trim());
    } catch (e) {
      const err = 'Format JSON Service Account tidak valid. Pastikan Anda menempelkan seluruh isi file JSON.';
      updateSyncState({ status: 'error', errorMessage: err });
      throw new Error(err);
    }
  }

  try {
    const res = await fetch('/api/sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceAccountJson: parsedJson,
        spreadsheetId: spreadsheetIdInput.trim(),
      }),
    });

    const data = await res.json();

    if (res.ok && data.connected) {
      updateSyncState({
        status: 'connected',
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl,
        clientEmail: data.clientEmail,
        lastSyncedAt: new Date(),
        errorMessage: null,
      });
      return syncState;
    } else {
      const msg = data.message || 'Gagal memverifikasi koneksi Google Spreadsheet.';
      updateSyncState({
        status: 'error',
        clientEmail: data.clientEmail || parsedJson?.client_email || null,
        spreadsheetId: spreadsheetIdInput,
        errorMessage: msg,
      });
      throw new Error(msg);
    }
  } catch (err: any) {
    const msg = err.message || 'Gagal menyimpan konfigurasi Service Account.';
    updateSyncState({ status: 'error', errorMessage: msg });
    throw new Error(msg);
  }
}

// Fetch all Bookings from Google Sheets via server
export async function fetchBookingsFromSheets(): Promise<BookingSession[]> {
  try {
    const res = await fetch('/api/sheets/bookings');
    if (!res.ok) return [];

    const data = await res.json();
    const bookings: BookingSession[] = (data.bookings || []).map((b: any) => ({
      ...b,
      method: b.method as any,
      status: b.status as BookingStatus,
    }));

    updateSyncState({ status: 'connected', lastSyncedAt: new Date() });
    return bookings;
  } catch (err) {
    console.warn('Notice fetching bookings from server:', err);
    return [];
  }
}

// Push Bookings to Google Sheets via server
export async function pushBookingsToSheets(bookings: BookingSession[]): Promise<boolean> {
  try {
    const res = await fetch('/api/sheets/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookings }),
    });

    if (res.ok) {
      updateSyncState({ status: 'connected', lastSyncedAt: new Date(), errorMessage: null });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Notice pushing bookings to server:', err);
    return false;
  }
}

// Fetch Psychologists from Google Sheets via server
export async function fetchPsychologistsFromSheets(): Promise<Psychologist[]> {
  try {
    const res = await fetch('/api/sheets/psychologists');
    if (!res.ok) return [];

    const data = await res.json();
    const psychologists: Psychologist[] = data.psychologists || [];

    updateSyncState({ status: 'connected', lastSyncedAt: new Date() });
    return psychologists;
  } catch (err) {
    console.warn('Notice fetching psychologists from server:', err);
    return [];
  }
}

// Push Psychologists to Google Sheets via server
export async function pushPsychologistsToSheets(psychologists: Psychologist[]): Promise<boolean> {
  try {
    const res = await fetch('/api/sheets/psychologists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ psychologists }),
    });

    if (res.ok) {
      updateSyncState({ status: 'connected', lastSyncedAt: new Date(), errorMessage: null });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Notice pushing psychologists to server:', err);
    return false;
  }
}

// Push CMS Config Rows to Google Sheets via server
export async function pushCmsConfigToSheets(rows: string[][]): Promise<boolean> {
  try {
    const res = await fetch('/api/sheets/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });

    if (res.ok) {
      updateSyncState({ status: 'connected', lastSyncedAt: new Date(), errorMessage: null });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Push CMS Config Error:', err);
    return false;
  }
}

// Fetch CMS Config Rows from Google Sheets via server
export async function fetchCmsConfigFromSheets(): Promise<string[][]> {
  try {
    const res = await fetch('/api/sheets/cms');
    if (!res.ok) return [];

    const data = await res.json();
    return data.rows || [];
  } catch (err) {
    console.warn('Notice fetching CMS config from server:', err);
    return [];
  }
}

// ----------------------------------------------------
// ADMIN USERS SHEET FUNCTIONS
// ----------------------------------------------------
export interface AdminUser {
  email: string;
  password: string;
  name?: string;
  role?: string;
  status?: string;
}

export async function fetchAdminUsersFromSheets(): Promise<AdminUser[]> {
  try {
    const res = await fetch('/api/sheets/admins');
    if (!res.ok) return [];
    const data = await res.json();
    return data.admins || [];
  } catch (err) {
    console.warn('Notice fetching admin users from server:', err);
    return [];
  }
}

export async function pushAdminUsersToSheets(admins: AdminUser[]): Promise<boolean> {
  try {
    const res = await fetch('/api/sheets/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admins }),
    });

    if (res.ok) {
      updateSyncState({ status: 'connected', lastSyncedAt: new Date(), errorMessage: null });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Push Admin Users Error:', err);
    return false;
  }
}

export async function verifyAdminLoginInServer(email: string, password: string): Promise<{
  success: boolean;
  message: string;
  admin?: { email: string; name?: string; role?: string };
}> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Email atau Password Salah.',
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal menghubungi server untuk memverifikasi login admin.',
    };
  }
}

