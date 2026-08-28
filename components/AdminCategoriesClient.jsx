"use client";

import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

const categoryIconMap = {
  "إلكترونيات": "🔌",
  "موبايلات": "📱",
  "كمبيوتر": "💻",
  "عطور": "👑",
  "ملابس": "👕",
  "أحذية": "👟",
  "أدوات منزلية": "☕",
  "سوبر ماركت": "🛒",
  "مستحضرات تجميل": "✨",
  "قطع غيار السيارات": "🏎️",
};

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
  const [showAddForm, setShowAddForm] = useState(false);

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
    setShowAddForm(false);
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

      setMessage(form.id ? "✓ تم تحديث التصنيف بنجاح" : "✓ تمت إضافة التصنيف الجديد بنجاح");
      resetForm();
      await loadCategories();
    } catch (error) {
      setMessage(error.message || "تعذر حفظ التصنيف");
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
    setShowAddForm(true);
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
      setMessage("✓ تم حذف التصنيف");
      await loadCategories();
    } catch (error) {
      setMessage(error.message || "تعذر حذف التصنيف");
    }
  };

  return (
    <div className="szAdminCategoriesWrapper">
      <div className="szAdminSectionTopBar">
        <div>
          <h3>🏷️ إدارة أقسام وتصنيفات المتجر</h3>
          <p>أضف تصنيفات جديدة لتظهر فوراً في شريط الفئات والهيدر للمتسوقين.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!showAddForm) resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="szAdminAddBtn"
        >
          {showAddForm ? "إغلاق النموذج" : "+ إضافة تصنيف جديد"}
        </button>
      </div>

      {message && <div className="szAdminAlert">{message}</div>}

      {showAddForm && (
        <form onSubmit={submitForm} className="szAdminAddUserCard">
          <div className="szEditorHeader">
            <h4>{form.id ? "تعديل بيانات التصنيف" : "إنشاء تصنيف جديد"}</h4>
          </div>
          <div className="szFormGrid2">
            <div className="szFormGroup">
              <label className="szFormLabel">اسم القسم (عربي) *</label>
              <input
                className="szFormInput"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="مثال: إلكترونيات، عطور، ساعات..."
                required
              />
            </div>
            <div className="szFormGroup">
              <label className="szFormLabel">الاسم اللطيف (Slug إنجليزي)</label>
              <input
                className="szFormInput"
                name="slug"
                value={form.slug}
                onChange={onChange}
                placeholder="مثال: electronics"
              />
            </div>
          </div>
          <div className="szFormActionButtons">
            <button className="szSubmitProductBtn" type="submit" disabled={saving}>
              {saving ? "جارِ الحفظ..." : form.id ? "✓ حفظ التعديل" : "+ إضافة التصنيف"}
            </button>
            <button className="szCancelFormBtn" type="button" onClick={resetForm}>
              إلغاء
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="szAdminLoading">جارِ تحميل التصنيفات...</div>
      ) : categories.length === 0 ? (
        <div className="szAdminEmpty">
          <span>🏷️</span>
          <h3>لا توجد تصنيفات حالياً</h3>
        </div>
      ) : (
        <div className="szAdminCategoryGrid">
          {categories.map((c) => {
            const icon = categoryIconMap[c.name] || "📦";
            return (
              <div className="szAdminCategoryCard" key={c.id}>
                <div className="szCategoryCardTop">
                  <span className="szCatBigIcon">{icon}</span>
                  <div>
                    <strong className="szCatName">{c.name}</strong>
                    <small className="szCatSlug">{c.slug || "بدون slug"}</small>
                  </div>
                </div>

                <div className="szCatStatsRow">
                  <span className="szCatProductCount">
                    🛍️ {c._count?.products || 0} منتج معروض
                  </span>
                  <div className="szCatCardBtns">
                    <button
                      type="button"
                      onClick={() => editCategory(c)}
                      className="szCatMiniBtn szCatMiniBtn--edit"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(c)}
                      className="szCatMiniBtn szCatMiniBtn--delete"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
