"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiForm, apiJson } from "../lib/api";
import { getProductImage, getProductImages, parseImageList } from "../lib/media";

import MultiImageUploader from "./MultiImageUploader";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  image: "",
  images: [],
  price: "",
  stock: "",
  categoryId: "",
  categoryName: "",
  vendorId: "",
};

export default function AdminProductsClient() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [spotlightInfo, setSpotlightInfo] = useState(null);
  const [settingSpotlight, setSettingSpotlight] = useState(false);

  const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "");

  const loadSpotlightInfo = async () => {
    try {
      const result = await apiJson("/api/admin/spotlight", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSpotlightInfo(result);
    } catch {
      try {
        const publicRes = await apiJson("/api/products/spotlight");
        setSpotlightInfo({
          dealOfTheDayProduct: publicRes.dealOfTheDay,
          mostPopularProduct: publicRes.mostPopular,
          mostPopularSalesCount: publicRes.mostPopular?.totalSold || 0,
          config: publicRes.config,
        });
      } catch {}
    }
  };

  const makeDealOfTheDay = async (product) => {
    try {
      setSettingSpotlight(true);
      await apiJson("/api/admin/spotlight/deal-of-the-day", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ productId: product.id }),
      });
      setMessage(`🔥 تم تعيين "${product.name}" كـ صفقة اليوم بنجاح وستظهر فوراً في واجهة المتجر الرئيسية!`);
      await loadSpotlightInfo();
    } catch (error) {
      setMessage(error.message || "تعذر تعيين صفقة اليوم");
    } finally {
      setSettingSpotlight(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/products", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProducts(result.items || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await apiJson("/api/products/categories");
      setCategories(result.items || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const loadVendors = async () => {
    try {
      const result = await apiJson("/api/admin/vendors", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setVendors(result.items || []);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadVendors();
    loadSpotlightInfo();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setGalleryImages([]);
    setIsEditing(false);
    setShowModal(false);
  };

  const startCreateProduct = () => {
    setForm(emptyForm);
    setGalleryImages([]);
    setIsEditing(false);
    setShowModal(true);
  };

  const editProduct = (product) => {
    setIsEditing(true);
    const parsedImages = parseImageList(product.images);
    const currentMainImage = product.image || parsedImages[0] || "";
    const allImages = parsedImages.length ? parsedImages : currentMainImage ? [currentMainImage] : [];

    setForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      image: currentMainImage,
      images: allImages,
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      categoryId: product.categoryId || product.category?.id || "",
      categoryName: product.category?.name || (typeof product.category === "string" ? product.category : ""),
      vendorId: product.vendorId || product.vendor?.id || "",
    });

    setGalleryImages(
      allImages.map((url, i) => ({
        id: "img_" + i + "_" + url,
        url,
        file: null,
        isNew: false,
      }))
    );
    setShowModal(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("description", form.description.trim());
    payload.append("price", String(Number(form.price)));
    payload.append("stock", String(Number(form.stock || 0)));
    payload.append("categoryId", form.categoryId);
    payload.append("categoryName", form.categoryName.trim());
    if (form.vendorId) {
      payload.append("vendorId", form.vendorId);
    }

    const newFiles = galleryImages.filter((item) => item.file).map((item) => item.file);
    const existingImgs = galleryImages.filter((item) => !item.file && item.url).map((item) => item.url);

    newFiles.forEach((file) => payload.append("imageFiles", file));
    payload.append("existingImages", JSON.stringify(existingImgs));
    payload.append("primaryIsNew", String(Boolean(galleryImages[0]?.file)));
    if (galleryImages[0]?.url && !galleryImages[0]?.file) {
      payload.append("primaryImage", galleryImages[0].url);
    }

    try {
      if (isEditing) {
        await apiForm(`/api/products/${form.id}`, payload, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        setMessage("✓ تم تحديث المنتج بنجاح");
      } else {
        await apiForm("/api/products", payload, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        setMessage("✓ تم إضافة المنتج الجديد بنجاح إلى المنصة!");
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      setMessage(error.message || "تعذر حفظ المنتج");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${product.name}" نهائياً من المنصة؟`)) {
      return;
    }

    try {
      await apiJson(`/api/products/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage("✓ تم حذف المنتج من المنصة");
      if (form.id === product.id) resetForm();
      await loadProducts();
    } catch (error) {
      setMessage(error.message || "تعذر حذف المنتج");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCat === "ALL" || (p.category?.name || p.category) === selectedCat;
      const matchVendor = selectedVendorFilter === "ALL" || p.vendor?.id === selectedVendorFilter;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.vendor?.storeName && p.vendor.storeName.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchVendor && matchSearch;
    });
  }, [products, selectedCat, selectedVendorFilter, search]);

  return (
    <div className="szAdminProductsWrapper">
      {/* Top Filter Bar */}
      <div className="szAdminFilterBar">
        <div className="szAdminSearchBox">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="بحث باسم المنتج أو المتجر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="szAdminActionsRight">
          <select
            className="szCatalogFilterSelect"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="ALL">جميع الأقسام ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {vendors.length > 0 && (
            <select
              className="szCatalogFilterSelect"
              value={selectedVendorFilter}
              onChange={(e) => setSelectedVendorFilter(e.target.value)}
            >
              <option value="ALL">جميع المتاجر ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.storeName}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={startCreateProduct}
            className="szAdminAddBtn"
          >
            + إضافة منتج جديد
          </button>
        </div>
      </div>

      {message && <div className="szAdminAlert">{message}</div>}

      {/* Spotlight Control Banner */}
      <div
        className="szAdminSpotlightBanner"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "20px",
          color: "#fff",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          alignItems: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          border: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              fontSize: "28px",
              background: "rgba(245, 158, 11, 0.15)",
              borderRadius: "12px",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              flexShrink: 0,
            }}
          >
            🔥
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 700 }}>
              صفقة اليوم المعروضة في الواجهة الرئيسية
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
              {spotlightInfo?.dealOfTheDayProduct ? (
                <>
                  <span>{spotlightInfo.dealOfTheDayProduct.name}</span>
                  <span style={{ marginRight: "8px", color: "#38bdf8", fontSize: "12px" }}>
                    ({Number(spotlightInfo.dealOfTheDayProduct.price).toLocaleString()} ج.س)
                  </span>
                </>
              ) : (
                <span style={{ color: "#94a3b8" }}>تلقائي (أحدث منتج بالمنصة)</span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              💡 لتعيين أي منتج كـ "صفقة اليوم"، اضغط زر «🔥 صفقة اليوم» بجوار أي منتج في الجدول أدناه.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderRight: "1px solid #334155",
            paddingRight: "16px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              background: "rgba(56, 189, 248, 0.15)",
              borderRadius: "12px",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700 }}>
              المنتج الأكثر طلباً (تلقائي ذكي)
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
              {spotlightInfo?.mostPopularProduct ? (
                <>
                  <span>{spotlightInfo.mostPopularProduct.name}</span>
                  {spotlightInfo.mostPopularSalesCount > 0 && (
                    <span
                      style={{
                        marginRight: "8px",
                        background: "#0284c7",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                      }}
                    >
                      تم شراؤه {spotlightInfo.mostPopularSalesCount} مرة
                    </span>
                  )}
                </>
              ) : (
                <span style={{ color: "#94a3b8" }}>يعرض حالياً المنتجات المميزة</span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              {spotlightInfo?.mostPopularSalesCount > 0
                ? "✓ يتم تحديثه تلقائياً بناءً على إحصائيات الطلبات الحقيقية."
                : "ℹ️ لا توجد طلبات بعد - بمجرد ورود أي طلب لمنتج سيتم عرضه هنا فوراً."}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <form className="szAdminAddUserCard" onSubmit={submitForm}>
          <div className="szEditorHeader">
            <h3>{isEditing ? "✏️ تعديل المنتج الإداري" : "🛍️ إضافة منتج جديد لأي متجر"}</h3>
            <p>يمكنك كمدير إضافة أو تعديل أي منتج وتعيين المتجر التابع له مباشرة.</p>
          </div>

          <div className="szFormGrid2">
            <div className="szFormGroup">
              <label className="szFormLabel">اسم المنتج *</label>
              <input
                className="szFormInput"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="مثال: عباية خليجية مطرزة فاخرة"
                required
              />
            </div>

            <div className="szFormGroup">
              <label className="szFormLabel">المتجر التابع له المنتج *</label>
              <select
                className="szFormSelect"
                name="vendorId"
                value={form.vendorId}
                onChange={onChange}
              >
                <option value="">متجر المنصة الافتراضي (سودان زون)</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    🏬 {v.storeName} ({v.owner?.name || "تاجر"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="szFormGroup">
            <label className="szFormLabel">وصف وتفاصيل المنتج *</label>
            <textarea
              className="szFormTextarea"
              name="description"
              value={form.description}
              onChange={onChange}
              rows={3}
              placeholder="اكتب مواصفات المنتج، الخامة، المميزات، والضمان..."
              required
            />
          </div>

          <div className="szFormGrid3">
            <div className="szFormGroup">
              <label className="szFormLabel">السعر (ج.س) *</label>
              <input
                className="szFormInput"
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                placeholder="25000"
                required
              />
            </div>
            <div className="szFormGroup">
              <label className="szFormLabel">الكمية المتوفرة بالمخزون *</label>
              <input
                className="szFormInput"
                name="stock"
                type="number"
                value={form.stock}
                onChange={onChange}
                placeholder="10"
                required
              />
            </div>
            <div className="szFormGroup">
              <label className="szFormLabel">القسم / التصنيف *</label>
              <select
                className="szFormSelect"
                name="categoryId"
                value={form.categoryId}
                onChange={(event) => {
                  const category = categories.find((item) => item.id === event.target.value);
                  setForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                    categoryName: category?.name || "",
                  }));
                }}
                required
              >
                <option value="">اختر التصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload Block with Interactive Gallery */}
          <div className="szFormGroup">
            <MultiImageUploader
              images={galleryImages}
              onChange={setGalleryImages}
              maxImages={8}
              label="صور المنتج (أضف حتى 8 صور مع تحديد الصورة الأساسية)"
            />
          </div>

          <div className="szFormActionButtons">
            <button className="szSubmitProductBtn" type="submit" disabled={saving}>
              {saving ? "جارِ الحفظ..." : isEditing ? "✓ حفظ التعديلات" : "✓ إضافة المنتج الآن"}
            </button>
            <button className="szCancelFormBtn" type="button" onClick={resetForm}>
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Products Table Card */}
      {loading ? (
        <div className="szAdminLoading">جارِ جلب منتجات المنصة...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="szAdminEmpty">
          <span>🛍️</span>
          <h3>لا توجد منتجات مطابقة للبحث</h3>
        </div>
      ) : (
        <div className="szOrdersTableCard">
          <div className="szOrdersTableResponsive">
            <table className="szAdminTable">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>المتجر / البائع</th>
                  <th>التصنيف</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                  <th>إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isDealOfTheDay =
                    spotlightInfo?.config?.dealOfTheDayProductId === product.id ||
                    spotlightInfo?.dealOfTheDayProduct?.id === product.id;

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="szProductAdminCell">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="szProductAdminThumb"
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <strong className="szProductAdminTitle">{product.name}</strong>
                              {isDealOfTheDay && (
                                <span
                                  style={{
                                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                    color: "#fff",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    padding: "2px 6px",
                                    borderRadius: "6px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "2px",
                                  }}
                                >
                                  🔥 صفقة اليوم
                                </span>
                              )}
                            </div>
                            <Link href={`/products/${product.id}`} className="szProductAdminViewLink">
                              معاينة بالمتجر ↗
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="szVendorPill">
                          🏪 {product.vendor?.storeName || "سودان زون"}
                        </span>
                      </td>
                      <td>
                        <span className="szAdminCatPill">
                          {product.category?.name || product.category || "عام"}
                        </span>
                      </td>
                      <td>
                        <strong className="szOrderTotal">
                          {Number(product.price || 0).toLocaleString()} ج.س
                        </strong>
                      </td>
                      <td>
                        <span className={`szQtyBadge ${Number(product.stock || 0) <= 3 ? "is-low" : ""}`}>
                          {Number(product.stock || 0)} قطعة
                        </span>
                      </td>
                      <td>
                        <div className="szCatCardBtns" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => makeDealOfTheDay(product)}
                            disabled={settingSpotlight}
                            className="szCatMiniBtn"
                            style={{
                              background: isDealOfTheDay ? "#fef3c7" : "#f8fafc",
                              color: isDealOfTheDay ? "#b45309" : "#0f766e",
                              borderColor: isDealOfTheDay ? "#f59e0b" : "#cbd5e1",
                              fontWeight: isDealOfTheDay ? "bold" : "normal",
                            }}
                            title="تعيين هذا المنتج كـ صفقة اليوم في واجهة الموقع"
                          >
                            {isDealOfTheDay ? "★ صفقة اليوم" : "🔥 صفقة اليوم"}
                          </button>
                          <button
                            type="button"
                            onClick={() => editProduct(product)}
                            className="szCatMiniBtn szCatMiniBtn--edit"
                            title="تعديل المنتج"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(product)}
                            className="szCatMiniBtn szCatMiniBtn--delete"
                            title="حذف المنتج"
                          >
                            حذف
                          </button>
                        </div>
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
