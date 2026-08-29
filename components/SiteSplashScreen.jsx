"use client";

import { useEffect, useState } from "react";

export default function SiteSplashScreen() {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  useEffect(() => {
    // Keep splash visible for 1.8s, then trigger smooth fade-out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    const destroyTimer = setTimeout(() => {
      setDestroyed(true);
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (destroyed) {
    return null;
  }

  return (
    <div
      id="szSiteSplash"
      className={`szSplashOverlay ${isFadingOut ? "szSplashOverlay--fadeOut" : ""}`}
    >
      {/* Background Ambient Glows */}
      <div className="szSplashGlow szSplashGlow--emerald" />
      <div className="szSplashGlow szSplashGlow--gold" />

      <div className="szSplashCenterBox">
        {/* Logo Container with Breathing Ring */}
        <div className="szSplashLogoWrap">
          <div className="szSplashPulseRing" />
          <img
            src="/logo.png"
            alt="SudanZon"
            className="szSplashLogoImg"
            onError={(e) => {
              e.currentTarget.src = "/favicon.png";
            }}
          />
        </div>

        {/* Brand Typography */}
        <h1 className="szSplashBrandTitle">سودان زون</h1>
        <p className="szSplashBrandSub">SUDAN ZON MARKET</p>

        <div className="szSplashDivider" />

        <div className="szSplashFlagBadge">
          <span>🇸🇩 منصة التجارة والتسوق السودانية الأولى</span>
        </div>

        {/* Progress Bar with CSS Keyframe Animation */}
        <div className="szSplashProgressTrack">
          <div className="szSplashProgressBar" />
        </div>

        {/* Status Text */}
        <p className="szSplashStatusText">جارِ تجهيز العروض والمتاجر الحصرية...</p>

        <div className="szSplashFooterVer">
          <span>الإصدار 2.0 • 2026 SudanZon</span>
        </div>
      </div>

      <style jsx global>{`
        #szSiteSplash.szSplashOverlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 99999999 !important;
          background: #090d16 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          direction: rtl !important;
          font-family: var(--font-tajawal), system-ui, sans-serif !important;
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      visibility 0.6s ease !important;
          opacity: 1;
          transform: scale(1);
          visibility: visible;
          pointer-events: all;
        }

        #szSiteSplash.szSplashOverlay--fadeOut {
          opacity: 0 !important;
          transform: scale(1.05) !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        .szSplashGlow {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.32;
          animation: szFloatGlow 6s ease-in-out infinite alternate;
        }

        .szSplashGlow--emerald {
          top: 15%;
          right: 20%;
          background: #059669;
        }

        .szSplashGlow--gold {
          bottom: 15%;
          left: 20%;
          background: #d97706;
          animation-delay: -3s;
        }

        @keyframes szFloatGlow {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(30px, 25px) scale(1.2);
          }
        }

        .szSplashCenterBox {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px;
          max-width: 440px;
          width: 90%;
        }

        .szSplashLogoWrap {
          position: relative;
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .szSplashPulseRing {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%);
          animation: szPulseRing 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        @keyframes szPulseRing {
          0% {
            transform: scale(0.85);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.85);
            opacity: 0.3;
          }
        }

        .szSplashLogoImg {
          width: 96px;
          height: 96px;
          object-fit: contain;
          border-radius: 22px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55);
          animation: szLogoEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes szLogoEntrance {
          0% {
            opacity: 0;
            transform: scale(0.7) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .szSplashBrandTitle {
          margin: 0;
          font-size: 2.1rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
        }

        .szSplashBrandSub {
          margin: 4px 0 0 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 2.8px;
          opacity: 0.95;
        }

        .szSplashDivider {
          width: 48px;
          height: 3px;
          border-radius: 99px;
          background: linear-gradient(90deg, #10b981, #f59e0b);
          margin: 16px 0;
        }

        .szSplashFlagBadge {
          padding: 6px 16px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(12px);
          margin-bottom: 26px;
        }

        .szSplashFlagBadge span {
          font-size: 0.84rem;
          color: #e2e8f0;
          font-weight: 600;
        }

        .szSplashProgressTrack {
          width: 100%;
          max-width: 290px;
          height: 5px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 14px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .szSplashProgressBar {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399, #fbbf24);
          border-radius: 99px;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);
          animation: szFillProgress 1.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes szFillProgress {
          0% {
            width: 0%;
          }
          40% {
            width: 55%;
          }
          80% {
            width: 88%;
          }
          100% {
            width: 100%;
          }
        }

        .szSplashStatusText {
          margin: 0;
          font-size: 0.84rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .szSplashFooterVer {
          margin-top: 36px;
          font-size: 0.74rem;
          color: #475569;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
