import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import ProductCard from "../../components/ProductCard";
import { apiJson } from "../../lib/api";
import { categories as fallbackCategories, products as fallbackProducts } from "../../lib/mock-data";

const categoryIconMap = {
  "إلكترونيات": "🔌",
  "موبايلات": "📱",
  "كمبيوتر": "💻",
  "عطور": "👑",
  "ملابس": "👕",
  "أحذية": "👟",
  "أدوات منزلية": "☕",
  "سوبر ماركت": "🛒",
  "مستحضرات تجميل": "✨",
  "قطع غيار السيارات": "🏎️",
};

import { matchesProductSmartly } from "../../lib/arabic-search";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function loadProducts(filters = {}) {
  const q = filters.q?.trim();
  const category = filters.category?.trim();
  const sort = filters.sort?.trim();
  const searchParts = [];

  if (q) searchParts.push(`q=${encodeURIComponent(q)}`);
  if (category) searchParts.push(`category=${encodeURIComponent(category)}`);
  if (sort) searchParts.push(`sort=${encodeURIComponent(sort)}`);

  const queryString = searchParts.length ? `?${searchParts.join("&")}` : "";

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      apiJson(`/api/products${queryString}`),
      apiJson("/api/products/categories"),
    ]);

    let products = productsResult.items || [];

    // Additional smart filter if needed
    if (q && products.length === 0) {
      const allResult = await apiJson("/api/products");
      const allItems = allResult.items || [];
      products = allItems.filter((p) => matchesProductSmartly(p, q));
    }

    return {
      products,
      categories: (categoriesResult.items || []).map((item) => item.name || item),
    };
  } catch {
    const lowerCategory = category?.toLowerCase() || "";

    let items = fallbackProducts.filter((product) => {
      const matchesQuery = matchesProductSmartly(product, q);
      const matchesCategory =
        !lowerCategory || String(product.category).toLowerCase().includes(lowerCategory);
      return matchesQuery && matchesCategory;
    });

    if (sort === "price-low") {
      items.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      items.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return {
      products: items,
      categories: fallbackCategories,
    };
  }
}

export async function generateMetadata({ searchParams }) {
  const currentCategory = searchParams?.category?.trim() || "";
  const currentQuery = searchParams?.q?.trim() || "";

  if (currentCategory) {
    let catTitle = `${currentCategory} في السودان - أفضل الأسعار والعروض | سودان زون`;
    let catDesc = `تسوق أفضل منتجات ${currentCategory} الأصلية بأسعار منافسة في السودان. شحن وتوصيل يومي لكافة الولايات (الخرطوم، دنقلا، بورتسودان) ودفع عند الاستلام وبنكك.`;

    if (currentCategory === "ملابس") {
      catTitle = "ملابس وأزياء في السودان - أحدث الموديلات وأفضل الأسعار | سودان زون";
      catDesc = "تسوق ملابس وأزياء سودانية فاخرة، عبايات وطرح، أحدث الموديلات بأفضل الأسعار في السودان مع شحن سريع ودفع بنكك.";
    } else if (currentCategory === "مستحضرات تجميل") {
      catTitle = "مستحضرات تجميل وكريمات عناية وتفتيح في السودان | سودان زون";
      catDesc = "تسوقي منتجات التجميل، كريمات التفتيح والنضارة ومستلزمات العناية الأصلية في السودان. توصيل سريع للخرطوم والولايات ودفع بنكك.";
    } else if (currentCategory === "عطور") {
      catTitle = "عطور وبخور وزيوت عطرية في السودان - روائح أصلية فاخرة | سودان زون";
      catDesc = "أفخم العطور الشرقية والفرنسية، البخور والصندل الأصلي في السودان. أفضل الأسعار وشحن سريع لكافة الولايات والدفع بنكك.";
    } else if (currentCategory === "موبايلات") {
      catTitle = "موبايلات وهواتف ذكية للبيع في السودان - أحدث الأجهزة | سودان زون";
      catDesc = "عروض وأسعار الهواتف الذكية في السودان. أجهزة جديدة ومضمونة مع شحن سريع وضمان استلام ودفع بنكك.";
    }

    return {
      title: catTitle,
      description: catDesc,
      alternates: {
        canonical: `https://sudanzon.com/products?category=${encodeURIComponent(currentCategory)}`,
      },
      openGraph: {
        title: catTitle,
        description: catDesc,
        url: `https://sudanzon.com/products?category=${encodeURIComponent(currentCategory)}`,
        siteName: "سودان زون | SudanZon",
        locale: "ar_SD",
        type: "website",
      },
    };
  }

  if (currentQuery) {
    const queryTitle = `${currentQuery} في السودان - أفضل الأسعار والعروض | سودان زون`;
    const queryDesc = `عروض وأسعار ${currentQuery} في السودان. شحن سريع وتوصيل يومي للخرطوم والولايات، دفع آمن عند الاستلام وبنكك على سوق سودان زون.`;
    return {
      title: queryTitle,
      description: queryDesc,
      openGraph: {
        title: queryTitle,
        description: queryDesc,
        locale: "ar_SD",
        type: "website",
      },
    };
  }

  return {
    title: "تسوق أونلاين في السودان - كافة المنتجات والعروض الحصرية | سوق سودان زون",
    description: "المنصة السودانية الأولى للتسوق الإلكتروني متعدد البائعين. آلاف المنتجات الأصلية: ملابس، هواتف، عطور، أدوات منزلية مع شحن سريع ودفع بنكك.",
    alternates: {
      canonical: "https://sudanzon.com/products",
    },
  };
}

export default async function ProductsPage({ searchParams }) {
  const currentQuery = searchParams?.q || "";
  const currentCategory = searchParams?.category || "";
  const currentSort = searchParams?.sort || "new";

  const { products, categories } = await loadProducts({
    q: currentQuery,
    category: currentCategory,
    sort: currentSort,
  });

  const totalProducts = products.length;

  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szCatalogSection">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav className="szBreadcrumb" aria-label="مسار التنقل">
            <Link href="/">الرئيسية</Link>
            <span>/</span>
            <Link href="/products">جميع المنتجات</Link>
            {currentCategory && (
              <>
                <span>/</span>
                <span className="szBreadcrumbCurrent">{currentCategory}</span>
              </>
            )}
            {currentQuery && (
              <>
                <span>/</span>
                <span className="szBreadcrumbCurrent">بحث: "{currentQuery}"</span>
              </>
            )}
          </nav>

          {/* Luxury Catalog Hero Banner */}
          <div className="szCatalogHeroBanner">
            <div className="szCatalogHeroInfo">
              <span className="szDashboardBadge">🛍️ سوق سودان زون المتكامل</span>
              <h1 className="szCatalogHeroTitle">
                {currentCategory
                  ? `قسم ${currentCategory} - أفضل الخيارات والأسعار`
                  : currentQuery
                    ? `نتائج البحث عن "${currentQuery}"`
                    : "تسوق وتصفح كافة المنتجات والعروض"}
              </h1>
              <p className="szCatalogHeroDesc">
                منتجات أصلية ومضمونة من نخبة المتاجر المعتمدة في السودان، مع خيارات الدفع عند الاستلام وبنكك والتوصيل السريع لكافة الولايات.
              </p>

              {/* Active Scope Badges */}
              <div className="szCatalogScopeRow">
                <span className="szScopeChip">
                  📦 <strong>{totalProducts.toLocaleString()}</strong> منتج متاح
                </span>
                <span className="szScopeChip">
                  🏷️ <strong>{categories.length}</strong> أقسام رئيسية
                </span>
                <span className="szScopeChip szScopeChip--green">
                  🚚 شحن لجميع الولايات
                </span>
              </div>
            </div>
          </div>

          {/* Quick Category Pills Bar */}
          <div className="szCatalogCategoryBar">
            <Link
              href="/products"
              className={`szCatFilterPill ${!currentCategory ? "is-active" : ""}`}
            >
              <span>⚡ كل الأقسام</span>
            </Link>
            {categories.map((cat) => {
              const icon = categoryIconMap[cat] || "📦";
              const isActive = currentCategory === cat;
              return (
                <Link
                  key={cat}
                  href={`/products?category=${encodeURIComponent(cat)}${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ""}`}
                  className={`szCatFilterPill ${isActive ? "is-active" : ""}`}
                >
                  <span>{icon} {cat}</span>
                </Link>
              );
            })}
          </div>

          {/* Catalog Main 2-Column Layout */}
          <div className="szCatalogLayout">
            {/* Sidebar Filters */}
            <aside className="szCatalogSidebar">
              {/* Category Filter Box */}
              <div className="szFilterCard">
                <h3 className="szFilterCardTitle">🏷️ الأقسام والتصنيفات</h3>
                <div className="szFilterOptionsList">
                  <Link
                    href={`/products${currentQuery ? `?q=${encodeURIComponent(currentQuery)}` : ""}`}
                    className={`szFilterRadioItem ${!currentCategory ? "is-selected" : ""}`}
                  >
                    <span className="szRadioCircle"></span>
                    <span className="szFilterName">كل الأقسام</span>
                  </Link>
                  {categories.map((cat) => {
                    const icon = categoryIconMap[cat] || "📦";
                    const isSelected = currentCategory === cat;
                    return (
                      <Link
                        key={cat}
                        href={`/products?category=${encodeURIComponent(cat)}${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ""}`}
                        className={`szFilterRadioItem ${isSelected ? "is-selected" : ""}`}
                      >
                        <span className="szRadioCircle"></span>
                        <span className="szFilterName">{icon} {cat}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Trust Guarantee Card */}
              <div className="szCatalogTrustCard">
                <div className="szTrustMiniIcon">🛡️</div>
                <div>
                  <strong>ضمان سودان زون</strong>
                  <p>معاينة عند الاستلام، إرجاع مجاني للمنتجات المعيبة، ودعم فني على مدار الساعة.</p>
                </div>
              </div>
            </aside>

            {/* Main Products Grid Column */}
            <div className="szCatalogContent">
              {/* Top Control Bar (Search, Active Tags & Count) */}
              <div className="szCatalogTopBar">
                <div className="szCatalogTopBarLeft">
                  <span className="szResultsCountText">
                    عرض <strong>{totalProducts}</strong> من المنتجات المتاحة
                  </span>
                  {(currentCategory || currentQuery) && (
                    <div className="szActiveFiltersRow">
                      {currentCategory && (
                        <Link
                          href={`/products${currentQuery ? `?q=${encodeURIComponent(currentQuery)}` : ""}`}
                          className="szActiveFilterTag"
                          title="إزالة هذا الفلتر"
                        >
                          <span>{currentCategory}</span>
                          <strong>✕</strong>
                        </Link>
                      )}
                      {currentQuery && (
                        <Link
                          href={`/products${currentCategory ? `?category=${encodeURIComponent(currentCategory)}` : ""}`}
                          className="szActiveFilterTag"
                          title="إزالة هذا الفلتر"
                        >
                          <span>"{currentQuery}"</span>
                          <strong>✕</strong>
                        </Link>
                      )}
                      <Link href="/products" className="szClearAllFiltersLink">
                        مسح الفلاتر
                      </Link>
                    </div>
                  )}
                </div>

                {/* Inline Search Bar */}
                <form className="szCatalogSearchForm" action="/products" method="get">
                  {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    name="q"
                    placeholder="ابحث بالاسم أو الوصف..."
                    defaultValue={currentQuery}
                  />
                  <button type="submit">بحث</button>
                </form>
              </div>

              {/* Products Grid or Empty State */}
              {products.length === 0 ? (
                <div className="szCatalogEmptyState">
                  <span className="szEmptyIcon">🔍</span>
                  <h3>لا توجد منتجات مطابقة لخيارات البحث</h3>
                  <p>جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً من القائمة الجانبية.</p>
                  <Link href="/products" className="szHeroBtn szHeroBtn--primary">
                    عرض جميع المنتجات
                  </Link>
                </div>
              ) : (
                <div className="szProductGrid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
