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
            width={96}
            height={96}
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
          <span>الإصدار 1.0.0 • 2026 SudanZon</span>
        </div>
      </div>
    </div>
  );
}
