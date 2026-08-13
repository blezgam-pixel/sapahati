import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Heart, HeartHandshake, AlertCircle, User } from 'lucide-react';
import { ChatMessage } from '../../types';
import { Header } from '../../components/user/Header';
import { MobileHeader } from '../../components/user/MobileHeader';
import { MobileBottomNav } from '../../components/user/MobileBottomNav';
import { NavigationDrawer } from '../../components/user/NavigationDrawer';
import { APP_IMAGES } from '../../data/appImages';

interface CurhatAiPageProps {
  onBackToHome: () => void;
  onOpenPsikolog: () => void;
  onOpenPsikotes: () => void;
  onOpenDashboard: () => void;
  onOpenJournal?: () => void;
  onOpenMitra?: () => void;
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

export const CurhatAiPage: React.FC<CurhatAiPageProps> = ({
  onBackToHome,
  onOpenPsikolog,
  onOpenPsikotes,
  onOpenDashboard,
  onOpenJournal,
  onOpenMitra,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Count how many questions user has sent in current session
  const questionsCount = messages.filter((m) => m.sender === 'user').length;
  const isLimitReached = questionsCount >= 5;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D123B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-purple-200 overflow-x-hidden w-full pb-20 md:pb-10">
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header
          onOpenNav={() => setIsNavOpen(true)}
          onStartCurhat={() => {}}
          onOpenPsikolog={onOpenPsikolog}
          onOpenDashboard={onOpenDashboard}
          onOpenMoodTracker={onOpenJournal}
          onOpenPsikotes={onOpenPsikotes}
          onGoHome={onBackToHome}
        />
      </div>

      {/* Mobile Top Header */}
      <div className="block md:hidden">
        <MobileHeader onGoHome={onBackToHome} onOpenNav={() => setIsNavOpen(true)} />
      </div>

      {/* Main Container */}
      <main className="flex-1 pt-16 md:pt-20 px-3 sm:px-4 max-w-3xl mx-auto w-full flex flex-col">
        
        {/* Session Status Bar */}
        <div className="mb-3 bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#6C47FF] to-pink-500 p-0.5 shrink-0 shadow-2xs">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                <img src={APP_IMAGES.botAvatar} alt="Sesi Curhat" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Sesi Curhat</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">24/7</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Sisa Pertanyaan Sesi Ini: <strong className={isLimitReached ? 'text-rose-600 font-bold' : 'text-purple-700'}>{Math.max(0, 5 - questionsCount)}/5</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 bg-white rounded-3xl p-4 shadow-2xs border border-purple-100/70 space-y-4 overflow-y-auto min-h-[400px] max-h-[520px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.sender === 'ai' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C47FF] to-pink-500 p-0.5 shrink-0 shadow-2xs">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img src={APP_IMAGES.botAvatar} alt="Sesi Curhat" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs border border-purple-200">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}

              <div className={`max-w-[80%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#6C47FF] to-[#5034D4] text-white rounded-tr-none shadow-sm'
                      : 'bg-[#F6F3FF] text-[#1D123B] rounded-tl-none border border-purple-100/60'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 px-1 block">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50/60 p-2.5 rounded-xl w-fit">
              <Heart className="w-4 h-4 text-purple-600 fill-purple-600 animate-bounce" />
              <span>sedang mengetik...</span>
            </div>
          )}

          {isLimitReached && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm space-y-3 mt-4 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Batas 5 Pertanyaan Sesi Ini Telah Tercapai</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-xs">
                Terima kasih banyak sudah berbagi cerita di sesi AI kali ini 💜. Untuk pendampingan psikologis yang lebih mendalam &amp; personal, kamu bisa lanjut berkonsultasi langsung dengan Psikolog Profesional.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={onOpenPsikolog}
                  className="py-2.5 px-4 bg-[#6C47FF] hover:bg-[#5034D4] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Konsultasi Psikolog Profesional</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips */}
        {!isLimitReached && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-full bg-white border border-purple-200/80 text-[11px] font-medium text-purple-800 hover:bg-purple-50 shrink-0 cursor-pointer transition-all active:scale-95 shadow-2xs disabled:opacity-50"
                disabled={isTyping}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="mt-3 bg-white p-2 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isLimitReached
                ? 'Batas 5 pertanyaan tercapai. Konsultasi lebih lanjut bersama Psikolog.'
                : `Ketik curhatanmu di sini... (Pertanyaan ${questionsCount + 1}/5)`
            }
            disabled={isTyping || isLimitReached}
            className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping || isLimitReached}
            className="w-10 h-10 rounded-xl bg-[#6C47FF] text-white flex items-center justify-center shrink-0 disabled:bg-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </main>

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onGoHome={onBackToHome}
        onStartCurhat={() => {}}
        onOpenPsikolog={onOpenPsikolog}
        onOpenDashboard={onOpenDashboard}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onOpenPsikotes={onOpenPsikotes}
      />

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav
        activeTab="chat"
        onGoHome={onBackToHome}
        onOpenPsikolog={onOpenPsikolog}
        onStartCurhat={() => {}}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onOpenPsikotes={onOpenPsikotes}
        onOpenNav={onBackToHome}
      />
    </div>
  );
};
