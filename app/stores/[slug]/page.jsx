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

  let logoUrl = "https://sudanzon.com/logo.png";
  if (store.logo) {
    if (store.logo.startsWith("http")) {
      logoUrl = store.logo;
    } else if (store.logo.startsWith("/uploads/")) {
      logoUrl = `${API_BASE}${store.logo}`;
    }
  }

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
          url: logoUrl,
          width: 800,
          height: 800,
          alt: `شعار متجر ${storeName}`,
        },
      ],
      locale: "ar_SD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `متجر ${storeName} | سودان زون`,
      description: desc,
      images: [logoUrl],
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
  const logoUrl = store?.logo
    ? store.logo.startsWith("http")
      ? store.logo
      : `${API_BASE}${store.logo}`
    : "https://sudanzon.com/logo.png";

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
