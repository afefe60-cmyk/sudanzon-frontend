"use client";

import { useEffect, useState, useRef } from "react";
import { apiJson, apiForm } from "../lib/api";
import { resolveImageUrl } from "../lib/media";

const emptyForm = {
  id: "",
  title: "",
  subtitle: "",
  badgeText: "إعلان ممول",
  placement: "HOME_TOP_SLIDER",
  actionType: "WHATSAPP",
  actionUrl: "",
  whatsappPhone: "",
  whatsappText: "مرحباً، أود الاستفسار بخصوص الإعلان على تطبيق سودان زون",
  callPhone: "",
  isActive: true,
  startDate: "",
  endDate: "",
  priority: 0,
  imageFile: null,
  imagePreview: "",
  logoFile: null,
  logoPreview: "",
};

export default function AdminAdsClient() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const imageInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "");

  const loadAds = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/admin/ads", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setAds(result.ads || []);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "تعذر تحميل قائمة الإعلانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        logoFile: file,
        logoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleEdit = (ad) => {
    setForm({
      id: ad.id,
      title: ad.title || "",
      subtitle: ad.subtitle || "",
      badgeText: ad.badgeText || "إعلان ممول",
      placement: ad.placement || "HOME_TOP_SLIDER",
      actionType: ad.actionType || "WHATSAPP",
      actionUrl: ad.actionUrl || "",
      whatsappPhone: ad.whatsappPhone || "",
      whatsappText: ad.whatsappText || "مرحباً، أود الاستفسار بخصوص الإعلان على تطبيق سودان زون",
      callPhone: ad.callPhone || "",
      isActive: ad.isActive !== false,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : "",
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : "",
      priority: ad.priority || 0,
      imageFile: null,
      imagePreview: resolveImageUrl(ad.imageUrl),
      logoFile: null,
      logoPreview: ad.logoUrl ? resolveImageUrl(ad.logoUrl) : "",
    });
    setShowAddForm(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleToggle = async (adId) => {
    try {
      const result = await apiJson(`/api/admin/ads/${adId}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMessage(result.message || "تم تغيير حالة الإعلان");
      loadAds();
    } catch (error) {
      setErrorMessage(error.message || "تعذر تعديل حالة الإعلان");
    }
  };

  const handleDelete = async (adId, title) => {
    if (!window.confirm(`هل أنت متأكد من حذف الإعلان "${title}"؟`)) return;
    try {
      await apiJson(`/api/admin/ads/${adId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMessage("تم حذف الإعلان بنجاح");
      loadAds();
    } catch (error) {
      setErrorMessage(error.message || "تعذر حذف الإعلان");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("badgeText", form.badgeText);
      formData.append("placement", form.placement);
      formData.append("actionType", form.actionType);
      formData.append("actionUrl", form.actionUrl);
      formData.append("whatsappPhone", form.whatsappPhone);
      formData.append("whatsappText", form.whatsappText);
      formData.append("callPhone", form.callPhone);
      formData.append("isActive", String(form.isActive));
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      formData.append("priority", String(form.priority));

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }
      if (form.logoFile) {
        formData.append("logo", form.logoFile);
      }

      if (form.id) {
        // Update
        await apiForm(`/api/admin/ads/${form.id}`, formData, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setMessage("🎉 تم تحديث بيانات الإعلان بنجاح!");
      } else {
        // Create
        await apiForm("/api/admin/ads", formData, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setMessage("🎉 تم إنشاء وإدراج الإعلان بنجاح!");
      }

      setForm(emptyForm);
      setShowAddForm(false);
      loadAds();
    } catch (error) {
      setErrorMessage(error.message || "حدث خطأ أثناء حفظ الإعلان");
    } finally {
      setSaving(false);
    }
  };

  const getPlacementLabel = (p) => {
    switch (p) {
      case "HOME_TOP_SLIDER":
        return "📱 سلايدر أعلى الرئيسية";
      case "HOME_FEED_CARD":
        return "🏢 بطاقة وسط المنتجات";
      case "PRODUCT_DETAILS":
        return "🛍️ داخل صفحة المنتج";
      default:
        return p;
    }
  };

  const getActionLabel = (a) => {
    switch (a) {
      case "WHATSAPP":
        return "💬 محادثة واتساب";
      case "PHONE_CALL":
        return "📞 اتصال هاتفي";
      case "WEBSITE_URL":
        return "🌐 رابط موقع خارجي";
      case "APP_STORE":
        return "📲 متجر التطبيقات";
      default:
        return a;
    }
  };

  return (
    <div className="szAdminAdsManager">
      <div className="szAdminSectionTop">
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", margin: "0 0 4px", color: "#f8fafc" }}>
            📢 إدارة الإعلانات والشركاء والرعاة
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: 0 }}>
            إدارة إعلانات البنوك، المعاهد التدريبية، الشركات، والتطبيقات الخارجية مع التحكم في مدة الظهور وطرق التواصل.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showAddForm) {
              setForm(emptyForm);
              setShowAddForm(false);
            } else {
              setForm(emptyForm);
              setShowAddForm(true);
            }
          }}
          className="szAdminBtnPrimary"
        >
          {showAddForm ? "✕ إغلاق النموذج" : "➕ إضافة إعلان جديد"}
        </button>
      </div>

      {message && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#34d399", padding: "12px 16px", borderRadius: "10px", margin: "16px 0", fontSize: "0.9rem" }}>
          {message}
        </div>
      )}

      {errorMessage && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#f87171", padding: "12px 16px", borderRadius: "10px", margin: "16px 0", fontSize: "0.9rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="szAdminFormCard" style={{ marginTop: "20px", background: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fbbf24", marginBottom: "16px" }}>
            {form.id ? "✏️ تعديل بيانات الإعلان" : "➕ إضافة إعلان أو راعي جديد"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="szFormLabel">عنوان الإعلان / اسم الجهة المعلنة *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder="مثال: خدمات بنكك الإلكترونية، معهد الرواد للتدريب"
                  required
                  className="szFormInput"
                />
              </div>

              <div>
                <label className="szFormLabel">نص الشارة العلوية (Badge)</label>
                <input
                  type="text"
                  name="badgeText"
                  value={form.badgeText}
                  onChange={onChange}
                  placeholder="مثال: إعلان ممول، شريك معتمد، خصم خاص"
                  className="szFormInput"
                />
              </div>

              <div>
                <label className="szFormLabel">مكان الظهور في التطبيق (Placement) *</label>
                <select name="placement" value={form.placement} onChange={onChange} className="szFormSelect">
                  <option value="HOME_TOP_SLIDER">📱 سلايدر أعلى الرئيسية (Top Banner Slider)</option>
                  <option value="HOME_FEED_CARD">🏢 بطاقة وسط المنتجات (In-Feed Sponsor Card)</option>
                  <option value="PRODUCT_DETAILS">🛍️ داخل صفحة تفاصيل المنتج (Product Details)</option>
                </select>
              </div>

              <div>
                <label className="szFormLabel">نوع الإجراء عند النقر (Call to Action) *</label>
                <select name="actionType" value={form.actionType} onChange={onChange} className="szFormSelect">
                  <option value="WHATSAPP">💬 محادثة واتساب مباشرة (WhatsApp Direct)</option>
                  <option value="PHONE_CALL">📞 اتصال هاتفي مباشر (Direct Phone Call)</option>
                  <option value="WEBSITE_URL">🌐 رابط موقع / صفحة تسجيل (Website Link)</option>
                  <option value="APP_STORE">📲 تحميل تطبيق (Google Play Link)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="szFormLabel">تفاصيل ونص الإعلان أو العرض (الوصف)</label>
              <textarea
                name="subtitle"
                value={form.subtitle}
                onChange={onChange}
                placeholder="مثال: التسجيل مفتوح الآن لدبلوم الذكاء الاصطناعي والتسويق مع شهادات معتمدة وتخفيض 30%..."
                rows={3}
                className="szFormTextarea"
              />
            </div>

            {/* Dynamic CTA Fields */}
            <div style={{ background: "rgba(30, 41, 59, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "16px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#38bdf8", margin: "0 0 12px" }}>
                🎯 إعدادات زر التفاعل ({getActionLabel(form.actionType)}):
              </h4>

              {form.actionType === "WHATSAPP" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                  <div>
                    <label className="szFormLabel">رقم واتساب للتواصل *</label>
                    <input
                      type="text"
                      name="whatsappPhone"
                      value={form.whatsappPhone}
                      onChange={onChange}
                      placeholder="مثال: +249912345678 أو 0912345678"
                      required
                      className="szFormInput"
                    />
                  </div>
                  <div>
                    <label className="szFormLabel">الرسالة الترحيبية التلقائية</label>
                    <input
                      type="text"
                      name="whatsappText"
                      value={form.whatsappText}
                      onChange={onChange}
                      placeholder="نص الرسالة التي تظهر تلقائياً عند فتح الواتساب"
                      className="szFormInput"
                    />
                  </div>
                </div>
              )}

              {form.actionType === "PHONE_CALL" && (
                <div>
                  <label className="szFormLabel">رقم الهاتف للاتصال المباشر *</label>
                  <input
                    type="text"
                    name="callPhone"
                    value={form.callPhone}
                    onChange={onChange}
                    placeholder="مثال: 0912345678"
                    required
                    className="szFormInput"
                  />
                </div>
              )}

              {(form.actionType === "WEBSITE_URL" || form.actionType === "APP_STORE") && (
                <div>
                  <label className="szFormLabel">الرابط الخارجي (URL) *</label>
                  <input
                    type="url"
                    name="actionUrl"
                    value={form.actionUrl}
                    onChange={onChange}
                    placeholder="مثال: https://bankofkhartoum.com أو https://play.google.com/..."
                    required
                    className="szFormInput"
                  />
                </div>
              )}
            </div>

            {/* Images Upload */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="szFormLabel">صورة البانر أو الإعلان الأساسية *</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="szAdminBtnSecondary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  🖼️ {form.imageFile ? form.imageFile.name : "اختر صورة الإعلان من الجهاز"}
                </button>
                {form.imagePreview && (
                  <div style={{ marginTop: "8px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid #475569" }}>
                    <img src={form.imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>

              <div>
                <label className="szFormLabel">شعار الجهة أو المعلن (اختياري)</label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="szAdminBtnSecondary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  🏢 {form.logoFile ? form.logoFile.name : "اختر لوجو الجهة (Logo)"}
                </button>
                {form.logoPreview && (
                  <div style={{ marginTop: "8px", width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", border: "1px solid #475569", background: "#ffffff", padding: "4px" }}>
                    <img src={form.logoPreview} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Dates & Status */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label className="szFormLabel">تاريخ بدء الحملة (اختياري)</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  className="szFormInput"
                />
              </div>

              <div>
                <label className="szFormLabel">تاريخ انتهاء الحملة (اختياري)</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChange}
                  className="szFormInput"
                />
              </div>

              <div>
                <label className="szFormLabel">أولوية الظهور (الأعلى يظهر أولاً)</label>
                <input
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={onChange}
                  className="szFormInput"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <label htmlFor="isActiveToggle" style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", cursor: "pointer" }}>
                  تفعيل الإعلان فوراً في التطبيق ✅
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setShowAddForm(false);
                }}
                className="szAdminBtnSecondary"
              >
                إلغاء
              </button>
              <button type="submit" disabled={saving} className="szAdminBtnPrimary">
                {saving ? "⏳ جاري الحفظ..." : form.id ? "💾 حفظ التعديلات" : "🚀 نشر الإعلان الآن"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads Table / Cards */}
      <div style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            ⏳ جاري تحميل الإعلانات...
          </div>
        ) : ads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "rgba(30, 41, 59, 0.4)", borderRadius: "16px", border: "1px dashed #475569" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "8px" }}>📢</span>
            <strong style={{ color: "#f8fafc", fontSize: "1.1rem" }}>لا توجد إعلانات مسجلة حتى الآن</strong>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>
              اضغط على "إضافة إعلان جديد" بالأعلى لترويج خدمات البنوك، المعاهد، أو الشركات.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {ads.map((ad) => {
              const now = new Date();
              const isExpired = ad.endDate && new Date(ad.endDate) < now;
              const isFuture = ad.startDate && new Date(ad.startDate) > now;

              return (
                <div
                  key={ad.id}
                  style={{
                    background: "#0f172a",
                    border: `1px solid ${ad.isActive && !isExpired ? "#3b82f6" : "#334155"}`,
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Banner Image */}
                  <div style={{ position: "relative", height: "140px", background: "#1e293b" }}>
                    <img
                      src={resolveImageUrl(ad.imageUrl)}
                      alt={ad.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", color: "#fbbf24", fontWeight: "bold" }}>
                      {ad.badgeText || "إعلان ممول"}
                    </div>
                    <div style={{ position: "absolute", bottom: "10px", right: "10px", background: ad.isActive && !isExpired ? "#10b981" : "#ef4444", color: "#ffffff", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold" }}>
                      {!ad.isActive ? "⏸️ معطل" : isExpired ? "⌛ منتهي" : isFuture ? "🕒 مجدول" : "🟢 نشط الآن"}
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {ad.logoUrl && (
                        <img
                          src={resolveImageUrl(ad.logoUrl)}
                          alt="Logo"
                          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "contain", background: "#ffffff", padding: "2px", border: "1px solid #475569" }}
                        />
                      )}
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc" }}>
                          {ad.title}
                        </h4>
                        <span style={{ fontSize: "0.78rem", color: "#38bdf8" }}>
                          {getPlacementLabel(ad.placement)}
                        </span>
                      </div>
                    </div>

                    {ad.subtitle && (
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.4" }}>
                        {ad.subtitle}
                      </p>
                    )}

                    {/* Stats & Action */}
                    <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "8px 12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                      <span style={{ color: "#cbd5e1" }}>
                        <strong>الإجراء:</strong> {getActionLabel(ad.actionType)}
                      </span>
                      <span style={{ color: "#fbbf24" }}>
                        👆 {ad.clicksCount || 0} نقرة | 👁️ {ad.viewsCount || 0} ظهور
                      </span>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #1e293b" }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(ad.id)}
                        style={{
                          flex: 1,
                          background: ad.isActive ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          border: `1px solid ${ad.isActive ? "#ef4444" : "#10b981"}`,
                          color: ad.isActive ? "#f87171" : "#34d399",
                          borderRadius: "8px",
                          padding: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        {ad.isActive ? "إيقاف مؤقت" : "تفعيل"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(ad)}
                        style={{
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid #3b82f6",
                          color: "#60a5fa",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "0.78rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        تعديل ✏️
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(ad.id, ad.title)}
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                          borderRadius: "8px",
                          padding: "6px 10px",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .szAdminAdsManager {
          color: #f8fafc;
        }
        .szAdminSectionTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }
        .szAdminBtnPrimary {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          border: none;
          font-weight: 800;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .szAdminBtnPrimary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        .szAdminBtnSecondary {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .szFormLabel {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .szFormInput,
        .szFormSelect,
        .szFormTextarea {
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          color: #ffffff;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: inherit;
          box-sizing: border-box;
        }
        .szFormInput:focus,
        .szFormSelect:focus,
        .szFormTextarea:focus {
          border-color: #f59e0b;
          outline: none;
        }
      `}</style>
    </div>
  );
}
