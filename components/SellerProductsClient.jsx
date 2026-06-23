"use client";

import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";
import { getProductImage } from "../lib/media";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  image: "",
  price: "",
  stock: "",
  categoryName: "",
};

export default function SellerProductsClient() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/seller/products", {
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

  useEffect(() => {
    loadProducts();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, image: "" }));
      setImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((current) => ({ ...current, image: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImagePreview("");
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      categoryName: form.categoryName.trim(),
    };

    try {
      await apiJson(form.id ? `/api/products/${form.id}` : "/api/products", {
        method: form.id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      setMessage(form.id ? "تم تحديث المنتج" : "تم إضافة المنتج");
      resetForm();
      await loadProducts();
      window.dispatchEvent(new Event("sudanzon-cart-updated"));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      image: product.image || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      categoryName: product.category?.name || product.category || "",
    });
    setImagePreview(product.image || "");
  };

  const removeProduct = async (productId) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) {
      return;
    }

    try {
      await apiJson(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage("تم حذف المنتج");
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="sellerCrudGrid">
      <form className="cardPanel formPanel" onSubmit={submitForm}>
        <h3>{form.id ? "تعديل منتج" : "إضافة منتج"}</h3>
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
            <input className="input" name="productImage" type="file" accept="image/*" onChange={onImageChange} />
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
        <input className="input" name="categoryName" value={form.categoryName} onChange={onChange} placeholder="التصنيف" required />
        <div className="formRow">
          <button className="primaryBtn" type="submit" disabled={saving}>
            {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديل" : "إضافة"}
          </button>
          <button className="secondaryBtn" type="button" onClick={resetForm}>
            مسح
          </button>
        </div>
        {message ? <p style={{ marginTop: 12, color: "#ffd84d" }}>{message}</p> : null}
      </form>

      <div className="cardPanel">
        <h3>منتجات متجرك</h3>
        {loading ? <p>جاري التحميل...</p> : null}
        <div className="sellerProductsList">
          {products.length === 0 ? <p>لا توجد منتجات بعد.</p> : null}
          {products.map((product) => (
            <div className="sellerProductRow" key={product.id}>
              <img className="sellerProductThumb" src={getProductImage(product)} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <p>{product.category?.name || product.category || "تصنيف"}</p>
              </div>
              <div className="sellerProductActions">
                <span>{product.image ? "صورة مرفوعة" : "صورة افتراضية"}</span>
                <span>{Number(product.price).toLocaleString()} جنيه سوداني</span>
                <button className="secondaryBtn" type="button" onClick={() => editProduct(product)}>
                  تعديل
                </button>
                <button className="secondaryBtn" type="button" onClick={() => removeProduct(product.id)}>
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
