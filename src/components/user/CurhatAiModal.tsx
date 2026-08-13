import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Heart, Bot, HeartHandshake, AlertCircle, User } from 'lucide-react';
import { ChatMessage } from '../../types';
import { APP_IMAGES } from '../../data/appImages';

interface CurhatAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPsikolog?: () => void;
  botAvatar?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    text: "haii bestie! 💜✨ I'm here for you 24/7.\n\nLagi ada yang bikin overthinking, capek, atau kepikiran bgt hari ini? Spill aja pelan-pelan yaa, zero pressure sama sekali... 🫂",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTED_CHIPS = [
  'Aku lagi capek & overthinking bgt 🥹',
  'Beban kerja & tugas lagi ngeroyok 📚',
  'Ngerasa kesepian & butuh sandaran 🫂',
  'Pengen tumpahin uneg-uneg aja ✨',
];

const getGenZFallbackReply = (turn: number, userText: string) => {
  const lower = userText.toLowerCase();
  if (turn >= 5) {
    return "Makasih banyak yaa udah tumpahin ceritamu di 5 sesi curhat AI ini! 💜✨ You're doing so great, proud of you! Karena sesi AI terbatas 5 pertanyaan, yuk lanjutin obrolan hangat ini bareng Psikolog Profesional biar dapet pendampingan yang lebih pas & lega bgt! 🫂";
  }

  if (lower.includes('lelah') || lower.includes('capek') || lower.includes('cemas') || lower.includes('anxiety')) {
    const capekReplies = [
      "I feel you bgt, rasa capek & cemas tuh emang beneran nguras energi bgt 🥹. Pull up a chair & take a deep breath dulu yaa bestie. Kamu udah bertahan sehebat ini kok! Mau cerita lebih lanjut bagian mana yang paling berat?",
      "Real bgt sih... kalau emosi lagi numpuk, wajar banget kalo raga & pikiran rasanya mau break dulu 💜. Inget ya, it's totally okay not to be okay. Pelan-pelan aja tumpahin ke aku, zero pressure sama sekali...",
      "Sending warm virtual hug for you! 🫂✨ capeknya kamu tuh valid banget dan gak usah dipaksain buat tahan sendirian. Tarik napas dulu, kamu hebat banget udah mau jujur sama perasaanmu hari ini.",
      "Proud of you bgt udah mau berani terbuka! 🫶 Intinya kamu gak sendirian kok. Langkah kecil apa nih yang bikin kamu ngerasa agak lega hari ini?"
    ];
    return capekReplies[(turn - 1) % capekReplies.length];
  }

  if (lower.includes('tugas') || lower.includes('kerja') || lower.includes('numpuk') || lower.includes('beban')) {
    const tugasReplies = [
      "Waduh, kalau urusan tugas atau kerjaan lagi ngeroyok emang bikin pala pusing bgt yaa 📚🥹! Tapi inget bestie, kerjain satu per satu aja, gak harus kelar detik ini juga. Mana nih yang paling bikin kamu pusing?",
      "Relate bgt sih... burnout gara-gara deadline/tugas numpuk tuh bener-bener gak enak. Istirahat sejenak dulu yuk, minum air putih, & tumpahin keselinmu di sini! Aku dengerin kok 💜",
      "Kamu udah kerja keras bgt hari ini, proud of you! 🫶 Tugas emang penting, tapi kesehatan mentalmu jauh lebih utama. Pelan-pelan aja yaa, slowly but surely!",
      "I feel you... Jangan lupa napas sejenak yaa. Mau cerita hal apa lagi yang bisa bikin beban pikiranmu berkurang sedikit?"
    ];
    return tugasReplies[(turn - 1) % tugasReplies.length];
  }

  const generalReplies = [
    "Haii bestie! 💜✨ I feel you bgt, cerita kamu valid banget kok. Spill aja pelan-pelan yaa, hal apa yang paling bikin kamu overthinking atau kepikiran hari ini?",
    "Thank you udah berani cerita jujur sama aku 🌸. Situasi ini pasti gak mudah buat kamu, tapi kamu hebat bgt bisa ngelewatinnya. Boleh cerita lebih lanjut?",
    "Relate bgt sih... Pelan-pelan aja yaa take your time 🫂. Aku di sini gak bakal nge-judge sama sekali. Tumpahin aja semuanya!",
    "Proud of you bgt udah berani terbuka! 🫶 Intinya kamu gak sendirian kok. Langkah kecil apa nih yang bikin kamu ngerasa agak lega hari ini?"
  ];
  return generalReplies[(turn - 1) % generalReplies.length];
};

export const CurhatAiModal: React.FC<CurhatAiModalProps> = ({ isOpen, onClose, onOpenPsikolog, botAvatar }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Count user questions sent
  const questionsCount = messages.filter((m) => m.sender === 'user').length;
  const isLimitReached = questionsCount >= 5;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping || isLimitReached) return;

    const nextTurn = questionsCount + 1;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/curhat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, turn: nextTurn, history: messages }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply || 'Makasih yaa udah mau cerita ke aku 💜. Apapun yang kamu rasain saat ini valid bgt kok.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Fallback response');
      }
    } catch {
      setTimeout(() => {
        const replyText = getGenZFallbackReply(nextTurn, text);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg h-[90vh] rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden p-0.5 shrink-0">
              <img src={botAvatar || APP_IMAGES.botAvatar} alt="Sesi Curhat" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h3 className="font-bold text-base">Sesi Curhat</h3>
              <p className="text-xs text-purple-100/90">
                Teman cerita privat 24/7 • Sisa: {Math.max(0, 5 - questionsCount)}/5 Pertanyaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF8FF]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C47FF] to-pink-500 p-0.5 shrink-0 shadow-2xs mb-1">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img src={botAvatar || APP_IMAGES.botAvatar} alt="Sesi Curhat" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#7C5CFC] text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 rounded-bl-none border border-purple-100 shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mb-1 border border-purple-200">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-purple-600 font-medium bg-purple-50 px-3 py-2 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>sedang mengetik...</span>
            </div>
          )}

          {isLimitReached && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 mt-3 text-center">
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Batas 5 Pertanyaan Sesi Ini Telah Tercapai</span>
              </div>
              <p className="text-amber-800 leading-normal text-[11px]">
                Terima kasih banyak sudah berbagi cerita di 5 sesi AI ini 💜. Yuk lanjut konsultasi dengan Psikolog Profesional untuk pendampingan lebih mendalam.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {onOpenPsikolog && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPsikolog();
                    }}
                    className="py-2 px-3 bg-[#6C47FF] hover:bg-[#5034D4] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Konsultasi Psikolog</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {!isLimitReached && (
          <div className="px-4 py-2 bg-[#FAF8FF] border-t border-purple-100/50 flex gap-2 overflow-x-auto no-scrollbar">
            {SUGGESTED_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-purple-100/80 text-purple-800 text-xs font-medium border border-purple-200 shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
                disabled={isTyping}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isLimitReached
                ? 'Batas 5 pertanyaan tercapai.'
                : `Ketik curhatanmu... (Pertanyaan ${questionsCount + 1}/5)`
            }
            value={input}
            disabled={isTyping || isLimitReached}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping || isLimitReached}
            className="w-11 h-11 rounded-2xl bg-[#7C5CFC] hover:bg-[#6C47FF] disabled:bg-slate-200 text-white flex items-center justify-center transition-all shadow-md disabled:shadow-none cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
