"use client";

import { useEffect, useRef } from "react";
import { resolveImageUrl } from "../lib/media";
import { getAdActionHref, trackAdClick, trackAdView } from "../lib/ads";

export default function ProductAdBanner({ ads = [] }) {
  const productAds = (ads || []).filter((ad) => ad.placement === "PRODUCT_DETAILS" && ad.isActive);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!productAds.length || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            productAds.forEach((ad) => trackAdView(ad.id));
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [productAds]);

  if (!productAds.length) return null;

  const ad = productAds[0];
  const href = getAdActionHref(ad);
  const bannerImg = resolveImageUrl(ad.imageUrl);
  const logoImg = ad.sponsorLogo ? resolveImageUrl(ad.sponsorLogo) : null;
  const isExternal = ad.actionType === "WEBSITE_URL" || ad.actionType === "APP_STORE" || ad.actionType === "WHATSAPP";

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case "WHATSAPP":
        return "استفسر عبر واتساب 💬";
      case "PHONE_CALL":
        return "اتصل الآن 📞";
      case "APP_STORE":
        return "تحميل التطبيق 📲";
      case "WEBSITE_URL":
      default:
        return "اكتشف المزيد ❯";
    }
  };

  return (
    <div className="szProductAdBanner" ref={containerRef}>
      {bannerImg && (
        <div className="szProductAdBannerMedia">
          <img src={bannerImg} alt={ad.title} loading="lazy" decoding="async" />
        </div>
      )}
      <div className="szProductAdBannerBody">
        <div className="szProductAdBannerHead">
          {logoImg && <img src={logoImg} alt={ad.sponsorName || "الراعي"} className="szProductAdLogo" />}
          <div className="szProductAdMeta">
            <span className="szProductAdSponsoredTag">✦ ممول • {ad.sponsorName || "شريك سودان زون"}</span>
            <h4 className="szProductAdTitle">{ad.title}</h4>
          </div>
        </div>
        {ad.description && <p className="szProductAdDesc">{ad.description}</p>}
        <a
          href={href}
          target={isExternal ? "_blank" : "_self"}
          rel={isExternal ? "noopener noreferrer" : ""}
          onClick={() => trackAdClick(ad.id)}
          className="szProductAdCta"
        >
          {getActionLabel(ad.actionType)}
        </a>
      </div>
    </div>
  );
}
