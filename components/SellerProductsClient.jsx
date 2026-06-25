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

export default function SellerProductsClient() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [productImageFile, setProductImageFile] = useState(null);

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

  const loadCategories = async () => {
    try {
      const result = await apiJson("/api/products/categories");
      const items = result.items || [];
      setCategories(items);
      setForm((current) => {
        if (current.categoryId || items.length === 0) {
          return current;
        }

        return { ...current, categoryId: items[0].id, categoryName: items[0].name };
      });
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

  const onImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, image: "" }));
      setImagePreview("");
      setProductImageFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImagePreview(result);
    };
    setProductImageFile(file);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImagePreview("");
    setProductImageFile(null);
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

    if (productImageFile) {
      payload.append("imageFile", productImageFile);
    } else if (form.image) {
      payload.append("image", form.image);
    }

    try {
      await apiForm(form.id ? `/api/products/${form.id}` : "/api/products", payload, {
        method: form.id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
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
      categoryId: product.category?.id || "",
      categoryName: product.category?.name || product.category || "",
    });
    setImagePreview(getProductImage(product));
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
