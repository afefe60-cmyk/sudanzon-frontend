"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";
import { readCart, removeCartItem, setCartQuantity, writeCart, getCartItemId } from "../lib/cart";
import { getProductImage } from "../lib/media";
import { products as fallbackProducts } from "../lib/mock-data";
import CheckoutForm from "./CheckoutForm";

export default function CartPageClient() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => setCart(readCart());
    sync();

    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await apiJson("/api/products");
        setProducts(result.items && result.items.length ? result.items : fallbackProducts);
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    window.addEventListener("sudanzon-cart-updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("sudanzon-cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const rows = useMemo(() => {
    return cart
      .map((entry) => {
        const product = products.find((item) => String(item.id) === String(entry.productId));
        const pName = entry.name || product?.name || "منتج";
        const pImg = entry.image || (product ? getProductImage(product) : "/products/fashion.jpg");
        const pVendor = entry.vendor || product?.vendor?.storeName || product?.vendor || "سودان زون";

        const qty = Math.max(1, Number(entry.quantity || 1));
        const price = Number(entry.price != null ? entry.price : (product?.price || 0));

        return {
          ...entry,
          cartItemId: getCartItemId(entry),
          product: product || { id: entry.productId, name: pName, price },
          name: pName,
          image: pImg,
          vendor: pVendor,
          variantTitle: entry.variantTitle || null,
          variantId: entry.variantId || null,
          sku: entry.sku || null,
          price,
          quantity: qty,
          subtotal: price * qty,
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const itemsTotal = rows.reduce((sum, row) => sum + row.subtotal, 0);
  const totalCount = rows.reduce((sum, row) => sum + row.quantity, 0);
  const shippingCost = itemsTotal > 0 ? (itemsTotal >= 50000 ? 0 : 3000) : 0;
  const grandTotal = itemsTotal + shippingCost;

  const updateQuantity = (cartItemId, quantity) => {
    const next = setCartQuantity(cartItemId, Math.max(1, quantity));
    setCart(next);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
  };

  const removeItem = (cartItemId) => {
    const next = removeCartItem(cartItemId);
    setCart(next);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
  };

  const clearCart = () => {
    writeCart([]);
    setCart([]);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
    setMessage("تم تفريغ سلة المشتريات");
    setTimeout(() => setMessage(""), 3000);
  };

  const checkoutItems = useMemo(() => {
    return rows.map((r) => ({
      productId: r.productId,
      variantId: r.variantId,
      variantTitle: r.variantTitle,
      sku: r.sku,
      quantity: r.quantity,
      price: r.price,
    }));
  }, [rows]);

  return (
    <div className="szCartPageWrapper">
      <div className="szCartPageHeader">
        <h1 className="szCartPageTitle">سلة المشتريات</h1>
        <span className="szCartItemsCount">({totalCount} منتج)</span>
      </div>

      {loading ? (
        <div className="szCartLoading">
          <p>جارِ جلب عناصر السلة...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="szCartEmptyBox">
          <div className="szCartEmptyIcon">🛒</div>
          <h2>سلة التسوق فارغة حالياً</h2>
          <p>لم تقم بإضافة أي منتجات للسلة بعد. استكشف آلاف العروض المميزة وابدأ التسوق الآن!</p>
          <Link href="/products" className="szHeroBtn szHeroBtn--primary">
            تصفح المنتجات والعروض
          </Link>
        </div>
      ) : (
        <div className="szCartMainLayout">
          {/* Items List (Left/Main Column) */}
          <div className="szCartItemsList">
            <div className="szCartItemsHeaderRow">
              <span>المنتج والتفاصيل المحددة</span>
              <span>الكمية والإجمالي</span>
            </div>

            {rows.map((row) => (
              <div className="szCartItemCard" key={row.cartItemId}>
                <div className="szCartItemInfo">
                  <div className="szCartItemImg">
                    <img
                      src={row.image}
                      alt={row.name}
                      width="80"
                      height="80"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="szCartItemDetails">
                    <span className="szCartVendorTag">
                      {row.vendor}
                    </span>
                    <Link href={"/products/" + row.productId} className="szCartItemTitleLink">
                      <strong className="szCartItemTitle">{row.name}</strong>
                    </Link>

                    {row.variantTitle && (
                      <div className="szCartVariantBadge">
                        <span>🏷️ الخيار: <strong>{row.variantTitle}</strong></span>
                        {row.sku && <small className="szCartSkuText">({row.sku})</small>}
                      </div>
                    )}

                    <span className="szCartItemUnitPrice">
                      {Number(row.price).toLocaleString()} ج.س للقطعة
                    </span>
                  </div>
                </div>

                <div className="szCartItemActions">
                  <div className="szCartQtyWrap">
                    <button
                      type="button"
                      onClick={() => updateQuantity(row.cartItemId, row.quantity - 1)}
                      className="szQtySmallBtn"
                      disabled={row.quantity <= 1}
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className="szQtySmallVal">{row.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(row.cartItemId, row.quantity + 1)}
                      className="szQtySmallBtn"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  <div className="szCartItemSubtotalBox">
                    <strong className="szCartItemSubtotal">
                      {row.subtotal.toLocaleString()} ج.س
                    </strong>
                    <button
                      type="button"
                      onClick={() => removeItem(row.cartItemId)}
                      className="szCartItemRemoveBtn"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="szCartFooterActions">
              <button type="button" onClick={clearCart} className="szCartClearBtn">
                تفريغ السلة بالكامل
              </button>
              <Link href="/products" className="szCartContinueLink">
                ← إضافة المزيد من المنتجات
              </Link>
            </div>
          </div>

          {/* Right Column: Checkout & Summary Card */}
          <div className="szCartSummaryCol">
            <div className="szCartSummaryCard">
              <h3 className="szSummaryCardTitle">ملخص الطلب</h3>

              <div className="szSummaryRow">
                <span>مجموع المنتجات ({totalCount} قطعة):</span>
                <strong>{itemsTotal.toLocaleString()} ج.س</strong>
              </div>

              <div className="szSummaryRow">
                <span>تكلفة الشحن والتوصيل:</span>
                {shippingCost === 0 ? (
                  <span className="szFreeShippingTag">مجاني (عرض خاص)</span>
                ) : (
                  <strong>{shippingCost.toLocaleString()} ج.س</strong>
                )}
              </div>

              <div className="szSummaryDivider" />

              <div className="szSummaryRow szSummaryRow--grand">
                <span>الإجمالي النهائي:</span>
                <strong className="szGrandTotalVal">{grandTotal.toLocaleString()} ج.س</strong>
              </div>
            </div>

            {/* Seamless One-Step Checkout Form */}
            <CheckoutForm items={checkoutItems} />
          </div>
        </div>
      )}

      {message && <div className="szCartToast">{message}</div>}
    </div>
  );
}
