import Link from "next/link";
import CategoryStrip from "../components/CategoryStrip";
import MarketPulse from "../components/MarketPulse";
import PromoHeroSlider from "../components/PromoHeroSlider";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ProductCard from "../components/ProductCard";
import { apiJson } from "../lib/api";
import { categories as fallbackCategories, products as fallbackProducts } from "../lib/mock-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadHomeData() {
  try {
    const [productsResult, categoriesResult] = await Promise.all([
      apiJson("/api/products", { cache: "no-store" }),
      apiJson("/api/products/categories", { cache: "no-store" }),
    ]);

    return {
      products: productsResult.items || [],
      categories: categoriesResult.items || [],
    };
  } catch {
    return {
      products: fallbackProducts,
      categories: fallbackCategories,
    };
  }
}

const categoryIcons = {
  "إلكترونيات": "/products/electronics.jpg",
  "موبايلات": "/products/phones.jpg",
  "كمبيوتر": "/products/computer.jpg",
  "عطور": "/products/perfume.jpg",
  "ملابس": "/products/fashion.jpg",
  "أحذية": "/products/shoes.jpg",
  "أدوات منزلية": "/products/home.jpg",
  "سوبر ماركت": "/products/grocery.jpg",
  "مستحضرات تجميل": "/products/beauty.jpg",
  "قطع غيار السيارات": "/products/auto.jpg",
};

export default async function HomePage() {
  const { products, categories } = await loadHomeData();

  const sections = [
    {
      id: "hot-deals",
      title: "عروض اليوم المميزة",
      badge: "🔥 تخفيضات كبرى",
      subtitle: "أفضل الأسعار والتخفيضات اليومية مع خيارات الدفع عند الاستلام وبنكك.",
      items: products.slice(0, 4),
      isHot: true,
      linkText: "استعراض كل العروض",
      linkHref: "/products?q=عروض",
    },
    {
      id: "new-arrivals",
      title: "وصل حديثاً إلى المنصة",
      badge: "✨ جديد",
      subtitle: "تشكيلات حصرية ومنتجات أضيفت حديثاً من أبرز المتاجر المعتمدة.",
      items: products.slice(4, 8),
      linkText: "مشاهدة الأحدث",
      linkHref: "/products?sort=new",
    },
    {
      id: "best-sellers",
      title: "المنتجات الأكثر مبيعاً",
      badge: "🏆 الأكثر طلباً",
      subtitle: "خيارات نالت ثقة وإعجاب آلاف المتسوقين في كافة أنحاء السودان.",
      items: products.slice(8, 12),
      linkText: "عرض الأكثر طلباً",
      linkHref: "/products?sort=popular",
    },
    {
      id: "weekly-picks",
      title: "مختارات سودان زون الأسبوعية",
      badge: "⭐ اختيارات المحرر",
      subtitle: "منتجات موثوقة بجودة عالية تم فحصها وترشيحها من فريق المنصة.",
      items: products.slice(12, 16),
      linkText: "تصفح الكل",
      linkHref: "/products",
    },
  ];

  const featuredStores = [
    { title: "متجر طيب الجنان للعطور", subtitle: "عطور وهدايا مختارة", image: "/products/perfume.jpg" },
    { title: "متجر إلكترونيات الخرطوم", subtitle: "هواتف وسماعات وأجهزة", image: "/products/electronics.jpg" },
    { title: "متجر أزياء النيلين", subtitle: "ملابس وأحذية عصرية", image: "/products/fashion.jpg" },
    { title: "متجر البيت العصري", subtitle: "أدوات منزلية ومطبخ", image: "/products/home.jpg" },
  ];

  const trustCards = [
    {
      icon: "🛡️",
      title: "تسوق آمن وموثوق",
      subtitle: "ضمان جودة المنتجات وحماية كاملة لبيانات المتسوقين وحقوق المشتري.",
    },
    {
      icon: "💵",
      title: "دفع متعدد ومرن",
      subtitle: "ادفع نقداً عند الاستلام أو عبر تطبيق بنكك والتحويلات المصرفية المحلية بسهولة.",
    },
    {
      icon: "🚚",
      title: "شحن سريع لكافة الولايات",
      subtitle: "شبكة توصيل تغطي الخرطوم والولايات بأفضل تكلفة وأسرع وقت ممكن.",
    },
    {
      icon: "🏪",
      title: "دعم مستمر للتجار والبائعين",
      subtitle: "لوحة تحكم متطورة لإدارة المبيعات والمخزون والتواصل المباشر مع العملاء.",
    },
  ];

  return (
    <main className="szPageShell">
      <SiteHeader />

      {/* Hero Banner Slider */}
      <PromoHeroSlider />

      {/* Category Strip */}
      <CategoryStrip categories={categories} categoryIcons={categoryIcons} />

      {/* Market Live Pulse (100% Real Live Database Metrics) */}
      <MarketPulse products={products} categories={categories} />

      {/* Product Sections */}
      {sections.map((section) => (
        <section className="szProductSection" key={section.id}>
          <div className="container">
            <div className="szSectionHeaderRow">
              <div className="szSectionTitleWrap">
                <span className="szSectionBadge">{section.badge}</span>
                <h2 className="szSectionMainTitle">{section.title}</h2>
                <p className="szSectionSubtitle">{section.subtitle}</p>
              </div>
              <Link className="szSectionViewAllBtn" href={section.linkHref}>
                <span>{section.linkText}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>

            <div className="szProductGrid">
              {section.items.map((product, idx) => (
                <ProductCard
                  key={`${section.id}-${product.id}`}
                  product={product}
                  isHot={section.isHot && idx === 0}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Trust & Guarantee Section */}
      <section className="szTrustSection">
        <div className="container">
          <div className="szTrustHeader">
            <span className="szSectionBadge">⭐ معايير الجودة</span>
            <h2 className="szSectionMainTitle">لماذا يفضل المتسوقون سودان زون؟</h2>
            <p className="szSectionSubtitle">نقدم لك تجربة تسوق إلكتروني متكاملة صُممت خصيصاً لتلبي احتياجات السوق السوداني.</p>
          </div>

          <div className="szTrustGrid">
            {trustCards.map((card) => (
              <div className="szTrustCard" key={card.title}>
                <div className="szTrustIconWrap">{card.icon}</div>
                <h3 className="szTrustCardTitle">{card.title}</h3>
                <p className="szTrustCardDesc">{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Footer */}
      <SiteFooter />
    </main>
  );
}
