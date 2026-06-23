import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import { apiJson } from "../../lib/api";
import { getProductImage } from "../../lib/media";
import { categories as fallbackCategories, products as fallbackProducts } from "../../lib/mock-data";

async function loadProducts(filters = {}) {
  const q = filters.q?.trim();
  const category = filters.category?.trim();
  const searchParts = [];

  if (q) searchParts.push(`q=${encodeURIComponent(q)}`);
  if (category) searchParts.push(`category=${encodeURIComponent(category)}`);

  const queryString = searchParts.length ? `?${searchParts.join("&")}` : "";

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      apiJson(`/api/products${queryString}`),
      apiJson("/api/products/categories"),
    ]);

    return {
      products: productsResult.items,
      categories: categoriesResult.items.map((item) => item.name || item),
    };
  } catch {
    const lowerQuery = q?.toLowerCase() || "";
    const lowerCategory = category?.toLowerCase() || "";

    return {
      products: fallbackProducts.filter((product) => {
        const matchesQuery =
          !lowerQuery ||
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery);
        const matchesCategory =
          !lowerCategory || String(product.category).toLowerCase().includes(lowerCategory);
        return matchesQuery && matchesCategory;
      }),
      categories: fallbackCategories,
    };
  }
}

export default async function ProductsPage({ searchParams }) {
  const currentQuery = searchParams?.q || "";
  const currentCategory = searchParams?.category || "";
  const { products, categories } = await loadProducts({ q: currentQuery, category: currentCategory });
  const totalProducts = products.length;
  const activeLabel = currentCategory || currentQuery || "كل المنتجات";

  return (
    <main className="pageShell amazonPage">
      <SiteHeader />

      <section className="sectionBlock">
        <div className="container">
          <div className="marketHero cardPanel">
            <div className="marketHeroCopy">
              <span className="dashboardHeroTag">SudanZon Market</span>
              <h1>سوق واحد يجمع المنتجات والمتاجر والعروض في مكان واضح</h1>
              <p>
                استعرض النتائج، وفلترها حسب التصنيف أو الكلمة المفتاحية، ثم ادخل إلى صفحة المنتج
                مباشرة لتكمل الشراء أو تقارن بين الخيارات.
              </p>
              <div className="marketHeroPills">
                <span className="marketScopePill">{activeLabel}</span>
                <span className="marketScopePill">{totalProducts.toLocaleString()} نتيجة</span>
                <span className="marketScopePill">دعم البائعين</span>
                <span className="marketScopePill">تصفح سريع</span>
              </div>
            </div>

            <div className="marketHeroAside">
              <div className="marketHeroStat">
                <strong>{categories.length.toLocaleString()}</strong>
                <span>تصنيفات نشطة</span>
              </div>
              <div className="marketHeroStat">
                <strong>{totalProducts.toLocaleString()}</strong>
                <span>منتجات ظاهرة الآن</span>
              </div>
              <div className="marketHeroStat">
                <strong>{currentQuery ? "بحث مخصص" : "تصفح حر"}</strong>
                <span>أسلوب العرض الحالي</span>
              </div>
            </div>
          </div>

          <div className="marketToolbar">
            <SectionHeading
              title="تسوق المنتجات"
              subtitle="ابحث داخل المنصة ثم صفِّ النتائج حسب التصنيف أو الكلمة المفتاحية."
            />
            <form className="marketSearchBar" action="/products" method="get">
              <input
                className="input"
                type="search"
                name="q"
                placeholder="ابحث عن منتج..."
                defaultValue={currentQuery}
              />
              <select className="input" name="category" defaultValue={currentCategory || ""}>
                <option value="">كل التصنيفات</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button className="primaryBtn" type="submit">
                بحث
              </button>
            </form>
          </div>

          <div className="amazonListFilters">
            {categories.slice(0, 8).map((item) => (
              <Link
                key={item}
                href={`/products?category=${encodeURIComponent(item)}${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ""}`}
                className={`amazonListPill ${currentCategory === item ? "is-active" : ""}`}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="amazonListLayout">
            <aside className="amazonFilterPanel">
              <h3>التصنيفات</h3>
              <p className="marketFilterNote">اختر تصنيفًا لتضييق النتائج بسرعة.</p>
              {categories.map((item) => (
                <Link
                  href={`/products?category=${encodeURIComponent(item)}${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ""}`}
                  className={`amazonFilterItem ${currentCategory === item ? "is-active" : ""}`}
                  key={item}
                >
                  {item}
                </Link>
              ))}
            </aside>

            <div className="amazonListContent">
              <div className="marketResultsBar">
                <strong>نتائج العرض</strong>
                <span>{totalProducts.toLocaleString()} منتج</span>
              </div>

              <div className="amazonDealsGrid">
                {products.map((product) => (
                  <Link href={`/products/${product.id}`} className="amazonDealCard" key={product.id}>
                    <div className="amazonDealImageWrap">
                      <img className="amazonDealImage" src={getProductImage(product)} alt={product.name} />
                    </div>
                    <span className="amazonDealTag">
                      {product.vendor?.storeName || product.vendor || "سودان زون"}
                    </span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="amazonDealMeta">
                      <strong>{Number(product.price).toLocaleString()} جنيه سوداني</strong>
                      <span>التقييم {product.rating || "4.5"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
