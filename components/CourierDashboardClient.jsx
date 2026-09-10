"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com").replace(/\/+$/, "");

export default function CourierDashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courier, setCourier] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-orders");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [actionLoading, setActionLoading] = useState("");
  const [otpInputs, setOtpInputs] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const savedToken = localStorage.getItem("sudanzonToken");
    const savedUserStr = localStorage.getItem("sudanzonUser");

    if (!savedToken || !savedUserStr) {
      router.push("/auth/login?return_to=/courier");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUserStr);
      setUser(parsedUser);
      setToken(savedToken);
      fetchCourierData(savedToken);
    } catch {
      router.push("/auth/login?return_to=/courier");
    }
  }, [router]);

  const fetchCourierData = async (authToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/couriers/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        router.push("/auth/login?return_to=/courier");
        return;
      }

      const data = await res.json();
      if (res.ok && data.courier) {
        setCourier(data.courier);
        if (data.courier.approved) {
          fetchOrders(authToken);
        }
      } else {
        setMessage({ text: data.message || "تعذر جلب بيانات المندوب", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "فشل الاتصال بالخادم", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (authToken) => {
    try {
      const [availRes, myRes] = await Promise.all([
        fetch(`${API_BASE}/api/couriers/available-orders`, {
          headers: { Authorization: `Bearer ${authToken || token}` },
        }),
        fetch(`${API_BASE}/api/couriers/my-orders`, {
          headers: { Authorization: `Bearer ${authToken || token}` },
        }),
      ]);

      if (availRes.ok) {
        const availData = await availRes.json();
        setAvailableOrders(availData.shipments || []);
      }

      if (myRes.ok) {
        const myData = await myRes.json();
        setMyOrders(myData.shipments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/couriers/availability`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourier((prev) => ({ ...prev, isAvailable: data.isAvailable }));
        setMessage({ text: data.message, type: "success" });
      }
    } catch {
      setMessage({ text: "تعذر تحديث الحالة", type: "error" });
    }
  };

  const handleAcceptOrder = async (shipmentId) => {
    setActionLoading(shipmentId);
    try {
      const res = await fetch(`${API_BASE}/api/couriers/shipments/${shipmentId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "تم قبول الشحنة بنجاح وبدء التوصيل 🛵", type: "success" });
        setActiveTab("my-orders");
        fetchOrders(token);
      } else {
        setMessage({ text: data.message || "تعذر قبول الطلب", type: "error" });
      }
    } catch {
      setMessage({ text: "خطأ في الاتصال بالخادم", type: "error" });
    } finally {
      setActionLoading("");
    }
  };

  const handleUpdateStatus = async (shipmentId, nextStatus) => {
    setActionLoading(shipmentId);
    try {
      const res = await fetch(`${API_BASE}/api/couriers/shipments/${shipmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `تم تحديث الحالة إلى: ${nextStatus}`, type: "success" });
        fetchOrders(token);
      } else {
        setMessage({ text: data.message || "تعذر تحديث الحالة", type: "error" });
      }
    } catch {
      setMessage({ text: "خطأ أثناء تحديث الحالة", type: "error" });
    } finally {
      setActionLoading("");
    }
  };

  const handleVerifyOtp = async (shipmentId) => {
    const otp = otpInputs[shipmentId];
    if (!otp || String(otp).trim().length < 4) {
      setMessage({ text: "يرجى إدخال رمز التحقق المكون من 4 أرقام من العميل", type: "error" });
      return;
    }

    setActionLoading(shipmentId);
    try {
      const res = await fetch(`${API_BASE}/api/couriers/shipments/${shipmentId}/deliver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: String(otp).trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "🎉 تم توثيق التسليم بنجاح وإيداع الأرباح في محفظتك!", type: "success" });
        fetchCourierData(token);
        fetchOrders(token);
      } else {
        setMessage({ text: data.message || "رمز التحقق غير صحيح", type: "error" });
      }
    } catch {
      setMessage({ text: "خطأ أثناء توثيق التسليم", type: "error" });
    } finally {
      setActionLoading("");
    }
  };

  const formatPhoneForWa = (phone) => {
    if (!phone) return "";
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "249" + clean.slice(1);
    if (!clean.startsWith("249")) clean = "249" + clean;
    return clean;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>🛵</div>
        <p style={{ fontWeight: "bold", color: "#475569" }}>جارِ تحميل لوحة تحكم المندوب...</p>
      </div>
    );
  }

  if (!courier) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>أنت لست مسجلاً كمندوب</h2>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>يمكنك تسجيل حسابك كمندوب أو شركة شحن والبدء في استلام الطلبات.</p>
        <Link href="/auth/courier" className="szBtn szBtnPrimary">
          انضم كمندوب توصيل الآن 🛵
        </Link>
      </div>
    );
  }

  const activeShipments = myOrders.filter((s) => s.status !== "تم التسليم بنجاح");
  const completedShipments = myOrders.filter((s) => s.status === "تم التسليم بنجاح");

  return (
    <div className="szCourierDashboard" style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "60px" }}>
      <div className="container" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 16px" }}>
        
        {/* Top Header Card */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                🛵
              </div>
              <div>
                <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: "#0f172a" }}>
                  كابتن / {courier.user?.name || user?.name}
                </h1>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  {courier.vehicleType} • {courier.city} {courier.vehiclePlate && `(${courier.vehiclePlate})`}
                </div>
              </div>
            </div>

            <button
              onClick={toggleAvailability}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer",
                background: courier.isAvailable ? "#dcfce7" : "#fee2e2",
                color: courier.isAvailable ? "#15803d" : "#991b1b",
              }}
            >
              <span>{courier.isAvailable ? "🟢 متاح للطلبات" : "🔴 غير متاح"}</span>
            </button>
          </div>

          {!courier.approved && (
            <div style={{ marginTop: "16px", background: "#fef3c7", color: "#92400e", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold" }}>
              ⏳ حسابك قيد المراجعة والاعتماد من قبل إدارة سودان زون. بمجرد التفعيل ستتمكن من استقبال وإسناد الطلبات المتاحة فوراً.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "16px" }}>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>رصيد المحفظة</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#16a34a", marginTop: "2px" }}>
                {Number(courier.walletBalance || 0).toLocaleString()} ج.س
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>الشحنات المنجزة</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb", marginTop: "2px" }}>
                {courier.totalDeliveries || 0}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>تقييم الكابتن</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#eab308", marginTop: "2px" }}>
                ⭐ {Number(courier.rating || 5).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {message.text && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "14px",
              fontWeight: "bold",
              background: message.type === "error" ? "#fee2e2" : "#dcfce7",
              color: message.type === "error" ? "#991b1b" : "#15803d",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Tabs Bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <button
            onClick={() => setActiveTab("my-orders")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
              background: activeTab === "my-orders" ? "#2563eb" : "#ffffff",
              color: activeTab === "my-orders" ? "#ffffff" : "#475569",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            🛵 شحناتي الحالية ({activeShipments.length})
          </button>

          <button
            onClick={() => setActiveTab("available")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
              background: activeTab === "available" ? "#2563eb" : "#ffffff",
              color: activeTab === "available" ? "#ffffff" : "#475569",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            📦 طلبات متاحة ({availableOrders.length})
          </button>
        </div>

        {/* TAB 1: My Active Orders */}
        {activeTab === "my-orders" && (
          <div>
            {activeShipments.length === 0 ? (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "40px 20px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🛵</div>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#334155" }}>لا توجد لديك شحنات قيد التوصيل حالياً</h3>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  تفقد تبويب <strong>"الطلبات المتاحة"</strong> لاختيار وقبول شحنات جديدة في مدينتك.
                </p>
                <button onClick={() => setActiveTab("available")} className="szBtn szBtnPrimary" style={{ marginTop: "12px" }}>
                  استعراض الطلبات المتاحة 📦
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {activeShipments.map((shipment) => {
                  const order = shipment.order;
                  const customer = order?.customer;
                  const firstItem = order?.items?.[0]?.product;
                  const vendor = firstItem?.vendor;
                  const isOutForDelivery = shipment.status === "جاري التوصيل للعميل";
                  const isPickedUp = shipment.status === "تم الاستلام من التاجر";

                  return (
                    <div
                      key={shipment.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "18px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                        <div>
                          <span style={{ fontSize: "12px", background: "#e2e8f0", color: "#334155", padding: "3px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                            طلب #{order?.id?.slice(-6) || shipment.id.slice(-6)}
                          </span>
                          <span style={{ marginRight: "8px", fontSize: "12px", color: "#64748b" }}>
                            {shipment.city}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2563eb" }}>
                          رسوم التوصيل: {Number(shipment.shippingFee || 2000).toLocaleString()} ج.س
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", marginBottom: "4px" }}>📍 مكان الاستلام (التاجر)</div>
                          <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>{vendor?.storeName || "متجر معتمد"}</div>
                          <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>{vendor?.user?.city || shipment.city}</div>
                          
                          {vendor?.user?.phone && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                              <a
                                href={`tel:${vendor.user.phone}`}
                                style={{ flex: 1, textAlign: "center", background: "#2563eb", color: "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}
                              >
                                📞 اتصال
                              </a>
                              <a
                                href={`https://wa.me/${formatPhoneForWa(vendor.user.phone)}?text=${encodeURIComponent(`مرحباً، أنا كابتن سودان زون بخصوص طلب #${order?.id?.slice(-6)}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ flex: 1, textAlign: "center", background: "#16a34a", color: "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}
                              >
                                💬 واتساب
                              </a>
                            </div>
                          )}
                        </div>

                        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", marginBottom: "4px" }}>🎯 مكان التسليم (العميل)</div>
                          <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>{customer?.name || "العميل"}</div>
                          <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>{customer?.shippingAddress || customer?.city || shipment.city}</div>

                          {customer?.phone && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                              <a
                                href={`tel:${customer.phone}`}
                                style={{ flex: 1, textAlign: "center", background: "#2563eb", color: "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}
                              >
                                📞 اتصال
                              </a>
                              <a
                                href={`https://wa.me/${formatPhoneForWa(customer.phone)}?text=${encodeURIComponent(`مرحباً ${customer.name || ""}, أنا كابتن سودان زون في طريقي إليك بطلبك رقم #${order?.id?.slice(-6)}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ flex: 1, textAlign: "center", background: "#16a34a", color: "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}
                              >
                                💬 واتساب
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: "12px", color: "#475569", marginBottom: "14px", background: "#f1f5f9", padding: "8px 12px", borderRadius: "8px" }}>
                        📦 <strong>محتويات الشحنة:</strong> {order?.items?.map((i) => `${i.product?.name} (x${i.quantity})`).join("، ")}
                        <div style={{ marginTop: "4px", fontWeight: "bold", color: "#0f172a" }}>
                          المبلغ المطلوب تحصيله عند الاستلام: {Number(order?.total || 0).toLocaleString()} ج.س
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                        {!isPickedUp && !isOutForDelivery && (
                          <button
                            onClick={() => handleUpdateStatus(shipment.id, "تم الاستلام من التاجر")}
                            disabled={actionLoading === shipment.id}
                            className="szBtn szBtnPrimary"
                            style={{ width: "100%", padding: "10px", fontSize: "14px" }}
                          >
                            {actionLoading === shipment.id ? "جارِ التحديث..." : "📦 تم استلام الشحنة من المتجر"}
                          </button>
                        )}

                        {isPickedUp && (
                          <button
                            onClick={() => handleUpdateStatus(shipment.id, "جاري التوصيل للعميل")}
                            disabled={actionLoading === shipment.id}
                            style={{ width: "100%", padding: "10px", fontSize: "14px", background: "#f59e0b", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                          >
                            {actionLoading === shipment.id ? "جارِ التحديث..." : "🚀 في الطريق للعميل (إرسال كود OTP)"}
                          </button>
                        )}

                        {isOutForDelivery && (
                          <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#166534", marginBottom: "6px" }}>
                              🔑 إدخال كود التسليم (OTP) من العميل:
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="4 أرقام"
                                value={otpInputs[shipment.id] || ""}
                                onChange={(e) => setOtpInputs((prev) => ({ ...prev, [shipment.id]: e.target.value }))}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #86efac", textAlign: "center", fontSize: "18px", fontWeight: "bold", letterSpacing: "4px" }}
                              />
                              <button
                                onClick={() => handleVerifyOtp(shipment.id)}
                                disabled={actionLoading === shipment.id}
                                style={{ background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: "bold", cursor: "pointer" }}
                              >
                                {actionLoading === shipment.id ? "تحقق..." : "✅ تأكيد التسليم"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {completedShipments.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#475569", marginBottom: "10px" }}>
                  ✅ الشحنات المكتملة سابقاً ({completedShipments.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {completedShipments.slice(0, 10).map((s) => (
                    <div key={s.id} style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                      <div>
                        <strong>طلب #{s.order?.id?.slice(-6)}</strong> • {s.city}
                      </div>
                      <div style={{ color: "#16a34a", fontWeight: "bold" }}>
                        +{Number(s.shippingFee || 2000).toLocaleString()} ج.س
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Available Orders */}
        {activeTab === "available" && (
          <div>
            {availableOrders.length === 0 ? (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "40px 20px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>📦</div>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#334155" }}>لا توجد طلبات جديدة متاحة حالياً في مدينتك</h3>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  سيظهر أي طلب جديد من التجار هنا فوراً لتتمكن من قبوله والبدء في توصيله.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {availableOrders.map((shipment) => {
                  const order = shipment.order;
                  const firstItem = order?.items?.[0]?.product;
                  const vendor = firstItem?.vendor;

                  return (
                    <div
                      key={shipment.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "14px",
                        padding: "16px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>
                          طلب شحنة جديدة • {shipment.city}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#16a34a" }}>
                          أرباح التوصيل: {Number(shipment.shippingFee || 2000).toLocaleString()} ج.س
                        </span>
                      </div>

                      <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px" }}>
                        🏬 من متجر: <strong>{vendor?.storeName || "متجر معتمد"}</strong> ({vendor?.user?.city || shipment.city})
                        <br />
                        🎯 إلى: <strong>{order?.customer?.city || shipment.city}</strong> ({order?.customer?.shippingAddress || "عنوان محدد"})
                      </div>

                      <button
                        onClick={() => handleAcceptOrder(shipment.id)}
                        disabled={actionLoading === shipment.id || !courier.approved}
                        className="szBtn szBtnPrimary"
                        style={{ width: "100%", padding: "10px", fontSize: "14px" }}
                      >
                        {actionLoading === shipment.id ? "جارِ القبول..." : "🛵 قبول هذه الشحنة والبدء"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
