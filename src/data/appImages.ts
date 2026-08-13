/**
 * ============================================================================
 * FILE PENYIMPANAN GAMBAR & LOGO WEBSITE SAPAHATI
 * ============================================================================
 * Anda dapat mengganti logo, gambar hero, banner, avatar bot AI, dan icon 
 * tab browser secara langsung dengan mengubah nilai variabel di bawah ini.
 * 
 * CARA MENGGANTI GAMBAR:
 * Ganti nilai variabel dengan URL gambar Anda (misal: 'https://domain.com/logo.png')
 * atau dengan kode base64 / SVG data-uri.
 * ============================================================================
 */

import {
  DEFAULT_HERO_IMAGE,
  DEFAULT_BANNER_IMAGE,
  DEFAULT_LOGO,
  DEFAULT_BOT_AVATAR,
  DEFAULT_APP_ICON,
} from './defaultImages';

/** 1. LOGO WEBSITE (Ditampilkan pada Header Navbar dan Drawer Navigasi) */
export const LOGO_IMAGE: string = DEFAULT_LOGO;

/** 2. GAMBAR HERO UTAMA (Ditampilkan di bagian paling atas beranda) */
export const HERO_IMAGE: string = DEFAULT_HERO_IMAGE;

/** 3. GAMBAR BANNER SUPPORT (Ditampilkan pada banner "Kamu tidak sendiri") */
export const BANNER_IMAGE: string = DEFAULT_BANNER_IMAGE;

/** 4. AVATAR AI BOT CURHAT (Ditampilkan dalam balon pesan AI pada modal Curhat) */
export const BOT_AVATAR_IMAGE: string = DEFAULT_BOT_AVATAR;

/** 5. ICON TAB BROWSER / FAVICON (Ditampilkan pada tab browser web) */
export const APP_ICON_IMAGE: string = DEFAULT_APP_ICON;

/** Export gabungan semua gambar website */
export const APP_IMAGES = {
  logoImage: LOGO_IMAGE,
  heroImage: HERO_IMAGE,
  bannerImage: BANNER_IMAGE,
  botAvatar: BOT_AVATAR_IMAGE,
  appIcon: APP_ICON_IMAGE,
};
