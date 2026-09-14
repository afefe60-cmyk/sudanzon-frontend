"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { addToCartItem } from "../lib/cart";
import { getProductImages } from "../lib/media";

export default function ProductDetailClient({ product, specs = [] }) {
  const router = useRouter();
  const gallery = getProductImages(product);
  const [selectedImage, setSelectedImage] = useState(gallery[0] || product.image);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Initialize selected options with first value of each option
  const initialSelectedOptions = useMemo(() => {
    const initial = {};
    if (product?.hasVariants && Array.isArray(product.options)) {
      product.options.forEach((opt) => {
        if (opt.name && Array.isArray(opt.values) && opt.values.length > 0) {
          initial[opt.name] = opt.values[0].value || opt.values[0];
        }
      });
    }
    return initial;
  }, [product]);

  const [selectedOptions, setSelectedOptions] = useState(initialSelectedOptions);

  useEffect(() => {
    setSelectedOptions(initialSelectedOptions);
  }, [initialSelectedOptions]);

  // Match the active variant based on selectedOptions
  const matchedVariant = useMemo(() => {
    if (!product?.hasVariants || !Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }

    const found = product.variants.find((v) => {
      if (!Array.isArray(v.optionValues) || v.optionValues.length === 0) return false;
      return v.optionValues.every((ov) => {
        const optName = ov.optionName || product.options?.find((o) => o.id === ov.optionId)?.name;
        if (!optName) return true;
        const selVal = selectedOptions[optName];
        return selVal === ov.value;
      });
    });

    return found || product.variants[0];
  }, [product, selectedOptions]);

  // Sync image if variant has its own image
  useEffect(() => {
    if (matchedVariant?.image) {
      setSelectedImage(matchedVariant.image);
    }
  }, [matchedVariant]);

  const basePrice = Number(product.price || 0);
  const currentPrice = matchedVariant ? Number(matchedVariant.price) : basePrice;
  const currentComparePrice = matchedVariant
    ? (matchedVariant.comparePrice != null && Number(matchedVariant.comparePrice) > currentPrice ? Number(matchedVariant.comparePrice) : null)
    : (product.discount > 0 ? Math.round(currentPrice / (1 - product.discount / 100)) : null);

  const currentStock = matchedVariant ? Number(matchedVariant.stock) : Number(product.stock !== undefined ? product.stock : 10);
  const isOutOfStock = currentStock <= 0 || (matchedVariant && matchedVariant.isActive === false);

  const discountPercent = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCartItem(product, quantity, matchedVariant, selectedOptions);
    setAdded(true);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCartItem(product, quantity, matchedVariant, selectedOptions);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    router.push("/cart");
  };

  const incrementQty = () => {
    if (quantity < currentStock) setQuantity(quantity + 1);
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
        <Link href={"/products?category=" + encodeURIComponent(product.category?.name || product.category || "")}>
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
              width="600"
              height="600"
              fetchPriority="high"
              decoding="async"
              className="szMainImage"
              onError={(e) => {
                e.currentTarget.src = "/products/fashion.jpg";
              }}
            />
            {discountPercent > 0 && (
              <span className="szGalleryDiscountBadge">خصم {discountPercent}%</span>
            )}
            <button
              type="button"
              onClick={() => setIsFav(!isFav)}
              className={"szGalleryFavBtn " + (isFav ? "is-active" : "")}
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
                  key={imgUrl + "-" + idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={"szThumbBtn " + (selectedImage === imgUrl ? "is-active" : "")}
                >
                  <img
                    src={imgUrl}
                    alt={product.name + " " + (idx + 1)}
                    width="80"
                    height="80"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = "/products/fashion.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column: Product Details & Options */}
        <div className="szProductInfoCol">
          <div className="szVendorBadgeRow">
            <span className="szVendorPill">
              🏪 {product.vendor?.storeName || product.vendor || "سودان زون"}
            </span>
            <span className="szStockStatus">
              {!isOutOfStock ? (
                <span className="szInStock">✓ متوفر بالمخزون ({currentStock} قطعة)</span>
              ) : (
                <span className="szOutOfStock">نفد من المخزون (غير متوفر)</span>
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
            {matchedVariant?.sku && (
              <>
                <span className="szDividerDot">•</span>
                <span className="szSkuBadge">رمز SKU: {matchedVariant.sku}</span>
              </>
            )}
          </div>

          {/* Price Block */}
          <div className="szDetailPriceBox">
            <div className="szMainPriceRow">
              <span className="szDetailPrice">{currentPrice.toLocaleString()}</span>
              <span className="szDetailCurrency">جنيه سوداني</span>
              {currentComparePrice && (
                <span className="szDetailOriginalPrice">{currentComparePrice.toLocaleString()} ج.س</span>
              )}
            </div>
            <span className="szTaxNotice">السعر شامل كافة الرسوم والضريبة المحلية</span>
          </div>

          {/* Dynamic Interactive Product Options Selector */}
          {product.hasVariants && Array.isArray(product.options) && product.options.length > 0 && (
            <div className="szDetailOptionsSection">
              <h3 className="szOptionsHeading">اختر المواصفات والخيارات:</h3>
              {product.options.map((opt) => {
                const optName = opt.name;
                const activeVal = selectedOptions[optName];

                return (
                  <div key={opt.id || optName} className="szOptionGroup">
                    <div className="szOptionGroupTitle">
                      <span className="szOptionNameLabel">{optName}:</span>
                      <strong className="szOptionActiveValue">{activeVal || "يرجى الاختيار"}</strong>
                    </div>

                    <div className="szOptionPills">
                      {(opt.values || []).map((valObj) => {
                        const valStr = typeof valObj === "object" ? valObj.value : valObj;
                        const isSelected = activeVal === valStr;

                        return (
                          <button
                            key={valStr}
                            type="button"
                            onClick={() => handleOptionSelect(optName, valStr)}
                            className={"szOptionPillBtn " + (isSelected ? "is-selected" : "")}
                          >
                            <span>{valStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
              <span className="szBuyBoxLabel">إجمالي الطلب</span>
              <strong className="szBuyBoxPrice">{(currentPrice * quantity).toLocaleString()} ج.س</strong>
            </div>

            {/* Selected summary */}
            {product.hasVariants && Object.keys(selectedOptions).length > 0 && (
              <div className="szBuyBoxSelectedSummary">
                <span className="szSummaryLabel">الخيار المختار:</span>
                <span className="szSummaryPill">
                  {Object.entries(selectedOptions).map(([k, v]) => k + ": " + v).join(" • ")}
                </span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="szQtySelectorWrap">
              <label htmlFor="sz-qty-input">الكمية المطلوبة:</label>
              <div className="szQtyControl">
                <button
                  type="button"
                  onClick={decrementQty}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="szQtyBtn"
                  aria-label="إنقاص الكمية"
                >
                  -
                </button>
                <input
                  id="sz-qty-input"
                  type="number"
                  min="1"
                  max={Math.max(1, currentStock)}
                  value={quantity}
                  disabled={isOutOfStock}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 1;
                    if (val >= 1 && val <= currentStock) setQuantity(val);
                  }}
                  className="szQtyInput"
                />
                <button
                  type="button"
                  onClick={incrementQty}
                  disabled={quantity >= currentStock || isOutOfStock}
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
                className={"szBuyBtn szBuyBtn--cart " + (added ? "is-added " : "") + (isOutOfStock ? "is-disabled" : "")}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  <span>غير متوفر حالياً</span>
                ) : added ? (
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
                className={"szBuyBtn szBuyBtn--buyNow " + (isOutOfStock ? "is-disabled" : "")}
                disabled={isOutOfStock}
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
                <strong>{product.vendor?.storeName || (typeof product.vendor === "string" ? product.vendor : "سودان زون")}</strong>
                <small>بائع معتمد بالمنصة</small>
              </div>
            </div>
            <p className="szSellerSnapDesc">
              {product.vendor?.description || "متجر موثوق يقدم منتجات مختارة بعناية داخل SudanZon."}
            </p>
            {product.vendor?.storeSlug ? (
              <Link href={"/stores/" + product.vendor.storeSlug} className="szVisitStoreBtn">
                <span>زيارة صفحة المتجر وتصفح منتجاته</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Specifications Table */}
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
          <span className="szStickyPriceVal">{currentPrice.toLocaleString()} ج.س</span>
          <span className="szStickyStockStatus">{isOutOfStock ? "غير متوفر" : "متوفر للطلب"}</span>
        </div>
        <div className="szStickyMobileButtons">
          <button
            type="button"
            onClick={handleAddToCart}
            className="szStickyCartBtn"
            disabled={isOutOfStock}
            aria-label="أضف للسلة"
          >
            {isOutOfStock ? "غير متوفر" : added ? "✓ تمت الإضافة" : "أضف للسلة"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="szStickyBuyBtn"
            disabled={isOutOfStock}
            aria-label="شراء الآن"
          >
            شراء الآن
          </button>
        </div>
      </div>
    </div>
  );
}
