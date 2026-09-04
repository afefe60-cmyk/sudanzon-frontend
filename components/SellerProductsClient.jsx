"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiForm, apiJson } from "../lib/api";
import { getProductImage, getProductImages, resolveImageUrl } from "../lib/media";
import { products as fallbackProducts } from "../lib/mock-data";

import MultiImageUploader from "./MultiImageUploader";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  image: "/products/electronics.jpg",
  images: [],
  price: "",
  discount: "0",
  stock: "10",
  categoryId: "",
  categoryName: "إلكترونيات",
};

const realisticPhotoPresets = [
  { name: "هواتف وذكاء", path: "/products/phones.jpg", category: "موبايلات" },
  { name: "سماعات وإلكترونيات", path: "/products/electronics.jpg", category: "إلكترونيات" },
  { name: "عطور ملكية", path: "/products/perfume.jpg", category: "عطور" },
  { name: "أحذية رياضية", path: "/products/shoes.jpg", category: "أحذية" },
  { name: "لابتوب وكمبيوتر", path: "/products/computer.jpg", category: "كمبيوتر" },
  { name: "ساعة ذكية", path: "/products/smartwatch.jpg", category: "إلكترونيات" },
  { name: "مستحضرات وعناية", path: "/products/beauty.jpg", category: "مستحضرات تجميل" },
  { name: "أدوات منزل ومطبخ", path: "/products/home.jpg", category: "أدوات منزلية" },
  { name: "بن وسوبرماركت", path: "/products/grocery.jpg", category: "سوبر ماركت" },
  { name: "ملابس وأزياء", path: "/products/fashion.jpg", category: "ملابس" },
  { name: "إطارات سيارات", path: "/products/auto.jpg", category: "قطع غيار السيارات" },
];

export default function SellerProductsClient() {
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'add' | 'guide'
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("sudanzonToken") || "");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await apiJson("/api/seller/products", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProducts(result.items && result.items.length ? result.items : fallbackProducts.slice(0, 8));
      setMessage("");
    } catch {
      setProducts(fallbackProducts.slice(0, 8));
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
        if (current.categoryId || items.length === 0) return current;
        return { ...current, categoryId: items[0].id, categoryName: items[0].name };
      });
    } catch {
      // fallback categories
      setCategories([
        { id: "c1", name: "إلكترونيات" },
        { id: "c2", name: "موبايلات" },
        { id: "c3", name: "عطور" },
        { id: "c4", name: "ملابس" },
        { id: "c5", name: "أحذية" },
        { id: "c6", name: "أدوات منزلية" },
        { id: "c7", name: "سوبر ماركت" },
        { id: "c8", name: "مستحضرات تجميل" },
        { id: "c9", name: "قطع غيار السيارات" },
      ]);
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

  const selectPresetImage = (preset) => {
    setForm((current) => ({
      ...current,
      image: preset.path,
      categoryName: preset.category,
    }));
    setGalleryImages((prev) => [
      { id: "preset_" + preset.path, url: preset.path, file: null, isNew: false },
      ...prev.filter((item) => item.url !== preset.path),
    ]);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setGalleryImages([]);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("description", form.description.trim());
    payload.append("price", String(Number(form.price)));
    payload.append("discount", String(Number(form.discount || 0)));
    payload.append("stock", String(Number(form.stock || 0)));
    payload.append("categoryId", form.categoryId || "c1");
    payload.append("categoryName", form.categoryName.trim() || "عام");

    const newFiles = galleryImages.filter((item) => item.file).map((item) => item.file);
    const existingImgs = galleryImages.filter((item) => !item.file && item.url).map((item) => item.url);

    newFiles.forEach((file) => payload.append("imageFiles", file));
    payload.append("existingImages", JSON.stringify(existingImgs));
    payload.append("primaryIsNew", String(Boolean(galleryImages[0]?.file)));
    if (galleryImages[0]?.url && !galleryImages[0]?.file) {
      payload.append("primaryImage", galleryImages[0].url);
    }

    try {
      await apiForm(form.id ? `/api/products/${form.id}` : "/api/products", payload, {
        method: form.id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setMessage(form.id ? "✓ تم تحديث المنتج بنجاح!" : "✓ تم نشر المنتج في المتجر بنجاح!");
      resetForm();
      await loadProducts();
      setActiveTab("catalog");
      window.dispatchEvent(new Event("sudanzon-cart-updated"));
    } catch (error) {
      setMessage(error.message || "تعذر حفظ المنتج");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    const allImgs = getProductImages(product);
    setForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      image: product.image || allImgs[0] || "/products/electronics.jpg",
      images: allImgs,
      price: String(product.price ?? ""),
      discount: String(product.discount ?? "0"),
      stock: String(product.stock ?? "10"),
      categoryId: product.category?.id || "",
      categoryName: product.category?.name || product.category || "",
    });
    setGalleryImages(
      allImgs.map((url, i) => ({
        id: "img_" + i + "_" + url,
        url,
        file: null,
        isNew: false,
      }))
    );
    setActiveTab("add");
  };

  const removeProduct = async (productId) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟")) {
      return;
    }

    try {
      await apiJson(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage("تم حذف المنتج من المتجر");
      await loadProducts();
    } catch (error) {
      setMessage(error.message || "تعذر حذف المنتج");
    }
  };

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const pCat = p.category?.name || p.category || "";
      const matchCat = selectedCategoryFilter === "ALL" || pCat === selectedCategoryFilter;
      return matchQuery && matchCat;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  const previewPrice = Number(form.price || 0);
  const previewDiscount = Number(form.discount || 0);
  const previewOriginalPrice = previewDiscount > 0 ? Math.round(previewPrice / (1 - previewDiscount / 100)) : null;

  return (
    <div className="szSellerHubWrapper">
      {/* Navigation Tabs */}
      <div className="szSellerTabsHeader">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`szSellerTabBtn ${activeTab === "catalog" ? "is-active" : ""}`}
        >
          <span>📦 قائمة منتجاتي ({products.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (activeTab !== "add") resetForm();
            setActiveTab("add");
          }}
          className={`szSellerTabBtn ${activeTab === "add" ? "is-active" : ""}`}
        >
          <span>{form.id ? "✏️ تعديل المنتج" : "➕ إضافة منتج جديد"}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`szSellerTabBtn ${activeTab === "guide" ? "is-active" : ""}`}
        >
          <span>🚀 نصائح زيادة المبيعات</span>
        </button>
      </div>

      {message && (
        <div className="szSellerAlert">
          <span>{message}</span>
        </div>
      )}

      {/* TAB 1: CATALOG */}
      {activeTab === "catalog" && (
        <div className="szSellerCatalogPane">
          <div className="szCatalogTopControls">
            <div className="szCatalogSearchWrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="ابحث في منتجات متجرك بالاسم أو الوصف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="szCatalogSearchInput"
              />
            </div>

            <div className="szCatalogActionsRight">
              <select
                className="szCatalogFilterSelect"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="ALL">جميع الأقسام</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("add");
                }}
                className="szAddProductCtaBtn"
              >
                + إضافة منتج جديد
              </button>
            </div>
          </div>

          {loading ? (
            <div className="szSellerLoading">جارِ تحميل المنتجات...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="szCatalogEmpty">
              <span className="szCatalogEmptyIcon">📦</span>
              <h3>لا توجد منتجات مطابقة</h3>
              <p>جرّب تغيير كلمات البحث أو أضف منتجاً جديداً إلى متجرك الآن.</p>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("add");
                }}
                className="szAddProductCtaBtn"
              >
                أضف أول منتج الآن
              </button>
            </div>
          ) : (
            <div className="szMerchantProductsGrid">
              {filteredProducts.map((p) => {
                const pPrice = Number(p.price || 0);
                const pStock = Number(p.stock ?? 10);
                const pDiscount = Number(p.discount || 0);

                return (
                  <div className="szMerchantProductCard" key={p.id}>
                    <div className="szMerchantCardImgWrap">
                      <img src={getProductImage(p)} alt={p.name} />
                      {pDiscount > 0 && <span className="szMerchantDiscount">خصم {pDiscount}%</span>}
                      <span className={`szMerchantStockPill ${pStock <= 3 ? "is-low" : ""}`}>
                        {pStock > 0 ? `المخزون: ${pStock}` : "نفد المخزون"}
                      </span>
                    </div>

                    <div className="szMerchantCardBody">
                      <span className="szMerchantCatTag">{p.category?.name || p.category || "تصنيف"}</span>
                      <strong className="szMerchantTitle">{p.name}</strong>
                      <p className="szMerchantDesc">{p.description}</p>

                      <div className="szMerchantPriceRow">
                        <strong className="szMerchantPrice">{pPrice.toLocaleString()} ج.س</strong>
                        <span className="szMerchantRating">★ {p.rating || "4.8"}</span>
                      </div>

                      <div className="szMerchantCardActions">
                        <Link href={`/products/${p.id}`} className="szMerchantBtn szMerchantBtn--view">
                          معاينة بالمتجر
                        </Link>
                        <button
                          type="button"
                          onClick={() => editProduct(p)}
                          className="szMerchantBtn szMerchantBtn--edit"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          className="szMerchantBtn szMerchantBtn--delete"
                          aria-label="حذف"
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
      )}

      {/* TAB 2: ADD / EDIT PRODUCT WITH LIVE PREVIEW */}
      {activeTab === "add" && (
        <div className="szProductFormWithPreview">
          <form className="szProductEditorCard" onSubmit={submitForm}>
            <div className="szEditorHeader">
              <h3>{form.id ? "✏️ تعديل بيانات المنتج" : "✨ نشر منتج جديد بالمتجر"}</h3>
              <p>املأ التفاصيل بدقة لضمان ظهور المنتج بشكل جذاب لجميع زوار سودان زون.</p>
            </div>

            <div className="szFormGroup">
              <label className="szFormLabel">اسم المنتج التجاري *</label>
              <input
                className="szFormInput"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="مثال: عطر العود الملكي الفاخر 100 مل"
                required
              />
            </div>

            <div className="szFormGroup">
              <label className="szFormLabel">وصف المنتج ومزاياه *</label>
              <textarea
                className="szFormTextarea"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="اشرح مواصفات المنتج، الخامة، طريقة الاستخدام، وفترة الضمان..."
                rows={4}
                required
              />
            </div>

            {/* Realistic Photo Studio Presets */}
            <div className="szFormGroup">
              <label className="szFormLabel">صور المنتج (اختر صورة استوديو جاهزة أو ارفع صورك الخاصة):</label>
              <div className="szPhotoPresetsTrack">
                {realisticPhotoPresets.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => selectPresetImage(preset)}
                    className={`szPresetPhotoBtn ${galleryImages[0]?.url === preset.path ? "is-selected" : ""}`}
                  >
                    <img src={preset.path} alt={preset.name} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Multi-Image Gallery Uploader with + Button */}
              <MultiImageUploader
                images={galleryImages}
                onChange={setGalleryImages}
                maxImages={8}
                label="معرض صور المنتج (أضف حتى 8 صور وحدد الصورة الأساسية)"
              />
            </div>

            <div className="szFormGrid2">
              <div className="szFormGroup">
                <label className="szFormLabel">السعر (جنيه سوداني) *</label>
                <input
                  className="szFormInput"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={onChange}
                  placeholder="مثال: 45000"
                  required
                />
              </div>

              <div className="szFormGroup">
                <label className="szFormLabel">نسبة الخصم % (اختياري)</label>
                <input
                  className="szFormInput"
                  name="discount"
                  type="number"
                  min="0"
                  max="90"
                  value={form.discount}
                  onChange={onChange}
                  placeholder="مثال: 15"
                />
              </div>
            </div>

            <div className="szFormGrid2">
              <div className="szFormGroup">
                <label className="szFormLabel">الكمية المتوفرة بالمخزون *</label>
                <input
                  className="szFormInput"
                  name="stock"
                  type="number"
                  min="1"
                  value={form.stock}
                  onChange={onChange}
                  placeholder="مثال: 20"
                  required
                />
              </div>

              <div className="szFormGroup">
                <label className="szFormLabel">التصنيف الرئيسي *</label>
                <select
                  className="szFormSelect"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={(event) => {
                    const category = categories.find((item) => item.id === event.target.value);
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                      categoryName: category?.name || current.categoryName,
                    }));
                  }}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="szFormActionButtons">
              <button className="szSubmitProductBtn" type="submit" disabled={saving}>
                {saving ? "جارِ الحفظ والنشر..." : form.id ? "✓ حفظ التعديلات" : "🚀 نشر المنتج في المتجر"}
              </button>
              <button
                className="szCancelFormBtn"
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("catalog");
                }}
              >
                إلغاء
              </button>
            </div>
          </form>

          {/* Live Customer Preview Card */}
          <div className="szLivePreviewSticky">
            <div className="szLivePreviewCard">
              <div className="szPreviewHeader">
                <span className="szLiveDot" />
                <span>معاينة حية: كيف سيظهر للمتسوق؟</span>
              </div>

              <div className="szPreviewProductCard">
                <div className="szPreviewImgWrap">
                  <img
                    src={
                      galleryImages[0]?.url
                        ? galleryImages[0].isNew
                          ? galleryImages[0].url
                          : resolveImageUrl(galleryImages[0].url)
                        : form.image
                        ? resolveImageUrl(form.image)
                        : "/products/electronics.jpg"
                    }
                    alt={form.name || "معاينة المنتج"}
                  />
                  {previewDiscount > 0 && <span className="szPreviewDiscountBadge">خصم {previewDiscount}%</span>}
                </div>

                <div className="szPreviewCardBody">
                  <span className="szPreviewCategory">{form.categoryName || "تصنيف عام"}</span>
                  <h4 className="szPreviewTitle">{form.name || "اسم المنتج سيظهر هنا"}</h4>
                  <p className="szPreviewDesc">
                    {form.description || "هنا يظهر الشرح التوضيحي للمنتج ومزاياه التنافسية..."}
                  </p>

                  <div className="szPreviewPriceRow">
                    <div>
                      <strong className="szPreviewPrice">
                        {previewPrice > 0 ? previewPrice.toLocaleString() : "0"} ج.س
                      </strong>
                      {previewOriginalPrice && previewOriginalPrice > previewPrice && (
                        <span className="szPreviewOldPrice">{previewOriginalPrice.toLocaleString()} ج.س</span>
                      )}
                    </div>
                    <span className="szPreviewStock">المخزون: {form.stock || 10}</span>
                  </div>

                  <button type="button" className="szPreviewAddBtn" disabled>
                    + أضف إلى السلة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SELLER GROWTH GUIDE */}
      {activeTab === "guide" && (
        <div className="szSellerGuidePane">
          <div className="szGuideBanner">
            <h2>دليل التاجر لتحقيق أعلى مبيعات في SudanZon 🇸🇩📈</h2>
            <p>خطوات عملية مجربة لرفع ثقة المشترين وتسريع وتيرة شحن واستلام الطلبات.</p>
          </div>

          <div className="szGuideCardsGrid">
            <div className="szGuideCard">
              <span className="szGuideIcon">📸</span>
              <strong>استخدم صوراً واضحة واستوديو</strong>
              <p>المنتجات التي تحتوي على صور واقعية وذات إضاءة نقية تحقق معدل شراء أعلى بنسبة 350%.</p>
            </div>

            <div className="szGuideCard">
              <span className="szGuideIcon">⚡</span>
              <strong>سرعة تسليم الطلبات للمندوب</strong>
              <p>تجهيز الطلب خلال أقل من 12 ساعة يمنح متجرك أولوية الظهور في قسم "مختارات سودان زون".</p>
            </div>

            <div className="szGuideCard">
              <span className="szGuideIcon">🏦</span>
              <strong>توفير الدفع عبر بنكك والكاش</strong>
              <p>تأكد من تحديث رقم حساب بنكك لتسوية الأرباح واستلام المدفوعات فور تأكيد التسليم.</p>
            </div>

            <div className="szGuideCard">
              <span className="szGuideIcon">🔥</span>
              <strong>تقديم عروض موسمية وخصومات</strong>
              <p>تفعيل شارة الخصم حتى 10% إلى 20% يجذب المتسوقين في قسم العروض الساخنة بالهيدر.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
