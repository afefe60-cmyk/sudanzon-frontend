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
};

export default function AdminProductsClient() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [showEditModal, setShowEditModal] = useState(false);

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

  useEffect(() => {
    loadProducts();
    loadCategories();
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
    setShowEditModal(false);
  };

  const editProduct = (product) => {
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
    });
    setImagePreviews(getProductImages(product));
    setProductImageFiles([]);
    setShowEditModal(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (!form.id) {
      setMessage("اختر منتجاً من القائمة أولاً للتعديل.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("description", form.description.trim());
    payload.append("price", String(Number(form.price)));
    payload.append("stock", String(Number(form.stock || 0)));
    payload.append("categoryId", form.categoryId);
    payload.append("categoryName", form.categoryName.trim());

    if (productImageFiles.length) {
      productImageFiles.forEach((file) => payload.append("imageFiles", file));
    } else if (form.image) {
      payload.append("image", form.image);
      payload.append("images", JSON.stringify(form.images?.length ? form.images : [form.image]));
    }

    try {
      await apiForm(`/api/products/${form.id}`, payload, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage("✓ تم تحديث المنتج بنجاح");
      resetForm();
      await loadProducts();
    } catch (error) {
      setMessage(error.message || "تعذر تحديث المنتج");
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
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.vendor?.storeName && p.vendor.storeName.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCat, search]);

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
            placeholder="بحث بالاسم أو اسم المتجر التابع له..."
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
        </div>
      </div>

      {message && <div className="szAdminAlert">{message}</div>}

      {/* Edit Product Modal */}
      {showEditModal && (
        <form className="szAdminAddUserCard" onSubmit={submitForm}>
          <div className="szEditorHeader">
            <h3>✏️ تعديل المنتج الإداري</h3>
            <p>تعديل بيانات المنتج والمخزون والتصنيف.</p>
          </div>

          <div className="szFormGroup">
            <label className="szFormLabel">اسم المنتج *</label>
            <input
              className="szFormInput"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="اسم المنتج"
              required
            />
          </div>

          <div className="szFormGroup">
            <label className="szFormLabel">وصف المنتج</label>
            <textarea
              className="szFormTextarea"
              name="description"
              value={form.description}
              onChange={onChange}
              rows={3}
              required
            />
          </div>

          <div className="szFormGrid2">
            <div className="szFormGroup">
              <label className="szFormLabel">السعر (ج.س) *</label>
              <input
                className="szFormInput"
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                required
              />
            </div>
            <div className="szFormGroup">
              <label className="szFormLabel">المخزون *</label>
              <input
                className="szFormInput"
                name="stock"
                type="number"
                value={form.stock}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="szFormGroup">
            <label className="szFormLabel">التصنيف</label>
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

          <div className="szFormActionButtons">
            <button className="szSubmitProductBtn" type="submit" disabled={saving}>
              {saving ? "جارِ الحفظ..." : "✓ حفظ التعديل"}
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
                  <th>إجراءات</th>
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
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(product)}
                          className="szCatMiniBtn szCatMiniBtn--delete"
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
