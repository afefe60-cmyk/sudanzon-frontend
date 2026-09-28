import { API_BASE_URL } from "./api";

const viewedAdsSet = new Set();

export function getAdActionHref(ad) {
  if (!ad) return "#";
  const actionType = ad.actionType || "WEBSITE_URL";
  const val = (ad.actionValue || "").trim();

  switch (actionType) {
    case "WHATSAPP": {
      const cleanPhone = val.replace(/[^0-9]/g, "");
      const msg = encodeURIComponent(`مرحباً، أود الاستفسار بخصوص: ${ad.title || "إعلانكم على سودان زون"}`);
      return cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : "#";
    }
    case "PHONE_CALL": {
      const cleanPhone = val.replace(/[^0-9+]/g, "");
      return cleanPhone ? `tel:${cleanPhone}` : "#";
    }
    case "APP_STORE":
    case "WEBSITE_URL":
    default: {
      if (!val) return "#";
      if (val.startsWith("http://") || val.startsWith("https://")) {
        return val;
      }
      return `https://${val}`;
    }
  }
}

export function trackAdView(adId) {
  if (!adId || viewedAdsSet.has(adId)) return;
  viewedAdsSet.add(adId);

  try {
    fetch(`${API_BASE_URL}/api/ads/${encodeURIComponent(adId)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore analytics network errors
  }
}

export function trackAdClick(adId) {
  if (!adId) return;

  try {
    fetch(`${API_BASE_URL}/api/ads/${encodeURIComponent(adId)}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore analytics network errors
  }
}
