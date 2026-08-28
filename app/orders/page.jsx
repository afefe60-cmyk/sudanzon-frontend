"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { apiJson } from "../../lib/api";
import { getProductImage } from "../../lib/media";

const statusStepList = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const statusMap = {
  PENDING: { label: "جديد (قيد التأكيد)", color: "#92400e", bg: "#fef3c7", step: 0 },
  PROCESSING: { label: "قيد التجهيز في المتجر", color: "#075985", bg: "#e0f2fe", step: 1 },
  SHIPPED: { label: "خرج مع المندوب", color: "#6b21a8", bg: "#f3e8ff", step: 2 },
  DELIVERED: { label: "تم التسليم بنجاح ✓", color: "#065f46", bg: "#ecfdf5", step: 3 },
  CANCELLED: { label: "ملغي ✕", color: "#991b1b", bg: "#fef2f2", step: -1 },
};

function formatDate(dateStr) {
  if (!dateStr) return "غير متوفر";
  return new Intl.DateTimeFormat("ar-SD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("sudanzonToken");
    if (!token) {
      window.location.replace("/auth/login?returnTo=/orders");
      return;
    }

    apiJson("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        setOrders(result.items || []);
        setMessage("");
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szOrdersPageSection">
        <div className="container">
          {/* Header Bar */}
          <div className="szOrdersHeaderBar">
            <div>
              <span className="szDashboardBadge">📦 سجل المشتريات</span>
              <h1 className="szOrdersPageTitle">طلباتي ومتابعة الشحنات</h1>
              <p className="szOrdersPageSubtitle">
                تتبع مسار شحناتك الحالية وراجع تفاصيل وفواتير طلباتك السابقة بسهولة.
              </p>
            </div>

            <Link href="/products" className="szHeaderActionBtn szHeaderActionBtn--primary">
              + تسوق منتجات جديدة
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <div className="szOrdersFilterTabs">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`szOrderFilterTab ${statusFilter === "ALL" ? "is-active" : ""}`}
            >
              جميع الطلبات ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`szOrderFilterTab ${statusFilter === "PENDING" ? "is-active" : ""}`}
            >
              قيد التأكيد
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PROCESSING")}
              className={`szOrderFilterTab ${statusFilter === "PROCESSING" ? "is-active" : ""}`}
            >
              قيد التجهيز
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("SHIPPED")}
              className={`szOrderFilterTab ${statusFilter === "SHIPPED" ? "is-active" : ""}`}
            >
              في الطريق مع المندوب
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DELIVERED")}
              className={`szOrderFilterTab ${statusFilter === "DELIVERED" ? "is-active" : ""}`}
            >
              المكتملة ✓
            </button>
          </div>

          {loading ? (
            <div className="szOrdersLoading">
              <p>جارِ جلب سجل طلباتك...</p>
            </div>
          ) : message ? (
            <div className="szAdminAlert" style={{ background: "#fef2f2", color: "#991b1b" }}>
              {message}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="szOrdersEmptyBox">
              <span className="szOrdersEmptyIcon">🛍️</span>
              <h2>لا توجد طلبات في هذا القسم</h2>
              <p>لم تقم بإنشاء أي طلبات مطابقة بعد. تصفح آلاف المنتجات والعروض الرائعة الآن!</p>
              <Link href="/products" className="szHeroBtn szHeroBtn--primary">
                تصفح المنتجات والعروض
              </Link>
            </div>
          ) : (
            <div className="szOrdersStackList">
              {filteredOrders.map((order) => {
                const sData = statusMap[order.status] || {
                  label: order.status,
                  color: "#334155",
                  bg: "#f1f5f9",
                  step: 0,
                };
                const totalItemsCount = (order.items || []).reduce(
                  (sum, it) => sum + Number(it.quantity || 1),
                  0
                );

                return (
                  <div className="szOrderCard" key={order.id}>
                    {/* Order Card Header */}
                    <div className="szOrderCardHeader">
                      <div className="szOrderCardHeaderInfo">
                        <div className="szOrderNumberBlock">
                          <span className="szOrderNumberLabel">رقم الطلب</span>
                          <strong className="szOrderNumberVal">#{order.id.slice(0, 10)}</strong>
                        </div>
                        <div className="szOrderDateBlock">
                          <span className="szOrderDateLabel">تاريخ الطلب</span>
                          <span className="szOrderDateVal">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="szOrderCityBlock">
                          <span className="szOrderCityLabel">المدينة</span>
                          <span className="szOrderCityVal">📍 {order.city || "الخرطوم"}</span>
                        </div>
                      </div>

                      <div className="szOrderCardHeaderRight">
                        <span
                          className="szOrderStatusPill"
                          style={{ backgroundColor: sData.bg, color: sData.color }}
                        >
                          {sData.label}
                        </span>
                        <strong className="szOrderCardTotal">
                          {Number(order.total || 0).toLocaleString()} ج.س
                        </strong>
                      </div>
                    </div>

                    {/* Mini Progress Stepper Bar (if not cancelled) */}
                    {order.status !== "CANCELLED" && (
                      <div className="szMiniStepBar">
                        {statusStepList.map((stepKey, idx) => {
                          const isDone = sData.step >= idx;
                          const isCurrent = sData.step === idx;
                          return (
                            <div
                              key={stepKey}
                              className={`szMiniStepItem ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
                            >
                              <div className="szMiniStepCircle">{isDone ? "✓" : idx + 1}</div>
                              <span className="szMiniStepTitle">
                                {idx === 0
                                  ? "تم الطلب"
                                  : idx === 1
                                    ? "قيد التجهيز"
                                    : idx === 2
                                      ? "مع المندوب"
                                      : "تم الاستلام"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Items Thumbnails & Summary */}
                    <div className="szOrderItemsPreviewRow">
                      <div className="szOrderThumbsTrack">
                        {(order.items || []).slice(0, 4).map((item, idx) => (
                          <div className="szOrderMiniThumb" key={`${item.id}-${idx}`}>
                            <img src={getProductImage(item.product || {})} alt={item.product?.name || "منتج"} />
                            {item.quantity > 1 && (
                              <span className="szThumbQty">×{item.quantity}</span>
                            )}
                          </div>
                        ))}
                        {(order.items || []).length > 4 && (
                          <div className="szOrderMoreThumbs">
                            +{(order.items || []).length - 4}
                          </div>
                        )}
                      </div>

                      <div className="szOrderCardActions">
                        <span className="szOrderItemsSummaryText">
                          إجمالي ({totalItemsCount}) قطعة من منتجات معتمدة
                        </span>
                        <Link
                          href={`/orders/${order.id}`}
                          className="szOrderTrackBtn"
                        >
                          <span>تتبع الشحنة بالتفصيل</span>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
