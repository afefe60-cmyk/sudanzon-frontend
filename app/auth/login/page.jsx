"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import GoogleAuthButton from "../../../components/GoogleAuthButton";
import { apiJson } from "../../../lib/api";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const notice = searchParams.get("notice");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      if (result.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("sudanzonToken", result.token);
          localStorage.setItem("sudanzonUser", JSON.stringify(result.user));

          // Bridge to Android App if opened inside WebView
          if (window.AndroidBridge && typeof window.AndroidBridge.onGoogleLoginSuccess === "function") {
            window.AndroidBridge.onGoogleLoginSuccess(result.token, JSON.stringify(result.user));
          }
        }
        window.dispatchEvent(new Event("sudanzon-user-updated"));
        setSuccessMessage("تم تسجيل الدخول بنجاح! جارِ توجيهك...");
        setTimeout(() => {
          router.push(returnTo);
        }, 600);
      }
    } catch (error) {
      setErrorMessage(error.message || "بيانات الدخول غير صحيحة، يرجى التحقق والمحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="szLoginCard">
      {/* Header */}
      <div className="szLoginCardHeader">
        <div className="szLoginLogoBadge">
          <img src="/logo.png" alt="SudanZon" onError={(e) => { e.currentTarget.src = "/favicon.png"; }} />
        </div>
        <h1 className="szLoginTitle">تسجيل الدخول</h1>
        <p className="szLoginSubtitle">مرحباً بك مجدداً في منصة سودان زون للتجارة الإلكترونية</p>
      </div>

      {notice === "vendor-pending" && (
        <div className="szNoticeBox szNoticeBox--warning">
          <strong>⏳ تم استلام طلب التاجر</strong>
          <p>حساب متجرك الآن بانتظار مراجعة الإدارة. بعد الموافقة يمكنك الدخول مباشرة إلى لوحة البائع.</p>
        </div>
      )}

      {/* Google Fast Login Button */}
      <div className="szGoogleAuthContainer">
        <GoogleAuthButton returnTo={returnTo} />
      </div>

      {/* Divider */}
      <div className="szLoginDivider">
        <span>أو بالبريد / رقم الهاتف</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="szLoginForm">
        {errorMessage && (
          <div className="szNoticeBox szNoticeBox--error">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="szNoticeBox szNoticeBox--success">
            <span>✓ {successMessage}</span>
          </div>
        )}

        <div className="szFormGroup">
          <label className="szFormLabel">رقم الهاتف أو البريد الإلكتروني</label>
          <input
            type="text"
            className="szFormInput"
            placeholder="09XXXXXXXX أو example@domain.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="szFormGroup">
          <div className="szFormLabelRow">
            <label className="szFormLabel">كلمة المرور</label>
            <Link href="/auth/forgot-password" className="szForgotPasswordLink">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <input
            type="password"
            className="szFormInput"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="szSubmitBtn" disabled={loading}>
          {loading ? "جارِ التحقق والدخول..." : "دخول إلى الحساب"}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="szLoginCardFooter">
        <p className="szRegisterPrompt">ليس لديك حساب بعد؟</p>
        <div className="szRegisterLinksGrid">
          <Link href="/auth/customer" className="szRegisterCardBtn">
            <span>🛍️ حساب متسوق جديد</span>
            <strong>إنشاء حساب عميل</strong>
          </Link>
          <Link href="/auth/vendor" className="szRegisterCardBtn szRegisterCardBtn--vendor">
            <span>🏬 انضم كتاجر وبائع</span>
            <strong>فتح متجر معتمد</strong>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .szLoginCard {
          width: 100%;
          max-width: 460px;
          background: #ffffff;
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
        }

        .szLoginCardHeader {
          text-align: center;
          margin-bottom: 24px;
        }

        .szLoginLogoBadge {
          width: 64px;
          height: 64px;
          margin: 0 auto 14px;
          border-radius: 16px;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
        }

        .szLoginLogoBadge img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .szLoginTitle {
          margin: 0;
          font-size: 1.55rem;
          font-weight: 800;
          color: #0f172a;
        }

        .szLoginSubtitle {
          margin: 6px 0 0;
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
        }

        .szNoticeBox {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.88rem;
          margin-bottom: 18px;
          line-height: 1.5;
        }

        .szNoticeBox--warning {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
        }

        .szNoticeBox--error {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
        }

        .szNoticeBox--success {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          color: #15803d;
        }

        .szGoogleAuthContainer {
          margin-bottom: 20px;
        }

        .szLoginDivider {
          position: relative;
          text-align: center;
          margin: 20px 0;
        }

        .szLoginDivider::before {
          content: "";
          position: absolute;
          inset-inline: 0;
          top: 50%;
          height: 1px;
          background: #e2e8f0;
        }

        .szLoginDivider span {
          position: relative;
          z-index: 1;
          background: #ffffff;
          padding: 0 14px;
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .szLoginForm {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .szFormGroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .szFormLabelRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .szFormLabel {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1e293b;
        }

        .szForgotPasswordLink {
          font-size: 0.82rem;
          color: #059669;
          font-weight: 600;
          text-decoration: none;
        }

        .szForgotPasswordLink:hover {
          text-decoration: underline;
        }

        .szFormInput {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .szFormInput:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
        }

        .szSubmitBtn {
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #ffffff;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
          transition: transform 0.15s, opacity 0.15s;
        }

        .szSubmitBtn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .szSubmitBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .szLoginCardFooter {
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        }

        .szRegisterPrompt {
          margin: 0 0 12px;
          font-size: 0.86rem;
          color: #64748b;
          font-weight: 500;
        }

        .szRegisterLinksGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .szRegisterCardBtn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 10px 8px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .szRegisterCardBtn span {
          font-size: 0.78rem;
          color: #64748b;
        }

        .szRegisterCardBtn strong {
          font-size: 0.86rem;
          color: #0f172a;
          font-weight: 700;
        }

        .szRegisterCardBtn:hover {
          background: #ffffff;
          border-color: #059669;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.08);
        }

        .szRegisterCardBtn--vendor:hover {
          border-color: #d97706;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szLoginSection">
        <div className="container szLoginContainer">
          <Suspense fallback={<div className="szLoginCard" style={{ padding: "40px", textAlign: "center" }}>جارِ تحميل صفحة تسجيل الدخول...</div>}>
            <LoginFormContent />
          </Suspense>
        </div>
      </section>

      <style jsx>{`
        .szLoginSection {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px 60px;
          background: #f8fafc;
          direction: rtl;
        }

        .szLoginContainer {
          display: flex;
          justify-content: center;
          width: 100%;
        }
      `}</style>
    </main>
  );
}
