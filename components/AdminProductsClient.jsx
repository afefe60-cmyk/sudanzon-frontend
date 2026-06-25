"use client";

import { useEffect, useState } from "react";
import { apiForm, apiJson } from "../lib/api";
import { getProductImage } from "../lib/media";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  image: "",
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
  const [imagePreview, setImagePreview] = useState("");
  const [productImageFile, setProductImageFile] = useState(null);

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
    const file = event.target.files?.[0];
    if (!file) {
      setProductImageFile(null);
      return;
    }

    setProductImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImagePreview("");
    setProductImageFile(null);
  };

  const editProduct = (product) => {
    setForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      image: product.image || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      categoryId: product.category?.id || "",
      categoryName: product.category?.name || "",
    });
    setImagePreview(getProductImage(product));
    setProductImageFile(null);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (!form.id) {
      setMessage("اختر منتجًا من القائمة أولًا للتعديل.");
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

    if (productImageFile) {
      payload.append("imageFile", productImageFile);
    } else if (form.image) {
      payload.append("image", form.image);
    }

    try {
      await apiForm(`/api/products/${form.id}`, payload, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage("تم تحديث المنتج بنجاح");
      resetForm();
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    if (!confirm(`هل تريد حذف المنتج "${product.name}"؟`)) {
      return;
    }

    try {
      await apiJson(`/api/products/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage("تم حذف المنتج");
      if (form.id === product.id) {
        resetForm();
      }
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="sellerCrudGrid" style={{ marginTop: 24 }}>
      <form className="cardPanel formPanel" onSubmit={submitForm}>
        <h3>{form.id ? "تعديل منتج من المنصة" : "اختر منتجًا للتعديل"}</h3>
        <input className="input" name="name" value={form.name} onChange={onChange} placeholder="اسم المنتج" required />
        <textarea
          className="input"
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="وصف المنتج"
          rows={4}
          required
        />
        <div className="sellerImageUpload">
          <label className="sellerImagePicker">
            <span>صورة المنتج</span>
            <input className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} />
          </label>
          {imagePreview ? (
            <div className="sellerImagePreview">
              <img src={imagePreview} alt="معاينة المنتج" />
            </div>
          ) : null}
        </div>
        <div className="formRow">
          <input className="input" name="price" value={form.price} onChange={onChange} placeholder="السعر" type="number" required />
          <input className="input" name="stock" value={form.stock} onChange={onChange} placeholder="المخزون" type="number" />
        </div>
        <select
          className="input"
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
        <div className="formRow">
          <button className="primaryBtn" type="submit" disabled={saving || !form.id}>
            {saving ? "جاري الحفظ..." : "حفظ التعديل"}
          </button>
          <button className="secondaryBtn" type="button" onClick={resetForm}>
            إلغاء
          </button>
        </div>
        {message ? <p style={{ marginTop: 12, color: "#f0c14b" }}>{message}</p> : null}
      </form>

      <div className="cardPanel">
        <h3>كل منتجات المنصة</h3>
        {loading ? <p>جاري تحميل المنتجات...</p> : null}
        <div className="sellerProductsList">
          {!loading && products.length === 0 ? <p>لا توجد منتجات بعد.</p> : null}
          {products.map((product) => (
            <div className="sellerProductRow" key={product.id}>
              <img className="sellerProductThumb" src={getProductImage(product)} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <p>{product.vendor?.storeName || "متجر غير محدد"}</p>
                <p>{product.category?.name || "تصنيف غير محدد"}</p>
              </div>
              <div className="sellerProductActions">
                <span>{Number(product.price).toLocaleString()} جنيه سوداني</span>
                <span>المخزون {Number(product.stock || 0).toLocaleString()}</span>
                <button className="secondaryBtn" type="button" onClick={() => editProduct(product)}>
                  تعديل
                </button>
                <button className="secondaryBtn" type="button" onClick={() => removeProduct(product)}>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
