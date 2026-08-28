"use client";

import Link from "next/link";
import { getProductImage } from "../lib/media";

const pulseMetrics = [
  { label: "عروض مميزة", value: "+250", icon: "🏷️" },
  { label: "متاجر معتمدة", value: "+45", icon: "🏪" },
  { label: "طلبات ناجحة", value: "+1,200", icon: "📦" },
  { label: "تغطية المدن", value: "كل الولايات", icon: "🚚" },
];

export default function MarketPulse({ products = [], stores = [] }) {
  const spotlightProducts = products.slice(0, 3);
  const spotlightStores = stores.slice(0, 4);

  return (
    <section className="szPulseSection" aria-label="حركة السوق المباشرة">
      <div className="container szPulseContainer">
        {/* Market Intro & Metrics */}
        <div className="szPulseHero">
          <div className="szPulseLiveTag">
            <span className="szPulseLiveDot" />
            <span>حركة السوق المباشرة</span>
          </div>
          <h2 className="szPulseTitle">نبض سودان زون اليومي</h2>
          <p className="szPulseSubtitle">
            متابعة فورية لأحدث المنتجات المضافة، المتاجر النشطة، والعروض الأكثر طلباً على مستوى السودان في مكان واحد.
          </p>

          <div className="szPulseMetricsGrid">
            {pulseMetrics.map((metric) => (
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
              استكشف كل المنتجات
            </Link>
            <Link className="szHeroBtn szHeroBtn--outline" href="/seller">
              عرض المتاجر
            </Link>
          </div>
        </div>

        {/* Featured Mini Showcase */}
        <div className="szPulseShowcase">
          {/* Spotlight Products */}
          <div className="szPulsePanel">
            <div className="szPulsePanelHeader">
              <div className="szPanelTitleWrap">
                <span className="szPanelBadge">الأعلى طلباً</span>
                <strong>منتجات مميزة الآن</strong>
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

          {/* Spotlight Stores */}
          <div className="szPulsePanel">
            <div className="szPulsePanelHeader">
              <div className="szPanelTitleWrap">
                <span className="szPanelBadge szPanelBadge--store">شركاء النجاح</span>
                <strong>متاجر رائدة بالمنصة</strong>
              </div>
              <Link href="/seller" className="szPanelLink">تصفح الكل ❯</Link>
            </div>
            <div className="szPulseStoresGrid">
              {spotlightStores.map((store) => (
                <div className="szPulseStoreCard" key={store.title}>
                  <div className="szPulseStoreIcon">
                    <img src={store.image} alt={store.title} loading="lazy" />
                  </div>
                  <div className="szPulseStoreMeta">
                    <strong className="szPulseStoreName">{store.title}</strong>
                    <span className="szPulseStoreCategory">{store.subtitle}</span>
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
