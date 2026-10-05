"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";

const statusColors = {
  PENDING: { label: "جديد (قيد المراجعة)", bg: "#fef3c7", text: "#92400e" },
  NEW: { label: "جديد (قيد المراجعة)", bg: "#fef3c7", text: "#92400e" },
  "جديد": { label: "جديد (قيد المراجعة)", bg: "#fef3c7", text: "#92400e" },
  PROCESSING: { label: "قيد التجهيز", bg: "#e0f2fe", text: "#075985" },
  "قيد المعالجة": { label: "قيد التجهيز", bg: "#e0f2fe", text: "#075985" },
  "قيد التجهيز": { label: "قيد التجهيز", bg: "#e0f2fe", text: "#075985" },
  SHIPPED: { label: "خرج مع المندوب", bg: "#f3e8ff", text: "#6b21a8" },
  "تم الشحن": { label: "خرج مع المندوب", bg: "#f3e8ff", text: "#6b21a8" },
  "خرج مع المندوب": { label: "خرج مع المندوب", bg: "#f3e8ff", text: "#6b21a8" },
  "وصل للمندوب": { label: "خرج مع المندوب", bg: "#f3e8ff", text: "#6b21a8" },
  OUT_FOR_DELIVERY: { label: "خرج مع المندوب", bg: "#f3e8ff", text: "#6b21a8" },
  DELIVERED: { label: "تم التسليم بنجاح ✓", bg: "#ecfdf5", text: "#065f46" },
  "تم التسليم": { label: "تم التسليم بنجاح ✓", bg: "#ecfdf5", text: "#065f46" },
  CANCELLED: { label: "ملغي ✕", bg: "#fef2f2", text: "#991b1b" },
  CANCELED: { label: "ملغي ✕", bg: "#fef2f2", text: "#991b1b" },
  "ملغي": { label: "ملغي ✕", bg: "#fef2f2", text: "#991b1b" },
};

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

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
      setStatuses(result.statuses || ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);
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
      setMessage("✓ تم تحديث حالة الطلب بنجاح");
      await loadOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message || "تعذر تحديث الحالة");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchesSearch =
        !search ||
        String(o.id).toLowerCase().includes(search.toLowerCase()) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(search.toLowerCase())) ||
        (o.recipientName && o.recipientName.toLowerCase().includes(search.toLowerCase())) ||
        (o.shipment?.recipientName && o.shipment.recipientName.toLowerCase().includes(search.toLowerCase())) ||
        (o.recipientPhone && o.recipientPhone.includes(search)) ||
        (o.shipment?.recipientPhone && o.shipment.recipientPhone.includes(search)) ||
        (o.customer?.phone && o.customer.phone.includes(search)) ||
        (o.shipment?.city && o.shipment.city.toLowerCase().includes(search.toLowerCase())) ||
        (o.city && o.city.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  return (
    <div className="szAdminOrdersWrapper">
      {/* Top Filter Bar */}
      <div className="szAdminFilterBar">
        <div className="szAdminSearchBox">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم العميل، الهاتف أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="szAdminStatusTabs">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`szStatusFilterBtn ${statusFilter === "ALL" ? "is-active" : ""}`}
          >
            الكل ({orders.length})
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`szStatusFilterBtn ${statusFilter === s ? "is-active" : ""}`}
            >
              {statusColors[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="szAdminAlert">{message}</div>}

      {loading ? (
        <div className="szAdminLoading">جارِ جلب طلبات المنصة...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="szAdminEmpty">
          <span>📦</span>
          <h3>لا توجد طلبات مطابقة للفلتر المحدد</h3>
        </div>
      ) : (
        <div className="szOrdersTableCard">
          <div className="szOrdersTableResponsive">
            <table className="szAdminTable">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>صاحب الطلب والتواصل</th>
                  <th>المدينة والعنوان</th>
                  <th>عدد القطع</th>
                  <th>الإجمالي</th>
                  <th>الحالة</th>
                  <th>تغيير الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const sInfo = statusColors[order.status] || {
                    label: order.status,
                    bg: "#f1f5f9",
                    text: "#334155",
                  };
                  const itemsCount = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 1), 0);
                  const customerName = order.shipment?.recipientName || order.recipientName || order.customer?.name || "عميل مسجل";
                  const phone = order.shipment?.recipientPhone || order.recipientPhone || order.customer?.phone || "";
                  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
                  const waPhone = cleanPhone.startsWith("0") ? `249${cleanPhone.slice(1)}` : cleanPhone;

                  return (
                    <tr key={order.id}>
                      <td>
                        <a
                          href={`/orders/${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="szOrderId"
                          title="عرض تفاصيل الطلب بالكامل"
                          style={{ color: "#0284c7", textDecoration: "underline" }}
                        >
                          #{order.id.slice(0, 8)}
                        </a>
                      </td>
                      <td>
                        <div className="szCustomerCell">
                          <strong style={{ display: "block", color: "#0f172a" }}>👤 {customerName}</strong>
                          {phone ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                              <span dir="ltr" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#334155" }}>{phone}</span>
                              <a
                                href={`tel:${phone}`}
                                title="اتصال هاتفي"
                                style={{
                                  textDecoration: "none",
                                  padding: "2px 6px",
                                  background: "#e0f2fe",
                                  color: "#0369a1",
                                  borderRadius: "4px",
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                }}
                              >
                                📞
                              </a>
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                title="تواصل واتساب"
                                style={{
                                  textDecoration: "none",
                                  padding: "2px 6px",
                                  background: "#dcfce7",
                                  color: "#15803d",
                                  borderRadius: "4px",
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                }}
                              >
                                💬
                              </a>
                            </div>
                          ) : (
                            <small style={{ color: "#94a3b8" }}>{order.customer?.email || "بدون هاتف"}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="szAddressCell">
                          <span className="szCityTag">📍 {order.shipment?.city || order.city || "الخرطوم"}</span>
                          <small style={{ display: "block", marginTop: "2px", color: "#475569" }}>
                            {order.shipment?.address || order.address || "العنوان الأساسي"}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="szQtyBadge">{itemsCount} قطع</span>
                      </td>
                      <td>
                        <strong className="szOrderTotal">
                          {Number(order.total || 0).toLocaleString()} ج.س
                        </strong>
                      </td>
                      <td>
                        <span
                          className="szStatusPill"
                          style={{ backgroundColor: sInfo.bg, color: sInfo.text }}
                        >
                          {sInfo.label}
                        </span>
                      </td>
                      <td>
                        <select
                          className="szStatusSelect"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {statusColors[s]?.label || s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
