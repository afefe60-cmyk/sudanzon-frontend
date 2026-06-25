"use client";

import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  role: "CUSTOMER",
  authProvider: "LOCAL",
  storeName: "",
  storeSlug: "",
  description: "",
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(result.items || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setToken(localStorage.getItem("sudanzonToken") || "");
  }, []);

  useEffect(() => {
    if (!token) return;
    loadUsers();
  }, [token]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => setForm(emptyForm);

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!token) {
      setMessage("يجب تسجيل الدخول كمدير أولاً");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      storeName: form.storeName.trim() || null,
      storeSlug: form.storeSlug.trim() || null,
      description: form.description.trim() || null,
      password: form.authProvider === "LOCAL" ? form.password : null,
    };

    try {
      await apiJson("/api/admin/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      setMessage("تم إنشاء الحساب بنجاح");
      resetForm();
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const approveVendor = async (user) => {
    if (!user.vendor || user.vendor.approved) {
      return;
    }

    setMessage("");
    try {
      await apiJson(`/api/admin/users/${user.id}/approve-vendor`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("تم اعتماد حساب التاجر بنجاح");
      await loadUsers();
      window.dispatchEvent(new Event("sudanzon-notifications-updated"));
    } catch (error) {
      setMessage(error.message);
    }
  };

  const showVendorFields = form.role === "VENDOR";

  return (
    <div className="adminUsersGrid">
      <form className="cardPanel formPanel" onSubmit={submitForm}>
        <h3>إنشاء حساب جديد</h3>
        <p style={{ color: "var(--amazon-muted)", marginTop: 8 }}>
          أنشئ حساب عميل أو بائع أو مشرف من لوحة واحدة.
        </p>

        <div className="formRow">
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="الاسم الكامل"
            required
          />
          <select className="input" name="role" value={form.role} onChange={onChange}>
            <option value="CUSTOMER">عميل</option>
            <option value="VENDOR">بائع</option>
            <option value="ADMIN">مدير</option>
            <option value="COURIER">مندوب</option>
          </select>
        </div>

        <div className="formRow">
          <input
            className="input"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="رقم الهاتف"
          />
          <input
            className="input"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="البريد الإلكتروني"
            required={form.authProvider === "GOOGLE"}
          />
        </div>

        <div className="formRow">
          <select className="input" name="authProvider" value={form.authProvider} onChange={onChange}>
            <option value="LOCAL">تسجيل محلي</option>
            <option value="GOOGLE">Google</option>
          </select>
          <input
            className="input"
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            placeholder="كلمة المرور"
            required={form.authProvider === "LOCAL"}
          />
        </div>

        {showVendorFields ? (
          <>
            <input
              className="input"
              name="storeName"
              value={form.storeName}
              onChange={onChange}
              placeholder="اسم المتجر"
              required
            />
            <div className="formRow">
              <input
                className="input"
                name="storeSlug"
                value={form.storeSlug}
                onChange={onChange}
                placeholder="Slug المتجر"
              />
              <input
                className="input"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="وصف المتجر"
              />
            </div>
          </>
        ) : null}

        <div className="formRow">
          <button className="primaryBtn" type="submit" disabled={saving}>
            {saving ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
          <button className="secondaryBtn" type="button" onClick={resetForm}>
            مسح
          </button>
        </div>

        {message ? <p style={{ color: "#1f5f3a", margin: 0 }}>{message}</p> : null}
      </form>

      <div className="cardPanel">
        <h3>الحسابات الأخيرة</h3>
        <p style={{ color: "var(--amazon-muted)", marginTop: 8 }}>
          راقب الحسابات المنشأة حديثًا وتأكد من توزيع الأدوار بالشكل الصحيح.
        </p>
        {loading ? <p>جاري تحميل الحسابات...</p> : null}
        <div className="adminUsersList">
          {!loading && users.length === 0 ? <p>لا توجد حسابات بعد.</p> : null}
          {users.map((user) => (
            <div className="adminUserRow" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <p>{user.email || user.phone || "لا يوجد معرف ظاهر"}</p>
              </div>
              <div className="adminUserMeta">
                <span className="amazonMiniTag">{user.role}</span>
                <span className="amazonMiniTag">{user.authProvider}</span>
                {user.vendor ? <span className="amazonMiniTag">{user.vendor.storeName}</span> : null}
                {user.vendor ? (
                  <span className="amazonMiniTag">{user.vendor.approved ? "معتمد" : "بانتظار الموافقة"}</span>
                ) : null}
                {user.vendor && !user.vendor.approved ? (
                  <button className="primaryBtn" type="button" onClick={() => approveVendor(user)}>
                    اعتماد التاجر
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
