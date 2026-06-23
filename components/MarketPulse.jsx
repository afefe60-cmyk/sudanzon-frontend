import Link from "next/link";
import { getProductImage } from "../lib/media";

const pulseMetrics = [
  { label: "عروض مميزة", value: "18", image: "/icons/discount.svg" },
  { label: "متاجر نشطة", value: "42", image: "/icons/store.svg" },
  { label: "طلبات مفتوحة", value: "127", image: "/icons/product.svg" },
  { label: "شحنات الآن", value: "31", image: "/icons/shipping.svg" },
];

export default function MarketPulse({ products = [], stores = [] }) {
  const spotlightProducts = products.slice(0, 3);
  const spotlightStores = stores.slice(0, 4);

  return (
    <section className="marketPulseSection">
      <div className="container">
        <div className="marketPulseShell">
          <div className="marketPulseHero">
            <span className="marketPulseBadge">نبض سودان زون</span>
            <h2>حركة السوق الآن</h2>
            <p>
              لوحة حيّة تجمع العروض النشطة والمتاجر البارزة والطلبات المفتوحة في واجهة واحدة واضحة، لتصل إلى أهم ما في المنصة بسرعة وبدون تشتيت.
            </p>

            <div className="marketPulseMetrics">
              {pulseMetrics.map((metric) => (
                <div className="marketPulseMetric" key={metric.label}>
                  <div className="marketPulseMetricThumb">
                    <img src={metric.image} alt={metric.label} />
                  </div>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>

            <div className="marketPulseActions">
              <Link className="noonHeroPrimaryBtn marketPulsePrimary" href="/products">
                تصفح المنتجات
              </Link>
              <Link className="noonHeroSecondaryBtn marketPulseSecondary" href="/seller">
                اكتشف المتاجر
              </Link>
            </div>
          </div>

          <div className="marketPulseGrid">
            <div className="marketPulsePanel marketPulsePanel--products">
              <div className="marketPulsePanelHeader">
                <strong>عروض مختارة</strong>
                <span>الأقوى طلبًا اليوم</span>
              </div>
              <div className="marketPulseProductList">
                {spotlightProducts.map((product, index) => (
                  <Link href={`/products/${product.id}`} className="marketPulseProductCard" key={product.id}>
                    <div className="marketPulseProductImage">
                      <img src={getProductImage(product)} alt={product.name} />
                    </div>
                    <div className="marketPulseProductBody">
                      <span>#{index + 1} في الواجهة</span>
                      <strong>{product.name}</strong>
                      <small>{Number(product.price).toLocaleString()} جنيه سوداني</small>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="marketPulsePanel marketPulsePanel--stores">
              <div className="marketPulsePanelHeader">
                <strong>متاجر بارزة</strong>
                <span>متاجر جاهزة للعرض الآن</span>
              </div>
              <div className="marketPulseStoreList">
                {spotlightStores.map((store) => (
                  <div className="marketPulseStoreCard" key={store.title}>
                    <div className="marketPulseStoreVisual">
                      <img src={store.image} alt={store.title} />
                    </div>
                    <div className="marketPulseStoreCopy">
                      <strong>{store.title}</strong>
                      <span>{store.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="marketPulseWave" aria-hidden="true">
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
