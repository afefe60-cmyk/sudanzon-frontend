"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import { apiJson } from "../../../lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const initialForm = useMemo(
    () => ({
      email,
      token,
      password: "",
      confirmPassword: "",
    }),
    [email, token]
  );

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.token) {
      setMessage("رابط إعادة التعيين غير مكتمل. افتح الرابط من البريد مرة أخرى.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await apiJson("/api/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          token: form.token,
          password: form.password,
        }),
      });

      setMessage(result.message || "تم تغيير كلمة المرور بنجاح");
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));

      window.setTimeout(() => {
        router.push("/auth/login");
      }, 1800);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authLoginCenter">
      <div className="authStack authLoginPanel">
        <div className="cardPanel formPanel">
          <div>
            <h3>كلمة مرور جديدة</h3>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>
              أدخل كلمة مرور جديدة وآمنة للحساب المرتبط بهذا الرابط.
            </p>
          </div>

          <form onSubmit={onSubmit} className="formPanel">
            <input
              className="input"
              name="email"
              type="hidden"
              value={form.email}
              readOnly
            />
            <input
              className="input"
              name="token"
              type="hidden"
              value={form.token}
              readOnly
            />

            <input
              className="input"
              name="password"
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={form.password}
              onChange={onChange}
              required
            />
            <input
              className="input"
              name="confirmPassword"
              type="password"
              placeholder="تأكيد كلمة المرور الجديدة"
              value={form.confirmPassword}
              onChange={onChange}
              required
            />

            <button className="primaryBtn" type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
            </button>
          </form>

          {message ? <p style={{ marginTop: 12, color: "#ffd84d" }}>{message}</p> : null}
        </div>

        <div className="authSignupLinks">
          <Link className="authSignupLink" href="/auth/login">
            <span>عودة</span>
            <strong>تسجيل الدخول</strong>
          </Link>
          <Link className="authSignupLink" href="/auth/forgot-password">
            <span>رابط آخر</span>
            <strong>إرسال بريد إعادة التعيين</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading title="إعادة تعيين كلمة المرور" />
          <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>جارِ التحميل...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
