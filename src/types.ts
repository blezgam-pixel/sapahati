export interface ImageConfig {
  heroImage: string;
  bannerImage: string;
  logoImage: string;
  botAvatar?: string;
  appIcon?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export type ConsultationMethod = 'chat' | 'video' | 'offline';

export interface MethodPrice {
  method: ConsultationMethod;
  label: string;
  description: string;
  price: number;
  formattedPrice: string;
}

export interface Psychologist {
  id: string;
  name: string;
  title: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  avatar: string;
  specialties: string[];
  prices: {
    chat: number;
    video: number;
    offline: number;
  };
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrisCodeUrl?: string;
  };
  whatsapp?: string;
  scheduleSlots?: string[];
  available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface BookingSession {
  id: string;
  patientName: string;
  patientAge: number;
  patientWhatsapp: string;
  psychologistId: string;
  psychologistName: string;
  method: ConsultationMethod;
  methodTitle: string;
  timeSlot: string;
  price: number;
  paymentReceiptName?: string;
  paymentReceiptUrl?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 'sangat_baik' | 'baik' | 'biasa' | 'sedih' | 'cemas';
  note: string;
}

