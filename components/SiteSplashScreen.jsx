"use client";

import { useEffect, useState } from "react";

export default function SiteSplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(12);
  const [statusText, setStatusText] = useState("جارِ الاتصال الآمن بسيرفرات سودان زون...");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  useEffect(() => {
    // Only run on client
    setMounted(true);

    const step1 = setTimeout(() => {
      setProgress(45);
      setStatusText("تجهيز العروض الحصرية والمتاجر المعتمدة...");
    }, 400);

    const step2 = setTimeout(() => {
      setProgress(85);
      setStatusText("تحميل نبض السوق وبيانات الدفع...");
    }, 850);

    const step3 = setTimeout(() => {
      setProgress(100);
      setStatusText("أهلاً بك في سودان زون 🇸🇩✨");
    }, 1250);

    const fadeStep = setTimeout(() => {
      setIsFadingOut(true);
    }, 1550);

    const destroyStep = setTimeout(() => {
      setDestroyed(true);
    }, 2050);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(fadeStep);
      clearTimeout(destroyStep);
    };
  }, []);

  if (!mounted || destroyed) {
    return null;
  }

  return (
    <div
      className={`szSplashOverlay ${isFadingOut ? "szSplashOverlay--fadeOut" : ""}`}
      aria-hidden={isFadingOut}
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

        {/* Progress Bar */}
        <div className="szSplashProgressTrack">
          <div
            className="szSplashProgressBar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Status Text */}
        <p className="szSplashStatusText">{statusText}</p>

        <div className="szSplashFooterVer">
          <span>الإصدار 2.0 • 2026 SudanZon</span>
        </div>
      </div>

      <style jsx>{`
        .szSplashOverlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #090d16;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          direction: rtl;
          font-family: var(--font-tajawal), system-ui, sans-serif;
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      visibility 0.5s ease;
          opacity: 1;
          transform: scale(1);
          visibility: visible;
        }

        .szSplashOverlay--fadeOut {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
          visibility: hidden;
        }

        .szSplashGlow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.28;
          animation: floatGlow 6s ease-in-out infinite alternate;
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

        @keyframes floatGlow {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(25px, 20px) scale(1.15);
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
          max-width: 420px;
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
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
          animation: pulseRing 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.85);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.85);
            opacity: 0.4;
          }
        }

        .szSplashLogoImg {
          width: 96px;
          height: 96px;
          object-fit: contain;
          border-radius: 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
          animation: logoEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes logoEntrance {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(15px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .szSplashBrandTitle {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .szSplashBrandSub {
          margin: 4px 0 0 0;
          font-size: 0.78rem;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 2.5px;
          opacity: 0.95;
        }

        .szSplashDivider {
          width: 46px;
          height: 3px;
          border-radius: 99px;
          background: linear-gradient(90deg, #10b981, #f59e0b);
          margin: 14px 0;
        }

        .szSplashFlagBadge {
          padding: 6px 14px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          margin-bottom: 24px;
        }

        .szSplashFlagBadge span {
          font-size: 0.82rem;
          color: #e2e8f0;
          font-weight: 600;
        }

        .szSplashProgressTrack {
          width: 100%;
          max-width: 280px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        .szSplashProgressBar {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399, #fbbf24);
          border-radius: 99px;
          transition: width 0.35s ease-out;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
        }

        .szSplashStatusText {
          margin: 0;
          font-size: 0.82rem;
          color: #94a3b8;
          font-weight: 500;
          min-height: 20px;
          transition: color 0.2s ease;
        }

        .szSplashFooterVer {
          margin-top: 32px;
          font-size: 0.72rem;
          color: #475569;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
