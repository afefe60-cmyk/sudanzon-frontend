"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";

const defaultShipmentStatuses = ["تم الاستلام", "في الطريق", "تم التسليم"];

export default function CourierOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [shipmentStatuses, setShipmentStatuses] = useState(defaultShipmentStatuses);
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

      setOrders(result.items || []);
      setShipmentStatuses(result.shipmentStatuses || defaultShipmentStatuses);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const waiting = orders.filter((order) => order.shipment?.status === "تم الاستلام").length;
    const transit = orders.filter((order) => order.shipment?.status === "في الطريق").length;
    const delivered = orders.filter((order) => order.shipment?.status === "تم التسليم").length;

    return { total, waiting, transit, delivered };
  }, [orders]);

  const updateShipmentStatus = async (orderId, status) => {
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

  return (
    <div className="cardPanel">
      <div className="statsGrid">
        <div className="miniStat">
          <strong>{stats.total}</strong>
          <span>إجمالي الطلبات</span>
        </div>
        <div className="miniStat">
          <strong>{stats.waiting}</strong>
          <span>تم الاستلام</span>
        </div>
        <div className="miniStat">
          <strong>{stats.transit}</strong>
          <span>في الطريق</span>
        </div>
        <div className="miniStat">
          <strong>{stats.delivered}</strong>
          <span>تم التسليم</span>
        </div>
      </div>

      {message ? <div className="cardPanel">{message}</div> : null}
      {loading ? <div className="cardPanel">جاري تحميل الطلبات...</div> : null}

      <div className="ordersAdminList">
        {!loading && orders.length === 0 ? <div className="cardPanel">لا توجد طلبات مخصصة للمندوب حالياً.</div> : null}

        {orders.map((order) => {
          const currentShipmentStatus = order.shipment?.status || shipmentStatuses[0] || defaultShipmentStatuses[0];

          return (
            <div className="cardPanel orderAdminRow" key={order.id}>
              <div>
                <strong>{order.id}</strong>
                <p>{order.customer?.name || "عميل"}</p>
                <span>{Number(order.total).toLocaleString()} جنيه سوداني</span>
                <div className="accountRoleLine" style={{ marginTop: 12 }}>
                  <span className="amazonMiniTag">{order.status}</span>
                  <span className="amazonMiniTag">{order.shipment?.city || "الخرطوم"}</span>
                </div>
              </div>

              <div className="orderAdminControls">
                <label>
                  حالة الشحنة
                  <select
                    className="input"
                    value={currentShipmentStatus}
                    onChange={(event) => updateShipmentStatus(order.id, event.target.value)}
                  >
                    {shipmentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <Link className="secondaryBtn" href={`/orders/${order.id}`}>
                  عرض الطلب
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
