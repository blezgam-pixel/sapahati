import { BookingSession } from '../types';

export const sendTelegramNotification = async (booking: BookingSession): Promise<boolean> => {
  try {
    const formatRp = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const message = `
🛎 <b>PESANAN BARU MASUK!</b> 🛎

<b>Pasien:</b> ${booking.patientName} (Usia: ${booking.patientAge})
<b>WhatsApp:</b> ${booking.patientWhatsapp}
<b>Psikolog:</b> ${booking.psychologistName}
<b>Metode:</b> ${booking.methodTitle}
<b>Jadwal:</b> ${booking.timeSlot}
<b>Harga:</b> ${formatRp(booking.price)}

Mohon segera cek Dashboard Admin untuk melihat bukti pembayaran dan memproses pesanan ini.
    `.trim();

    const response = await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || 'Gagal mengirim ke server');
    }

    console.log('[Telegram] ✅ Notifikasi admin berhasil terkirim via server!');
    return true;
  } catch (error) {
    console.error('[Telegram] ❌ Gagal kirim notifikasi admin:', error);
    return false;
  }
};
