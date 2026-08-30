"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import { apiJson } from "../../lib/api";

export default function AllStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    apiJson("/api/admin/vendors")
      .then((data) => {
        setStores(data.items || []);
      })
      .catch(() => {
        // Fallback: list of stores from categories
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (!s.approved) return false; // only show approved stores to shoppers
      return (
        !search ||
        s.storeName.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
        (s.owner?.city && s.owner.city.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [stores, search]);

  const getStoreLogoUrl = (s) => {
    if (!s.logo) return null;
    if (s.logo.startsWith("http")) return s.logo;
    if (s.logo.startsWith("/uploads/")) return `https://api.sudanzon.com${s.logo}`;
    return s.logo;
  };

  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szStoresDirectorySection">
        <div className="container">
          {/* Header Banner */}
          <div className="szStoresHeaderCard">
            <span className="szStoresBadge">🏬 دليل المتاجر المعتمدة</span>
            <h1 className="szStoresTitle">تسوق من أفضل المتاجر والماركات في السودان</h1>
            <p className="szStoresSubtitle">
              استكشف المتاجر الموثقة، وتواصل مباشرة مع التجار، واستمتع بتوصيل سريع لكافة المدن والدفع عند الاستلام وبنكك.
            </p>

            <div className="szStoresSearchBox">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="ابحث عن متجر، علامة تجارية، أو مدينة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Stores Grid */}
          {loading ? (
            <div className="szStoresLoading">جارِ تحميل المتاجر المعتمدة...</div>
          ) : filteredStores.length === 0 ? (
            <div className="szStoresEmpty">
              <span>🏬</span>
              <h3>لا توجد متاجر مطابقة للبحث</h3>
              <p>جرب البحث باسم آخر.</p>
            </div>
          ) : (
            <div className="szStoresGrid">
              {filteredStores.map((store) => {
                const logoUrl = getStoreLogoUrl(store);

                return (
                  <Link
                    key={store.id}
                    href={`/stores/${store.storeSlug || store.id}`}
                    className="szStoreDirectoryCard"
                  >
                    <div className="szStoreCardHeader">
                      <div className="szStoreCardLogoWrap">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={store.storeName}
                            className="szStoreCardLogoImg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="szStoreCardLogoFallback">🏬</div>
                        )}
                        <span className="szStoreBadgeCheck">✓</span>
                      </div>

                      <div className="szStoreCardHeaderMeta">
                        <span className="szStoreApprovedTag">متجر معتمد</span>
                        {store.owner?.city && (
                          <span className="szStoreCityTag">📍 {store.owner.city}</span>
                        )}
                      </div>
                    </div>

                    <div className="szStoreCardBody">
                      <h3 className="szStoreCardName">{store.storeName}</h3>
                      <p className="szStoreCardDesc">
                        {store.description || "متجر معتمد يقدم أفضل العروض والمنتجات الأصلية على منصة سودان زون."}
                      </p>
                    </div>

                    <div className="szStoreCardFooter">
                      <span className="szStoreCardCount">
                        📦 {store.productsCount || 0} منتج معروض
                      </span>
                      <span className="szStoreCardAction">
                        زيارة المتجر ←
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .szStoresDirectorySection {
          padding: 24px 0 60px;
          direction: rtl;
        }

        .szStoresHeaderCard {
          background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
          border-radius: 28px;
          padding: 40px 32px;
          color: #ffffff;
          text-align: center;
          margin-bottom: 32px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
        }

        .szStoresBadge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 99px;
          background: rgba(16, 185, 129, 0.18);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .szStoresTitle {
          margin: 0;
          font-size: 2rem;
          font-weight: 900;
          color: #ffffff;
        }

        .szStoresSubtitle {
          margin: 10px auto 24px;
          font-size: 0.95rem;
          color: #cbd5e1;
          max-width: 600px;
          line-height: 1.6;
        }

        .szStoresSearchBox {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .szStoresSearchBox svg {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .szStoresSearchBox input {
          width: 100%;
          height: 52px;
          padding: 0 50px 0 20px;
          border-radius: 16px;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 1rem;
          outline: none;
          backdrop-filter: blur(8px);
        }

        .szStoresSearchBox input::placeholder {
          color: #94a3b8;
        }

        .szStoresSearchBox input:focus {
          border-color: #10b981;
          background: rgba(255, 255, 255, 0.15);
        }

        .szStoresLoading,
        .szStoresEmpty {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .szStoresEmpty span {
          font-size: 3.5rem;
          display: block;
          margin-bottom: 12px;
        }

        .szStoresGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 22px;
        }

        .szStoreDirectoryCard {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .szStoreDirectoryCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
          border-color: #10b981;
        }

        .szStoreCardHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .szStoreCardLogoWrap {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 18px;
          background: #f8fafc;
          border: 2px solid #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
        }

        .szStoreCardLogoImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        }

        .szStoreCardLogoFallback {
          font-size: 2rem;
        }

        .szStoreBadgeCheck {
          position: absolute;
          bottom: -4px;
          left: -4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f59e0b;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.75rem;
          border: 2px solid #ffffff;
        }

        .szStoreCardHeaderMeta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .szStoreApprovedTag {
          padding: 4px 10px;
          border-radius: 99px;
          background: #ecfdf5;
          color: #059669;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .szStoreCityTag {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
        }

        .szStoreCardBody {
          flex: 1;
          margin-bottom: 18px;
        }

        .szStoreCardName {
          margin: 0 0 8px;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .szStoreCardDesc {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.6;
        }

        .szStoreCardFooter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }

        .szStoreCardCount {
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
        }

        .szStoreCardAction {
          font-size: 0.86rem;
          font-weight: 800;
          color: #059669;
        }
      `}</style>
    </main>
  );
}
