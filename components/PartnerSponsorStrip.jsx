"use client";

import { useEffect, useRef } from "react";
import { resolveImageUrl } from "../lib/media";
import { getAdActionHref, trackAdClick, trackAdView } from "../lib/ads";

export default function PartnerSponsorStrip({ ads = [] }) {
  const feedAds = (ads || []).filter((ad) => ad.placement === "HOME_FEED_CARD" && ad.isActive);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!feedAds.length || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            feedAds.forEach((ad) => trackAdView(ad.id));
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [feedAds]);

  if (!feedAds.length) return null;

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case "WHATSAPP":
        return "💬 تواصل عبر واتساب";
      case "PHONE_CALL":
        return "📞 اتصال هاتفي مباشر";
      case "APP_STORE":
        return "📲 تحميل التطبيق";
      case "WEBSITE_URL":
      default:
        return "🌐 زيارة الموقع / العرض";
    }
  };

  return (
    <section className="szPartnerSponsorSection" ref={containerRef}>
      <div className="container">
        <div className="szPartnerSponsorGrid">
          {feedAds.map((ad) => {
            const href = getAdActionHref(ad);
            const bannerImg = resolveImageUrl(ad.imageUrl);
            const logoImg = ad.sponsorLogo ? resolveImageUrl(ad.sponsorLogo) : null;
            const isExternal = ad.actionType === "WEBSITE_URL" || ad.actionType === "APP_STORE" || ad.actionType === "WHATSAPP";

            return (
              <div key={ad.id} className="szPartnerCard">
                {bannerImg && (
                  <div className="szPartnerBannerWrap">
                    <img
                      src={bannerImg}
                      alt={ad.title}
                      className="szPartnerBannerImg"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="szPartnerBannerOverlay" />
                  </div>
                )}

                <div className="szPartnerContentWrap">
                  <div className="szPartnerMetaRow">
                    {logoImg ? (
                      <div className="szPartnerLogo">
                        <img src={logoImg} alt={ad.sponsorName || "الراعي"} />
                      </div>
                    ) : (
                      <div className="szPartnerLogoPlaceholder">
                        <span>🏢</span>
                      </div>
                    )}
                    <div className="szPartnerInfo">
                      <div className="szPartnerTagBadge">
                        <span className="szSparkle">✦</span>
                        <span>شريك معتمد</span>
                        {ad.sponsorName && <strong className="szPartnerName">• {ad.sponsorName}</strong>}
                      </div>
                      <h3 className="szPartnerTitle">{ad.title}</h3>
                    </div>
                  </div>

                  {ad.description && <p className="szPartnerDesc">{ad.description}</p>}

                  <div className="szPartnerActionRow">
                    <a
                      href={href}
                      target={isExternal ? "_blank" : "_self"}
                      rel={isExternal ? "noopener noreferrer" : ""}
                      onClick={() => trackAdClick(ad.id)}
                      className="szPartnerCtaBtn"
                    >
                      <span>{getActionLabel(ad.actionType)}</span>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
