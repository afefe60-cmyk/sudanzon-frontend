"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import { apiJson } from "../../../lib/api";
import { getProductImage } from "../../../lib/media";

export default function StoreProfilePage() {
  const params = useParams();
  const rawSlug = params?.slug;

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    if (!rawSlug) return;
    setLoading(true);
    setError("");

    let cleanSlug = "";
    try {
      cleanSlug = decodeURIComponent(String(rawSlug));
    } catch {
      cleanSlug = String(rawSlug);
    }

    const fetchStore = async () => {
      try {
        const data = await apiJson(`/api/products/stores/${encodeURIComponent(cleanSlug)}`);
        if (data.store) {
          setStore(data.store);
          return;
        }
      } catch {
        // Fallback with raw slug
        try {
          const fallbackData = await apiJson(`/api/products/stores/${rawSlug}`);
          if (fallbackData.store) {
            setStore(fallbackData.store);
            return;
          }
        } catch {
          // Both failed
        }
      }
      setError("المتجر غير متاح أو قيد التفعيل من الإدارة.");
    };

    fetchStore().finally(() => {
      setLoading(false);
    });
  }, [rawSlug]);

  const addToCart = (product) => {
    if (typeof window === "undefined") return;
    const cart = JSON.parse(localStorage.getItem("sudanzonCart") || "[]");
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: getProductImage(product),
        quantity: 1,
        vendor: store?.storeName || "متجر معتمد",
      });
    }

    localStorage.setItem("sudanzonCart", JSON.stringify(cart));
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    setCartMessage(`✓ تم إضافة "${product.name}" إلى السلة`);
    setTimeout(() => setCartMessage(""), 2800);
  };

  const filteredProducts = useMemo(() => {
    if (!store?.products) return [];
    return store.products.filter((p) => {
      const matchCat =
        selectedCategory === "ALL" ||
        (p.category?.name || p.category) === selectedCategory;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [store, selectedCategory, search]);

  const getStoreLogoUrl = () => {
    if (!store?.logo) return null;
    if (store.logo.startsWith("http")) return store.logo;
    if (store.logo.startsWith("/uploads/")) return `https://api.sudanzon.com${store.logo}`;
    return store.logo;
  };

  const getFormattedPhone = () => {
    const raw = store?.owner?.phone || "";
    const clean = raw.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      return `249${clean.substring(1)}`;
    }
    if (clean.startsWith("249")) {
      return clean;
    }
    return `249${clean}`;
  };

  return (
    <main className="szPageShell">
      <SiteHeader />

      {loading ? (
        <div className="container szStoreLoadingBox">
          <div className="szStoreSpinner" />
          <p>جارِ تحميل المتجر والمنتجات...</p>
        </div>
      ) : error || !store ? (
        <div className="container szStoreErrorBox">
          <div className="szStoreErrorIcon">🏬</div>
          <h2>المتجر غير متاح</h2>
          <p>{error || "تعذر العثور على هذا المتجر في منصة سودان زون."}</p>
          <Link href="/products" className="szBackBtn">
            ← تصفح كافة المنتجات في المنصة
          </Link>
        </div>
      ) : (
        <div className="szStorePageBody">
          {/* Store Hero Banner */}
          <section className="szStoreHeroSection">
            <div className="container">
              <div className="szStoreHeroCard">
                {/* Ambient Glows */}
                <div className="szStoreHeroGlow szStoreHeroGlow--green" />
                <div className="szStoreHeroGlow szStoreHeroGlow--gold" />

                <div className="szStoreHeroMain">
                  {/* Store Logo */}
                  <div className="szStoreHeroLogoWrap">
                    {getStoreLogoUrl() ? (
                      <img
                        src={getStoreLogoUrl()}
                        alt={store.storeName}
                        className="szStoreHeroLogoImg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="szStoreHeroLogoFallback">🏬</div>
                    )}
                    {store.approved && (
                      <span className="szStoreVerifiedBadge" title="متجر معتمد وموثق">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Store Identity */}
                  <div className="szStoreHeroInfo">
                    <div className="szStoreTitleRow">
                      <h1 className="szStoreHeroTitle">{store.storeName}</h1>
                      {store.approved && (
                        <span className="szStoreApprovedPill">
                          🛡️ متجر معتمد في SudanZon
                        </span>
                      )}
                    </div>

                    <p className="szStoreHeroSlug">
                      رابط المتجر: <strong>sudanzon.com/stores/{store.storeSlug}</strong>
                    </p>

                    {store.description && (
                      <p className="szStoreHeroDesc">{store.description}</p>
                    )}

                    {/* Store Meta Badges */}
                    <div className="szStoreMetaBadgesRow">
                      {store.owner?.city && (
                        <span className="szStoreMetaPill">
                          📍 {store.owner.city}
                        </span>
                      )}
                      <span className="szStoreMetaPill">
                        📦 {store.stats?.productsCount || 0} منتج متوفر
                      </span>
                      <span className="szStoreMetaPill">
                        ⭐ تقييم 4.9/5 (ممتاز)
                      </span>
                      <span className="szStoreMetaPill">
                        💳 دفع عند الاستلام وبنكك
                      </span>
                    </div>
                  </div>

                  {/* Merchant Contact Actions */}
                  <div className="szStoreContactCard">
                    <h3 className="szContactCardTitle">📞 تواصل مباشر مع التاجر</h3>

                    <div className="szContactButtonsGrid">
                      {store.owner?.phone && (
                        <a
                          href={`https://wa.me/${getFormattedPhone()}?text=${encodeURIComponent(`السلام عليكم، استفسار بخصوص متجر ${store.storeName} على منصة سودان زون`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="szStoreContactBtn szStoreContactBtn--whatsapp"
                        >
                          <span>💬 تواصل عبر واتساب</span>
                        </a>
                      )}

                      {store.owner?.phone && (
                        <a
                          href={`tel:${store.owner.phone}`}
                          className="szStoreContactBtn szStoreContactBtn--phone"
                        >
                          <span>📞 اتصال هاتفي ({store.owner.phone})</span>
                        </a>
                      )}

                      {store.owner?.email && (
                        <a
                          href={`mailto:${store.owner.email}`}
                          className="szStoreContactBtn szStoreContactBtn--email"
                        >
                          <span>✉️ البريد الإلكتروني</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Toast Message */}
          {cartMessage && (
            <div className="szCartToastAlert">
              <span>{cartMessage}</span>
            </div>
          )}

          {/* Store Products Section */}
          <section className="szStoreProductsSection">
            <div className="container">
              {/* Filter & Search Bar */}
              <div className="szStoreFilterBar">
                <div className="szStoreSearchInputWrap">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={`ابحث داخل منتجات متجر ${store.storeName}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {store.stats?.categories?.length > 0 && (
                  <div className="szStoreCategoryPills">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("ALL")}
                      className={`szStoreCatPill ${selectedCategory === "ALL" ? "is-active" : ""}`}
                    >
                      جميع المنتجات ({store.products?.length || 0})
                    </button>
                    {store.stats.categories.map((catName) => (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setSelectedCategory(catName)}
                        className={`szStoreCatPill ${selectedCategory === catName ? "is-active" : ""}`}
                      >
                        {catName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="szStoreEmptyProducts">
                  <span>🛍️</span>
                  <h3>لا توجد منتجات مطابقة في هذا المتجر</h3>
                  <p>جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً.</p>
                </div>
              ) : (
                <div className="szStoreProductGrid">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="szStoreProductCard">
                      <Link href={`/products/${product.id}`} className="szStoreProductThumbLink">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="szStoreProductThumbImg"
                          onError={(e) => {
                            e.currentTarget.src = "/products/fashion.jpg";
                          }}
                        />
                        <span className="szStoreProductCatBadge">
                          {product.category?.name || product.category || "عام"}
                        </span>
                      </Link>

                      <div className="szStoreProductCardBody">
                        <Link href={`/products/${product.id}`} className="szStoreProductTitleLink">
                          <h3 className="szStoreProductTitle">{product.name}</h3>
                        </Link>

                        <p className="szStoreProductShortDesc">
                          {product.description ? product.description.substring(0, 75) + "..." : "منتج أصلي معتمد"}
                        </p>

                        <div className="szStoreProductPriceRow">
                          <div className="szStorePriceGroup">
                            <strong className="szStoreProductPrice">
                              {Number(product.price || 0).toLocaleString()} ج.س
                            </strong>
                            <small className="szStoreDeliveryTag">🚚 توصيل سريع</small>
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="szStoreAddToCartBtn"
                            title="أضف إلى السلة"
                          >
                            <span>🛒 أضف للسلة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .szStoreLoadingBox,
        .szStoreErrorBox {
          min-height: 50vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px;
          direction: rtl;
        }

        .szStoreSpinner {
          width: 44px;
          height: 44px;
          border: 4px solid #e2e8f0;
          border-top-color: #059669;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        .szStoreErrorIcon {
          font-size: 3.5rem;
          margin-bottom: 14px;
        }

        .szBackBtn {
          display: inline-block;
          margin-top: 18px;
          padding: 12px 24px;
          border-radius: 12px;
          background: #059669;
          color: #ffffff;
          font-weight: 700;
          text-decoration: none;
        }

        .szStoreHeroSection {
          padding: 24px 0 16px;
          direction: rtl;
        }

        .szStoreHeroCard {
          position: relative;
          background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
          border-radius: 28px;
          padding: 36px 32px;
          color: #ffffff;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .szStoreHeroGlow {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.25;
        }

        .szStoreHeroGlow--green {
          top: -40px;
          right: -40px;
          background: #059669;
        }

        .szStoreHeroGlow--gold {
          bottom: -40px;
          left: -40px;
          background: #d97706;
        }

        .szStoreHeroMain {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 28px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .szStoreHeroLogoWrap {
          position: relative;
          width: 104px;
          height: 104px;
          border-radius: 24px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          flex-shrink: 0;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
          border: 3px solid #10b981;
        }

        .szStoreHeroLogoImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 20px;
        }

        .szStoreHeroLogoFallback {
          font-size: 2.8rem;
        }

        .szStoreVerifiedBadge {
          position: absolute;
          bottom: -6px;
          left: -6px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f59e0b;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.9rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          border: 2px solid #ffffff;
        }

        .szStoreHeroInfo {
          flex: 1;
          min-width: 280px;
        }

        .szStoreTitleRow {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .szStoreHeroTitle {
          margin: 0;
          font-size: 1.85rem;
          font-weight: 900;
          color: #ffffff;
        }

        .szStoreApprovedPill {
          padding: 4px 12px;
          border-radius: 99px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .szStoreHeroSlug {
          margin: 6px 0 10px;
          font-size: 0.82rem;
          color: #94a3b8;
        }

        .szStoreHeroSlug strong {
          color: #f59e0b;
        }

        .szStoreHeroDesc {
          margin: 0 0 16px;
          font-size: 0.92rem;
          color: #cbd5e1;
          line-height: 1.6;
          max-width: 600px;
        }

        .szStoreMetaBadgesRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .szStoreMetaPill {
          padding: 6px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 0.82rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .szStoreContactCard {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 20px;
          padding: 20px;
          min-width: 260px;
          backdrop-filter: blur(10px);
        }

        .szContactCardTitle {
          margin: 0 0 12px;
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
        }

        .szContactButtonsGrid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .szStoreContactBtn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.86rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s, opacity 0.15s;
        }

        .szStoreContactBtn:hover {
          transform: translateY(-2px);
          opacity: 0.92;
        }

        .szStoreContactBtn--whatsapp {
          background: #25d366;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }

        .szStoreContactBtn--phone {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .szStoreContactBtn--email {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .szCartToastAlert {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          background: #059669;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.92rem;
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);
          animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popUp {
          from {
            transform: translate(-50%, 20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .szStoreProductsSection {
          padding: 24px 0 60px;
          direction: rtl;
        }

        .szStoreFilterBar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }

        .szStoreSearchInputWrap {
          position: relative;
          width: 100%;
        }

        .szStoreSearchInputWrap svg {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .szStoreSearchInputWrap input {
          width: 100%;
          height: 48px;
          padding: 0 46px 0 16px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .szStoreSearchInputWrap input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
        }

        .szStoreCategoryPills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .szStoreCatPill {
          padding: 8px 16px;
          border-radius: 99px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .szStoreCatPill.is-active {
          background: #059669;
          border-color: #059669;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
        }

        .szStoreEmptyProducts {
          text-align: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px dashed #cbd5e1;
        }

        .szStoreEmptyProducts span {
          font-size: 3rem;
          display: block;
          margin-bottom: 10px;
        }

        .szStoreProductGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .szStoreProductCard {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .szStoreProductCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
        }

        .szStoreProductThumbLink {
          position: relative;
          height: 190px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .szStoreProductThumbImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .szStoreProductCard:hover .szStoreProductThumbImg {
          transform: scale(1.05);
        }

        .szStoreProductCatBadge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .szStoreProductCardBody {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .szStoreProductTitleLink {
          text-decoration: none;
        }

        .szStoreProductTitle {
          margin: 0 0 6px;
          font-size: 0.98rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.4;
        }

        .szStoreProductShortDesc {
          margin: 0 0 14px;
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.5;
          flex: 1;
        }

        .szStoreProductPriceRow {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .szStorePriceGroup {
          display: flex;
          flex-direction: column;
        }

        .szStoreProductPrice {
          font-size: 1.15rem;
          font-weight: 900;
          color: #b91c1c;
        }

        .szStoreDeliveryTag {
          font-size: 0.72rem;
          color: #059669;
          font-weight: 600;
        }

        .szStoreAddToCartBtn {
          padding: 8px 14px;
          border-radius: 10px;
          background: #059669;
          color: #ffffff;
          border: none;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.15s;
          white-space: nowrap;
        }

        .szStoreAddToCartBtn:hover {
          background: #047857;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
