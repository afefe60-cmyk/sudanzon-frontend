"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import { apiJson } from "../../../lib/api";
import { getProductImage } from "../../../lib/media";

const timelineSteps = [
  {
    key: "PENDING",
    icon: "📝",
    title: "تم تسجيل وتأكيد الطلب",
    desc: "تم استلام طلبك بنجاح وجارِ إرساله إلى المتجر لتجهيز المحتويات.",
  },
  {
    key: "PROCESSING",
    icon: "📦",
    title: "قيد التجهيز والتغليف",
    desc: "يقوم التاجر بتجهيز المنتجات وتغليفها بعناية لتسليمها لشركة الشحن.",
  },
  {
    key: "SHIPPED",
    icon: "🚚",
    title: "خرج مع مندوب التوصيل",
    desc: "الشحنة الآن في عهدة مندوب التوصيل وهي في طريقها إلى عنوانك المحدد.",
  },
  {
    key: "DELIVERED",
    icon: "✓",
    title: "تم التسليم بنجاح",
    desc: "تم تسليم الطلب إلى العميل واستلام الدفع بنجاح. شكراً لتسوقكم عبر SudanZon!",
  },
];

const statusStepIndices = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

function formatDate(dateStr) {
  if (!dateStr) return "غير متوفر";
  return new Intl.DateTimeFormat("ar-SD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatPaymentMethod(value) {
  const map = {
    CASH_ON_DELIVERY: "💵 الدفع عند الاستلام (كاش)",
    BANKAK: "🏦 تطبيق بنكك (Bankak)",
    CARD: "💳 بطاقة الصراف الآلي",
  };
  return map[value] || value || "💵 الدفع عند الاستلام";
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentRole, setCurrentRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("sudanzonToken");
    if (!token) {
      window.location.replace(`/auth/login?returnTo=/orders/${orderId}`);
      return;
    }

    try {
      const storedUser = localStorage.getItem("sudanzonUser");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setCurrentRole(parsedUser?.role || null);
    } catch {
      setCurrentRole(null);
    }

    if (!orderId) {
      setMessage("رقم الطلب غير موجود");
      setLoading(false);
      return;
    }

    apiJson(`/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        setOrder(result.item || null);
        setSelectedStatus(result.item?.status || "PENDING");
        setMessage("");
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const canEditStatus = currentRole === "ADMIN" || currentRole === "COURIER" || currentRole === "VENDOR";

  const submitStatusChange = async () => {
    const token = localStorage.getItem("sudanzonToken");
    if (!token || !selectedStatus) return;

    try {
      await apiJson(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: selectedStatus }),
      });
      setMessage("✓ تم تحديث حالة الطلب بنجاح");
      const refreshed = await apiJson(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(refreshed.item || null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message || "تعذر تحديث الحالة");
    }
  };

  const currentStepIndex = useMemo(() => {
    if (!order) return 0;
    return statusStepIndices[order.status] ?? 0;
  }, [order]);

  const itemsTotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0);
  }, [order]);

  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szOrderDetailSection">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav className="szBreadcrumb" aria-label="مسار التنقل">
            <Link href="/">الرئيسية</Link>
            <span>/</span>
            <Link href="/orders">طلباتي</Link>
            <span>/</span>
            <span className="szBreadcrumbCurrent">طلب #{orderId ? String(orderId).slice(0, 10) : ""}</span>
          </nav>

          {loading ? (
            <div className="szOrdersLoading">
              <p>جارِ تحميل تفاصيل الطلب والتتبع...</p>
            </div>
          ) : !order ? (
            <div className="szOrdersEmptyBox">
              <span className="szOrdersEmptyIcon">⚠️</span>
              <h2>الطلب غير متوفر أو تم حذفه</h2>
              <p>{message || "تعذر العثور على بيانات هذا الطلب."}</p>
              <Link href="/orders" className="szHeroBtn szHeroBtn--primary">
                العودة لقائمة الطلبات
              </Link>
            </div>
          ) : (
            <div className="szOrderDetailWrapper">
              {/* Order Header Summary Banner */}
              <div className="szOrderBannerCard">
                <div className="szOrderBannerInfo">
                  <div className="szOrderBannerTopRow">
                    <span className="szDashboardBadge">📦 شحنة نشطة</span>
                    <span className="szOrderDateChip">تاريخ التسجيل: {formatDate(order.createdAt)}</span>
                  </div>
                  <h1 className="szOrderMainTitle">الطلب #{order.id}</h1>
                  <p className="szOrderSubtitle">
                    طريقة الدفع: {formatPaymentMethod(order.paymentMethod || order.payment?.method)} • الوجهة: 📍 {order.city || "الخرطوم"}
                  </p>
                </div>

                <div className="szOrderBannerPriceBox">
                  <span className="szOrderBannerPriceLabel">المبلغ الإجمالي المستحق</span>
                  <strong className="szOrderBannerPriceVal">
                    {Number(order.total || 0).toLocaleString()} ج.س
                  </strong>
                  <span className="szOrderPaymentTag">
                    {order.payment?.status === "paid" ? "✓ تم الدفع" : "الدفع عند الاستلام"}
                  </span>
                </div>
              </div>

              {message && <div className="szAdminAlert">{message}</div>}

              {/* Visual Stepper Timeline Card */}
              <div className="szTimelineCard">
                <h2 className="szTimelineHeading">📍 خط سير ومسار الشحنة</h2>

                {order.status === "CANCELLED" ? (
                  <div className="szOrderCancelledNotice">
                    <span className="szCancelIcon">✕</span>
                    <div>
                      <strong>تم إلغاء هذا الطلب</strong>
                      <p>تم إيقاف معالجة هذا الطلب. يمكنك إعادة الطلب أو التواصل مع خدمة العملاء.</p>
                    </div>
                  </div>
                ) : (
                  <div className="szVisualStepperGrid">
                    {timelineSteps.map((step, idx) => {
                      const isDone = currentStepIndex >= idx;
                      const isCurrent = currentStepIndex === idx;
                      return (
                        <div
                          key={step.key}
                          className={`szTimelineStep ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
                        >
                          <div className="szStepIconBadge">
                            <span>{isDone && !isCurrent ? "✓" : step.icon}</span>
                          </div>
                          <div className="szStepBody">
                            <strong className="szStepTitle">{step.title}</strong>
                            <p className="szStepDesc">{step.desc}</p>
                            {isCurrent && (
                              <span className="szStepCurrentPill">الحالة الحالية الآن</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Role Status Controls */}
                {canEditStatus && (
                  <div className="szOrderStaffControlRow">
                    <span className="szStaffLabel">⚙️ لوحة المشرف/المندوب لتحديث الحالة:</span>
                    <div className="szStaffSelectGroup">
                      <select
                        className="szFormSelect"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="PENDING">جديد (قيد المراجعة)</option>
                        <option value="PROCESSING">قيد التجهيز في المتجر</option>
                        <option value="SHIPPED">خرج مع المندوب</option>
                        <option value="DELIVERED">تم التسليم للعميل</option>
                        <option value="CANCELLED">إلغاء الطلب</option>
                      </select>
                      <button
                        type="button"
                        onClick={submitStatusChange}
                        className="szAddProductCtaBtn"
                      >
                        حفظ وتحديث الحالة
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two Column Layout: Items Table (65%) & Delivery Info (35%) */}
              <div className="szOrderBottomLayout">
                {/* Items List */}
                <div className="szOrderItemsCard">
                  <h3 className="szItemsListTitle">🛍️ المنتجات المطلوبة في الشحنة</h3>
                  <div className="szItemsTableWrap">
                    {(order.items || []).map((item) => {
                      const pImg = getProductImage(item.product || {});
                      const pPrice = Number(item.price || 0);
                      const pQty = Number(item.quantity || 1);
                      return (
                        <div className="szOrderItemRow" key={item.id}>
                          <img src={pImg} alt={item.product?.name || "منتج"} className="szOrderItemImg" />
                          <div className="szOrderItemDetails">
                            <span className="szItemVendorTag">
                              🏬 {item.product?.vendor?.storeName || "سودان زون"}
                            </span>
                            <strong className="szItemTitle">{item.product?.name || "منتج معتمد"}</strong>
                            <span className="szItemUnitPrice">
                              {pPrice.toLocaleString()} ج.س × {pQty} قطعة
                            </span>
                          </div>
                          <div className="szItemSubtotalBlock">
                            <span className="szItemSubLabel">المجموع:</span>
                            <strong className="szItemSubVal">{(pPrice * pQty).toLocaleString()} ج.س</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping & Financial Breakdown */}
                <div className="szOrderAsideStack">
                  {/* Delivery Address Card */}
                  <div className="szDeliveryAddressCard">
                    <h3 className="szAsideCardTitle">📍 عنوان التوصيل والشحن</h3>
                    <div className="szAddressInfoList">
                      <div className="szAddressInfoRow">
                        <span className="szInfoLabel">المدينة / الولاية:</span>
                        <strong className="szInfoVal">🇸🇩 {order.city || "الخرطوم"}</strong>
                      </div>
                      <div className="szAddressInfoRow">
                        <span className="szInfoLabel">العنوان بالتفصيل:</span>
                        <strong className="szInfoVal">{order.address || "العنوان الأساسي للعميل"}</strong>
                      </div>
                      {order.note && (
                        <div className="szAddressInfoRow">
                          <span className="szInfoLabel">ملاحظات التوصيل:</span>
                          <p className="szDeliveryNote">{order.note}</p>
                        </div>
                      )}
                      <div className="szAddressInfoRow">
                        <span className="szInfoLabel">رقم هاتف المستلم:</span>
                        <strong className="szInfoVal">{order.customer?.phone || "مسجل لدى المندوب"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown Card */}
                  <div className="szFinancialBreakdownCard">
                    <h3 className="szAsideCardTitle">💰 تفاصيل الفاتورة</h3>
                    <div className="szSummaryRows">
                      <div className="szSummaryRow">
                        <span>مجموع المنتجات</span>
                        <strong>{itemsTotal.toLocaleString()} ج.س</strong>
                      </div>
                      <div className="szSummaryRow">
                        <span>تكلفة التوصيل</span>
                        <strong>
                          {Number(order.total) > itemsTotal
                            ? `${(Number(order.total) - itemsTotal).toLocaleString()} ج.س`
                            : "مجاني"}
                        </strong>
                      </div>
                      <div className="szSummaryRow szSummaryRow--total">
                        <span>الإجمالي الكلي</span>
                        <strong className="szGrandTotal">
                          {Number(order.total || 0).toLocaleString()} ج.س
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
