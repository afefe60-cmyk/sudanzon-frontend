"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCartItem } from "../lib/cart";
import { getProductImages } from "../lib/media";

export default function ProductDetailClient({ product, specs = [] }) {
  const router = useRouter();
  const gallery = getProductImages(product);
  const [selectedImage, setSelectedImage] = useState(gallery[0] || product.image);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  const stock = Number(product.stock !== undefined ? product.stock : 10);
  const originalPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : null;

  const handleAddToCart = () => {
    addToCartItem(product, quantity);
    setAdded(true);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCartItem(product, quantity);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    router.push("/cart");
  };

  const incrementQty = () => {
    if (quantity < stock) setQuantity(quantity + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="szProductDetailShell">
      {/* Breadcrumb Navigation */}
      <nav className="szBreadcrumb" aria-label="مسار التنقل">
        <Link href="/">الرئيسية</Link>
        <span>/</span>
        <Link href="/products">المنتجات</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category?.name || product.category || "")}`}>
          {product.category?.name || product.category || "التصنيف"}
        </Link>
        <span>/</span>
        <span className="szBreadcrumbCurrent">{product.name}</span>
      </nav>

      {/* Main Showcase (Gallery + Info + Buy Box) */}
      <div className="szProductMainLayout">
        {/* Left Column: Interactive Image Gallery */}
        <div className="szProductGalleryCol">
          <div className="szMainImageContainer">
            <img
              src={selectedImage}
              alt={product.name}
              className="szMainImage"
            />
            {discount > 0 && (
              <span className="szGalleryDiscountBadge">خصم {discount}%</span>
            )}
            <button
              type="button"
              onClick={() => setIsFav(!isFav)}
              className={`szGalleryFavBtn ${isFav ? "is-active" : ""}`}
              aria-label="المفضلة"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill={isFav ? "#e11d48" : "none"} stroke={isFav ? "#e11d48" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Thumbnails list */}
          {gallery.length > 1 && (
            <div className="szThumbsTrack">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`szThumbBtn ${selectedImage === imgUrl ? "is-active" : ""}`}
                >
                  <img src={imgUrl} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center/Right Column: Product Details & Specs */}
        <div className="szProductInfoCol">
          <div className="szVendorBadgeRow">
            <span className="szVendorPill">
              🏪 {product.vendor?.storeName || product.vendor || "سودان زون"}
            </span>
            <span className="szStockStatus">
              {stock > 0 ? (
                <span className="szInStock">✓ متوفر بالمخزون ({stock} قطعة)</span>
              ) : (
                <span className="szOutOfStock">نفد من المخزون</span>
              )}
            </span>
          </div>

          <h1 className="szDetailTitle">{product.name}</h1>

          {/* Rating Row */}
          <div className="szDetailRatingRow">
            <div className="szRatingStars">
              <span className="szStarFilled">★</span>
              <span className="szRatingScore">{product.rating ? Number(product.rating).toFixed(1) : "4.8"}</span>
            </div>
            <span className="szDividerDot">•</span>
            <span className="szReviewCount">تقييم موثوق من المشترين</span>
          </div>

          {/* Price Block */}
          <div className="szDetailPriceBox">
            <div className="szMainPriceRow">
              <span className="szDetailPrice">{price.toLocaleString()}</span>
              <span className="szDetailCurrency">جنيه سوداني</span>
              {originalPrice && originalPrice > price && (
                <span className="szDetailOriginalPrice">{originalPrice.toLocaleString()} ج.س</span>
              )}
            </div>
            <span className="szTaxNotice">السعر شامل كافة الرسوم والضريبة المحلية</span>
          </div>

          {/* Product Description */}
          <div className="szDetailDescBox">
            <h3>تفاصيل ومزايا المنتج</h3>
            <p>{product.description || "منتج عالي الجودة متوفر حصرياً عبر منصة سودان زون مع ضمان الجودة والتوصيل السريع."}</p>
          </div>

          {/* Trust Highlights */}
          <div className="szDetailTrustPills">
            <div className="szTrustPillItem">
              <span className="szTrustPillIcon">🚚</span>
              <div>
                <strong>شحن سريع</strong>
                <small>توصيل لجميع الولايات</small>
              </div>
            </div>
            <div className="szTrustPillItem">
              <span className="szTrustPillIcon">💵</span>
              <div>
                <strong>دفع مرن</strong>
                <small>كاش أو بنكك</small>
              </div>
            </div>
            <div className="szTrustPillItem">
              <span className="szTrustPillIcon">🛡️</span>
              <div>
                <strong>ضمان أصلي</strong>
                <small>استبدال سهل</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Buy Box (Desktop Panel) */}
        <div className="szProductBuyBoxCol">
          <div className="szBuyBoxCard">
            <div className="szBuyBoxHeader">
              <span className="szBuyBoxLabel">طلب المنتج</span>
              <strong className="szBuyBoxPrice">{(price * quantity).toLocaleString()} ج.س</strong>
            </div>

            {/* Quantity Selector */}
            <div className="szQtySelectorWrap">
              <label htmlFor="sz-qty-input">الكمية المطلوبة:</label>
              <div className="szQtyControl">
                <button
                  type="button"
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                  className="szQtyBtn"
                  aria-label="إنقاص الكمية"
                >
                  -
                </button>
                <input
                  id="sz-qty-input"
                  type="number"
                  min="1"
                  max={stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 1;
                    if (val >= 1 && val <= stock) setQuantity(val);
                  }}
                  className="szQtyInput"
                />
                <button
                  type="button"
                  onClick={incrementQty}
                  disabled={quantity >= stock}
                  className="szQtyBtn"
                  aria-label="زيادة الكمية"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="szBuyBoxActions">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`szBuyBtn szBuyBtn--cart ${added ? "is-added" : ""}`}
                disabled={stock <= 0}
              >
                {added ? (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>تمت الإضافة للسلة!</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span>أضف إلى السلة</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="szBuyBtn szBuyBtn--buyNow"
                disabled={stock <= 0}
              >
                <span>شراء الآن (متابعة الدفع)</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="szBuyBoxGuarantees">
              <span>🔒 معاملات آمنة ومحمية بالكامل</span>
              <span>🇸🇩 تسوق محلي مباشر يدعم التجار</span>
            </div>
          </div>

          {/* Seller Snapshot */}
          <div className="szSellerSnapshotCard">
            <div className="szSellerSnapHeader">
              <span className="szSellerSnapIcon">🏬</span>
              <div>
                <strong>{product.vendor?.storeName || product.vendor || "سودان زون"}</strong>
                <small>بائع معتمد بالمنصة</small>
              </div>
            </div>
            <p className="szSellerSnapDesc">
              {product.vendor?.description || "متجر موثوق يقدم منتجات مختارة بعناية داخل SudanZon."}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications & Attributes Table */}
      {specs.length > 0 && (
        <div className="szSpecsSection">
          <h2 className="szSpecsHeading">مواصفات وتفاصيل المنتج</h2>
          <div className="szSpecsGrid">
            {specs.map((spec) => (
              <div className="szSpecItem" key={spec.label}>
                <span className="szSpecLabel">{spec.label}</span>
                <strong className="szSpecValue">{spec.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Action Bar */}
      <div className="szStickyMobileBar">
        <div className="szStickyMobilePrice">
          <span className="szStickyPriceVal">{price.toLocaleString()} ج.س</span>
          <span className="szStickyStockStatus">متوفر للطلب</span>
        </div>
        <div className="szStickyMobileButtons">
          <button
            type="button"
            onClick={handleAddToCart}
            className="szStickyCartBtn"
            aria-label="أضف للسلة"
          >
            {added ? "✓ تمت الإضافة" : "أضف للسلة"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="szStickyBuyBtn"
            aria-label="شراء الآن"
          >
            شراء الآن
          </button>
        </div>
      </div>
    </div>
  );
}
