"use client";

import { useEffect, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com").replace(/\/+$/, "");

export default function AdminCouriersClient() {
  const [couriers, setCouriers] = useState([]);
  const [shippingRates, setShippingRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [previewDoc, setPreviewDoc] = useState(null); // { url, title }

  // City Modal State
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityFormData, setCityFormData] = useState({
    id: "",
    cityName: "",
    stateName: "",
    standardFee: 2000,
    estimatedDays: "1-2 أيام",
    isActive: true,
  });

  const getHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sudanzonToken") : "";
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [couriersRes, ratesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/couriers`, { headers: getHeaders() }),
        fetch(`${API_BASE}/api/admin/shipping-rates`, { headers: getHeaders() }),
      ]);

      if (couriersRes.ok) {
        const cData = await couriersRes.json();
        setCouriers(cData.items || []);
      }
      if (ratesRes.ok) {
        const rData = await ratesRes.json();
        setShippingRates(rData.items || []);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "فشل في تحميل بيانات الكباتن والتوصيل", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveToggle = async (courierId, currentApproved) => {
    setActionLoading(courierId);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/admin/couriers/${courierId}/approve`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ approved: !currentApproved }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشلت العملية");

      setMessage({ text: data.message, type: "success" });
      setCouriers((prev) =>
        prev.map((c) => (c.id === courierId ? { ...c, approved: !currentApproved } : c))
      );
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    setActionLoading("savingCity");
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/admin/shipping-rates`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(cityFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل حفظ بيانات المدينة");

      setMessage({ text: data.message, type: "success" });
      setShowCityModal(false);
      fetchData();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCity = async (cityId, cityName) => {
    if (!confirm(`هل أنت متأكد من حذف مدينة "${cityName}" وأسعار الشحن الخاصة بها؟`)) {
      return;
    }

    setActionLoading(`deleteCity_${cityId}`);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/admin/shipping-rates/${cityId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل حذف المدينة");

      setMessage({ text: data.message, type: "success" });
      setShippingRates((prev) => prev.filter((r) => r.id !== cityId));
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const openAddCityModal = () => {
    setCityFormData({
      id: "",
      cityName: "",
      stateName: "",
      standardFee: 2000,
      estimatedDays: "1-2 أيام",
      isActive: true,
    });
    setShowCityModal(true);
  };

  const openEditCityModal = (rate) => {
    setCityFormData({
      id: rate.id,
      cityName: rate.cityName,
      stateName: rate.stateName || "",
      standardFee: Number(rate.standardFee || 2000),
      estimatedDays: rate.estimatedDays || "1-2 أيام",
      isActive: rate.isActive,
    });
    setShowCityModal(true);
  };

  const resolveImgUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return `${API_BASE}${path}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      {message.text && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "14px",
            background: message.type === "error" ? "#fee2e2" : "#dcfce7",
            color: message.type === "error" ? "#991b1b" : "#166534",
            border: `1px solid ${message.type === "error" ? "#f87171" : "#86efac"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* SECTION 1: City Shipping Rates & Add/Delete Cities */}
      <div className="szAdminPanelCard" style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>📍 إدارة المدن ومناطق الشحن والتسعيرة</h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>
              إضافة وحذف المدن السودانية وتحديد تكلفة الشحن ومدة التوصيل لكل ولاية.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddCityModal}
            className="szBtn szBtnPrimary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "14px", fontWeight: "bold" }}
          >
            <span>➕ إضافة مدينة جديدة</span>
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "right" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px 14px" }}>المدينة</th>
                <th style={{ padding: "10px 14px" }}>الولاية</th>
                <th style={{ padding: "10px 14px" }}>تكلفة الشحن القياسية</th>
                <th style={{ padding: "10px 14px" }}>المدة التقديرية</th>
                <th style={{ padding: "10px 14px" }}>الحالة</th>
                <th style={{ padding: "10px 14px", textAlign: "center" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {shippingRates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                    لا توجد مدن مضافة حالياً.
                  </td>
                </tr>
              ) : (
                shippingRates.map((rate) => (
                  <tr key={rate.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#0f172a" }}>{rate.cityName}</td>
                    <td style={{ padding: "12px 14px", color: "#475569" }}>{rate.stateName || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#16a34a", fontWeight: "bold" }}>
                      {Number(rate.standardFee).toLocaleString()} ج.س
                    </td>
                    <td style={{ padding: "12px 14px", color: "#64748b" }}>{rate.estimatedDays}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: rate.isActive ? "#dcfce7" : "#fee2e2",
                          color: rate.isActive ? "#166534" : "#991b1b",
                        }}
                      >
                        {rate.isActive ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => openEditCityModal(rate)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === `deleteCity_${rate.id}`}
                          onClick={() => handleDeleteCity(rate.id, rate.cityName)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #fecaca",
                            background: "#fff1f2",
                            color: "#e11d48",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          {actionLoading === `deleteCity_${rate.id}` ? "..." : "🗑️ حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Couriers & Logistics Partners */}
      <div className="szAdminPanelCard" style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>🛵 كباتن ومناديب وشركات التوصيل المسجلة</h2>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>
            مراجعة وفحص وثائق الكباتن (الرقم الوطني، اللوحة، رخصة القيادة، استمارة المركبة) والاعتماد الفوري.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "right" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px 14px" }}>الكابتن / الشركة</th>
                <th style={{ padding: "10px 14px" }}>بيانات التواصل</th>
                <th style={{ padding: "10px 14px" }}>المدينة & المركبة</th>
                <th style={{ padding: "10px 14px" }}>الرقم الوطني واللوحة</th>
                <th style={{ padding: "10px 14px" }}>المستندات والوثائق</th>
                <th style={{ padding: "10px 14px" }}>المحفظة والرحلات</th>
                <th style={{ padding: "10px 14px" }}>الحالة</th>
                <th style={{ padding: "10px 14px", textAlign: "center" }}>الاعتماد</th>
              </tr>
            </thead>
            <tbody>
              {couriers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "28px", color: "#94a3b8" }}>
                    {loading ? "جارِ تحميل بيانات الكباتن..." : "لا يوجد كباتن مسجلين حتى الآن."}
                  </td>
                </tr>
              ) : (
                couriers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: "bold", color: "#0f172a" }}>{c.user?.name || "بدون اسم"}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {c.isCompany ? `🏢 شركة: ${c.companyName || "بدون اسم"}` : "🛵 كابتن مستقل"}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b" }}>{c.user?.phone || "—"}</div>
                      {c.user?.phone && (
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          <a
                            href={`https://wa.me/249${c.user.phone.replace(/^0+/, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "#dcfce7",
                              color: "#166534",
                              textDecoration: "none",
                              fontWeight: "bold",
                            }}
                          >
                            واتساب
                          </a>
                          <a
                            href={`tel:${c.user.phone}`}
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "#e0f2fe",
                              color: "#0369a1",
                              textDecoration: "none",
                              fontWeight: "bold",
                            }}
                          >
                            اتصال
                          </a>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: "bold", color: "#334155" }}>📍 {c.city || "بورتسودان"}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{c.vehicleType}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px" }}>
                        <span style={{ color: "#64748b" }}>الوطني: </span>
                        <strong>{c.nationalId || "—"}</strong>
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        <span style={{ color: "#64748b" }}>اللوحة: </span>
                        <strong>{c.vehiclePlate || "—"}</strong>
                      </div>
                    </td>

                    {/* Document Preview Buttons */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {c.licensePhoto ? (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ url: resolveImgUrl(c.licensePhoto), title: `رخصة قيادة الكابتن: ${c.user?.name}` })}
                            style={{
                              padding: "3px 8px",
                              fontSize: "11px",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              textAlign: "right",
                            }}
                          >
                            🪪 رخصة القيادة
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>بدون رخصة</span>
                        )}

                        {c.vehiclePhoto ? (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ url: resolveImgUrl(c.vehiclePhoto), title: `استمارة مركبة: ${c.user?.name}` })}
                            style={{
                              padding: "3px 8px",
                              fontSize: "11px",
                              background: "#f0fdf4",
                              color: "#15803d",
                              border: "1px solid #bbf7d0",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              textAlign: "right",
                            }}
                          >
                            📋 استمارة المركبة
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>بدون استمارة</span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: "bold", color: "#16a34a" }}>
                        {Number(c.walletBalance || 0).toLocaleString()} ج.س
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {c.totalDeliveries || 0} عملية تسليم
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: c.approved ? "#dcfce7" : "#fef3c7",
                          color: c.approved ? "#166534" : "#92400e",
                        }}
                      >
                        {c.approved ? "✅ معتمد" : "⏳ قيد المراجعة"}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <button
                        type="button"
                        disabled={actionLoading === c.id}
                        onClick={() => handleApproveToggle(c.id, c.approved)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          background: c.approved ? "#fee2e2" : "#16a34a",
                          color: c.approved ? "#991b1b" : "#ffffff",
                        }}
                      >
                        {actionLoading === c.id
                          ? "..."
                          : c.approved
                          ? "⛔ إيقاف التفعيل"
                          : "✅ اعتماد وتفعيل"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit City Modal */}
      {showCityModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                {cityFormData.id ? "✏️ تعديل بيانات وتسعيرة المدينة" : "➕ إضافة مدينة جديدة"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCityModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCity} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>اسم المدينة *</label>
                <input
                  type="text"
                  value={cityFormData.cityName}
                  onChange={(e) => setCityFormData({ ...cityFormData, cityName: e.target.value })}
                  required
                  placeholder="مثال: بورتسودان، الخرطوم، مدني"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>اسم الولاية</label>
                <input
                  type="text"
                  value={cityFormData.stateName}
                  onChange={(e) => setCityFormData({ ...cityFormData, stateName: e.target.value })}
                  placeholder="مثال: البحر الأحمر، الخرطوم، الجزيرة"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>سعر الشحن (ج.س) *</label>
                  <input
                    type="number"
                    value={cityFormData.standardFee}
                    onChange={(e) => setCityFormData({ ...cityFormData, standardFee: Number(e.target.value) })}
                    required
                    min="0"
                    step="100"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>المدة التقديرية *</label>
                  <input
                    type="text"
                    value={cityFormData.estimatedDays}
                    onChange={(e) => setCityFormData({ ...cityFormData, estimatedDays: e.target.value })}
                    required
                    placeholder="مثال: 1-2 أيام أو خلال 24 ساعة"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="cityActive"
                  checked={cityFormData.isActive}
                  onChange={(e) => setCityFormData({ ...cityFormData, isActive: e.target.checked })}
                />
                <label htmlFor="cityActive" style={{ fontSize: "13px", fontWeight: "bold", cursor: "pointer" }}>
                  تفعيل المدينة واستقبال الشحنات بها
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button
                  type="submit"
                  disabled={actionLoading === "savingCity"}
                  className="szBtn szBtnPrimary"
                  style={{ flex: 1, padding: "10px", fontWeight: "bold" }}
                >
                  {actionLoading === "savingCity" ? "جارِ الحفظ..." : "💾 حفظ المدينة"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCityModal(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f1f5f9",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Lightbox Preview Modal */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              maxWidth: "600px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{previewDoc.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <img
              src={previewDoc.url}
              alt={previewDoc.title}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                borderRadius: "8px",
                objectFit: "contain",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
