"use client";

import { useEffect, useMemo, useState } from "react";
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

const roleBadges = {
  ADMIN: { label: "🛡️ مدير النظام", bg: "#fef2f2", text: "#991b1b" },
  VENDOR: { label: "🏬 تاجر / بائع", bg: "#ecfdf5", text: "#065f46" },
  COURIER: { label: "🚚 مندوب توصيل", bg: "#f3e8ff", text: "#6b21a8" },
  CUSTOMER: { label: "👤 عميل متسوق", bg: "#e0f2fe", text: "#075985" },
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

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

      setMessage("✓ تم إنشاء الحساب بنجاح في المنصة!");
      resetForm();
      setShowAddModal(false);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || "تعذر إنشاء الحساب");
    } finally {
      setSaving(false);
    }
  };

  const approveVendor = async (user) => {
    if (!user.vendor || user.vendor.approved) return;

    setMessage("");
    try {
      await apiJson(`/api/admin/users/${user.id}/approve-vendor`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✓ تم اعتماد متجر التاجر بنجاح");
      await loadUsers();
      window.dispatchEvent(new Event("sudanzon-notifications-updated"));
    } catch (error) {
      setMessage(error.message || "تعذر اعتماد التاجر");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchSearch =
        !search ||
        (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
        (u.phone && u.phone.includes(search)) ||
        (u.vendor?.storeName && u.vendor.storeName.toLowerCase().includes(search.toLowerCase()));
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, search]);

  const showVendorFields = form.role === "VENDOR";

  return (
    <div className="szAdminUsersWrapper">
      {/* Top Bar with Search & Add Button */}
      <div className="szAdminFilterBar">
        <div className="szAdminSearchBox">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، رقم الهاتف، أو اسم المتجر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="szAdminActionsRight">
          <div className="szAdminRoleFilterTabs">
            <button
              type="button"
              onClick={() => setRoleFilter("ALL")}
              className={`szRoleFilterBtn ${roleFilter === "ALL" ? "is-active" : ""}`}
            >
              الكل ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("VENDOR")}
              className={`szRoleFilterBtn ${roleFilter === "VENDOR" ? "is-active" : ""}`}
            >
              التجار
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("CUSTOMER")}
              className={`szRoleFilterBtn ${roleFilter === "CUSTOMER" ? "is-active" : ""}`}
            >
              العملاء
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("COURIER")}
              className={`szRoleFilterBtn ${roleFilter === "COURIER" ? "is-active" : ""}`}
            >
              المناديب
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("ADMIN")}
              className={`szRoleFilterBtn ${roleFilter === "ADMIN" ? "is-active" : ""}`}
            >
              المدراء
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(!showAddModal)}
            className="szAdminAddBtn"
          >
            {showAddModal ? "إغلاق النموذج" : "+ إنشاء حساب جديد"}
          </button>
        </div>
      </div>

      {message && <div className="szAdminAlert">{message}</div>}

      {/* Add User Modal / Form */}
      {showAddModal && (
        <form className="szAdminAddUserCard" onSubmit={submitForm}>
          <div className="szEditorHeader">
            <h3>👤 إنشاء حساب مستخدم / تاجر / مندوب</h3>
            <p>املأ بيانات الحساب وحدد الدور والصلاحيات المطلوبة في النظام.</p>
          </div>

          <div className="szFormGrid2">
            <div className="szFormGroup">
              <label className="szFormLabel">الاسم الكامل *</label>
              <input
                className="szFormInput"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="مثال: أحمد محمد عثمان"
                required
              />
            </div>

            <div className="szFormGroup">
              <label className="szFormLabel">الدور والصلاحية *</label>
              <select className="szFormSelect" name="role" value={form.role} onChange={onChange}>
                <option value="CUSTOMER">عميل متسوق</option>
                <option value="VENDOR">بائع / تاجر متجر</option>
                <option value="COURIER">مندوب توصيل</option>
                <option value="ADMIN">مدير نظام</option>
              </select>
            </div>
          </div>

          <div className="szFormGrid2">
            <div className="szFormGroup">
              <label className="szFormLabel">رقم الهاتف (سوداني)</label>
              <input
                className="szFormInput"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="0912345678"
              />
            </div>

            <div className="szFormGroup">
              <label className="szFormLabel">البريد الإلكتروني</label>
              <input
                className="szFormInput"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="user@sudanzon.com"
              />
            </div>
          </div>

          <div className="szFormGrid2">
            <div className="szFormGroup">
              <label className="szFormLabel">نوع المصادقة</label>
              <select className="szFormSelect" name="authProvider" value={form.authProvider} onChange={onChange}>
                <option value="LOCAL">تسجيل وكلمة مرور محلية</option>
                <option value="GOOGLE">حساب Google</option>
              </select>
            </div>

            <div className="szFormGroup">
              <label className="szFormLabel">كلمة المرور *</label>
              <input
                className="szFormInput"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                required={form.authProvider === "LOCAL"}
              />
            </div>
          </div>

          {showVendorFields && (
            <div className="szVendorExtraFields">
              <h4 className="szVendorExtraTitle">🏬 بيانات المتجر للتاجر</h4>
              <div className="szFormGrid2">
                <div className="szFormGroup">
                  <label className="szFormLabel">اسم المتجر التجاري *</label>
                  <input
                    className="szFormInput"
                    name="storeName"
                    value={form.storeName}
                    onChange={onChange}
                    placeholder="مثال: متجر الإلكترونيات الحديثة"
                    required
                  />
                </div>
                <div className="szFormGroup">
                  <label className="szFormLabel">رابط المتجر (Slug)</label>
                  <input
                    className="szFormInput"
                    name="storeSlug"
                    value={form.storeSlug}
                    onChange={onChange}
                    placeholder="electronics-store"
                  />
                </div>
              </div>
              <div className="szFormGroup">
                <label className="szFormLabel">وصف المتجر ونشاطه</label>
                <textarea
                  className="szFormTextarea"
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={onChange}
                  placeholder="وصف مختصر للمنتجات التي يقدمها التاجر..."
                />
              </div>
            </div>
          )}

          <div className="szFormActionButtons">
            <button className="szSubmitProductBtn" type="submit" disabled={saving}>
              {saving ? "جارِ إنشاء الحساب..." : "✓ حفظ وإنشاء الحساب"}
            </button>
            <button
              className="szCancelFormBtn"
              type="button"
              onClick={() => {
                resetForm();
                setShowAddModal(false);
              }}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Users Table Card */}
      {loading ? (
        <div className="szAdminLoading">جارِ جلب قائمة المستخدمين...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="szAdminEmpty">
          <span>👥</span>
          <h3>لا يوجد مستخدمين مطابقين للبحث</h3>
        </div>
      ) : (
        <div className="szOrdersTableCard">
          <div className="szOrdersTableResponsive">
            <table className="szAdminTable">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>بيانات الاتصال</th>
                  <th>الدور</th>
                  <th>بيانات المتجر</th>
                  <th>حالة الاعتماد</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const rBadge = roleBadges[user.role] || {
                    label: user.role,
                    bg: "#f1f5f9",
                    text: "#334155",
                  };

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="szUserCell">
                          <span className="szUserAvatar">
                            {user.name ? user.name.charAt(0) : "U"}
                          </span>
                          <div>
                            <strong className="szUserName">{user.name || "مستخدم"}</strong>
                            <small className="szUserProvider">مصادقة: {user.authProvider}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="szContactCell">
                          <span>{user.email || "بدون بريد"}</span>
                          <small>{user.phone || "بدون هاتف"}</small>
                        </div>
                      </td>
                      <td>
                        <span
                          className="szStatusPill"
                          style={{ backgroundColor: rBadge.bg, color: rBadge.text }}
                        >
                          {rBadge.label}
                        </span>
                      </td>
                      <td>
                        {user.vendor ? (
                          <div className="szVendorInfoCell">
                            <strong>{user.vendor.storeName}</strong>
                            <small>{user.vendor.storeSlug || "بدون slug"}</small>
                          </div>
                        ) : (
                          <span className="szTextMuted">—</span>
                        )}
                      </td>
                      <td>
                        {user.vendor ? (
                          <span className={`szApprovalTag ${user.vendor.approved ? "is-approved" : "is-pending"}`}>
                            {user.vendor.approved ? "✓ معتمد" : "⏳ قيد المراجعة"}
                          </span>
                        ) : (
                          <span className="szTextMuted">مفعل</span>
                        )}
                      </td>
                      <td>
                        {user.vendor && !user.vendor.approved ? (
                          <button
                            type="button"
                            onClick={() => approveVendor(user)}
                            className="szApproveVendorBtn"
                          >
                            ✓ اعتماد التاجر
                          </button>
                        ) : (
                          <span className="szTextMuted">نشط</span>
                        )}
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
