"use client";

import { useEffect, useState, useRef } from "react";
import { apiJson, apiForm } from "../lib/api";
import { resolveImageUrl } from "../lib/media";

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

const popularCategoryEmojis = [
  "🔌", "📱", "💻", "👑", "👕", "👟", "☕", "🛒", "✨", "🏎️",
  "💊", "👶", "📚", "🍔", "🏠", "🎁", "⚽", "🕶️", "⌚", "💄",
  "🌿", "🎮", "🎧", "🚲", "🛠️", "🎨", "🛍️", "🧴", "🍎", "🛋️",
];

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  icon: "🛍️",
  image: "",
  imageFile: null,
  imagePreview: "",
};

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef(null);

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

  const onSelectEmoji = (emoji) => {
    setForm((current) => ({ ...current, icon: emoji }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setForm((current) => ({
        ...current,
        imageFile: file,
        imagePreview: previewUrl,
      }));
    }
  };

  const removeSelectedImage = () => {
    setForm((current) => ({
      ...current,
      image: "",
      imageFile: null,
      imagePreview: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowAddForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (form.imageFile) {
        const formData = new FormData();
        formData.append("name", form.name.trim());
        formData.append("slug", form.slug.trim());
        if (form.icon) formData.append("icon", form.icon.trim());
        formData.append("imageFile", form.imageFile);

        await apiForm(form.id ? `/api/admin/categories/${form.id}` : "/api/admin/categories", formData, {
          method: form.id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
      } else {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          icon: form.icon ? form.icon.trim() : null,
          image: form.image ? form.image.trim() : null,
        };

        await apiJson(form.id ? `/api/admin/categories/${form.id}` : "/api/admin/categories", {
          method: form.id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        });
      }

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
      icon: category.icon || categoryIconMap[category.name] || "🛍️",
      image: category.image || "",
      imageFile: null,
      imagePreview: category.image ? resolveImageUrl(category.image) : "",
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <p>أضف تصنيفات جديدة وأيقونات مميزة لتظهر فوراً في شريط الفئات والهيدر للمتسوقين.</p>
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
        <form onSubmit={submitForm} className="szAdminAddUserCard szCategoryFormCard">
          <div className="szEditorHeader">
            <h4>{form.id ? "✏️ تعديل بيانات وأيقونة التصنيف" : "✨ إنشاء تصنيف جديد"}</h4>
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

          {/* Category Icon & Image Section */}
          <div className="szCatMediaFormSection">
            <div className="szCatMediaGroup">
              <label className="szFormLabel">
                <span>🎨 اختيار أيقونة التصنيف (رمز تعبيري / Emoji)</span>
              </label>

              <div className="szEmojiPickerContainer">
                <div className="szEmojiPresetsGrid">
                  {popularCategoryEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`szEmojiPresetBtn ${form.icon === emoji ? "szEmojiPresetBtn--active" : ""}`}
                      onClick={() => onSelectEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="szCustomEmojiInputRow">
                  <span className="szEmojiInputLabel">رمز مخصص:</span>
                  <input
                    type="text"
                    name="icon"
                    value={form.icon}
                    onChange={onChange}
                    placeholder="ضع رمز أو إيموجي هنا (مثلاً: 📱)"
                    className="szFormInput szCustomEmojiInput"
                    maxLength={10}
                  />
                  <div className="szSelectedIconPreview">
                    <span className="szPreviewEmoji">{form.icon || "📦"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="szCatMediaGroup szCatUploadGroup">
              <label className="szFormLabel">
                <span>🖼️ أو رفع صورة / أيقونة مخصصة للتصنيف (PNG, JPG, WEBP, SVG)</span>
              </label>

              <div className="szCatUploadBox">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="szFileInputHidden"
                  id="szCatFileInput"
                />
                <label htmlFor="szCatFileInput" className="szCatUploadLabel">
                  <span className="szUploadIcon">📁</span>
                  <span>اضغط هنا لاختيار صورة أو أيقونة من جهازك</span>
                  <small>الحجم الأقصى 5 ميجابايت (يُفضل أبعاد مربعة 200×200 أو 512×512)</small>
                </label>

                {(form.imagePreview || form.image) && (
                  <div className="szCatImagePreviewCard">
                    <img
                      src={form.imagePreview || resolveImageUrl(form.image)}
                      alt="معاينة أيقونة التصنيف"
                      className="szCatPreviewImg"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="szCatRemoveImgBtn"
                      title="إزالة الصورة"
                    >
                      ✕ إزالة
                    </button>
                  </div>
                )}
              </div>
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
            const hasCustomImage = Boolean(c.image);
            const icon = c.icon || categoryIconMap[c.name] || "📦";

            return (
              <div className="szAdminCategoryCard" key={c.id}>
                <div className="szCategoryCardTop">
                  {hasCustomImage ? (
                    <div className="szCatCustomImgWrap">
                      <img
                        src={resolveImageUrl(c.image)}
                        alt={c.name}
                        className="szCatCustomImg"
                      />
                    </div>
                  ) : (
                    <span className="szCatBigIcon">{icon}</span>
                  )}
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

      <style jsx>{`
        .szCategoryFormCard {
          margin-bottom: 28px;
        }
        .szCatMediaFormSection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 18px 0;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .szCatMediaGroup {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .szEmojiPresetsGrid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 6px;
          background: #ffffff;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
        }
        .szEmojiPresetBtn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1.25rem;
          padding: 6px 0;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .szEmojiPresetBtn:hover {
          background: #e2e8f0;
          transform: scale(1.15);
        }
        .szEmojiPresetBtn--active {
          background: #ecfdf5 !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
          transform: scale(1.12);
        }
        .szCustomEmojiInputRow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }
        .szEmojiInputLabel {
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
          white-space: nowrap;
        }
        .szCustomEmojiInput {
          max-width: 140px;
          text-align: center;
          font-size: 1.1rem;
        }
        .szSelectedIconPreview {
          width: 42px;
          height: 42px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        .szFileInputHidden {
          display: none;
        }
        .szCatUploadBox {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .szCatUploadLabel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: #ffffff;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          color: #334155;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .szCatUploadLabel:hover {
          border-color: #10b981;
          background: #f0fdf4;
          color: #047857;
        }
        .szUploadIcon {
          font-size: 1.8rem;
          margin-bottom: 4px;
        }
        .szCatUploadLabel small {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 400;
          margin-top: 4px;
        }
        .szCatImagePreviewCard {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .szCatPreviewImg {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #cbd5e1;
        }
        .szCatRemoveImgBtn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .szCatRemoveImgBtn:hover {
          background: #fecaca;
        }
        .szCatCustomImgWrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          overflow: hidden;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .szCatCustomImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @media (max-width: 768px) {
          .szCatMediaFormSection {
            grid-template-columns: 1fr;
          }
          .szEmojiPresetsGrid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
