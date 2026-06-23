"use client";

import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/orders", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setOrders(result.items || []);
      setStatuses(result.statuses || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await apiJson(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      setMessage("تم تحديث الحالة");
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="cardPanel">
      <h3>الطلبات</h3>
      {message ? <p style={{ color: "#ffd84d" }}>{message}</p> : null}
      {loading ? <p>جاري التحميل...</p> : null}
      <div className="ordersAdminList">
        {!loading && orders.length === 0 ? <p>لا توجد طلبات لعرضها.</p> : null}
        {orders.map((order) => (
          <div className="orderAdminRow" key={order.id}>
            <div>
              <strong>{order.id}</strong>
              <p>{order.customer?.name || "عميل"}</p>
              <span>{Number(order.total).toLocaleString()} جنيه سوداني</span>
            </div>
            <div className="orderAdminControls">
              <label>
                الحالة
                <select
                  className="input"
                  value={order.status}
                  onChange={(event) => updateStatus(order.id, event.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
