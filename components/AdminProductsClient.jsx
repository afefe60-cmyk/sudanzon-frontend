"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiForm, apiJson } from "../lib/api";
import { getProductImage, getProductImages } from "../lib/media";

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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "");

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
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onImageChange = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 4);
    if (files.length === 0) {
      setProductImageFiles([]);
      setImagePreviews([]);
      return;
    }

    setProductImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImagePreviews([]);
    setProductImageFiles([]);
    setIsEditing(false);
    setShowModal(false);
  };

  const startCreateProduct = () => {
    setForm(emptyForm);
    setImagePreviews([]);
    setProductImageFiles([]);
    setIsEditing(false);
    setShowModal(true);
  };

  const editProduct = (product) => {
    setIsEditing(true);
    setForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      image: product.image || "",
      images: Array.isArray(product.images) ? product.images : product.image ? [product.image] : [],
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      categoryId: product.category?.id || "",
      categoryName: product.category?.name || "",
      vendorId: product.vendor?.id || "",
    });
    setImagePreviews(getProductImages(product));
    setProductImageFiles([]);
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

    if (productImageFiles.length) {
      productImageFiles.forEach((file) => payload.append("imageFiles", file));
    } else if (form.image) {
      payload.append("image", form.image);
      payload.append("images", JSON.stringify(form.images?.length ? form.images : [form.image]));
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

          {/* Image Upload Block */}
          <div className="szFormGroup">
            <label className="szFormLabel">صور المنتج (حتى 4 صور عالية الدقة)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageChange}
              className="szFormInput"
            />
            {imagePreviews.length > 0 && (
              <div className="szImagePreviewGrid" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {imagePreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="معاينة"
                    style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                ))}
              </div>
            )}
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
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="szProductAdminCell">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="szProductAdminThumb"
                        />
                        <div>
                          <strong className="szProductAdminTitle">{product.name}</strong>
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
                      <div className="szCatCardBtns">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
