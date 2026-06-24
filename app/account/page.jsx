"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import { apiJson } from "../../lib/api";

const emptyProfile = {
  name: "",
  email: "",
  city: "",
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
          city: current.city || "",
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
  const canAccessCourier = useMemo(() => user && ["COURIER", "ADMIN"].includes(user.role), [user]);

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
      setMessage("تم حفظ بيانات الحساب بنجاح");
    } catch (error) {
      setMessage(error.message);
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
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading title="حسابي" subtitle="إدارة بياناتك وعنوان الشحن من مكان واحد" />

          {message ? <div className="cardPanel">{message}</div> : null}

          {user ? (
            <div className="accountHero cardPanel">
              <div>
                <span className="dashboardHeroTag">ملف المستخدم</span>
                <h3>{user.name}</h3>
                <p>
                  {user.role} · {user.authProvider === "GOOGLE" ? "دخول Google" : "دخول محلي"}
                </p>
              </div>

              <div className="accountHeroMeta">
                <span className="accountMetaPill">{user.phone || "لا يوجد هاتف"}</span>
                <span className="accountMetaPill">{user.email || "لا يوجد بريد"}</span>
                <span className="accountMetaPill">{user.city || "لا توجد مدينة"}</span>
              </div>
            </div>
          ) : null}

          <div className="accountGrid">
            <form className="cardPanel formPanel" onSubmit={saveProfile}>
              <h3>الملف الشخصي</h3>

              {loading ? <p>جاري تحميل البيانات...</p> : null}

              <input
                className="input"
                name="name"
                value={profile.name}
                onChange={onChange}
                placeholder="الاسم الكامل"
                required
              />
              <input
                className="input"
                name="email"
                type="email"
                value={profile.email}
                onChange={onChange}
                placeholder="البريد الإلكتروني"
              />
              <div className="formRow">
                <input
                  className="input"
                  name="city"
                  value={profile.city}
                  onChange={onChange}
                  placeholder="المدينة"
                />
                <input
                  className="input"
                  name="alternatePhone"
                  value={profile.alternatePhone}
                  onChange={onChange}
                  placeholder="رقم إضافي"
                />
              </div>
              <textarea
                className="input"
                name="shippingAddress"
                rows={4}
                value={profile.shippingAddress}
                onChange={onChange}
                placeholder="عنوان الشحن الكامل"
              />

              <div className="formRow">
                <button className="primaryBtn" type="submit" disabled={saving}>
                  {saving ? "جاري الحفظ..." : "حفظ البيانات"}
                </button>
                <button className="secondaryBtn" type="button" onClick={logout}>
                  تسجيل الخروج
                </button>
              </div>
            </form>

            <div className="cardPanel">
              <h3>ملخص الحساب</h3>
              {user ? (
                <div className="accountInfo">
                  <p>الاسم: {user.name}</p>
                  <p>الهاتف: {user.phone || "غير محدد"}</p>
                  <p>البريد: {user.email || "لا يوجد بريد إلكتروني"}</p>
                  <p>المدينة: {user.city || "غير محددة"}</p>
                  <p>العنوان: {user.shippingAddress || "غير محدد"}</p>
                  <p>رقم إضافي: {user.alternatePhone || "غير محدد"}</p>
                  <div className="accountRoleLine">
                    <span className="amazonMiniTag">{user.role}</span>
                    <span className="amazonMiniTag">{user.authProvider}</span>
                  </div>
                </div>
              ) : null}

              <div className="accountQuickGrid">
                <Link className="accountQuickCard" href="/orders">
                  <strong>طلباتي</strong>
                  <span>مراجعة حالات الطلب والتسليم</span>
                </Link>
                <Link className="accountQuickCard" href="/cart">
                  <strong>السلة</strong>
                  <span>متابعة المنتجات قبل الدفع</span>
                </Link>
                {canAccessSeller ? (
                  <Link className="accountQuickCard" href="/seller">
                    <strong>لوحة البائع</strong>
                    <span>للمتاجر المعتمدة فقط</span>
                  </Link>
                ) : null}
                {canAccessCourier ? (
                  <Link className="accountQuickCard" href="/courier">
                    <strong>لوحة المندوب</strong>
                    <span>تحديث وتسليم الشحنات</span>
                  </Link>
                ) : null}
                <Link className="accountQuickCard" href="/products">
                  <strong>التسوق</strong>
                  <span>استمرار في التصفح والبحث</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
