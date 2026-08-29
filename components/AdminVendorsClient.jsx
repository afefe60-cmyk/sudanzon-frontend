"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";

const emptyVendorForm = {
  id: "",
  userId: "",
  userName: "",
  userEmail: "",
  userPhone: "",
  userPassword: "",
  storeName: "",
  storeSlug: "",
  description: "",
  approved: true,
  isNewUser: false,
};

export default function AdminVendorsClient() {
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyVendorForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | APPROVED | PENDING
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/admin/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(result.items || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await apiJson("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(result.items || []);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("sudanzonToken") || "";
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadVendors();
    loadUsers();
  }, [token]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((curr) => ({
      ...curr,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyVendorForm);
    setIsEditing(false);
    setShowModal(false);
  };

  const startCreateStore = () => {
    setForm(emptyVendorForm);
    setIsEditing(false);
    setShowModal(true);
  };

  const startEditStore = (vendor) => {
    setIsEditing(true);
    setForm({
      id: vendor.id,
      userId: vendor.userId || "",
      userName: vendor.owner?.name || "",
      userEmail: vendor.owner?.email || "",
      userPhone: vendor.owner?.phone || "",
      userPassword: "",
      storeName: vendor.storeName || "",
      storeSlug: vendor.storeSlug || "",
      description: vendor.description || "",
      approved: Boolean(vendor.approved),
      isNewUser: false,
    });
    setShowModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (isEditing) {
        await apiJson(`/api/admin/vendors/${form.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            storeName: form.storeName.trim(),
            storeSlug: form.storeSlug.trim(),
            description: form.description.trim(),
            approved: form.approved,
          }),
        });
        setMessage("✓ تم تحديث وتخصيص بيانات المتجر بنجاح!");
      } else {
        if (form.isNewUser) {
          // Create new vendor user with store
          await apiJson("/api/admin/users", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: form.userName.trim(),
              email: form.userEmail.trim() || undefined,
              phone: form.userPhone.trim() || undefined,
              password: form.userPassword.trim() || "123456",
              role: "VENDOR",
              storeName: form.storeName.trim(),
              storeSlug: form.storeSlug.trim() || undefined,
              description: form.description.trim() || undefined,
              approved: form.approved,
            }),
          });
          setMessage("✓ تم إنشاء حساب التاجر وتخصيص المتجر الجديد بنجاح!");
        } else {
          // Assign store to existing user
          if (!form.userId) {
            setMessage("يرجى اختيار المستخدم المالك للمتجر");
            setSaving(false);
            return;
          }
          await apiJson(`/api/admin/users/${form.userId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              role: "VENDOR",
              storeName: form.storeName.trim(),
              storeSlug: form.storeSlug.trim() || undefined,
              description: form.description.trim() || undefined,
              approved: form.approved,
            }),
          });
          setMessage("✓ تم تخصيص وإنشاء المتجر للمستخدم بنجاح!");
        }
      }

      resetForm();
      await loadVendors();
      await loadUsers();
    } catch (error) {
      setMessage(error.message || "تعذر حفظ المتجر");
    } finally {
      setSaving(false);
    }
  };

  const approveVendor = async (vendor) => {
    setMessage("");
    try {
      await apiJson(`/api/admin/vendors/${vendor.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approved: true }),
      });
      setMessage("✓ تم اعتماد المتجر وتفعيله للبيع الفوري");
      await loadVendors();
    } catch (error) {
      setMessage(error.message || "تعذر اعتماد المتجر");
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchFilter =
        filter === "ALL" ||
        (filter === "APPROVED" && v.approved) ||
        (filter === "PENDING" && !v.approved);

      const matchSearch =
        !search ||
        v.storeName.toLowerCase().includes(search.toLowerCase()) ||
        (v.storeSlug && v.storeSlug.toLowerCase().includes(search.toLowerCase())) ||
        (v.owner?.name && v.owner.name.toLowerCase().includes(search.toLowerCase())) ||
        (v.owner?.phone && v.owner.phone.includes(search));

      return matchFilter && matchSearch;
    });
  }, [vendors, filter, search]);

  return (
    <div className="szAdminVendorsWrapper">
      {/* Top Filter Bar */}
      <div className="szAdminFilterBar">
        <div className="szAdminSearchBox">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="ابحث باسم المتجر، الرابط، اسم المالك، أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="szAdminActionsRight">
          <div className="szAdminRoleFilterTabs">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`szRoleFilterBtn ${filter === "ALL" ? "is-active" : ""}`}
            >
              جميع المتاجر ({vendors.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("APPROVED")}
              className={`szRoleFilterBtn ${filter === "APPROVED" ? "is-active" : ""}`}
            >
              المعتمدة ({vendors.filter((v) => v.approved).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("PENDING")}
              className={`szRoleFilterBtn ${filter === "PENDING" ? "is-active" : ""}`}
            >
              قيد المراجعة ({vendors.filter((v) => !v.approved).length})
            </button>
          </div>

          <button
            type="button"
            onClick={startCreateStore}
            className="szAdminAddBtn"
          >
            + إضافة وتخصيص متجر جديد
          </button>
        </div>
      </div>

      {message && <div className="szAdminAlert">{message}</div>}

      {/* Add / Edit Store Modal */}
      {showModal && (
        <form className="szAdminAddUserCard" onSubmit={submitForm}>
          <div className="szEditorHeader">
            <h3>{isEditing ? "✏️ تخصيص وتعديل بيانات المتجر" : "🏬 إنشاء وتخصيص متجر جديد"}</h3>
            <p>يمكنك إنشاء متجر جديد، ربطه بتاجر موجود، أو إنشاء حساب تاجر جديد ومتجر في خطوة واحدة.</p>
          </div>

          {!isEditing && (
            <div className="szFormGroup" style={{ marginBottom: 16 }}>
              <label className="szFormLabel">مالك المتجر (التاجر)</label>
              <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="isNewUser"
                    checked={!form.isNewUser}
                    onChange={() => setForm((c) => ({ ...c, isNewUser: false }))}
                  />
                  <span>ربط بمستخدم مسجل حالياً</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="isNewUser"
                    checked={form.isNewUser}
                    onChange={() => setForm((c) => ({ ...c, isNewUser: true }))}
                  />
                  <span>إنشاء حساب تاجر جديد بالكامل</span>
                </label>
              </div>
            </div>
          )}

          {!isEditing && !form.isNewUser && (
            <div className="szFormGroup" style={{ marginBottom: 16 }}>
              <label className="szFormLabel">اختر المستخدم المالك *</label>
              <select
                className="szFormSelect"
                name="userId"
                value={form.userId}
                onChange={onChange}
                required
              >
                <option value="">-- اختر المستخدم لتحويله لتاجر وتخصيص متجر له --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.name} ({u.email || u.phone || "بدون هاتف"}) - {u.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isEditing && form.isNewUser && (
            <div className="szFormGrid3" style={{ marginBottom: 16 }}>
              <div className="szFormGroup">
                <label className="szFormLabel">اسم صاحب المتجر *</label>
                <input
                  className="szFormInput"
                  name="userName"
                  value={form.userName}
                  onChange={onChange}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
              <div className="szFormGroup">
                <label className="szFormLabel">رقم الهاتف</label>
                <input
                  className="szFormInput"
                  name="userPhone"
                  value={form.userPhone}
                  onChange={onChange}
                  placeholder="09XXXXXXXX"
                />
              </div>
              <div className="szFormGroup">
                <label className="szFormLabel">كلمة المرور للحساب</label>
                <input
                  className="szFormInput"
                  name="userPassword"
                  type="password"
                  value={form.userPassword}
                  onChange={onChange}
                  placeholder="•••••••• (افتراضي: 123456)"
                />
              </div>
            </div>
          )}

          <div className="szFormGrid2">
            <div className="szFormGroup">
              <label className="szFormLabel">اسم المتجر التجاري *</label>
              <input
                className="szFormInput"
                name="storeName"
                value={form.storeName}
                onChange={onChange}
                placeholder="مثال: متجر النيلين للإلكترونيات"
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
                placeholder="alnilin-store"
              />
            </div>
          </div>

          <div className="szFormGroup">
            <label className="szFormLabel">نبذة ووصف المتجر والنشاط</label>
            <textarea
              className="szFormTextarea"
              name="description"
              rows={3}
              value={form.description}
              onChange={onChange}
              placeholder="وصف تخصص المتجر والمنتجات التي يعرضها..."
            />
          </div>

          <div className="szFormGroup" style={{ marginTop: 10 }}>
            <label className="szToggleLabel">
              <input
                type="checkbox"
                name="approved"
                checked={form.approved}
                onChange={onChange}
              />
              <span><strong>متجر معتمد ومفعل:</strong> يظهر المتجر ومنتجاته للمتسوقين فوراً</span>
            </label>
          </div>

          <div className="szFormActionButtons">
            <button className="szSubmitProductBtn" type="submit" disabled={saving}>
              {saving ? "جارِ الحفظ..." : isEditing ? "✓ حفظ التعديلات" : "✓ إنشاء وتخصيص المتجر"}
            </button>
            <button className="szCancelFormBtn" type="button" onClick={resetForm}>
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Stores Table Card */}
      {loading ? (
        <div className="szAdminLoading">جارِ جلب قائمة المتاجر...</div>
      ) : filteredVendors.length === 0 ? (
        <div className="szAdminEmpty">
          <span>🏬</span>
          <h3>لا توجد متاجر مطابقة للبحث</h3>
        </div>
      ) : (
        <div className="szOrdersTableCard">
          <div className="szOrdersTableResponsive">
            <table className="szAdminTable">
              <thead>
                <tr>
                  <th>المتجر</th>
                  <th>المالك / التاجر</th>
                  <th>رابط المتجر</th>
                  <th>عدد المنتجات</th>
                  <th>حالة الاعتماد</th>
                  <th>إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="szVendorStoreCell">
                        <div className="szVendorStoreIcon">🏬</div>
                        <div>
                          <strong className="szVendorStoreName">{v.storeName}</strong>
                          <small className="szVendorStoreDesc">
                            {v.description ? v.description.substring(0, 40) + "..." : "متجر معتمد"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="szContactCell">
                        <strong>{v.owner?.name || "بدون اسم"}</strong>
                        <small>{v.owner?.phone || v.owner?.email || "—"}</small>
                      </div>
                    </td>
                    <td>
                      <span className="szStoreSlugPill">
                        /{v.storeSlug || "store"}
                      </span>
                    </td>
                    <td>
                      <span className="szQtyBadge">
                        📦 {v.productsCount || 0} منتج
                      </span>
                    </td>
                    <td>
                      <span className={`szApprovalTag ${v.approved ? "is-approved" : "is-pending"}`}>
                        {v.approved ? "✓ معتمد" : "⏳ قيد المراجعة"}
                      </span>
                    </td>
                    <td>
                      <div className="szCatCardBtns">
                        {!v.approved && (
                          <button
                            type="button"
                            onClick={() => approveVendor(v)}
                            className="szApproveVendorBtn"
                            title="اعتماد وتفعيل المتجر"
                          >
                            ✓ اعتماد
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditStore(v)}
                          className="szCatMiniBtn szCatMiniBtn--edit"
                          title="تخصيص وتعديل بيانات المتجر"
                        >
                          تخصيص
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
