"use client";

import ProductOptionsBuilder from "./ProductOptionsBuilder";
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
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
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
      const res = await apiJson("/api/admin/spotlight/deal-of-the-day", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ productId: product.id }),
      });
      setMessage(res.message || `🔥 تم تحديث صفقة اليوم بنجاح!`);
      await loadSpotlightInfo();
    } catch (error) {
      setMessage(error.message || "تعذر تعيين صفقة اليوم");
    } finally {
      setSettingSpotlight(false);
    }
  };

  const makeSpecialOffer = async (product) => {
    try {
      setSettingSpotlight(true);
      const res = await apiJson("/api/admin/spotlight/special-offer", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ productId: product.id }),
      });
      setMessage(res.message || `⭐ تم تحديث العرض الخاص بنجاح!`);
      await loadSpotlightInfo();
    } catch (error) {
      setMessage(error.message || "تعذر تعيين العرض الخاص");
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
    setHasVariants(false);
    setOptions([]);
    setVariants([]);
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
    setHasVariants(Boolean(product.hasVariants));
    setOptions(product.options || []);
    setVariants(product.variants || []);
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
    payload.append("hasVariants", String(hasVariants));
    if (hasVariants) {
      payload.append("options", JSON.stringify(options));
      payload.append("variants", JSON.stringify(variants));
    }
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
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          alignItems: "stretch",
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          border: "1px solid #334155",
        }}
      >
        {/* Deal of the Day Card */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              fontSize: "26px",
              background: "rgba(245, 158, 11, 0.15)",
              borderRadius: "12px",
              width: "46px",
              height: "46px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              flexShrink: 0,
            }}
          >
            🔥
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 700 }}>
              صفقة اليوم المعروضة (الكارد الأول)
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#f8fafc",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {spotlightInfo?.dealOfTheDayProduct ? (
                <>
                  <span>{spotlightInfo.dealOfTheDayProduct.name}</span>
                  <span style={{ marginRight: "6px", color: "#38bdf8", fontSize: "12px" }}>
                    ({Number(spotlightInfo.dealOfTheDayProduct.price).toLocaleString()} ج.س)
                  </span>
                </>
              ) : (
                <span style={{ color: "#94a3b8" }}>تلقائي (أحدث منتج)</span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              💡 اضغط «🔥 صفقة اليوم» بالجدول للتعيين أو الإلغاء.
            </div>
          </div>
        </div>

        {/* Special Offer Card */}
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
              fontSize: "26px",
              background: "rgba(2, 132, 199, 0.15)",
              borderRadius: "12px",
              width: "46px",
              height: "46px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(2, 132, 199, 0.3)",
              flexShrink: 0,
            }}
          >
            ⭐
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700 }}>
              العرض الخاص المعروض (الكارد الثاني)
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#f8fafc",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {spotlightInfo?.specialOfferProduct ? (
                <>
                  <span>{spotlightInfo.specialOfferProduct.name}</span>
                  <span style={{ marginRight: "6px", color: "#38bdf8", fontSize: "12px" }}>
                    ({Number(spotlightInfo.specialOfferProduct.price).toLocaleString()} ج.س)
                  </span>
                </>
              ) : (
                <span style={{ color: "#94a3b8" }}>تلقائي (الأكثر طلباً)</span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              💡 اضغط «⭐ العرض الخاص» بالجدول للتعيين أو الإلغاء.
            </div>
          </div>
        </div>

        {/* Dynamic Most Popular Stats */}
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
              fontSize: "26px",
              background: "rgba(16, 185, 129, 0.15)",
              borderRadius: "12px",
              width: "46px",
              height: "46px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "11px", color: "#34d399", fontWeight: 700 }}>
              الأكثر طلباً الفعلي (من الطلبات)
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#f8fafc",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {spotlightInfo?.mostPopularProduct ? (
                <>
                  <span>{spotlightInfo.mostPopularProduct.name}</span>
                  {spotlightInfo.mostPopularSalesCount > 0 && (
                    <span
                      style={{
                        marginRight: "6px",
                        background: "#059669",
                        color: "#fff",
                        padding: "1px 6px",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    >
                      {spotlightInfo.mostPopularSalesCount} طلب
                    </span>
                  )}
                </>
              ) : (
                <span style={{ color: "#94a3b8" }}>لا توجد طلبات بعد</span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              {spotlightInfo?.mostPopularSalesCount > 0
                ? "✓ يعتمد تلقائياً على الطلبات الحقيقية."
                : "ℹ️ يستبدل تلقائياً مع ورود أول طلب شراء."}
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

          {/* Universal Product Options and Variants Builder */}
          <div className="szFormGroup" style={{ marginTop: "1rem" }}>
            <ProductOptionsBuilder
              hasVariants={hasVariants}
              setHasVariants={setHasVariants}
              options={options}
              setOptions={setOptions}
              variants={variants}
              setVariants={setVariants}
              basePrice={Number(form.price) || 0}
              galleryImages={galleryImages}
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
                  <th style={{ textAlign: "center" }}>إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isDealOfTheDay =
                    spotlightInfo?.config?.dealOfTheDayProductId === product.id ||
                    spotlightInfo?.dealOfTheDayProduct?.id === product.id;

                  const isSpecialOffer =
                    spotlightInfo?.config?.specialOfferProductId === product.id ||
                    spotlightInfo?.specialOfferProduct?.id === product.id;

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
                                    boxShadow: "0 1px 4px rgba(245, 158, 11, 0.3)",
                                  }}
                                >
                                  🔥 صفقة اليوم
                                </span>
                              )}
                              {isSpecialOffer && (
                                <span
                                  style={{
                                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                                    color: "#fff",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    padding: "2px 6px",
                                    borderRadius: "6px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "2px",
                                    boxShadow: "0 1px 4px rgba(2, 132, 199, 0.3)",
                                  }}
                                >
                                  ⭐ العرض الخاص
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {/* 🔥 صفقة اليوم */}
                          <button
                            type="button"
                            onClick={() => makeDealOfTheDay(product)}
                            disabled={settingSpotlight}
                            style={{
                              background: isDealOfTheDay ? "#fef3c7" : "#fff",
                              color: isDealOfTheDay ? "#b45309" : "#475569",
                              border: `1.5px solid ${isDealOfTheDay ? "#f59e0b" : "#e2e8f0"}`,
                              fontWeight: isDealOfTheDay ? 700 : 500,
                              borderRadius: "8px",
                              padding: "6px 10px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.15s ease",
                              boxShadow: isDealOfTheDay ? "0 2px 6px rgba(245, 158, 11, 0.25)" : "none",
                            }}
                            title={isDealOfTheDay ? "إلغاء تعيين صفقة اليوم" : "تعيين هذا المنتج كـ صفقة اليوم في الصفحة الرئيسية"}
                          >
                            <span>🔥</span>
                            <span>{isDealOfTheDay ? "صفقة اليوم" : "صفقة اليوم"}</span>
                          </button>

                          {/* ⭐ العرض الخاص */}
                          <button
                            type="button"
                            onClick={() => makeSpecialOffer(product)}
                            disabled={settingSpotlight}
                            style={{
                              background: isSpecialOffer ? "#e0f2fe" : "#fff",
                              color: isSpecialOffer ? "#0369a1" : "#475569",
                              border: `1.5px solid ${isSpecialOffer ? "#0284c7" : "#e2e8f0"}`,
                              fontWeight: isSpecialOffer ? 700 : 500,
                              borderRadius: "8px",
                              padding: "6px 10px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.15s ease",
                              boxShadow: isSpecialOffer ? "0 2px 6px rgba(2, 132, 199, 0.25)" : "none",
                            }}
                            title={isSpecialOffer ? "إلغاء تعيين العرض الخاص" : "تعيين هذا المنتج كـ عرض خاص في الصفحة الرئيسية"}
                          >
                            <span>⭐</span>
                            <span>{isSpecialOffer ? "العرض الخاص" : "العرض الخاص"}</span>
                          </button>

                          {/* ✏️ تعديل */}
                          <button
                            type="button"
                            onClick={() => editProduct(product)}
                            style={{
                              background: "#ecfdf5",
                              color: "#047857",
                              border: "1.5px solid #a7f3d0",
                              fontWeight: 600,
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.15s ease",
                            }}
                            title="تعديل بيانات وصور المنتج"
                          >
                            <span>✏️</span>
                            <span>تعديل</span>
                          </button>

                          {/* 🗑️ حذف */}
                          <button
                            type="button"
                            onClick={() => removeProduct(product)}
                            style={{
                              background: "#fef2f2",
                              color: "#b91c1c",
                              border: "1.5px solid #fecaca",
                              fontWeight: 600,
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.15s ease",
                            }}
                            title="حذف المنتج نهائياً"
                          >
                            <span>🗑️</span>
                            <span>حذف</span>
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
