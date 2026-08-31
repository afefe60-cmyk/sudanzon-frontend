import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import ProductDetailClient from "../../../components/ProductDetailClient";
import ProductCard from "../../../components/ProductCard";
import { apiJson } from "../../../lib/api";
import { getProductImage } from "../../../lib/media";
import { products as fallbackProducts } from "../../../lib/mock-data";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com").replace(/\/+$/, "");

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadProduct(id) {
  try {
    const result = await apiJson(`/api/products/${id}`, { cache: "no-store" });
    return result.item || fallbackProducts.find((item) => String(item.id) === String(id)) || fallbackProducts[0];
  } catch {
    return fallbackProducts.find((item) => String(item.id) === String(id)) || fallbackProducts[0];
  }
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
  const desc =
    product.description ||
    `اشترِ ${productName} بسعر ${priceFormatted} ج.س من ${vendorName} عبر منصة سودان زون. شحن سريع لكافة الولايات والدفع عند الاستلام وبنكك.`;

  let imgUrl = getProductImage(product);
  if (imgUrl && imgUrl.startsWith("/")) {
    imgUrl = `https://sudanzon.com${imgUrl}`;
  }

  const canonicalUrl = `https://sudanzon.com/products/${params?.id}`;

  return {
    title: `${productName} - ${priceFormatted} ج.س | سودان زون (SudanZon)`,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${productName} | بسعر ${priceFormatted} ج.س على SudanZon`,
      description: desc,
      url: canonicalUrl,
      siteName: "سودان زون | SudanZon",
      images: [
        {
          url: imgUrl,
          width: 800,
          height: 800,
          alt: productName,
        },
      ],
      locale: "ar_SD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${productName} - ${priceFormatted} ج.س`,
      description: desc,
      images: [imgUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await loadProduct(params.id);
  const similarProducts = await loadSimilarProducts(
    product.category?.name || product.category,
    product.id
  );
  const specs = buildSpecs(product);

  return (
    <main className="szPageShell">
      <SiteHeader />

      <div className="container szProductDetailContainer">
        <ProductDetailClient product={product} specs={specs} />

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
