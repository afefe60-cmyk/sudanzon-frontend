"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson } from "../lib/api";

const shipmentStatuses = ["تم الاستلام", "في الطريق", "تم التسليم"];

export default function CourierOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "";

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders((result.items || []).filter((order) => order.status !== "تم التسليم" && order.status !== "ملغي"));
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    loadOrders();
  }, [token]);

  const pickUpOrder = async (orderId, status) => {
    try {
      await apiJson(`/api/orders/${orderId}/shipment-status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      setMessage("تم تحديث حالة الشحنة");
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const groupedOrders = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        canStart: order.shipment?.status === "تم الاستلام",
        canMove: order.shipment?.status === "في الطريق" || order.shipment?.status === "تم الاستلام",
      })),
    [orders]
  );

  return (
    <div className="cardPanel">
      <div className="ordersAdminHeader" style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0 }}>طلبات المندوب</h3>
          <p style={{ margin: "6px 0 0", color: "var(--amazon-muted)" }}>
            استلم الشحنة ثم حرّكها إلى الطريق وبعدها إلى التسليم.
          </p>
        </div>
        <Link className="secondaryBtn" href="/orders">
          كل الطلبات
        </Link>
      </div>

      {message ? <p style={{ color: "#ffd84d", marginTop: 12 }}>{message}</p> : null}
      {loading ? <p style={{ marginTop: 12 }}>جاري تحميل الطلبات...</p> : null}

      <div className="ordersAdminList" style={{ marginTop: 16 }}>
        {!loading && groupedOrders.length === 0 ? <p>لا توجد طلبات جاهزة للمندوب الآن.</p> : null}

        {groupedOrders.map((order) => (
          <div className="orderAdminRow" key={order.id}>
            <div>
              <strong>{order.id}</strong>
              <p>{order.customer?.name || "عميل"}</p>
              <span>{Number(order.total).toLocaleString()} جنيه سوداني</span>
            </div>

            <div className="orderAdminControls">
              <div style={{ display: "grid", gap: 8 }}>
                <label>
                  حالة الشحنة
                  <select
                    className="input"
                    value={order.shipment?.status || shipmentStatuses[0]}
                    onChange={(event) => pickUpOrder(order.id, event.target.value)}
                  >
                    {shipmentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button className="secondaryBtn" type="button" onClick={() => pickUpOrder(order.id, "تم الاستلام")}>
                    استلام الشحنة
                  </button>
                  <button className="secondaryBtn" type="button" onClick={() => pickUpOrder(order.id, "في الطريق")}>
                    في الطريق
                  </button>
                  <button className="primaryBtn" type="button" onClick={() => pickUpOrder(order.id, "تم التسليم")}>
                    تم التسليم
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
