"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";
import { writeCart } from "../lib/cart";

const sudanCities = [
  "الخرطوم",
  "أم درمان",
  "بحري",
  "بورتسودان",
  "ود مدني",
  "كسلا",
  "القضارف",
  "الأبيض",
  "دنقلا",
  "عطبرة",
  "كوستي",
  "الفاشر",
  "الولايات الأخرى",
];

const paymentMethods = [
  {
    id: "CASH_ON_DELIVERY",
    name: "الدفع عند الاستلام",
    icon: "💵",
    desc: "ادفع نقداً لمندوب التوصيل عند استلام الطلب",
  },
  {
    id: "BANKAK",
    name: "تطبيق بنكك (Bankak)",
    icon: "🏦",
    desc: "تحويل مباشر لحساب التاجر عبر بنك الخرطوم",
  },
  {
    id: "CARD",
    name: "بطاقة الصراف الآلي",
    icon: "💳",
    desc: "دفع إلكتروني محلي آمن ومباشر",
  },
];

export default function CheckoutForm({ items = [] }) {
  const router = useRouter();
  const [city, setCity] = useState("الخرطوم");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  useEffect(() => {
    const storedToken = localStorage.getItem("sudanzonToken") || "";
    setToken(storedToken);

    try {
      const rawUser = localStorage.getItem("sudanzonUser");
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (user) {
        setCurrentUser(user);
        if (user.city) setCity(user.city);
        if (user.shippingAddress) setAddress(user.shippingAddress);
      }
    } catch {
      // keep defaults
    }

    if (storedToken) {
      apiJson("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((result) => {
          if (result.user) {
            setCurrentUser(result.user);
            if (result.user.city) setCity(result.user.city);
            if (result.user.shippingAddress) setAddress(result.user.shippingAddress);
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }, []);

  const submitOrder = async (e) => {
    e.preventDefault();

    if (!items.length) {
      setMessage("السلة فارغة، يرجى إضافة منتجات أولاً");
      return;
    }

    if (!token) {
      setMessage("يرجى تسجيل الدخول أو إنشاء حساب لإتمام الطلب ومتابعة الشحنة");
      return;
    }

    if (!address.trim()) {
      setMessage("يرجى كتابة عنوان التوصيل بالتفصيل (الحي، الشارع، المعلم البارز)");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await apiJson("/api/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items,
          city,
          address,
          note: `${note ? note + " | " : ""}طريقة الدفع: ${paymentMethod}`,
        }),
      });

      writeCart([]);
      window.dispatchEvent(new Event("sudanzon-cart-updated"));
      setIsSuccess(true);
      setMessage(`تم إنشاء طلبك بنجاح! رقم الطلب: #${result.order?.id || ""}`);
      
      setTimeout(() => {
        router.push(result.order?.id ? `/orders/${result.order.id}` : "/orders");
      }, 2000);
    } catch (error) {
      setMessage(error.message || "تعذر إتمام الطلب، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="szCheckoutCard" onSubmit={submitOrder}>
      <div className="szCheckoutCardHeader">
        <h3 className="szCheckoutTitle">بيانات الشحن والدفع</h3>
        <span className="szCheckoutSub">إتمام الطلب لـ ({totalItems}) قطعة</span>
      </div>

      {!token && (
        <div className="szLoginPromptBox">
          <div className="szLoginPromptIcon">👤</div>
          <div>
            <strong>تسجيل الدخول مطلوب</strong>
            <p>سجّل دخولك لحفظ الطلب في حسابك ومتابعة خط سير الشحنة.</p>
            <Link href="/auth/login" className="szLoginPromptBtn">
              تسجيل الدخول الآن ❯
            </Link>
          </div>
        </div>
      )}

      {/* City Selector */}
      <div className="szFormField">
        <label className="szFormLabel" htmlFor="checkout-city">
          المدينة / الولاية:
        </label>
        <select
          id="checkout-city"
          className="szFormSelect"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {sudanCities.map((c) => (
            <option key={c} value={c}>
              📍 {c}
            </option>
          ))}
        </select>
      </div>

      {/* Shipping Address */}
      <div className="szFormField">
        <label className="szFormLabel" htmlFor="checkout-address">
          عنوان التوصيل بالتفصيل:
        </label>
        <textarea
          id="checkout-address"
          className="szFormTextarea"
          rows={3}
          placeholder="مثال: الخرطوم، حي الرياض، شارع المشتل، بالقرب من مركز..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      {/* Payment Methods */}
      <div className="szFormField">
        <span className="szFormLabel">اختر طريقة الدفع:</span>
        <div className="szPaymentMethodsGrid">
          {paymentMethods.map((pm) => (
            <label
              key={pm.id}
              className={`szPaymentOptionCard ${paymentMethod === pm.id ? "is-selected" : ""}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={pm.id}
                checked={paymentMethod === pm.id}
                onChange={() => setPaymentMethod(pm.id)}
                className="szPaymentRadio"
              />
              <div className="szPaymentOptionBody">
                <div className="szPaymentOptionTop">
                  <span className="szPaymentIcon">{pm.icon}</span>
                  <strong className="szPaymentName">{pm.name}</strong>
                </div>
                <span className="szPaymentDesc">{pm.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Order Notes */}
      <div className="szFormField">
        <label className="szFormLabel" htmlFor="checkout-notes">
          ملاحظات لمندوب التوصيل (اختياري):
        </label>
        <textarea
          id="checkout-notes"
          className="szFormTextarea"
          rows={2}
          placeholder="أي تعليمات إضافية بخصوص وقت التسليم أو الاتصال..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`szSubmitOrderBtn ${loading ? "is-loading" : ""}`}
        disabled={loading || !items.length}
      >
        {loading ? (
          <span>جارِ تأكيد الطلب...</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>تأكيد وإرسال الطلب الآن</span>
          </>
        )}
      </button>

      {message && (
        <div className={`szOrderAlert ${isSuccess ? "is-success" : "is-error"}`}>
          {isSuccess ? "✓ " : "⚠️ "}
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}
