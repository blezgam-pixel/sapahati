import React, { useState, useEffect, Suspense } from 'react';
import { Header } from './components/user/Header';
import { HeroSection } from './components/user/HeroSection';
import { FeaturesSection } from './components/user/FeaturesSection';
import { BannerSection } from './components/user/BannerSection';
import { Footer } from './components/user/Footer';

// Lazy Loaded Modals
const CurhatAiModal = React.lazy(() => import('./components/user/CurhatAiModal').then(m => ({ default: m.CurhatAiModal })));
const PsikologModal = React.lazy(() => import('./components/psychologist/PsikologModal').then(m => ({ default: m.PsikologModal })));
const MoodTrackerModal = React.lazy(() => import('./components/user/MoodTrackerModal').then(m => ({ default: m.MoodTrackerModal })));
const NavigationDrawer = React.lazy(() => import('./components/user/NavigationDrawer').then(m => ({ default: m.NavigationDrawer })));

// Lazy Loaded Pages
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const PsikotesPage = React.lazy(() => import('./pages/psikotes/PsikotesPage').then(m => ({ default: m.PsikotesPage })));
const PersonalityQuizPage = React.lazy(() => import('./pages/quiz/PersonalityQuizPage').then(m => ({ default: m.PersonalityQuizPage })));
const CurhatAiPage = React.lazy(() => import('./pages/chat/CurhatAiPage').then(m => ({ default: m.CurhatAiPage })));
const KonsultasiPsikologPage = React.lazy(() => import('./pages/konsultasi/KonsultasiPsikologPage').then(m => ({ default: m.KonsultasiPsikologPage })));
const MoodTrackerPage = React.lazy(() => import('./pages/journal/MoodTrackerPage').then(m => ({ default: m.MoodTrackerPage })));
const DaftarMitraPage = React.lazy(() => import('./pages/mitra/DaftarMitraPage').then(m => ({ default: m.DaftarMitraPage })));
import { FlyingAirplane } from './components/user/FlyingAirplane';
import { MobileHomeView } from './components/user/MobileHomeView';
import { MobileBottomNav } from './components/user/MobileBottomNav';
import { processImageToTransparentUrl } from './components/common/TransparentImage';
import { APP_IMAGES } from './data/appImages';
import { getCmsConfig, subscribeCmsConfig, useCmsConfig, CmsConfig } from './data/cmsStore';
import { initGoogleAuth } from './services/googleSheets';

export default function App() {
  const cmsConfig = useCmsConfig();

  // Automatically trigger Google Sheets auth & background data sync on app start
  useEffect(() => {
    initGoogleAuth();
  }, []);
  // Simple SPA Route State
  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    if (hash === '#/sp-dash-9f3a' || path === '/sp-dash-9f3a') {
      return 'admin';
    }
    if (hash === '#psikotes' || hash === '#/psikotes' || path === '/psikotes') {
      return 'psikotes';
    }
    if (hash === '#kuis' || hash === '#/kuis' || hash === '#quiz' || hash === '#/quiz' || path === '/kuis') {
      return 'quiz';
    }
    if (hash === '#chat' || hash === '#/chat' || hash === '#curhat' || hash === '#/curhat' || path === '/chat') {
      return 'chat';
    }
    if (hash === '#psikolog' || hash === '#/psikolog' || hash === '#konsultasi' || hash === '#/konsultasi' || path === '/psikolog') {
      return 'konsultasi';
    }
    if (hash === '#journal' || hash === '#/journal' || hash === '#jurnal' || hash === '#/jurnal' || path === '/jurnal') {
      return 'journal';
    }
    if (hash === '#mitra' || hash === '#/mitra' || hash === '#daftar-mitra' || hash === '#/daftar-mitra' || path === '/mitra') {
      return 'mitra';
    }
    return 'home';
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#/sp-dash-9f3a' || path === '/sp-dash-9f3a') {
        setRoute('admin');
      } else if (hash === '#psikotes' || hash === '#/psikotes' || path === '/psikotes') {
        setRoute('psikotes');
      } else if (hash === '#kuis' || hash === '#/kuis' || hash === '#quiz' || hash === '#/quiz' || path === '/kuis') {
        setRoute('quiz');
      } else if (hash === '#chat' || hash === '#/chat' || hash === '#curhat' || hash === '#/curhat' || path === '/chat') {
        setRoute('chat');
      } else if (hash === '#psikolog' || hash === '#/psikolog' || hash === '#konsultasi' || hash === '#/konsultasi' || path === '/psikolog') {
        setRoute('konsultasi');
      } else if (hash === '#journal' || hash === '#/journal' || hash === '#jurnal' || hash === '#/jurnal' || path === '/jurnal') {
        setRoute('journal');
      } else if (hash === '#mitra' || hash === '#/mitra' || hash === '#daftar-mitra' || hash === '#/daftar-mitra' || path === '/mitra') {
        setRoute('mitra');
      } else {
        setRoute('home');
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = '#/sp-dash-9f3a';
    setRoute('admin');
  };

  const navigateToPsikotes = () => {
    window.location.hash = '#/psikotes';
    setRoute('psikotes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToQuiz = () => {
    window.location.hash = '#/kuis';
    setRoute('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToChat = () => {
    window.location.hash = '#/chat';
    setRoute('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToKonsultasi = () => {
    window.location.hash = '#/konsultasi';
    setRoute('konsultasi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToJournal = () => {
    window.location.hash = '#/jurnal';
    setRoute('journal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMitra = () => {
    window.location.hash = '#/mitra';
    setRoute('mitra');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.location.hash = '';
    setRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamically update favicon based on configured CMS appIcon / logo
  useEffect(() => {
    const updateFavicon = async (cmsConfig?: CmsConfig) => {
      const config = cmsConfig || getCmsConfig();
      const iconUrl = config.branding?.appIcon || config.branding?.logoImage || APP_IMAGES.appIcon;
      if (iconUrl && iconUrl.trim().length > 0) {
        const transparentIconUrl = await processImageToTransparentUrl(iconUrl);
        let favicons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
        if (favicons.length === 0) {
          const favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(favicon);
          favicons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
        }
        favicons.forEach((fav) => {
          fav.href = transparentIconUrl;
        });
      }
    };

    updateFavicon();
    const unsub = subscribeCmsConfig((cfg) => updateFavicon(cfg));
    return () => unsub();
  }, []);

  // Modal and Drawer States
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCurhatAiOpen, setIsCurhatAiOpen] = useState(false);
  const [isPsikologOpen, setIsPsikologOpen] = useState(false);
  const [isMoodTrackerOpen, setIsMoodTrackerOpen] = useState(false);

  const SuspenseFallback = () => (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8FF]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9F8BE9]"></div>
    </div>
  );

  // IF ADMIN ROUTE -> RENDER STANDALONE ADMIN DASHBOARD PAGE
  if (route === 'admin') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <AdminDashboardPage onBackToMainApp={navigateToHome} />
      </Suspense>
    );
  }

  // IF PSIKOTES ROUTE -> RENDER STANDALONE PSIKOTES PAGE
  if (route === 'psikotes') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <PsikotesPage
          onBackToHome={navigateToHome}
          onOpenDashboard={navigateToAdmin}
          onOpenJournal={navigateToJournal}
          onOpenMitra={navigateToMitra}
          onStartCurhat={navigateToChat}
          onOpenPsikolog={navigateToKonsultasi}
        />
      </Suspense>
    );
  }

  // IF QUIZ ROUTE -> RENDER DEDICATED PERSONALITY QUIZ PAGE
  if (route === 'quiz') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <PersonalityQuizPage
          onBackToHome={navigateToHome}
          onOpenDashboard={navigateToAdmin}
          onOpenPsikotes={navigateToPsikotes}
          onOpenJournal={navigateToJournal}
          onOpenMitra={navigateToMitra}
          onStartCurhat={navigateToChat}
          onOpenPsikolog={navigateToKonsultasi}
        />
      </Suspense>
    );
  }

  // IF CHAT ROUTE -> RENDER DEDICATED AI CHAT PAGE
  if (route === 'chat') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <CurhatAiPage
          onBackToHome={navigateToHome}
          onOpenPsikolog={navigateToKonsultasi}
          onOpenPsikotes={navigateToPsikotes}
          onOpenDashboard={navigateToAdmin}
          onOpenJournal={navigateToJournal}
          onOpenMitra={navigateToMitra}
        />
      </Suspense>
    );
  }

  // IF KONSULTASI ROUTE -> RENDER DEDICATED PSYCHOLOGIST CONSULTATION PAGE
  if (route === 'konsultasi') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <KonsultasiPsikologPage
          onBackToHome={navigateToHome}
          onOpenPsikotes={navigateToPsikotes}
          onStartCurhat={navigateToChat}
          onOpenDashboard={navigateToAdmin}
          onOpenJournal={navigateToJournal}
          onOpenMitra={navigateToMitra}
        />
      </Suspense>
    );
  }

  // IF JOURNAL ROUTE -> RENDER DEDICATED MOOD TRACKER & JOURNAL PAGE
  if (route === 'journal') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <MoodTrackerPage
          onBackToHome={navigateToHome}
          onOpenPsikolog={navigateToKonsultasi}
          onOpenPsikotes={navigateToPsikotes}
          onStartCurhat={navigateToChat}
          onOpenDashboard={navigateToAdmin}
          onOpenJournal={navigateToJournal}
          onOpenMitra={navigateToMitra}
        />
      </Suspense>
    );
  }

  // IF MITRA ROUTE -> RENDER DEDICATED DAFTAR MITRA PAGE
  if (route === 'mitra') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <DaftarMitraPage
          onBackToHome={navigateToHome}
          onOpenPsikolog={navigateToKonsultasi}
          onOpenPsikotes={navigateToPsikotes}
          onStartCurhat={navigateToChat}
          onOpenDashboard={navigateToAdmin}
          onOpenJournal={navigateToJournal}
          onOpenMitra={navigateToMitra}
        />
      </Suspense>
    );
  }

  // ELSE RENDER MAIN PATIENT WEBSITE
  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D123B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-purple-200 overflow-x-clip w-full">
      
      {/* Animasi Pesawat Terbang */}
      <FlyingAirplane />

      {/* Top Header for Desktop */}
      <div className="hidden md:block">
        <Header
          onOpenNav={() => setIsNavOpen(true)}
          onStartCurhat={navigateToChat}
          onOpenPsikolog={navigateToKonsultasi}
          onOpenMoodTracker={() => setIsMoodTrackerOpen(true)}
          onOpenPsikotes={navigateToPsikotes}
          onGoHome={navigateToHome}
        />
      </div>

      {/* Main Page Layout */}
      <main className="flex-1 pt-0 md:pt-20 pb-0 md:pb-10">
        
        {/* Dedicated Mobile View (Halodoc Style Dashboard) */}
        <MobileHomeView
          onStartCurhat={navigateToChat}
          onOpenPsikolog={navigateToKonsultasi}
          onOpenMoodTracker={navigateToJournal}
          onOpenPsikotes={navigateToPsikotes}
          onOpenQuiz={navigateToQuiz}
          onOpenNav={() => setIsNavOpen(true)}
          onOpenDashboard={navigateToAdmin}
        />

        {/* Desktop Main Layout */}
        <div className="hidden md:block">
          {/* Hero Section */}
          <HeroSection
            onStartCurhat={navigateToChat}
            onOpenPsikolog={navigateToKonsultasi}
          />

          {/* Section 2: Kami hadir untukmu */}
          <FeaturesSection
            onStartCurhat={navigateToChat}
            onOpenPsikolog={navigateToKonsultasi}
            onOpenMoodTracker={() => setIsMoodTrackerOpen(true)}
          />

          {/* Section 3: Kamu tidak sendiri */}
          <BannerSection
            onStartCurhat={navigateToChat}
          />
        </div>

      </main>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer
          onOpenDashboard={navigateToAdmin}
          onOpenPsikolog={navigateToKonsultasi}
        />
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        activeTab="home"
        onGoHome={navigateToHome}
        onStartCurhat={navigateToChat}
        onOpenJournal={navigateToJournal}
        onOpenMitra={navigateToMitra}
        onOpenPsikolog={navigateToKonsultasi}
        onOpenPsikotes={navigateToPsikotes}
        onOpenNav={navigateToMitra}
      />

      {/* Modals & Drawers */}
      <Suspense fallback={null}>
        {isCurhatAiOpen && (
          <CurhatAiModal
            isOpen={isCurhatAiOpen}
            onClose={() => setIsCurhatAiOpen(false)}
            onOpenPsikolog={navigateToKonsultasi}
            botAvatar={cmsConfig.branding.botAvatar}
          />
        )}

        {isPsikologOpen && (
          <PsikologModal
            isOpen={isPsikologOpen}
            onClose={() => setIsPsikologOpen(false)}
          />
        )}

        {isMoodTrackerOpen && (
          <MoodTrackerModal
            isOpen={isMoodTrackerOpen}
            onClose={() => setIsMoodTrackerOpen(false)}
          />
        )}

        {isNavOpen && (
          <NavigationDrawer
            isOpen={isNavOpen}
            onClose={() => setIsNavOpen(false)}
            onStartCurhat={navigateToChat}
            onOpenPsikolog={navigateToKonsultasi}
            onOpenMoodTracker={() => setIsMoodTrackerOpen(true)}
            onOpenJournal={navigateToJournal}
            onOpenMitra={navigateToMitra}
            onOpenPsikotes={navigateToPsikotes}
            onGoHome={navigateToHome}
          />
        )}
      </Suspense>

    </div>
  );
}
