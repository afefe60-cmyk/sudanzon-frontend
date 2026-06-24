import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import AuthForm from "../../../components/AuthForm";

export default function ForgotPasswordPage({ searchParams }) {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading title="نسيت كلمة المرور" />

          <div className="authLoginCenter">
            <div className="authStack authLoginPanel">
              <AuthForm
                title="إرسال رابط إعادة التعيين"
                subtitle="أدخل البريد المرتبط بالحساب وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور."
                endpoint="/api/auth/password-reset/request"
                submitLabel="إرسال الرابط"
                returnTo=""
                fields={[{ name: "email", placeholder: "البريد الإلكتروني", type: "email" }]}
              />

              <div className="authSignupLinks">
                <Link className="authSignupLink" href="/auth/login">
                  <span>رجوع</span>
                  <strong>العودة لتسجيل الدخول</strong>
                </Link>
                <Link className="authSignupLink" href="/auth/customer">
                  <span>إنشاء حساب جديد</span>
                  <strong>عميل مباشر</strong>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
