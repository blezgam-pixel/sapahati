import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isVisible: boolean;
  logoUrl?: string;
  brandName?: string;
}

export function SplashScreen({ isVisible, logoUrl, brandName }: SplashScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
      setIsFadingOut(false);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #F0EAFF 0%, #E8DEFF 40%, #F5F0FF 70%, #EEE6FF 100%)',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(159,139,233,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '5%', width: '20vw', height: '20vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,253,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '48px 56px', borderRadius: '28px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 8px 48px rgba(139,92,246,0.12), 0 2px 16px rgba(139,92,246,0.08)', border: '1px solid rgba(255,255,255,0.7)', maxWidth: '380px', width: '90vw', animation: 'sapahati-splash-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>

        {logoUrl && logoUrl.trim().length > 5 ? (
          <img src={logoUrl} alt="Sapa Hati Logo" style={{ width: '88px', height: '88px', objectFit: 'contain', borderRadius: '20px', filter: 'drop-shadow(0 4px 16px rgba(139,92,246,0.25))', animation: 'sapahati-logo-float 3s ease-in-out infinite' }} />
        ) : (
          <div style={{ width: '88px', height: '88px', borderRadius: '20px', background: 'linear-gradient(135deg, #9F8BE9 0%, #7C5CDB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 8px 24px rgba(139,92,246,0.3)', animation: 'sapahati-logo-float 3s ease-in-out infinite' }}>
            {'\u{1F49C}'}
          </div>
        )}

        <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
          <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9F8BE9' }}>
            Selamat Datang di
          </p>
          <h1 style={{ margin: '0 0 10px', fontSize: '32px', fontWeight: 800, background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #9F8BE9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.5px' }}>
            {brandName && brandName.trim() ? brandName : 'Sapa Hati'} {'\u{1F49C}'}
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#6D5A9E', fontWeight: 400, lineHeight: 1.6 }}>
            Ruang aman untuk berbagi,<br />bercerita, dan bertumbuh bersama.
          </p>
        </div>

        <div style={{ width: '48px', height: '3px', borderRadius: '99px', background: 'linear-gradient(90deg, #9F8BE9, #C4B5FD)' }} />

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9F8BE9', animation: 'sapahati-dot-bounce 1.4s ease-in-out 0s infinite' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9F8BE9', animation: 'sapahati-dot-bounce 1.4s ease-in-out 0.2s infinite' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9F8BE9', animation: 'sapahati-dot-bounce 1.4s ease-in-out 0.4s infinite' }} />
        </div>
      </div>

      <p style={{ marginTop: '32px', fontSize: '12px', color: '#A99BC5', letterSpacing: '0.06em', textAlign: 'center' }}>
        Kami hadir untukmu, selalu {'\u{1F49C}'}
      </p>

      <style>{`
        @keyframes sapahati-splash-in {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sapahati-logo-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes sapahati-dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40%           { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
