/**
 * ============================================================================
 * CMS & TAMPILAN STORE (DATABASE SPREADSHEET & CONFIGURATION MANAGER)
 * ============================================================================
 * Menyimpan seluruh kata/kalimat, gambar logo, banner, sponsor, card, kuis, 
 * ulasan, pesan psikolog, dan nomor WhatsApp secara terpusat dengan dukungan 
 * sinkronisasi Spreadsheet / Google Sheets.
 */

import { useState, useEffect } from 'react';
import { APP_IMAGES } from './appImages';

export interface SponsorItem {
  id: string;
  name: string;
  logoUrl: string;
}

export interface ServiceCardItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  buttonText: string;
}

export interface FeatureCardItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  image: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  service: string;
  comment: string;
  rating: number;
  date: string;
  avatarBg: string;
}

export interface CmsConfig {
  branding: {
    logoImage: string;
    appIcon: string;
    brandName: string;
    brandSubtitle: string;
    contactWhatsapp: string;
    contactEmail: string;
    adminNotificationEmail: string;
    botAvatar: string;
  };
  sponsors: SponsorItem[];
  hero: {
    title: string;
    subtitle: string;
    primaryBtnText: string;
    secondaryBtnText: string;
    heroImage: string;
  };
  kamiHadir: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: ServiceCardItem[];
  };
  kamuTidakSendiri: {
    sectionTitle: string;
    sectionSubtitle: string;
    bannerImage: string;
    items: FeatureCardItem[];
  };
  personalityQuiz: {
    sectionTitle: string;
    sectionSubtitle: string;
    headline: string;
    description: string;
    bannerImage: string;
    buttonText: string;
  };
  testimonials: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: TestimonialItem[];
  };
  motivationalPsychologists: {
    sectionTitle: string;
    sectionSubtitle: string;
    leftName: string;
    leftTitle: string;
    leftExp: string;
    leftQuote: string;
    leftPhoto: string;
    rightName: string;
    rightTitle: string;
    rightExp: string;
    rightQuote: string;
    rightPhoto: string;
  };
  mitraKarir: {
    bannerTitle: string;
    bannerDescription: string;
    buttonText: string;
    benefits: string[];
  };
}

const DEFAULT_CMS_CONFIG: CmsConfig = {
  branding: {
    logoImage: APP_IMAGES.logoImage,
    appIcon: APP_IMAGES.appIcon,
    brandName: 'Sapa Hati',
    brandSubtitle: 'Peduli • Dengar • Tumbuh',
    contactWhatsapp: '628888225892',
    contactEmail: 'halo@sapahati.id',
    adminNotificationEmail: 'blezgam@gmail.com',
    botAvatar: APP_IMAGES.botAvatar,
  },
  sponsors: [],
  hero: {
    title: 'Ruang Aman untuk Didengar, Dirangkul, & Memulihkan Hati',
    subtitle: 'Teman cerita dan layanan konsultasi profesional bersama psikolog tersertifikasi secara privat & rahasia.',
    primaryBtnText: 'Mulai Curhat AI Gratis',
    secondaryBtnText: 'Konsultasi Psikolog',
    heroImage: APP_IMAGES.heroImage,
  },
  kamiHadir: {
    sectionTitle: 'Kami Hadir Untukmu',
    sectionSubtitle: 'Layanan kesehatan mental yang mudah diakses, terjangkau, dan fleksibel sesuai kebutuhan emosionalmu.',
    items: [
      {
        id: 'kh_1',
        title: 'Sesi Curhat 24/7',
        description: 'Teman curhat responsif berbasis AI yang siap mendengarkan tanpa menghakimi kapan saja kamu merasa cemas atau butuh teman bicara.',
        badge: 'Gratis & Praktis',
        buttonText: 'Mulai Sesi Curhat',
      },
      {
        id: 'kh_2',
        title: 'Konsultasi Psikolog',
        description: 'Pilih jadwal dan metode terbaik: Sesi Chat privat, Video Call interaktif, atau Tatap Muka langsung bersama psikolog tersertifikasi.',
        badge: 'Layanan Profesional',
        buttonText: 'Cari Psikolog',
      },
      {
        id: 'kh_3',
        title: 'Mood Tracker & Jurnal',
        description: 'Catat grafik emosi harian, rilis beban fikiran, dan dapatkan rekomendasi latihan pernapasan mandiri dari para ahli.',
        badge: 'Mandiri & Terukur',
        buttonText: 'Buka Mood Tracker',
      },
    ],
  },
  kamuTidakSendiri: {
    sectionTitle: 'Kamu Tidak Sendiri',
    sectionSubtitle: 'Ribuan kawan Sapahati telah menemukan ketenangan dan sudut pandang baru dalam menghadapi tantangan hidup.',
    bannerImage: APP_IMAGES.bannerImage,
    items: [
      {
        id: 'kts_1',
        title: 'Kisah & Komunitas Berdaya',
        description: 'Bergabung dengan ruang berbagi rasa yang aman, di mana cerita dan pengalamanmu dihargai sepenuh hati.',
        badge: 'Komunitas',
        image: '',
      },
      {
        id: 'kts_2',
        title: 'Tes Stres & Kecemasan DASS-21',
        description: 'Pahami tingkat kesehatan emosionalmu secara objektif dengan alat ukur standar psikologi klinis.',
        badge: 'Skrining Gratis',
        image: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&q=80&w=600',
      },
      {
        id: 'kts_3',
        title: 'Panduan Self-Care & Relaksasi',
        description: 'Akses teknik groundings, mindfulness audio, dan tips mengatasi panic attack darurat kapan saja.',
        badge: 'Pertolongan Pertama',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
      },
    ],
  },
  personalityQuiz: {
    sectionTitle: 'Kuis Tipe Kepribadian & Potensi Diri',
    sectionSubtitle: 'Temukan karakter unik, kelebihan emosional, dan cara terbaikmu dalam mengelola stres.',
    headline: 'Kenali Tipe Kepribadianmu dalam 3 Menit',
    description: 'Jawab 5 pertanyaan singkat untuk memahami gaya komunikasi, kepribadian, dan rekomendasi perawatan diri yang cocok untukmu!',
    bannerImage: '',
    buttonText: 'Mulai Kuis Kepribadian',
  },
  testimonials: {
    sectionTitle: 'Apa Kata Mereka Tentang Sapahati?',
    sectionSubtitle: 'Kisah nyata dari kawan Sapahati yang menemukan ketenangan, sudut pandang baru, dan solusi kesehatan mental bersama psikolog & AI kami.',
    items: [
      {
        id: 't_1',
        name: 'A*** R.',
        role: 'Mahasiswi (22 th)',
        service: 'Sesi Curhat & Chat',
        comment: 'Awalnya cemas banget pas lagi burnout tugas akhir. Sesi Curhat langsung responsif 24 jam tanpa menghakimi, lalu lanjut sesi chat dengan Psikolog. Lega banget bisa rilis beban emosi!',
        rating: 5,
        date: '3 hari yang lalu',
        avatarBg: 'bg-purple-600 text-white',
      },
      {
        id: 't_2',
        name: 'B*** S*****',
        role: 'Karyawan Swasta (29 th)',
        service: 'Video Call Psikolog',
        comment: 'Psikolognya sangat komunikatif dan empatik. Dalam 60 menit sesi video call, saya dapet sudut pandang baru untuk atasi masalah kecemasan kerja. Proses pendaftarannya juga praktis!',
        rating: 5,
        date: '1 minggu yang lalu',
        avatarBg: 'bg-teal-600 text-white',
      },
      {
        id: 't_3',
        name: 'C****** M*',
        role: 'Freelancer (25 th)',
        service: 'Konsultasi Tatap Muka',
        comment: 'Privasi benar-benar terjamin. Tempat tatap mukanya nyaman dan psikolog mendengar cerita saya dengan sabar tanpa memberi penilaian negatif. Recomended bgt!',
        rating: 5,
        date: '2 minggu yang lalu',
        avatarBg: 'bg-rose-500 text-white',
      },
      {
        id: 't_4',
        name: 'D**** K*****',
        role: 'CPMI (32 th)',
        service: 'Mood Tracker & Sesi Curhat',
        comment: 'Fitur Mood Tracker-nya bantu saya sadar pola emosi harian. Pas lagi drop, Sesi Curhat langsung ngasih rekomendasi latihan pernapasan yang bikin tenang dalam hitungan menit.',
        rating: 5,
        date: '3 minggu yang lalu',
        avatarBg: 'bg-indigo-600 text-white',
      },
    ],
  },
  motivationalPsychologists: {
    sectionTitle: 'Pesan Dari Tim Psikolog',
    sectionSubtitle: 'Tim profesional Sapahati siap menemani setiap langkah perjalanan kesehatan mentalmu.',
    leftName: 'Ari Widyastuti, M.Psi., Psikolog',
    leftTitle: 'Psychology Lead',
    leftExp: '',
    leftQuote: 'Setiap rasa lelah dan cemas yang kamu rasakan itu valid. Mengakui perasaan adalah langkah awal menuju ketenangan. Kamu tidak harus menghadapi semuanya sendirian - kami siap mendengarkan tanpa menghakimi.',
    leftPhoto: '',
    rightName: 'Indatul Latifah',
    rightTitle: 'Co-Founder Sapa Hati',
    rightExp: '',
    rightQuote: 'Mengambil waktu untuk merawat pikiranmu bukanlah tanda kelemahan, melainkan bentuk kasih sayang terbesar pada dirimu sendiri.',
    rightPhoto: '',
  },
  mitraKarir: {
    bannerTitle: 'Ingin Daftar Sebagai Psikolog Mitra & Karir?',
    bannerDescription: 'Bergabunglah bersama psikolog profesional lainnya di Sapahati. Dapatkan fleksibilitas jam praktik, jam konsultasi digital, dan jangkauan klien yang lebih luas dari seluruh Indonesia.',
    buttonText: 'Daftar Mitra Psikolog',
    benefits: [],
  },
};

const STORAGE_KEY = 'sapahati_cms_config_v2';

type CmsListener = (config: CmsConfig) => void;
const listeners: Set<CmsListener> = new Set();

function fixSvgDataUri(url: string): string {
  if (typeof url === 'string' && url.startsWith('data:image/svg+xml;utf8,')) {
    return url.replace('data:image/svg+xml;utf8,', 'data:image/svg+xml;charset=utf-8,');
  }
  return url;
}

function sanitizeCmsConfig(config: CmsConfig): CmsConfig {
  if (!config) return DEFAULT_CMS_CONFIG;
  return {
    ...config,
    branding: {
      ...config.branding,
      logoImage: fixSvgDataUri(config.branding?.logoImage || ''),
      appIcon: fixSvgDataUri(config.branding?.appIcon || ''),
      adminNotificationEmail: config.branding?.adminNotificationEmail || 'blezgam@gmail.com',
      botAvatar: fixSvgDataUri(config.branding?.botAvatar || APP_IMAGES.botAvatar),
    },
    hero: {
      ...config.hero,
      heroImage: fixSvgDataUri(config.hero?.heroImage || ''),
    },
    kamuTidakSendiri: {
      ...config.kamuTidakSendiri,
      bannerImage: fixSvgDataUri(config.kamuTidakSendiri?.bannerImage || ''),
      items: (config.kamuTidakSendiri?.items || []).map((item) => ({
        ...item,
        image: fixSvgDataUri(item.image),
      })),
    },
    motivationalPsychologists: {
      ...config.motivationalPsychologists,
      leftTitle: config.motivationalPsychologists?.leftTitle || '',
      leftExp: config.motivationalPsychologists?.leftExp || '',
      rightTitle: config.motivationalPsychologists?.rightTitle || '',
      rightExp: config.motivationalPsychologists?.rightExp || '',
    },
  };
}

export function getCmsConfig(): CmsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizeCmsConfig({ ...DEFAULT_CMS_CONFIG, ...parsed });
    }
  } catch (err) {
    console.error('Failed to parse CMS config from localStorage:', err);
  }
  return sanitizeCmsConfig(DEFAULT_CMS_CONFIG);
}

export function saveCmsConfig(newConfig: CmsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    listeners.forEach((listener) => listener(newConfig));
  } catch (err) {
    console.error('Failed to save CMS config to localStorage:', err);
  }
}

export function resetCmsConfig(): void {
  saveCmsConfig(DEFAULT_CMS_CONFIG);
}

export function subscribeCmsConfig(listener: CmsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCmsConfig(): CmsConfig {
  const [config, setConfig] = useState<CmsConfig>(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((next) => setConfig(next));
    return () => unsub();
  }, []);

  return config;
}

/**
 * IMPORT CMS CONFIG FROM SPREADSHEET ROWS
 */
export function importCmsConfigRows(rows: string[][]): void {
  if (!rows || rows.length === 0) return;
  const current = getCmsConfig();
  const next: CmsConfig = JSON.parse(JSON.stringify(current));

  const sponsorMap: Record<number, { name?: string; logoUrl?: string }> = {};
  const kamiHadirMap: Record<number, any> = {};
  const ktsMap: Record<number, any> = {};
  const testiMap: Record<number, any> = {};

  rows.forEach((row) => {
    if (!row || row.length < 3) return;
    const [category, key, value] = row;
    if (!key || value === undefined || value === null) return;

    if (category === 'Branding' && key in next.branding) {
      (next.branding as any)[key] = value;
    } else if (category === 'Hero' && key in next.hero) {
      (next.hero as any)[key] = value;
    } else if (category === 'KamiHadir' && key in next.kamiHadir) {
      (next.kamiHadir as any)[key] = value;
    } else if (category === 'KamuTidakSendiri' && key in next.kamuTidakSendiri) {
      (next.kamuTidakSendiri as any)[key] = value;
    } else if (category === 'PersonalityQuiz' && key in next.personalityQuiz) {
      (next.personalityQuiz as any)[key] = value;
    } else if (category === 'Testimonials' && key in next.testimonials) {
      (next.testimonials as any)[key] = value;
    } else if (category === 'PesanPsikolog' && key in next.motivationalPsychologists) {
      (next.motivationalPsychologists as any)[key] = value;
    } else if (category === 'MitraKarir' && key in next.mitraKarir) {
      (next.mitraKarir as any)[key] = value;
    } else if (category === 'Sponsor') {
      const match = key.match(/^sponsor_(\d+)_(name|logo)$/i);
      if (match) {
        const idx = parseInt(match[1], 10);
        const field = match[2].toLowerCase();
        if (!sponsorMap[idx]) sponsorMap[idx] = {};
        if (field === 'name') sponsorMap[idx].name = value;
        if (field === 'logo') sponsorMap[idx].logoUrl = value;
      }
    } else if (category === 'KamiHadirItem') {
      const match = key.match(/^item_(\d+)_(.*)$/i);
      if (match) {
        const idx = parseInt(match[1], 10);
        const field = match[2];
        if (!kamiHadirMap[idx]) kamiHadirMap[idx] = {};
        kamiHadirMap[idx][field] = value;
      }
    } else if (category === 'KamuTidakSendiriItem') {
      const match = key.match(/^item_(\d+)_(.*)$/i);
      if (match) {
        const idx = parseInt(match[1], 10);
        const field = match[2];
        if (!ktsMap[idx]) ktsMap[idx] = {};
        ktsMap[idx][field] = value;
      }
    } else if (category === 'TestimonialItem') {
      const match = key.match(/^item_(\d+)_(.*)$/i);
      if (match) {
        const idx = parseInt(match[1], 10);
        const field = match[2];
        if (!testiMap[idx]) testiMap[idx] = {};
        testiMap[idx][field] = value;
      }
    }
  });

  const sponsorIndexes = Object.keys(sponsorMap).map(Number).sort((a, b) => a - b);
  if (sponsorIndexes.length > 0) {
    next.sponsors = sponsorIndexes.map((i) => ({
      id: 's_' + i,
      name: sponsorMap[i].name || 'Sponsor ' + i,
      logoUrl: sponsorMap[i].logoUrl || '',
    }));
  }

  const kamiHadirIndexes = Object.keys(kamiHadirMap).map(Number).sort((a, b) => a - b);
  if (kamiHadirIndexes.length > 0) {
    next.kamiHadir.items = kamiHadirIndexes.map((i) => ({
      id: 'kh_' + i,
      title: kamiHadirMap[i].title || '',
      description: kamiHadirMap[i].desc || '',
      badge: kamiHadirMap[i].badge || '',
      buttonText: kamiHadirMap[i].btn || '',
    }));
  }

  const ktsIndexes = Object.keys(ktsMap).map(Number).sort((a, b) => a - b);
  if (ktsIndexes.length > 0) {
    next.kamuTidakSendiri.items = ktsIndexes.map((i) => ({
      id: 'kts_' + i,
      title: ktsMap[i].title || '',
      description: ktsMap[i].desc || '',
      badge: ktsMap[i].badge || '',
      image: ktsMap[i].img || '',
    }));
  }

  const testiIndexes = Object.keys(testiMap).map(Number).sort((a, b) => a - b);
  if (testiIndexes.length > 0) {
    next.testimonials.items = testiIndexes.map((i) => ({
      id: 't_' + i,
      name: testiMap[i].name || '',
      role: testiMap[i].role || '',
      service: testiMap[i].service || '',
      comment: testiMap[i].comment || '',
      rating: parseInt(testiMap[i].rating) || 5,
      date: testiMap[i].date || 'Baru saja',
      avatarBg: testiMap[i].avatarBg || 'bg-purple-600 text-white',
    }));
  }

  saveCmsConfig(next);
}

/**
 * GENERATE ARRAY OF ROWS FOR SPREADSHEET SYNC
 */
export function exportCmsConfigRows(customConfig?: CmsConfig): string[][] {
  const config = customConfig || getCmsConfig();
  const rows: string[][] = [
    ['Branding', 'brandName', config.branding.brandName],
    ['Branding', 'brandSubtitle', config.branding.brandSubtitle],
    ['Branding', 'contactWhatsapp', config.branding.contactWhatsapp],
    ['Branding', 'contactEmail', config.branding.contactEmail],
    ['Branding', 'adminNotificationEmail', config.branding.adminNotificationEmail],
    ['Branding', 'logoImage', config.branding.logoImage],
    ['Branding', 'appIcon', config.branding.appIcon],
    ['Branding', 'botAvatar', config.branding.botAvatar || APP_IMAGES.botAvatar],
    ['Hero', 'title', config.hero.title],
    ['Hero', 'subtitle', config.hero.subtitle],
    ['Hero', 'primaryBtnText', config.hero.primaryBtnText],
    ['Hero', 'secondaryBtnText', config.hero.secondaryBtnText],
    ['Hero', 'heroImage', config.hero.heroImage],
    ['KamiHadir', 'sectionTitle', config.kamiHadir.sectionTitle],
    ['KamiHadir', 'sectionSubtitle', config.kamiHadir.sectionSubtitle],
    ['KamuTidakSendiri', 'sectionTitle', config.kamuTidakSendiri.sectionTitle],
    ['KamuTidakSendiri', 'sectionSubtitle', config.kamuTidakSendiri.sectionSubtitle],
    ['KamuTidakSendiri', 'bannerImage', config.kamuTidakSendiri.bannerImage || APP_IMAGES.bannerImage],
    ['PersonalityQuiz', 'sectionTitle', config.personalityQuiz.sectionTitle],
    ['PersonalityQuiz', 'sectionSubtitle', config.personalityQuiz.sectionSubtitle],
    ['PersonalityQuiz', 'headline', config.personalityQuiz.headline],
    ['PersonalityQuiz', 'description', config.personalityQuiz.description],
    ['PersonalityQuiz', 'bannerImage', config.personalityQuiz.bannerImage],
    ['PersonalityQuiz', 'buttonText', config.personalityQuiz.buttonText],
    ['Testimonials', 'sectionTitle', config.testimonials.sectionTitle],
    ['Testimonials', 'sectionSubtitle', config.testimonials.sectionSubtitle],
    ['PesanPsikolog', 'sectionTitle', config.motivationalPsychologists.sectionTitle],
    ['PesanPsikolog', 'sectionSubtitle', config.motivationalPsychologists.sectionSubtitle],
    ['PesanPsikolog', 'leftName', config.motivationalPsychologists.leftName],
    ['PesanPsikolog', 'leftTitle', config.motivationalPsychologists.leftTitle],
    ['PesanPsikolog', 'leftExp', config.motivationalPsychologists.leftExp],
    ['PesanPsikolog', 'leftQuote', config.motivationalPsychologists.leftQuote],
    ['PesanPsikolog', 'leftPhoto', config.motivationalPsychologists.leftPhoto],
    ['PesanPsikolog', 'rightName', config.motivationalPsychologists.rightName],
    ['PesanPsikolog', 'rightTitle', config.motivationalPsychologists.rightTitle],
    ['PesanPsikolog', 'rightExp', config.motivationalPsychologists.rightExp],
    ['PesanPsikolog', 'rightQuote', config.motivationalPsychologists.rightQuote],
    ['PesanPsikolog', 'rightPhoto', config.motivationalPsychologists.rightPhoto],
    ['MitraKarir', 'bannerTitle', config.mitraKarir.bannerTitle],
    ['MitraKarir', 'bannerDescription', config.mitraKarir.bannerDescription],
    ['MitraKarir', 'buttonText', config.mitraKarir.buttonText],
  ];

  // Add Sponsor rows
  config.sponsors.forEach((s, idx) => {
    rows.push(['Sponsor', `sponsor_${idx + 1}_name`, s.name]);
    rows.push(['Sponsor', `sponsor_${idx + 1}_logo`, s.logoUrl]);
  });

  config.kamiHadir.items.forEach((item, idx) => {
    rows.push(['KamiHadirItem', `item_${idx + 1}_title`, item.title]);
    rows.push(['KamiHadirItem', `item_${idx + 1}_desc`, item.description]);
    rows.push(['KamiHadirItem', `item_${idx + 1}_badge`, item.badge]);
    rows.push(['KamiHadirItem', `item_${idx + 1}_btn`, item.buttonText]);
  });

  config.kamuTidakSendiri.items.forEach((item, idx) => {
    rows.push(['KamuTidakSendiriItem', `item_${idx + 1}_title`, item.title]);
    rows.push(['KamuTidakSendiriItem', `item_${idx + 1}_desc`, item.description]);
    rows.push(['KamuTidakSendiriItem', `item_${idx + 1}_badge`, item.badge]);
    rows.push(['KamuTidakSendiriItem', `item_${idx + 1}_img`, item.image]);
  });

  config.testimonials.items.forEach((item, idx) => {
    rows.push(['TestimonialItem', `item_${idx + 1}_name`, item.name]);
    rows.push(['TestimonialItem', `item_${idx + 1}_role`, item.role]);
    rows.push(['TestimonialItem', `item_${idx + 1}_service`, item.service]);
    rows.push(['TestimonialItem', `item_${idx + 1}_comment`, item.comment]);
    rows.push(['TestimonialItem', `item_${idx + 1}_rating`, item.rating.toString()]);
    rows.push(['TestimonialItem', `item_${idx + 1}_date`, item.date]);
    rows.push(['TestimonialItem', `item_${idx + 1}_avatarBg`, item.avatarBg]);
  });

  return rows;
}

/**
 * GENERATE CSV / SPREADSHEET EXPORT FORMAT FOR DOWNLOAD & SYNC
 */
export function exportCmsConfigToCsv(): string {
  const rows = [['Kategori', 'Kunci_Properti', 'Nilai_Teks_Atau_URL'], ...exportCmsConfigRows()];

  return rows
    .map((row) =>
      row
        .map((col) => `"${(col || '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
}
