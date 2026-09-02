import SiteHeader from "../../../components/SiteHeader";
import StoreProfileClient from "../../../components/StoreProfileClient";
import { apiJson } from "../../../lib/api";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com").replace(/\/+$/, "");

async function getStoreData(slug) {
  if (!slug) return null;

  let cleanSlug = "";
  try {
    cleanSlug = decodeURIComponent(String(slug));
  } catch {
    cleanSlug = String(slug);
  }

  try {
    const res = await apiJson(`/api/products/stores/${encodeURIComponent(cleanSlug)}`, {
      cache: "no-store",
    });
    if (res?.store) return res.store;
  } catch {
    try {
      const fallbackRes = await apiJson(`/api/products/stores/${cleanSlug}`, {
        cache: "no-store",
      });
      if (fallbackRes?.store) return fallbackRes.store;
    } catch {
      return null;
    }
  }
  return null;
}

function resolveStoreShareImages(store) {
  if (!store) {
    return {
      optimized: "https://sudanzon.com/logo.png",
      direct: "https://sudanzon.com/logo.png",
      mimeType: "image/png",
    };
  }

  let candidate = store.logo || store.banner;

  if (!candidate && Array.isArray(store.products) && store.products.length > 0) {
    const first = store.products[0];
    candidate = first?.image || (Array.isArray(first?.images) ? first.images[0] : null);
  }

  if (!candidate) {
    return {
      optimized: "https://sudanzon.com/logo.png",
      direct: "https://sudanzon.com/logo.png",
      mimeType: "image/png",
    };
  }

  const raw = String(candidate).trim();
  let direct = "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    direct = raw;
  } else {
    const cleanPath = raw.startsWith("/") ? raw : `/${raw}`;
    direct = `https://api.sudanzon.com${cleanPath}`;
  }

  // Next.js automatic image optimization ensures the image is < 100KB, perfectly compliant with WhatsApp's strict 300KB limit
  const optimized = `https://sudanzon.com/_next/image?url=${encodeURIComponent(direct)}&w=600&q=80`;
  const isPng = raw.toLowerCase().endsWith(".png");
  const isWebp = raw.toLowerCase().endsWith(".webp");
  const mimeType = isPng ? "image/png" : isWebp ? "image/webp" : "image/jpeg";

  return {
    optimized,
    direct,
    mimeType,
  };
}

export async function generateMetadata({ params }) {
  const store = await getStoreData(params?.slug);

  let cleanSlug = "";
  try {
    cleanSlug = decodeURIComponent(String(params?.slug || ""));
  } catch {
    cleanSlug = String(params?.slug || "");
  }

  if (!store) {
    return {
      title: "متجر غير متاح | سودان زون (SudanZon)",
      description: "تسوق أفضل العروض والمنتجات الأصلية من كافة المتاجر المعتمدة في السودان عبر منصة سودان زون.",
    };
  }

  const storeName = store.storeName || "متجر معتمد";
  const desc =
    store.description ||
    `تصفح كافة منتجات وعروض متجر ${storeName} الحصرية على منصة سودان زون. تواصل مباشر مع التاجر عبر واتساب وتوصيل سريع لكافة المدن والدفع عند الاستلام وبنكك.`;

  const { optimized, direct, mimeType } = resolveStoreShareImages(store);
  const canonicalUrl = `https://sudanzon.com/stores/${encodeURIComponent(cleanSlug)}`;

  return {
    title: `متجر ${storeName} | تسوق أونلاين في السودان (SudanZon)`,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `متجر ${storeName} 🏬 | منصة سودان زون`,
      description: desc,
      url: canonicalUrl,
      siteName: "سودان زون | SudanZon",
      images: [
        {
          url: optimized,
          secureUrl: optimized,
          width: 600,
          height: 600,
          type: mimeType,
          alt: `شعار متجر ${storeName}`,
        },
        {
          url: direct,
          secureUrl: direct,
          width: 800,
          height: 800,
          type: mimeType,
          alt: `متجر ${storeName}`,
        },
      ],
      locale: "ar_SD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `متجر ${storeName} | سودان زون`,
      description: desc,
      images: [optimized],
    },
  };
}

export default async function StorePage({ params }) {
  const store = await getStoreData(params?.slug);

  let cleanSlug = "";
  try {
    cleanSlug = decodeURIComponent(String(params?.slug || ""));
  } catch {
    cleanSlug = String(params?.slug || "");
  }

  const storeName = store?.storeName || cleanSlug;
  const canonicalUrl = `https://sudanzon.com/stores/${encodeURIComponent(cleanSlug)}`;
  const { direct: logoUrl } = resolveStoreShareImages(store);

  const jsonLd = store
    ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name: store.storeName,
        description: store.description || `متجر ${store.storeName} المعتمد على منصة سودان زون.`,
        url: canonicalUrl,
        image: logoUrl,
        telephone: store.user?.phone || "+249",
        address: {
          "@type": "PostalAddress",
          addressLocality: store.user?.city || "الخرطوم",
          addressCountry: "SD",
        },
        priceRange: "$$",
        currenciesAccepted: "SDG",
        paymentAccepted: "Cash, Bankak, Card",
      }
    : null;

  return (
    <main className="szPageShell">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SiteHeader />
      <StoreProfileClient initialStore={store} initialSlug={cleanSlug} />
    </main>
  );
}
