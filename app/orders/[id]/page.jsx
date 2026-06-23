"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import { apiJson } from "../../../lib/api";
import { getProductImage } from "../../../lib/media";

const statusSteps = ["جديد", "قيد المعالجة", "تم الشحن", "وصل للمندوب", "تم التسليم", "ملغي"];
const shipmentSteps = ["تم الاستلام", "في الطريق", "تم التسليم"];

function getStepIndex(list, status) {
  const index = list.indexOf(status);
  return index === -1 ? 0 : index;
}

function formatDate(value) {
  if (!value) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPaymentMethod(value) {
  const map = {
    CASH_ON_DELIVERY: "الدفع عند الاستلام",
    BANKAK: "بنكك",
    O_CASH: "أوكاش",
    FAWRY: "فوري",
    EASYCASH: "إيزي كاش",
    VISA: "Visa",
    MASTERCARD: "MasterCard",
    PAYPAL: "PayPal",
  };

  return map[value] || value || "الدفع عند الاستلام";
}

function formatPaymentStatus(value) {
  const map = {
    pending: "قيد الانتظار",
    paid: "مدفوع",
    failed: "فشل الدفع",
    refunded: "مسترد",
  };

  return map[value] || value || "قيد الانتظار";
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("جاري تحميل تفاصيل الطلب...");

  useEffect(() => {
    const token = localStorage.getItem("sudanzonToken");
    if (!token) {
      window.location.replace(`/auth/login?returnTo=/orders/${orderId}`);
      return;
    }

    if (!orderId) {
      setMessage("رقم الطلب غير موجود");
      return;
    }

    apiJson(`/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        setOrder(result.item || null);
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, [orderId]);

  const orderStatusIndex = useMemo(() => getStepIndex(statusSteps, order?.status), [order]);
  const shipmentStatusIndex = useMemo(
    () => getStepIndex(shipmentSteps, order?.shipment?.status),
    [order]
  );

  return (
    <main className="pageShell amazonPage">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <div className="marketToolbar">
            <SectionHeading
              title="تفاصيل الطلب"
              subtitle="مراجعة الحالة، المنتجات، الدفع، والشحنة في صفحة واحدة."
            />
            <Link className="secondaryBtn" href="/orders">
              العودة للطلبات
            </Link>
          </div>

          {message ? <div className="cardPanel">{message}</div> : null}

          {order ? (
            <div className="orderDetailLayout">
              <div className="orderDetailStack">
                <div className="cardPanel orderTrackingCard">
                  <div className="orderDetailHeader">
                    <div>
                      <span className="amazonMiniTag">{order.status}</span>
                      <h3 style={{ margin: "10px 0 0" }}>{order.id}</h3>
                      <p style={{ margin: "8px 0 0", color: "var(--amazon-muted)" }}>
                        تاريخ الطلب: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="orderSummaryGrid">
                      <div className="orderSummaryCard">
                        <strong>{Number(order.total).toLocaleString()} جنيه سوداني</strong>
                        <p>إجمالي الطلب</p>
                      </div>
                      <div className="orderSummaryCard">
                        <strong>{formatPaymentStatus(order.payment?.status)}</strong>
                        <p>حالة الدفع</p>
                      </div>
                    </div>
                  </div>

                  <div className="orderTrackGrid">
                    {statusSteps.map((step, index) => (
                      <div className={`orderTrackStep ${index <= orderStatusIndex ? "is-active" : ""}`} key={step}>
                        <div className="orderTrackBullet">{index + 1}</div>
                        <div>
                          <strong>{step}</strong>
                          <p>
                            {index === 0
                              ? "تم تسجيل الطلب"
                              : index === 1
                                ? "قيد التجهيز داخل النظام"
                                : index === 2
                                  ? "تم تسليم الشحنة لشركة التوصيل"
                                  : index === 3
                                    ? "في طريقه إلى المندوب"
                                    : "تمت المراجعة النهائية"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="orderTrackGrid">
                    {shipmentSteps.map((step, index) => (
                      <div className={`orderTrackStep ${index <= shipmentStatusIndex ? "is-active" : ""}`} key={step}>
                        <div className="orderTrackBullet">{index + 1}</div>
                        <div>
                          <strong>{step}</strong>
                          <p>
                            {step === "تم الاستلام"
                              ? "تم تسليم الطلب لمركز الشحن"
                              : step === "في الطريق"
                                ? "الشحنة في الطريق إلى العنوان"
                                : "وصل الطلب للعميل"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cardPanel orderItemsCard">
                  <div className="orderItemsHeader">
                    <SectionHeading title="عناصر الطلب" subtitle="المنتجات المطلوبة داخل هذا الطلب." />
                    <Link className="secondaryBtn" href="/products">
                      متابعة التسوق
                    </Link>
                  </div>

                  <div className="orderInfoList">
                    {order.items?.map((item) => (
                      <div className="orderItemCard" key={item.id}>
                        <img
                          className="orderItemThumb"
                          src={getProductImage(item.product || {})}
                          alt={item.product?.name || "منتج"}
                        />
                        <div>
                          <strong>{item.product?.name || "منتج"}</strong>
                          <p>{item.product?.description || "وصف المنتج غير متوفر"}</p>
                          <p>
                            الكمية: {item.quantity} | البائع: {item.product?.vendor?.storeName || "SudanZon"}
                          </p>
                        </div>
                        <strong>{Number(item.price * item.quantity).toLocaleString()} جنيه سوداني</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="orderDetailStack">
                <div className="cardPanel">
                  <SectionHeading title="بيانات الطلب" subtitle="معلومات أساسية حول العميل والشحنة." />
                  <div className="orderInfoList">
                    <div className="orderInfoRow">
                      <span>المدينة</span>
                      <strong>{order.shipment?.city || "الخرطوم"}</strong>
                    </div>
                    <div className="orderInfoRow">
                      <span>الدفع</span>
                      <strong>
                        {formatPaymentMethod(order.paymentMethod || order.payment?.method)}
                      </strong>
                    </div>
                    <div className="orderInfoRow">
                      <span>عنوان الشحن</span>
                      <strong>{order.shipment?.address || "غير محدد"}</strong>
                    </div>
                    <div className="orderInfoRow">
                      <span>ملاحظة</span>
                      <strong>{order.note || "لا توجد ملاحظات"}</strong>
                    </div>
                  </div>
                </div>

                <div className="cardPanel">
                  <SectionHeading title="العميل" subtitle="معلومات صاحب الطلب." />
                  <div className="orderInfoList">
                    <div className="orderInfoRow">
                      <span>الاسم</span>
                      <strong>{order.customer?.name || "غير متوفر"}</strong>
                    </div>
                    <div className="orderInfoRow">
                      <span>الهاتف</span>
                      <strong>{order.customer?.phone || "غير متوفر"}</strong>
                    </div>
                    <div className="orderInfoRow">
                      <span>البريد</span>
                      <strong>{order.customer?.email || "غير متوفر"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
