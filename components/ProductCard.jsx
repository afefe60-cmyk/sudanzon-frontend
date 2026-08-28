"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCartItem } from "../lib/cart";
import { getProductImage } from "../lib/media";

export default function ProductCard({ product, badge, isHot = false }) {
  const [added, setAdded] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const price = Number(product.price || 0);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const discountPercent = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null;

  const vendorName = product.vendor?.storeName || product.vendor?.name || product.vendor || "سودان زون";
  const rating = product.rating ? Number(product.rating).toFixed(1) : "4.8";
  const stock = product.stock !== undefined ? Number(product.stock) : 10;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartItem(product, 1);
    setAdded(true);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    setTimeout(() => setAdded(false), 1800);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(!isFav);
  };

  return (
    <div className={`szProductCard ${isHot ? "is-hot-deal" : ""}`}>
      {/* Top badges & Favorite button */}
      <div className="szCardHeader">
        <div className="szBadgesGroup">
          {badge && <span className="szBadge szBadge--custom">{badge}</span>}
          {discountPercent && <span className="szBadge szBadge--discount">-{discountPercent}%</span>}
          {isHot && !badge && <span className="szBadge szBadge--hot">🔥 عرض خاص</span>}
          {stock <= 3 && stock > 0 && <span className="szBadge szBadge--lowStock">متبقي {stock} فقط</span>}
        </div>
        <button
          type="button"
          onClick={toggleFavorite}
          className={`szFavBtn ${isFav ? "is-active" : ""}`}
          aria-label={isFav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={isFav ? "#e11d48" : "none"} stroke={isFav ? "#e11d48" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${product.id}`} className="szImageLink">
        <div className="szImageWrap">
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            className="szProductImage"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="szCardBody">
        <div className="szCardMeta">
          <span className="szVendor">{vendorName}</span>
          <div className="szRating">
            <span className="szStar">★</span>
            <span className="szRatingValue">{rating}</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="szTitleLink">
          <h3 className="szTitle" title={product.name}>{product.name}</h3>
        </Link>

        {product.description && (
          <p className="szDescription">{product.description}</p>
        )}

        {/* Pricing & Add to Cart */}
        <div className="szCardFooter">
          <div className="szPriceBlock">
            <div className="szCurrentPrice">
              <span className="szAmount">{price.toLocaleString()}</span>
              <span className="szCurrency">ج.س</span>
            </div>
            {originalPrice && originalPrice > price && (
              <span className="szOldPrice">{originalPrice.toLocaleString()} ج.س</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`szAddCartBtn ${added ? "is-added" : ""}`}
            aria-label="إضافة المنتج إلى السلة"
          >
            {added ? (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
