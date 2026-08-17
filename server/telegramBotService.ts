import { getBookingsFromSheet, updateBookingsInSheet } from './sheetsService.js';

const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

function getTelegramConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    adminChatId: process.env.TELEGRAM_CHAT_ID || '',
  };
}

/**
 * Kirim email status ke user via REST API EmailJS
 */
async function sendUserStatusEmailViaEmailJS(booking: any, status: 'confirmed' | 'cancelled' | 'completed') {
  const userEmail = booking.userEmail;
  if (!userEmail || !userEmail.includes('@')) {
    console.log('[TelegramBot] Booking tidak memiliki userEmail untuk dikirimi status email:', booking.id);
    return;
  }

  let statusText = '';
  switch (status) {
    case 'confirmed': statusText = 'Dikonfirmasi ✅'; break;
    case 'cancelled': statusText = 'Dibatalkan ❌'; break;
    case 'completed': statusText = 'Selesai 🎉'; break;
    default: statusText = status;
  }

  try {
    const payload: any = {
      service_id: 'service_wql7xio',
      template_id: 'template_0ww0vkq',
      user_id: 'c6mMrZH8HD9nFlm6J',
      template_params: {
        to_email: userEmail,
        to_name: booking.patientName,
        booking_id: booking.id,
        psychologist_name: booking.psychologistName,
        method_title: booking.methodTitle,
        time_slot: booking.timeSlot,
        new_status: statusText,
      },
    };

    if (process.env.EMAILJS_PRIVATE_KEY) {
      payload.accessToken = process.env.EMAILJS_PRIVATE_KEY;
    }

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[TelegramBot] ✅ Email status "${statusText}" terkirim ke user (${userEmail})`);
    } else {
      const errTxt = await res.text();
      console.warn('[TelegramBot] ⚠️ Gagal kirim email ke user via EmailJS:', errTxt);
    }
  } catch (err: any) {
    console.error('[TelegramBot] ❌ Error kirim email status ke user:', err.message);
  }
}

/**
 * Kirim pesan teks dengan atau tanpa Inline Keyboard ke Telegram
 */
export async function sendTelegramMessage(text: string, inlineKeyboard?: any[][], targetChatId?: string | number) {
  const { token, adminChatId } = getTelegramConfig();
  const chatId = targetChatId || adminChatId;
  if (!token || !chatId) {
    console.warn('[TelegramBot] Token atau Chat ID belum diatur.');
    return null;
  }

  try {
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      body.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('[TelegramBot] Error kirim pesan:', err.message);
    return null;
  }
}

/**
 * Edit pesan teks Telegram setelah tombol diklik
 */
async function editTelegramMessageText(chatId: string | number, messageId: number, text: string, inlineKeyboard?: any[][]) {
  const { token } = getTelegramConfig();
  if (!token) return;

  try {
    const body: any = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    };

    if (inlineKeyboard) {
      body.reply_markup = { inline_keyboard: inlineKeyboard };
    }

    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    console.error('[TelegramBot] Error edit pesan:', err.message);
  }
}

/**
 * Menjawab Callback Query (agar tombol tidak loading terus di Telegram)
 */
async function answerCallbackQuery(callbackQueryId: string, alertText?: string) {
  const { token } = getTelegramConfig();
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: alertText || '',
        show_alert: !!alertText,
      }),
    });
  } catch (err: any) {
    console.error('[TelegramBot] Error answerCallbackQuery:', err.message);
  }
}

/**
 * Format notifikasi pesanan baru dengan tombol ACC & Tolak
 */
export async function sendTelegramBookingNotification(booking: any) {
  const text = `
🛎 <b>PESANAN BARU MASUK!</b> 🛎

<b>ID Pesanan:</b> <code>${booking.id}</code>
<b>Nama Pasien:</b> ${booking.patientName} (${booking.patientAge} th)
<b>WhatsApp:</b> <a href="https://wa.me/${booking.patientWhatsapp?.replace(/\D/g, '')}">${booking.patientWhatsapp}</a>
<b>Psikolog:</b> ${booking.psychologistName}
<b>Metode:</b> ${booking.methodTitle}
<b>Jadwal:</b> ${booking.timeSlot}
<b>Harga:</b> ${formatRp(booking.price)}
<b>Status:</b> ⏳ Menunggu Konfirmasi (Pending)
${booking.paymentReceiptName ? `\n📎 <i>Bukti Bayar: ${booking.paymentReceiptName}</i>` : ''}

Silakan pilih tindakan:
  `.trim();

  const keyboard: any[][] = [
    [
      { text: '✅ ACC / Terima', callback_data: `acc_${booking.id}` },
      { text: '❌ Tolak / Batalkan', callback_data: `cancel_${booking.id}` },
    ]
  ];

  if (booking.paymentReceiptUrl && booking.paymentReceiptUrl.startsWith('http')) {
    keyboard.unshift([
      { text: '🔍 Lihat Bukti Bayar', url: booking.paymentReceiptUrl }
    ]);
  }

  return await sendTelegramMessage(text, keyboard);
}

/**
 * Tangani perintah chat dari Admin (/start, /pending, /ringkasan)
 */
async function handleTelegramCommand(chatId: string | number, text: string) {
  const cmd = text.trim().toLowerCase();

  if (cmd.startsWith('/start') || cmd.startsWith('/help')) {
    const welcome = `
👋 <b>Halo Admin Sapa Hati!</b>

Bot ini siap membantu Anda mengontrol pesanan konsultasi langsung dari Telegram:

📌 <b>Daftar Perintah:</b>
• <b>/pending</b> - Lihat pesanan yang masih menunggu ACC
• <b>/aktif</b> - Lihat sesi aktif (sudah di-ACC) & tombol Selesai Sesi
• <b>/ringkasan</b> - Lihat total pemasukan & statistik pesanan
• <b>/help</b> - Bantuan & petunjuk penggunaan

<i>Setiap ada pesanan baru, Anda akan langsung menerima detail beserta tombol ACC, Tolak, dan Selesai Sesi!</i>
    `.trim();
    await sendTelegramMessage(welcome, undefined, chatId);
    return;
  }

  if (cmd.startsWith('/aktif') || cmd.startsWith('/jadwal')) {
    const bookings = await getBookingsFromSheet();
    const activeList = bookings.filter((b: any) => b.status === 'confirmed');

    if (activeList.length === 0) {
      await sendTelegramMessage('ℹ️ <b>Tidak ada sesi aktif saat ini.</b>\nSemua sesi sudah selesai atau belum di-ACC.', undefined, chatId);
      return;
    }

    await sendTelegramMessage(`🗓 <b>Ditemukan ${activeList.length} Sesi Aktif (Sudah di-ACC):</b>`, undefined, chatId);

    for (const b of activeList) {
      const itemText = `
<b>ID:</b> <code>${b.id}</code>
<b>Pasien:</b> ${b.patientName} (${b.patientAge} th)
<b>WhatsApp:</b> ${b.patientWhatsapp}
<b>Psikolog:</b> ${b.psychologistName}
<b>Jadwal:</b> ${b.timeSlot} | ${b.methodTitle}
<b>Total:</b> ${formatRp(b.price)}
<b>Status:</b> ✅ Dikonfirmasi (Siap Selesai)
      `.trim();

      const keyboard = [
        [
          { text: '🏁 Tandai Selesai Sesi', callback_data: `complete_${b.id}` },
        ]
      ];

      await sendTelegramMessage(itemText, keyboard, chatId);
    }
    return;
  }

  if (cmd.startsWith('/pending')) {
    const bookings = await getBookingsFromSheet();
    const pendingList = bookings.filter((b: any) => b.status === 'pending');

    if (pendingList.length === 0) {
      await sendTelegramMessage('🎉 <b>Semua Bersih!</b>\nTidak ada pesanan pending saat ini.', undefined, chatId);
      return;
    }

    await sendTelegramMessage(`📋 <b>Ditemukan ${pendingList.length} Pesanan Menunggu ACC:</b>`, undefined, chatId);

    for (const b of pendingList) {
      const itemText = `
<b>Pasien:</b> ${b.patientName} (${b.patientAge} th)
<b>WhatsApp:</b> ${b.patientWhatsapp}
<b>Psikolog:</b> ${b.psychologistName}
<b>Jadwal:</b> ${b.timeSlot} | ${b.methodTitle}
<b>Total:</b> ${formatRp(b.price)}
      `.trim();

      const keyboard = [
        [
          { text: '✅ ACC', callback_data: `acc_${b.id}` },
          { text: '❌ Tolak', callback_data: `cancel_${b.id}` },
        ]
      ];

      await sendTelegramMessage(itemText, keyboard, chatId);
    }
    return;
  }

  if (cmd.startsWith('/ringkasan') || cmd.startsWith('/stats')) {
    const bookings = await getBookingsFromSheet();
    const total = bookings.length;
    const pending = bookings.filter((b: any) => b.status === 'pending').length;
    const confirmed = bookings.filter((b: any) => b.status === 'confirmed').length;
    const completed = bookings.filter((b: any) => b.status === 'completed').length;
    const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;

    const totalIncome = bookings
      .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum: number, b: any) => sum + (Number(b.price) || 0), 0);

    const statsText = `
📊 <b>RINGKASAN PESANAN SAPA HATI</b> 📊

💰 <b>Total Pendapatan:</b> ${formatRp(totalIncome)}
📦 <b>Total Seluruh Pesanan:</b> ${total}

• ⏳ <b>Menunggu ACC (Pending):</b> ${pending}
• ✅ <b>Diterima (Confirmed):</b> ${confirmed}
• 🎉 <b>Selesai (Completed):</b> ${completed}
• ❌ <b>Dibatalkan (Cancelled):</b> ${cancelled}
    `.trim();

    await sendTelegramMessage(statsText, undefined, chatId);
    return;
  }

  // Pesan tidak dikenal
  await sendTelegramMessage('Perintah tidak dikenal. Ketik <b>/help</b> untuk melihat menu perintah.', undefined, chatId);
}

/**
 * Tangani aksi tombol (Callback Query)
 */
async function handleCallbackQuery(query: any) {
  const queryId = query.id;
  const data = query.data || '';
  const message = query.message;
  const chatId = message?.chat?.id;
  const messageId = message?.message_id;

  if (!data) return;

  if (data.startsWith('acc_')) {
    const bookingId = data.replace('acc_', '');
    try {
      const bookings = await getBookingsFromSheet();
      const target = bookings.find((b: any) => b.id === bookingId);

      if (!target) {
        await answerCallbackQuery(queryId, '⚠️ Pesanan tidak ditemukan di database.');
        return;
      }

      if (target.status === 'confirmed') {
        await answerCallbackQuery(queryId, 'ℹ️ Pesanan ini sudah di-ACC sebelumnya.');
        return;
      }

      target.status = 'confirmed';
      await updateBookingsInSheet(bookings);

      // 📧 Kirim email konfirmasi ke User
      sendUserStatusEmailViaEmailJS(target, 'confirmed').catch(() => {});

      await answerCallbackQuery(queryId, '✅ Pesanan BERHASIL di-ACC!');

      // Edit pesan Telegram asli: ganti tombol dengan tombol Selesai Sesi
      const updatedText = (message?.text || '') + `\n\n<b>[✅ SUDAH DI-ACC PADA ${new Date().toLocaleTimeString('id-ID')}]</b>`;
      const nextKeyboard = [
        [
          { text: '🏁 Tandai Selesai Sesi', callback_data: `complete_${bookingId}` },
        ]
      ];
      await editTelegramMessageText(chatId, messageId, updatedText, nextKeyboard);
    } catch (err: any) {
      console.error('[TelegramBot] Gagal ACC booking:', err);
      await answerCallbackQuery(queryId, '❌ Terjadi error saat mengupdate data.');
    }
    return;
  }

  if (data.startsWith('complete_')) {
    const bookingId = data.replace('complete_', '');
    try {
      const bookings = await getBookingsFromSheet();
      const target = bookings.find((b: any) => b.id === bookingId);

      if (!target) {
        await answerCallbackQuery(queryId, '⚠️ Pesanan tidak ditemukan di database.');
        return;
      }

      target.status = 'completed';
      await updateBookingsInSheet(bookings);

      // 📧 Kirim email selesai ke User
      sendUserStatusEmailViaEmailJS(target, 'completed').catch(() => {});

      await answerCallbackQuery(queryId, '🎉 Sesi konsultasi telah SELESAI!');

      // Edit pesan Telegram asli agar tombol hilang & ada tanda selesai
      const updatedText = (message?.text || '') + `\n\n<b>[🎉 SESI TELAH SELESAI PADA ${new Date().toLocaleTimeString('id-ID')}]</b>`;
      await editTelegramMessageText(chatId, messageId, updatedText, []);
    } catch (err: any) {
      console.error('[TelegramBot] Gagal menyelesaikan booking:', err);
      await answerCallbackQuery(queryId, '❌ Terjadi error saat memproses selesai sesi.');
    }
    return;
  }

  if (data.startsWith('cancel_')) {
    const bookingId = data.replace('cancel_', '');
    try {
      const bookings = await getBookingsFromSheet();
      const target = bookings.find((b: any) => b.id === bookingId);

      if (!target) {
        await answerCallbackQuery(queryId, '⚠️ Pesanan tidak ditemukan di database.');
        return;
      }

      target.status = 'cancelled';
      await updateBookingsInSheet(bookings);

      // 📧 Kirim email pembatalan ke User
      sendUserStatusEmailViaEmailJS(target, 'cancelled').catch(() => {});

      await answerCallbackQuery(queryId, '❌ Pesanan TELAH DIBATALKAN.');

      // Edit pesan Telegram asli
      const updatedText = (message?.text || '') + `\n\n<b>[❌ DIBATALKAN PADA ${new Date().toLocaleTimeString('id-ID')}]</b>`;
      await editTelegramMessageText(chatId, messageId, updatedText, []);
    } catch (err: any) {
      console.error('[TelegramBot] Gagal batalkan booking:', err);
      await answerCallbackQuery(queryId, '❌ Terjadi error saat membatalkan.');
    }
    return;
  }
}

/**
 * Long-Polling Loop Utama untuk mendengarkan aktivitas Telegram secara Realtime
 */
let isPollingRunning = false;

export function startTelegramBot() {
  const { token, adminChatId } = getTelegramConfig();
  if (!token || !adminChatId) {
    console.log('[TelegramBot] Token atau Chat ID belum disetel. Bot controller tidak aktif.');
    return;
  }

  if (isPollingRunning) return;
  isPollingRunning = true;

  console.log('[TelegramBot] 🚀 Telegram Bot Controller aktif & mendengarkan perintah...');

  let offset = 0;

  const poll = async () => {
    while (isPollingRunning) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20`, {
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }

        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;

            // 🔒 Keamanan: Pastikan hanya admin terdaftar yang bisa mengeksekusi
            if (update.message) {
              const msgChatId = String(update.message.chat?.id);
              if (msgChatId === String(adminChatId)) {
                if (update.message.text) {
                  await handleTelegramCommand(msgChatId, update.message.text);
                }
              }
            } else if (update.callback_query) {
              const queryUserId = String(update.callback_query.from?.id);
              if (queryUserId === String(adminChatId)) {
                await handleCallbackQuery(update.callback_query);
              } else {
                await answerCallbackQuery(update.callback_query.id, '⛔ Akses Ditolak! Anda bukan Admin.');
              }
            }
          }
        }
      } catch (err: any) {
        // Abaikan abort/timeout biasa, delay sejenak jika koneksi drop
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  };

  poll();
}
