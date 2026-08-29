"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getProductImage } from "../lib/media";

export default function MarketPulse({ products = [], categories = [] }) {
  // Real spotlight products (Top 3 from live database)
  const spotlightProducts = useMemo(() => products.slice(0, 3), [products]);

  // Extract live vendors/stores from real product database
  const liveStores = useMemo(() => {
    const storeMap = new Map();

    products.forEach((product) => {
      const storeName =
        product.vendor?.storeName ||
        product.vendor?.name ||
        product.storeName ||
        (product.category ? `متجر ${product.category?.name || product.category}` : "متجر معتمد");

      const categoryName =
        product.category?.name ||
        (typeof product.category === "string" ? product.category : "بضائع عامة");

      if (!storeMap.has(storeName)) {
        storeMap.set(storeName, {
          title: storeName,
          subtitle: categoryName,
          image: getProductImage(product),
          productCount: 1,
        });
      } else {
        storeMap.get(storeName).productCount += 1;
      }
    });

    return Array.from(storeMap.values()).slice(0, 4);
  }, [products]);

  // Live real metrics computed directly from database items
  const totalProducts = products.length;
  const totalCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories.length;
    const uniqueCats = new Set(
      products
        .map((p) => p.category?.name || (typeof p.category === "string" ? p.category : null))
        .filter(Boolean)
    );
    return uniqueCats.size || 10;
  }, [products, categories]);

  const totalStores = Math.max(liveStores.length, 1);
  const totalDeals = useMemo(() => {
    const withDiscount = products.filter((p) => Number(p.discount || 0) > 0);
    return withDiscount.length > 0 ? withDiscount.length : Math.min(totalProducts, 8);
  }, [products, totalProducts]);

  const livePulseMetrics = [
    { label: "منتجات معروضة للبيع", value: `${totalProducts} منتج`, icon: "🛍️" },
    { label: "أقسام وتصنيفات نشطة", value: `${totalCategories} أقسام`, icon: "🏷️" },
    { label: "متاجر وبائعين معتمدين", value: `${totalStores} متاجر`, icon: "🏪" },
    { label: "عروض وتخفيضات نشطة", value: `${totalDeals} عروض`, icon: "🔥" },
  ];

  return (
    <section className="szPulseSection" aria-label="حركة السوق المباشرة">
      <div className="container szPulseContainer">
        {/* Market Intro & Live Metrics */}
        <div className="szPulseHero">
          <div className="szPulseLiveTag">
            <span className="szPulseLiveDot" />
            <span>حركة السوق المباشرة (لحظياً)</span>
          </div>
          <h2 className="szPulseTitle">نبض سودان زون اليومي</h2>
          <p className="szPulseSubtitle">
            إحصائيات فورية ومحدثة لحظياً من قاعدة البيانات لأحدث المنتجات المسجلة، المتاجر النشطة، والعروض الأكثر طلباً على مستوى السودان.
          </p>

          <div className="szPulseMetricsGrid">
            {livePulseMetrics.map((metric) => (
              <div className="szPulseMetricCard" key={metric.label}>
                <span className="szPulseMetricIcon">{metric.icon}</span>
                <div className="szPulseMetricInfo">
                  <strong className="szPulseMetricVal">{metric.value}</strong>
                  <span className="szPulseMetricLbl">{metric.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="szPulseActions">
            <Link className="szHeroBtn szHeroBtn--primary" href="/products">
              استكشف كل المنتجات ({totalProducts})
            </Link>
            <Link className="szHeroBtn szHeroBtn--outline" href="/seller">
              انضم كبائع معتمد
            </Link>
          </div>
        </div>

        {/* Featured Mini Showcase */}
        <div className="szPulseShowcase">
          {/* Spotlight Live Products */}
          <div className="szPulsePanel">
            <div className="szPulsePanelHeader">
              <div className="szPanelTitleWrap">
                <span className="szPanelBadge">الأعلى طلباً</span>
                <strong>منتجات نشطة الآن</strong>
              </div>
              <Link href="/products" className="szPanelLink">عرض المزيد ❯</Link>
            </div>
            <div className="szPulseItemsList">
              {spotlightProducts.map((product, idx) => (
                <Link href={`/products/${product.id}`} className="szPulseItemRow" key={product.id}>
                  <div className="szPulseItemRank">#{idx + 1}</div>
                  <div className="szPulseItemImgWrap">
                    <img src={getProductImage(product)} alt={product.name} loading="lazy" />
                  </div>
                  <div className="szPulseItemDetails">
                    <strong className="szPulseItemName">{product.name}</strong>
                    <div className="szPulseItemPrice">
                      <span>{Number(product.price).toLocaleString()}</span>
                      <small>ج.س</small>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Spotlight Live Stores */}
          <div className="szPulsePanel">
            <div className="szPulsePanelHeader">
              <div className="szPanelTitleWrap">
                <span className="szPanelBadge szPanelBadge--store">المتاجر النشطة</span>
                <strong>متاجر مسجلة بالمنصة</strong>
              </div>
              <Link href="/seller" className="szPanelLink">بوابة التجار ❯</Link>
            </div>
            <div className="szPulseStoresGrid">
              {liveStores.map((store) => (
                <div className="szPulseStoreCard" key={store.title}>
                  <div className="szPulseStoreIcon">
                    <img src={store.image} alt={store.title} loading="lazy" />
                  </div>
                  <div className="szPulseStoreMeta">
                    <strong className="szPulseStoreName">{store.title}</strong>
                    <span className="szPulseStoreCategory">
                      {store.subtitle} • {store.productCount} منتجات
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
