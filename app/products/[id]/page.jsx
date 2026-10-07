import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import ProductDetailClient from "../../../components/ProductDetailClient";
import ProductCard from "../../../components/ProductCard";
import ProductAdBanner from "../../../components/ProductAdBanner";
import { apiJson } from "../../../lib/api";
import { getProductImage } from "../../../lib/media";
import { products as fallbackProducts } from "../../../lib/mock-data";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com").replace(/\/+$/, "");

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function loadProduct(id) {
  if (!id) return null;
  try {
    const encodedId = encodeURIComponent(String(id).trim());
    const result = await apiJson(`/api/products/${encodedId}`, { cache: "no-store" });
    if (result?.item) {
      return result.item;
    }
  } catch (e) {
    // API request failed or returned 404
  }

  const decodedId = decodeURIComponent(String(id));
  return (
    fallbackProducts.find(
      (item) =>
        String(item.id) === String(id) ||
        String(item.id) === decodedId ||
        item.slug === id ||
        item.slug === decodedId ||
        item.name === decodedId
    ) || null
  );
}

async function loadSimilarProducts(category, currentId) {
  try {
    const result = await apiJson(`/api/products?category=${encodeURIComponent(category || "")}`);
    return (result.items || []).filter((item) => String(item.id) !== String(currentId)).slice(0, 4);
  } catch {
    return fallbackProducts
      .filter((item) => item.category === category && String(item.id) !== String(currentId))
      .slice(0, 4);
  }
}

function buildSpecs(product) {
  return [
    { label: "التصنيف الرئيسي", value: product.category?.name || product.category || "عام" },
    { label: "المتجر / البائع", value: product.vendor?.storeName || product.vendor || "سودان زون" },
    { label: "حالة التوفر", value: `${product.stock ?? 10} قطعة جاهزة للشحن` },
    { label: "تقييم الجودة", value: `${product.rating ? Number(product.rating).toFixed(1) : "4.8"} من 5` },
    { label: "خيارات الدفع", value: "الدفع عند الاستلام • تطبيق بنكك" },
    { label: "الشحن والتوصيل", value: "سريع ومتاح لكافة مدن وولايات السودان" },
  ];
}

export async function generateMetadata({ params }) {
  const product = await loadProduct(params?.id);

  if (!product) {
    return {
      title: "منتج على سودان زون | SudanZon",
      description: "تسوق أفضل العروض والمنتجات الأصلية في السودان على منصة سودان زون.",
    };
  }

  const productName = product.name || "منتج فاخر";
  const priceFormatted = Number(product.price || 0).toLocaleString();
  const vendorName = product.vendor?.storeName || product.vendor || "سودان زون";

  // ذكاء اصطناعي للـ SEO: تعزيز العنوان والوصف لمحركات البحث بدون المساس بما كتبه التاجر
  const hasLocation = /السودان|الخرطوم|بورتسودان|دنقلا|مدني|بحري|أمدرمان|امدرمان/i.test(productName);
  const locationSuffix = hasLocation ? "" : "في السودان";
  const hasPriceWord = /سعر|للبيع|شراء/i.test(productName);
  const priceTag = hasPriceWord ? `${priceFormatted} ج.س` : `بأفضل سعر ${priceFormatted} ج.س`;

  // العنوان الذي سيظهر في نتائج بحث Google (محفز للنقر CTR Booster)
  const seoTitle = `${productName} ${locationSuffix} - ${priceTag} | توصيل ودفع بنكك • سودان زون`;

  // وصف الميتا الغني بالكلمات المفتاحية والمدن التي يبحث عنها المتسوقون
  const cleanDesc = (product.description || "").replace(/\s+/g, " ").trim();
  const descLead = `تسوق ${productName} ${locationSuffix} بأفضل سعر (${priceFormatted} ج.س) من متجر ${vendorName}.`;
  const descShipping = `شحن سريع وتوصيل يومي للخرطوم، دنقلا، بورتسودان وكافة ولايات السودان. دفع آمن عبر بنكك أو عند الاستلام.`;
  const seoDesc = cleanDesc
    ? `${descLead} ${cleanDesc.slice(0, 75)}... ${descShipping}`.slice(0, 160)
    : `${descLead} ${descShipping}`.slice(0, 160);

  let imgUrl = getProductImage(product);
  if (imgUrl && imgUrl.startsWith("/")) {
    imgUrl = `https://sudanzon.com${imgUrl}`;
  }

  const canonicalUrl = `https://sudanzon.com/products/${params?.id}`;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${productName} ${locationSuffix} | ${priceFormatted} ج.س - سودان زون`,
      description: seoDesc,
      url: canonicalUrl,
      siteName: "سودان زون | SudanZon",
      images: [
        {
          url: imgUrl,
          width: 800,
          height: 800,
          alt: `${productName} ${locationSuffix}`,
        },
      ],
      locale: "ar_SD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${productName} ${locationSuffix} - ${priceFormatted} ج.س`,
      description: seoDesc,
      images: [imgUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await loadProduct(params.id);

  if (!product) {
    return (
      <main className="szPageShell">
        <SiteHeader />
        <div className="container szProductDetailContainer" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "50px", marginBottom: "16px" }}>🔍</div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "10px" }}>عذراً، المنتج غير متوفر</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>قد يكون المنتج قد تم حذفه أو أن الرابط غير صحيح.</p>
          <Link href="/products" className="szHeroCtaPrimary" style={{ display: "inline-flex", margin: "0 auto" }}>
            تصفح كافة منتجات المتجر
          </Link>
        </div>
      </main>
    );
  }

  const [similarProducts, adsResult] = await Promise.all([
    loadSimilarProducts(product.category?.name || product.category, product.id),
    apiJson("/api/ads?activeOnly=true", { cache: "no-store" }).catch(() => ({ items: [] })),
  ]);

  const ads = Array.isArray(adsResult?.items) ? adsResult.items : [];
  const specs = buildSpecs(product);

  let schemaImg = getProductImage(product);
  if (schemaImg && schemaImg.startsWith("/")) {
    schemaImg = `https://sudanzon.com${schemaImg}`;
  }

  // Schema.org Structured Data for Google Rich Snippets
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [
      schemaImg,
      ...(Array.isArray(product.images)
        ? product.images.map((img) => (img && img.startsWith("/") ? `https://sudanzon.com${img}` : img))
        : []),
    ].filter(Boolean),
    description: product.description || `${product.name} متاح على سوق سودان زون`,
    sku: String(product.id),
    brand: {
      "@type": "Brand",
      name: product.vendor?.storeName || "سودان زون",
    },
    offers: {
      "@type": "Offer",
      url: `https://sudanzon.com/products/${product.id}`,
      priceCurrency: "SDG",
      price: Number(product.price || 0),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.vendor?.storeName || "سودان زون",
      },
    },
  };

  return (
    <main className="szPageShell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <SiteHeader />

      <div className="container szProductDetailContainer">
        <ProductDetailClient product={product} specs={specs} />

        {/* Sponsored Partner Banner on Product Details */}
        <ProductAdBanner ads={ads} />

        {/* Similar Products Shelf */}
        {similarProducts.length > 0 && (
          <section className="szSimilarProductsSection">
            <div className="szSectionHeaderRow">
              <div className="szSectionTitleWrap">
                <span className="szSectionBadge">✨ اختيارات مقترحة</span>
                <h2 className="szSectionMainTitle">منتجات مشابهة قد تنال إعجابك</h2>
                <p className="szSectionSubtitle">خيارات متنوعة من نفس التصنيف لتوسيع نطاق التسوق والمقارنة.</p>
              </div>
              <Link className="szSectionViewAllBtn" href={`/products?category=${encodeURIComponent(product.category?.name || product.category || "")}`}>
                <span>عرض الكل</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>

            <div className="szProductGrid">
              {similarProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
