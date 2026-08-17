import emailjs from '@emailjs/browser';
import { BookingSession } from '../types';

const SERVICE_ID = 'service_wql7xio';
const TEMPLATE_ID_ADMIN = 'admin123';
const TEMPLATE_ID_USER = 'template_0ww0vkq';
const PUBLIC_KEY = 'c6mMrZH8HD9nFlm6J';

// Email admin default (fallback jika server tidak tersedia)
export const ADMIN_EMAIL_FALLBACK = 'ahmadhabibi130301@gmail.com';

/**
 * Mengirim notifikasi perubahan status ke email user yang login
 */
export const sendOrderStatusToUser = async (
  booking: BookingSession,
  status: 'confirmed' | 'cancelled' | 'completed',
  userEmail: string
): Promise<boolean> => {
  if (!userEmail || !userEmail.includes('@')) {
    console.warn('[EmailJS] Email user tidak valid:', userEmail);
    return false;
  }

  let statusText = '';
  switch (status) {
    case 'confirmed': statusText = 'Dikonfirmasi ✅'; break;
    case 'cancelled': statusText = 'Dibatalkan ❌'; break;
    case 'completed': statusText = 'Selesai 🎉'; break;
    default: statusText = status;
  }

  console.log('[EmailJS] Kirim status email ke user:', userEmail, '| Status:', statusText);

  try {
    // Init EmailJS di sini agar tidak bergantung pada waktu module load
    emailjs.init(PUBLIC_KEY);

    const templateParams = {
      to_email: userEmail,
      to_name: booking.patientName,
      booking_id: booking.id,
      psychologist_name: booking.psychologistName,
      method_title: booking.methodTitle,
      time_slot: booking.timeSlot,
      new_status: statusText,
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_USER, templateParams, PUBLIC_KEY);

    console.log('[EmailJS] ✅ Status email ke user terkirim!', response.status, response.text);
    return true;
  } catch (error: any) {
    console.error('[EmailJS] ❌ Gagal kirim status email ke user:', error);
    const msg = error?.text || error?.message || JSON.stringify(error);
    alert('Gagal kirim email ke user.\nError: ' + msg);
    return false;
  }
};

