"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import { apiJson } from "../../../lib/api";

export default function ResetPasswordPage({ searchParams }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = useMemo(() => searchParams?.token || "", [searchParams]);
  const returnTo = useMemo(() => searchParams?.returnTo || "/auth/login", [searchParams]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين.");
      setLoading(false);
      return;
    }

    try {
      const result = await apiJson("/api/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      setMessage(result.message || "تم تحديث كلمة المرور بنجاح.");
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
            title="تعيين كلمة مرور جديدة"
            subtitle="استخدم الرابط المرسل إلى بريدك لتحديث كلمة المرور بشكل آمن."
          />

          <div className="authLoginCenter">
            <div className="authStack authLoginPanel">
              <div className="cardPanel">
                <h3>إنشاء كلمة مرور جديدة</h3>
                <p style={{ color: "var(--amazon-muted)", marginTop: 8, lineHeight: 1.8 }}>
                  إذا كان الرابط صالحًا، يمكنك تعيين كلمة مرور جديدة ثم العودة إلى تسجيل الدخول مباشرة.
                </p>
              </div>

              {!token ? <div className="cardPanel">رابط إعادة التعيين غير موجود. افتح الرابط المرسل إلى البريد.</div> : null}

              <form className="cardPanel formPanel" onSubmit={submit}>
                <input
                  className="input"
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <input
                  className="input"
                  type="password"
                  placeholder="تأكيد كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button className="primaryBtn" type="submit" disabled={loading || !token}>
                  {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </button>
              </form>

              {message ? <div className="cardPanel">{message}</div> : null}

              <Link className="secondaryBtn" href={returnTo}>
                العودة إلى تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
