"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";
import { writeCart } from "../lib/cart";

export default function CheckoutForm({ items }) {
  const [city, setCity] = useState("الخرطوم");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  useEffect(() => {
    const storedToken = localStorage.getItem("sudanzonToken") || "";
    setToken(storedToken);

    try {
      const rawUser = localStorage.getItem("sudanzonUser");
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (user?.city) {
        setCity(user.city);
      }
      if (user?.shippingAddress) {
        setAddress(user.shippingAddress);
      }
    } catch {
      // keep defaults
    }

    if (storedToken) {
      apiJson("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((result) => {
          if (result.user?.city) {
            setCity(result.user.city);
          }
          if (result.user?.shippingAddress) {
            setAddress(result.user.shippingAddress);
          }
        })
        .catch(() => {
          // ignore profile fetch issues in checkout
        });
    }
  }, []);

  const submitOrder = async (event) => {
    event.preventDefault();

    if (!items.length) {
      setMessage("السلة فارغة، أضف منتجات أولًا");
      return;
    }

    if (!token) {
      setMessage("سجّل الدخول أولًا لإنشاء الطلب");
      return;
    }

    try {
      const result = await apiJson("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          city,
          address,
          note,
        }),
      });

      writeCart([]);
      window.dispatchEvent(new Event("sudanzon-cart-updated"));
      setMessage(`تم إنشاء الطلب بنجاح. رقم الطلب: ${result.order.id}`);
      router.push("/orders");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form className="cardPanel formPanel" onSubmit={submitOrder}>
      <h3>إتمام الطلب</h3>
      <p style={{ color: "var(--amazon-muted)", margin: 0 }}>عدد القطع: {totalItems}</p>
      <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
        <option>الخرطوم</option>
        <option>أم درمان</option>
        <option>بحري</option>
        <option>الولايات</option>
      </select>
      <textarea
        className="input"
        rows={3}
        placeholder="العنوان الكامل"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <textarea
        className="input"
        rows={4}
        placeholder="ملاحظات إضافية"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="primaryBtn" type="submit" disabled={!items.length}>
        إنشاء الطلب
      </button>
      {message ? <p style={{ color: "#ffd84d" }}>{message}</p> : null}
    </form>
  );
}
