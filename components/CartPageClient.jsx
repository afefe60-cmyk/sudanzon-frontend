"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";
import { readCart, removeCartItem, setCartQuantity, writeCart } from "../lib/cart";
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
        setProducts(result.items || []);
      } catch {
        setProducts([]);
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
        const product = products.find((item) => item.id === entry.productId);
        if (!product) {
          return null;
        }

        return {
          ...entry,
          product,
          subtotal: Number(product.price) * entry.quantity,
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const total = rows.reduce((sum, row) => sum + row.subtotal, 0);

  const updateQuantity = (productId, quantity) => {
    const next = setCartQuantity(productId, quantity);
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
    setMessage("تم مسح السلة");
  };

  return (
    <div className="cartLayout">
      <div className="cartItemsPanel">
        {loading ? <p>جاري تحميل المنتجات...</p> : null}
        {!loading && rows.length === 0 ? <p>السلة فارغة الآن.</p> : null}

        <div className="stackList">
          {rows.map((row) => (
            <div className="stackItem cartItem" key={row.productId}>
              <div>
                <strong>{row.product.name}</strong>
                <p>{row.product.description}</p>
                <span>{Number(row.product.price).toLocaleString()} جنيه سوداني</span>
              </div>

              <div className="cartItemControls">
                <label>
                  الكمية
                  <input
                    className="input cartQtyInput"
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(event) => updateQuantity(row.productId, Number(event.target.value) || 1)}
                  />
                </label>
                <strong>{row.subtotal.toLocaleString()} جنيه سوداني</strong>
                <button type="button" className="secondaryBtn" onClick={() => removeItem(row.productId)}>
                  إزالة
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="summaryBox">
          <strong>إجمالي السلة</strong>
          <p>{total.toLocaleString()} جنيه سوداني</p>
          <div style={{ marginTop: 12 }}>
            <button type="button" className="secondaryBtn" onClick={clearCart}>
              تفريغ السلة
            </button>
          </div>
        </div>
      </div>

      <div className="cartCheckoutPanel">
        <CheckoutForm
          items={rows.map((row) => ({
            productId: row.productId,
            quantity: row.quantity,
          }))}
        />
        {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
      </div>
    </div>
  );
}
