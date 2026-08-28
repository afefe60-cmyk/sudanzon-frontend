import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import ProductDetailClient from "../../../components/ProductDetailClient";
import ProductCard from "../../../components/ProductCard";
import { apiJson } from "../../../lib/api";
import { products as fallbackProducts } from "../../../lib/mock-data";

async function loadProduct(id) {
  try {
    const result = await apiJson(`/api/products/${id}`);
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
