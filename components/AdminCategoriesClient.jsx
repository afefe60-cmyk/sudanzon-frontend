"use client";

import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

const emptyForm = {
  id: "",
  name: "",
  slug: "",
};

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/admin/categories", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCategories(result.items || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
    };

    try {
      await apiJson(form.id ? `/api/admin/categories/${form.id}` : "/api/admin/categories", {
        method: form.id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      setMessage(form.id ? "تم تحديث التصنيف" : "تمت إضافة التصنيف");
      resetForm();
      await loadCategories();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category) => {
    setForm({
      id: category.id,
      name: category.name || "",
      slug: category.slug || "",
    });
  };

  const removeCategory = async (category) => {
    if (!confirm(`هل تريد حذف التصنيف "${category.name}"؟`)) {
      return;
    }

    try {
      await apiJson(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage("تم حذف التصنيف");
      await loadCategories();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="cardPanel" style={{ marginTop: 24 }}>
      <h3>إدارة التصنيفات</h3>
      <p style={{ marginTop: 0, color: "var(--amazon-muted)" }}>
        أضف تصنيفًا جديدًا أو عدّل اسمًا موجودًا أو احذفه بعد نقل المنتجات منه.
      </p>

      <form onSubmit={submitForm} style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        <div className="formRow">
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="اسم التصنيف"
            required
          />
          <input
            className="input"
            name="slug"
            value={form.slug}
            onChange={onChange}
            placeholder="slug اختياري"
          />
        </div>
        <div className="formRow">
          <button className="primaryBtn" type="submit" disabled={saving}>
            {saving ? "جارٍ الحفظ..." : form.id ? "حفظ التعديل" : "إضافة تصنيف"}
          </button>
          <button className="secondaryBtn" type="button" onClick={resetForm}>
            مسح
          </button>
        </div>
      </form>

      {message ? <p style={{ marginTop: 0, color: "#f0c14b" }}>{message}</p> : null}
      {loading ? <p>جارٍ تحميل التصنيفات...</p> : null}

      <div className="sellerProductsList">
        {!loading && categories.length === 0 ? <p>لا توجد تصنيفات حتى الآن.</p> : null}
        {categories.map((category) => (
          <div className="sellerProductRow" key={category.id}>
            <div>
              <strong>{category.name}</strong>
              <p style={{ margin: "6px 0 0" }}>{category.slug}</p>
            </div>
            <div className="sellerProductActions">
              <span>{category._count?.products || 0} منتج</span>
              <button className="secondaryBtn" type="button" onClick={() => editCategory(category)}>
                تعديل
              </button>
              <button className="secondaryBtn" type="button" onClick={() => removeCategory(category)}>
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
