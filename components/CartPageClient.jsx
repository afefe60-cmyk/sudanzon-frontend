"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";
import { readCart, removeCartItem, setCartQuantity, writeCart } from "../lib/cart";
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
        if (!product) return null;

        const qty = Math.max(1, Number(entry.quantity || 1));
        const price = Number(product.price || 0);

        return {
          ...entry,
          product,
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

  const updateQuantity = (productId, quantity) => {
    const next = setCartQuantity(productId, Math.max(1, quantity));
    setCart(next);
    window.dispatchEvent(new Event("sudanzon-cart-updated"));
  };

  const removeItem = (productId) => {
    const next = removeCartItem(productId);
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
              <span>المنتج والتفاصيل</span>
              <span>الكمية والإجمالي</span>
            </div>

            {rows.map((row) => (
              <div className="szCartItemCard" key={row.productId}>
                <div className="szCartItemInfo">
                  <div className="szCartItemImg">
                    <img src={getProductImage(row.product)} alt={row.product.name} />
                  </div>
                  <div className="szCartItemDetails">
                    <span className="szCartVendorTag">
                      {row.product.vendor?.storeName || row.product.vendor || "سودان زون"}
                    </span>
                    <Link href={`/products/${row.product.id}`} className="szCartItemTitleLink">
                      <strong className="szCartItemTitle">{row.product.name}</strong>
                    </Link>
                    <span className="szCartItemUnitPrice">
                      {Number(row.product.price).toLocaleString()} ج.س للقطعة
                    </span>
                  </div>
                </div>

                <div className="szCartItemActions">
                  <div className="szCartQtyWrap">
                    <button
                      type="button"
                      onClick={() => updateQuantity(row.productId, row.quantity - 1)}
                      className="szQtySmallBtn"
                      disabled={row.quantity <= 1}
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className="szQtySmallVal">{row.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(row.productId, row.quantity + 1)}
                      className="szQtySmallBtn"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  <div className="szCartSubtotalBlock">
                    <span className="szCartSubtotalLabel">الإجمالي:</span>
                    <strong className="szCartSubtotalValue">
                      {row.subtotal.toLocaleString()} ج.س
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(row.productId)}
                    className="szCartDeleteBtn"
                    title="حذف المنتج من السلة"
                    aria-label="حذف من السلة"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}

            <div className="szCartBottomBar">
              <Link href="/products" className="szContinueShoppingLink">
                ‹ متابعة التسوق وإضافة منتجات
              </Link>
              <button type="button" onClick={clearCart} className="szClearCartBtn">
                تفريغ السلة بالكامل
              </button>
            </div>
            {message && <p className="szCartFeedbackMsg">{message}</p>}
          </div>

          {/* Checkout & Summary Panel (Right Column) */}
          <div className="szCartSidebar">
            {/* Financial Summary */}
            <div className="szOrderSummaryCard">
              <h3 className="szSummaryTitle">ملخص الطلب</h3>
              <div className="szSummaryRows">
                <div className="szSummaryRow">
                  <span>مجموع المنتجات ({totalCount})</span>
                  <strong>{itemsTotal.toLocaleString()} ج.س</strong>
                </div>
                <div className="szSummaryRow">
                  <span>تكلفة الشحن والتوصيل</span>
                  <strong>
                    {shippingCost === 0 ? (
                      <span className="szFreeShipping">مجاني (طلب أكثر من 50,000)</span>
                    ) : (
                      `${shippingCost.toLocaleString()} ج.س`
                    )}
                  </strong>
                </div>
                <div className="szSummaryRow szSummaryRow--total">
                  <span>الإجمالي النهائي</span>
                  <strong className="szGrandTotal">{grandTotal.toLocaleString()} ج.س</strong>
                </div>
              </div>

              <div className="szCartPaymentNotice">
                <span>💵 الدفع عند الاستلام متاح</span>
                <span>🏦 إمكانية التحويل عبر بنكك مباشرة</span>
              </div>
            </div>

            {/* Direct Checkout Form */}
            <CheckoutForm
              items={rows.map((row) => ({
                productId: row.productId,
                quantity: row.quantity,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
