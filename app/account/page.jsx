"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { apiJson } from "../../lib/api";

const sudanCities = [
  "الخرطوم",
  "أم درمان",
  "بحري",
  "بورتسودان",
  "كسلا",
  "القضارف",
  "ود مدني",
  "عطبرة",
  "شندي",
  "الأبيض",
  "كوستي",
  "الفاشر",
  "دنقلا",
];

const emptyProfile = {
  name: "",
  email: "",
  city: "الخرطوم",
  shippingAddress: "",
  alternatePhone: "",
};

export default function AccountPage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("sudanzonToken");

    if (!token) {
      window.location.replace("/auth/login?returnTo=/account");
      return;
    }

    apiJson("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        const current = result.user;
        setUser(current);
        setProfile({
          name: current.name || "",
          email: current.email || "",
          city: current.city || "الخرطوم",
          shippingAddress: current.shippingAddress || "",
          alternatePhone: current.alternatePhone || "",
        });
        localStorage.setItem("sudanzonUser", JSON.stringify(current));
        window.dispatchEvent(new Event("sudanzon-user-updated"));
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  const canAccessSeller = useMemo(() => user && ["VENDOR", "ADMIN"].includes(user.role), [user]);
  const canAccessAdmin = useMemo(() => user && user.role === "ADMIN", [user]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const token = localStorage.getItem("sudanzonToken");

    try {
      const result = await apiJson("/api/auth/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      setUser(result.user);
      localStorage.setItem("sudanzonUser", JSON.stringify(result.user));
      window.dispatchEvent(new Event("sudanzon-user-updated"));
      setMessage("✓ تم حفظ بيانات الملف الشخصي وعنوان التوصيل بنجاح!");
      setTimeout(() => setMessage(""), 3500);
    } catch (error) {
      setMessage(error.message || "تعذر حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("sudanzonToken");
    localStorage.removeItem("sudanzonUser");
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    window.dispatchEvent(new Event("sudanzon-user-updated"));
    window.location.href = "/";
  };

  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szAccountPageSection">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="szBreadcrumb" aria-label="مسار التنقل">
            <Link href="/">الرئيسية</Link>
            <span>/</span>
            <span className="szBreadcrumbCurrent">إدارة الحساب والملف الشخصي</span>
          </nav>

          {/* Profile Hero Header Card */}
          <div className="szAccountHeroCard">
            <div className="szAccountHeroLeft">
              <div className="szAccountAvatarLarge">
                {user?.name ? user.name.charAt(0) : "👤"}
              </div>
              <div className="szAccountHeroInfo">
                <span className="szDashboardBadge">
                  {user?.role === "ADMIN"
                    ? "🛡️ مدير النظام"
                    : user?.role === "VENDOR"
                      ? "🏬 تاجر معتمد"
                      : user?.role === "COURIER"
                        ? "🚚 مندوب توصيل"
                        : "👤 عميل متسوق"}
                </span>
                <h1 className="szAccountUserName">{user?.name || "المستخدم"}</h1>
                <p className="szAccountUserEmail">
                  {user?.phone || user?.email || "حساب سودان زون"} • مصادقة:{" "}
                  {user?.authProvider === "GOOGLE" ? "Google" : "تسجيل محلي"}
                </p>
              </div>
            </div>

            <div className="szAccountHeroActions">
              <button type="button" onClick={logout} className="szLogoutButton">
                <span>🚪 تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {message && <div className="szAdminAlert">{message}</div>}

          {/* Grid Layout: Profile Form (60%) & Quick Nav Cards (40%) */}
          <div className="szAccountMainGrid">
            {/* Profile Edit Form */}
            <form className="szAccountFormCard" onSubmit={saveProfile}>
              <div className="szEditorHeader">
                <h2 className="szCardSectionTitle">✏️ تعديل البيانات الشخصية وعنوان التوصيل</h2>
                <p className="szCardSectionSubtitle">
                  حدّث بياناتك لتسهيل وسرعة وصول مناديب التوصيل إلى موقعك.
                </p>
              </div>

              {loading ? (
                <div className="szAdminLoading">جارِ تحميل بيانات الحساب...</div>
              ) : (
                <>
                  <div className="szFormGrid2">
                    <div className="szFormGroup">
                      <label className="szFormLabel">الاسم الكامل *</label>
                      <input
                        className="szFormInput"
                        name="name"
                        value={profile.name}
                        onChange={onChange}
                        placeholder="الاسم الكامل"
                        required
                      />
                    </div>

                    <div className="szFormGroup">
                      <label className="szFormLabel">البريد الإلكتروني</label>
                      <input
                        className="szFormInput"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={onChange}
                        placeholder="user@sudanzon.com"
                      />
                    </div>
                  </div>

                  <div className="szFormGrid2">
                    <div className="szFormGroup">
                      <label className="szFormLabel">المدينة / الولاية *</label>
                      <select
                        className="szFormSelect"
                        name="city"
                        value={profile.city}
                        onChange={onChange}
                        required
                      >
                        {sudanCities.map((c) => (
                          <option key={c} value={c}>
                            🇸🇩 {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="szFormGroup">
                      <label className="szFormLabel">رقم هاتف إضافي (بديل)</label>
                      <input
                        className="szFormInput"
                        name="alternatePhone"
                        value={profile.alternatePhone}
                        onChange={onChange}
                        placeholder="0912345678"
                      />
                    </div>
                  </div>

                  <div className="szFormGroup">
                    <label className="szFormLabel">عنوان الشحن والتوصيل بالتفصيل</label>
                    <textarea
                      className="szFormTextarea"
                      name="shippingAddress"
                      rows={3}
                      value={profile.shippingAddress}
                      onChange={onChange}
                      placeholder="مثال: الخرطوم، حي الرياض، شارع المشتل، بالقرب من المركز الطبي..."
                    />
                  </div>

                  <div className="szFormActionButtons">
                    <button className="szSubmitProductBtn" type="submit" disabled={saving}>
                      {saving ? "جارِ الحفظ..." : "✓ حفظ التعديلات"}
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Quick Navigation Hub */}
            <div className="szAccountSideHub">
              <div className="szAccountSideCard">
                <h3 className="szAsideCardTitle">⚡ لوحة الوصول السريع</h3>
                <div className="szAccountQuickList">
                  <Link href="/orders" className="szAccountQuickItem">
                    <span className="szQuickItemIcon">📦</span>
                    <div>
                      <strong>طلباتي ومتابعة الشحنات</strong>
                      <small>تتبع مسار شحناتك الحالية وتاريخ المشتريات</small>
                    </div>
                  </Link>

                  <Link href="/cart" className="szAccountQuickItem">
                    <span className="szQuickItemIcon">🛒</span>
                    <div>
                      <strong>سلة المشتريات</strong>
                      <small>مراجعة المنتجات المختارة وإتمام الشراء</small>
                    </div>
                  </Link>

                  {canAccessSeller && (
                    <Link href="/seller" className="szAccountQuickItem szAccountQuickItem--seller">
                      <span className="szQuickItemIcon">🏬</span>
                      <div>
                        <strong>لوحة تحكم البائع</strong>
                        <small>إدارة المنتجات، المبيعات، ومخزون المتجر</small>
                      </div>
                    </Link>
                  )}

                  {canAccessAdmin && (
                    <Link href="/admin" className="szAccountQuickItem szAccountQuickItem--admin">
                      <span className="szQuickItemIcon">🛡️</span>
                      <div>
                        <strong>مركز الإدارة والتحكم</strong>
                        <small>مؤشرات الأداء وإدارة المتاجر والمناديب</small>
                      </div>
                    </Link>
                  )}

                  <Link href="/terms" className="szAccountQuickItem">
                    <span className="szQuickItemIcon">📄</span>
                    <div>
                      <strong>الشروط والأحكام</strong>
                      <small>اتفاقية الاستخدام وحقوق المشتري والتاجر</small>
                    </div>
                  </Link>

                  <Link href="/privacy" className="szAccountQuickItem">
                    <span className="szQuickItemIcon">🔒</span>
                    <div>
                      <strong>سياسة الخصوصية</strong>
                      <small>أمان وسرية بيانات المستخدمين والمدفوعات</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
