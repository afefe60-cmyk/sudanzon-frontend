"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import { apiJson } from "../../../lib/api";

export default function ForgotPasswordPage({ searchParams }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = useMemo(() => searchParams?.returnTo || "/auth/login", [searchParams]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await apiJson("/api/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email, returnTo }),
      });

      setMessage(result.message || "إذا كان البريد موجودًا، تم إرسال رابط إعادة التعيين.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading
            title="استعادة كلمة المرور"
            subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور."
          />

          <div className="authLoginCenter">
            <div className="authStack authLoginPanel">
              <div className="cardPanel">
                <h3>طلب رابط جديد</h3>
                <p style={{ color: "var(--amazon-muted)", marginTop: 8, lineHeight: 1.8 }}>
                  سيتم إرسال رابط واحد للاستخدام مرة واحدة إلى البريد المرتبط بحسابك. إذا لم تجد الرسالة، تفقد مجلد
                  الرسائل غير المرغوب فيها.
                </p>
              </div>

              <form className="cardPanel formPanel" onSubmit={submit}>
                <input
                  className="input"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <button className="primaryBtn" type="submit" disabled={loading}>
                  {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                </button>
              </form>

              {message ? <div className="cardPanel">{message}</div> : null}

              <Link className="secondaryBtn" href="/auth/login">
                العودة إلى تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
