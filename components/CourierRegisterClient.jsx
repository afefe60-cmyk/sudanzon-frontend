"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com").replace(/\/+$/, "");

export default function CourierRegisterClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    city: "بورتسودان",
    vehicleType: "موتر / دراجة نارية",
    vehiclePlate: "",
    nationalId: "",
    companyName: "",
    isCompany: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/couriers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "فشل تسجيل حساب المندوب");
      }

      setSuccess(true);
      if (data.token) {
        localStorage.setItem("sudanzonToken", data.token);
        localStorage.setItem("sudanzonUser", JSON.stringify(data.user));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="szVendorOnboardingSection">
      <div className="container">
        <div className="szVendorHeroCard">
          <div className="szVendorHeroBadge">
            <span>🛵 بوابة أفراد وشركات التوصيل والشحن</span>
          </div>
          <h1 className="szVendorHeroTitle">انضم لشبكة كباتن ومناديب سودان زون</h1>
          <p className="szVendorHeroSubtitle">
            حقق دخلاً ممتازاً ككابتن توصيل مستقل (موتر، ركشة، سيارة) أو كشركة شحن وترحيلات. استقبل الشحنات يومياً من آلاف التجار مع دفع فوري وأرباح مجزية.
          </p>

          <div className="szVendorBenefitsGrid">
            <div className="szBenefitCard">
              <div className="szBenefitIcon">🛵</div>
              <h3>حرية ومرونة كاملة</h3>
              <p>اعمل في الوقت والمناطق التي تناسبك واستقبل الطلبات بضغطة زر عبر هاتفك.</p>
            </div>

            <div className="szBenefitCard">
              <div className="szBenefitIcon">💵</div>
              <h3>أرباح ومحفظة فورية</h3>
              <p>تحصيل رسوم التوصيل وإضافتها لمحفظتك فورياً مع تسويات مباشرة عبر بنكك.</p>
            </div>

            <div className="szBenefitCard">
              <div className="szBenefitIcon">🔒</div>
              <h3>تسليم آمن عبر كود OTP</h3>
              <p>ضمان كامل لحقوقك وتأكيد التسليم برمز التحقق السري من العميل.</p>
            </div>
          </div>
        </div>

        <div className="szVendorFormContainer">
          <div className="szVendorFormWrapper">
            <div className="szAuthCard" style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div className="szAuthHeader">
                <h2>🚀 تسجيل كابتن / شركة توصيل جديدة</h2>
                <p>أدخل بياناتك لتفعيل حسابك والبدء في استلام وتوصيل الطلبات</p>
              </div>

              {error && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "bold" }}>
                  ⚠️ {error}
                </div>
              )}

              {success ? (
                <div style={{ textAlign: "center", padding: "24px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>تم استلام طلبك بنجاح!</h3>
                  <p style={{ color: "#475569", marginBottom: "20px" }}>
                    حسابك الآن قيد الاعتماد من قبل إدارة سودان زون. سيتم التواصل معك عبر الواتساب وتفعيل حسابك لاستقبال الطلبات.
                  </p>
                  <Link href="/courier" className="szBtn szBtnPrimary" style={{ display: "inline-block" }}>
                    الانتقال للوحة المندوب
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", gap: "10px", background: "#f1f5f9", padding: "6px", borderRadius: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, isCompany: false }))}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "bold",
                        background: !formData.isCompany ? "#2563eb" : "transparent",
                        color: !formData.isCompany ? "#ffffff" : "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      🛵 كابتن / مندوب مستقل
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, isCompany: true }))}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "bold",
                        background: formData.isCompany ? "#2563eb" : "transparent",
                        color: formData.isCompany ? "#ffffff" : "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      🏢 شركة شحن / ترحيلات
                    </button>
                  </div>

                  {formData.isCompany && (
                    <div>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>اسم شركة الشحن / الترحيلات *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        placeholder="مثال: شركة النسر للشحن السريع"
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>الاسم ثلاثي (المسؤول / الكابتن) *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="أدخل اسمك الكامل"
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>رقم الهاتف (الواتساب) *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="0912345678"
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>المدينة الأساسية *</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                      >
                        <option value="بورتسودان">بورتسودان</option>
                        <option value="الخرطوم">الخرطوم</option>
                        <option value="أم درمان">أم درمان</option>
                        <option value="بحري">بحري</option>
                        <option value="عطبرة">عطبرة</option>
                        <option value="شندي">شندي</option>
                        <option value="كسلا">كسلا</option>
                        <option value="القضارف">القضارف</option>
                        <option value="كوسـتي">كوسـتي</option>
                        <option value="دنقلا">دنقلا</option>
                        <option value="مروي">مروي</option>
                        <option value="الضعين">الضعين</option>
                        <option value="الفاشر">الفاشر</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>نوع وسيلة النقل *</label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                      >
                        <option value="موتر / دراجة نارية">موتر / دراجة نارية 🛵</option>
                        <option value="ركشة">ركشة 🛺</option>
                        <option value="سيارة خاصة / دباب">سيارة خاصة / دباب 🚗</option>
                        <option value="شاحنة / دفار ترحيلات">شاحنة / دفار ترحيلات 🚚</option>
                        <option value="أسطول متعدد (شركة)">أسطول متعدد (شركة) 🏢</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>رقم اللوحة (اختياري)</label>
                      <input
                        type="text"
                        name="vehiclePlate"
                        value={formData.vehiclePlate}
                        onChange={handleChange}
                        placeholder="مثال: خ 12345"
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>الرقم الوطني / الهوية (اختياري)</label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleChange}
                      placeholder="الرقم الوطني"
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>كلمة المرور *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="اختر كلمة مرور قوية"
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="szBtn szBtnPrimary"
                    style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: "bold", marginTop: "10px" }}
                  >
                    {loading ? "جارِ إنشاء الحساب..." : "🚀 تسجيل الحساب والانضمام للمنظومة"}
                  </button>

                  <div style={{ textAlign: "center", marginTop: "12px", fontSize: "14px" }}>
                    لديك حساب مندوب بالفعل؟{" "}
                    <Link href="/auth/login?return_to=/courier" style={{ color: "#2563eb", fontWeight: "bold" }}>
                      تسجيل الدخول هنا
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
