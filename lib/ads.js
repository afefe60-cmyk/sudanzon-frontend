import { API_BASE_URL } from "./api";

const viewedAdsSet = new Set();

export function getAdActionHref(ad) {
  if (!ad) return "#";
  const actionType = String(ad.actionType || "WEBSITE_URL").toUpperCase();

  switch (actionType) {
    case "WHATSAPP": {
      const rawPhone = String(ad.whatsappPhone || ad.actionUrl || ad.actionValue || "").trim();
      let cleanPhone = rawPhone.replace(/[^0-9]/g, "");

      if (cleanPhone.startsWith("00249")) {
        cleanPhone = cleanPhone.substring(2);
      } else if (cleanPhone.startsWith("0")) {
        cleanPhone = "249" + cleanPhone.substring(1);
      } else if (cleanPhone.length === 9) {
        cleanPhone = "249" + cleanPhone;
      }

      if (!cleanPhone) return "#";

      const defaultMsg = `مرحباً، أود الاستفسار بخصوص: ${ad.title || "إعلانكم على منصة سودان زون"}`;
      const textToEncode = ad.whatsappText ? String(ad.whatsappText).trim() : defaultMsg;
      const msg = encodeURIComponent(textToEncode);

      // api.whatsapp.com/send directly opens WhatsApp app on mobile and web
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`;
    }

    case "PHONE_CALL": {
      const rawPhone = String(ad.callPhone || ad.actionUrl || ad.actionValue || "").trim();
      const cleanPhone = rawPhone.replace(/[^0-9+]/g, "");
      return cleanPhone ? `tel:${cleanPhone}` : "#";
    }

    case "APP_STORE":
    case "WEBSITE_URL":
    default: {
      const val = String(ad.actionUrl || ad.actionValue || "").trim();
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
