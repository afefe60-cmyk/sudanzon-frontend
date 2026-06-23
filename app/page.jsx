import Link from "next/link";
import CategoryStrip from "../components/CategoryStrip";
import MarketPulse from "../components/MarketPulse";
import PromoHeroSlider from "../components/PromoHeroSlider";
import SiteHeader from "../components/SiteHeader";
import SectionHeading from "../components/SectionHeading";
import { apiJson } from "../lib/api";
import { getProductImage } from "../lib/media";
import { categories as fallbackCategories, products as fallbackProducts } from "../lib/mock-data";

async function loadHomeData() {
  try {
    const [productsResult, categoriesResult] = await Promise.all([
      apiJson("/api/products"),
      apiJson("/api/products/categories"),
    ]);

    return {
      products: productsResult.items,
      categories: categoriesResult.items.map((item) => item.name || item),
    };
  } catch {
    return {
      products: fallbackProducts,
      categories: fallbackCategories,
    };
  }
}

const categoryIcons = {
  "إلكترونيات": "/products/electronics.svg",
  "موبايلات": "/products/phones.svg",
  "كمبيوتر": "/products/computer.svg",
  "عطور": "/products/perfume.svg",
  "ملابس": "/products/fashion.svg",
  "أحذية": "/products/shoes.svg",
  "أدوات منزلية": "/products/home.svg",
  "سوبر ماركت": "/products/grocery.svg",
  "مستحضرات تجميل": "/products/beauty.svg",
  "قطع غيار السيارات": "/products/auto.svg",
};

function productSection(title, subtitle, items) {
  return (
    <section className="sectionBlock">
      <div className="container noonShelf">
        <div className="noonShelfHeader">
          <SectionHeading title={title} subtitle={subtitle} />
          <Link className="noonShelfLink" href="/products">
            عرض الكل
          </Link>
        </div>
        <div className="amazonDealsGrid noonDealsGrid">
          {items.map((product, index) => (
            <Link href={`/products/${product.id}`} className="amazonDealCard noonDealCard" key={`${title}-${product.id}`}>
              <div className="amazonDealImageWrap noonDealImageWrap">
                <img className="amazonDealImage" src={getProductImage(product)} alt={product.name} />
              </div>
              <span className={`amazonDealTag noonDealTag ${index === 0 ? "is-hot" : ""}`}>
                {index === 0 ? "عرض مميز" : "جاهز للطلب"}
              </span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="amazonDealMeta noonDealMeta">
                <strong>{Number(product.price).toLocaleString()} جنيه سوداني</strong>
                <span>المخزون {product.stock}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const { products, categories } = await loadHomeData();
  const heroStats = [
    { label: "منتج جاهز", value: products.length.toLocaleString() },
    { label: "تصنيف نشط", value: categories.length.toLocaleString() },
    { label: "متجر بارز", value: "4" },
  ];
  const featuredCategoryLinks = categories.slice(0, 6);

  const sections = [
    {
      title: "عروض اليوم",
      subtitle: "اختيارات يومية مرتبة بعناية لتسهيل قرار الشراء بسرعة.",
      items: products.slice(0, 4),
    },
    {
      title: "منتجات جديدة",
      subtitle: "إضافات حديثة تمنح الصفحة تنوعًا بصريًا وعرضًا واضحًا.",
      items: products.slice(4, 8),
    },
    {
      title: "الأكثر مبيعًا",
      subtitle: "منتجات أثبتت حضورها بين العملاء وتناسب الواجهة الأولى.",
      items: products.slice(8, 12),
    },
    {
      title: "مختارات أسبوعية",
      subtitle: "مجموعة متجددة لعرض البضائع بشكل احترافي ومنظم.",
      items: products.slice(12, 16),
    },
  ];

  const featuredStores = [
    { title: "متجر طيب الجنان للعطور", subtitle: "عطور وهدايا مختارة", tone: "is-gold", image: "/products/perfume.svg" },
    { title: "متجر إلكترونيات الخرطوم", subtitle: "هواتف وسماعات وأجهزة", tone: "is-sky", image: "/products/electronics.svg" },
    { title: "متجر ملابس السودان", subtitle: "أزياء وأحذية يومية", tone: "is-rose", image: "/products/fashion.svg" },
    { title: "متجر البيت العصري", subtitle: "أدوات منزلية عملية", tone: "is-mint", image: "/products/home.svg" },
  ];

  const trustCards = [
    {
      title: "لوحة البائعين",
      subtitle: "إدارة المنتجات والطلبات والشحن من مكان واحد.",
      image: "/banners/hero-2.svg",
    },
    {
      title: "الدفع عند الاستلام",
      subtitle: "تجربة شراء محلية واضحة وسهلة تناسب السوق السوداني.",
      image: "/banners/hero-3.svg",
    },
    {
      title: " شحن وتوصيل  ",
      subtitle: "       مساحة مناسبة لعرض الشركات الداعمة وخدمات التوصيل داخل السودان بشكل أنيق وواضح..",
      image: "/banners/hero-1.svg",
    },
  ];

  return (
    <main className="pageShell amazonPage noonPage">
      <SiteHeader />

      <CategoryStrip categories={categories} categoryIcons={categoryIcons} />
      <PromoHeroSlider />
      <MarketPulse products={products} stores={featuredStores} />

      {sections.map((section) => productSection(section.title, section.subtitle, section.items))}

      <section className="sectionBlock">
        <div className="container">
          <SectionHeading
            title="لماذا سودان زون"
            subtitle="واجهة جاهزة للنشر تجمع الهوية المحلية مع عرض حديث وواضح."
          />
          <div className="noonBenefitGrid noonBenefitGrid--image">
            {trustCards.map((card) => (
              <div className="amazonBelowCard noonBenefitCard noonBenefitCard--image" key={card.title}>
                <div className="noonBenefitVisual">
                  <img src={card.image} alt={card.title} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
