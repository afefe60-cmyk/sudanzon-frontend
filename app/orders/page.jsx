"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import { apiJson } from "../../lib/api";

const statusSteps = ["جديد", "قيد المعالجة", "تم الشحن", "وصل للمندوب", "تم التسليم"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("جاري تحميل الطلبات...");

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
      .catch((error) => setMessage(error.message));
  }, []);

  const getStepIndex = (status) => {
    const index = statusSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading title="الطلبات" subtitle="تتبع حالة الطلب من البداية حتى التسليم" />
          {message ? <div className="cardPanel">{message}</div> : null}

          <div className="ordersTimelineGrid">
            {orders.map((order) => {
              const activeStep = getStepIndex(order.status);
              return (
                <div className="cardPanel orderTimelineCard" key={order.id}>
                  <div className="orderTimelineTop">
                    <div>
                      <strong>{order.id}</strong>
                      <p>{Number(order.total).toLocaleString()} جنيه سوداني</p>
                    </div>
                    <span className="amazonMiniTag">{order.status}</span>
                  </div>

                  <div className="orderTimelineMeta">
                    <span>المدينة: {order.shipment?.city || "الخرطوم"}</span>
                    <span>الدفع: {order.paymentMethod || order.payment?.method || "الدفع عند الاستلام"}</span>
                  </div>

                  <div className="orderStepBar">
                    {statusSteps.map((step, index) => (
                      <span
                        key={step}
                        className={`orderStep ${index <= activeStep ? "is-active" : ""}`}
                      >
                        {step}
                      </span>
                    ))}
                  </div>

                  <div className="orderTimelineActions">
                    <Link className="secondaryBtn" href={`/orders/${order.id}`}>
                      عرض التفاصيل
                    </Link>
                  </div>

                  <div className="orderItemsList">
                    {order.items.map((item) => (
                      <div className="orderItemRow" key={item.id}>
                        <div>
                          <strong>{item.product?.name || "منتج"}</strong>
                          <p>الكمية: {item.quantity}</p>
                        </div>
                        <span>{Number(item.price * item.quantity).toLocaleString()} جنيه سوداني</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
