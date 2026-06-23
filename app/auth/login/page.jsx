import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import AuthForm from "../../../components/AuthForm";
import GoogleAuthButton from "../../../components/GoogleAuthButton";

export default function LoginPage({ searchParams }) {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading title="تسجيل الدخول" />

          <div className="authLoginCenter">
            <div className="authStack authLoginPanel">
              <GoogleAuthButton returnTo={searchParams?.returnTo || "/"} />

              <div className="authDivider">
                <span>أو</span>
              </div>

              <AuthForm
                title="دخول النظام"
                subtitle=""
                endpoint="/api/auth/login"
                submitLabel="دخول"
                returnTo={searchParams?.returnTo || "/"}
                fields={[
                  { name: "identifier", placeholder: "البريد الإلكتروني أو الهاتف" },
                  { name: "password", placeholder: "كلمة المرور", type: "password" },
                ]}
              />

              <div className="authSignupLinks">
                <div className="authSignupLinkGrid">
                  <Link className="authSignupLink" href="/auth/customer">
                    <span>حساب عميل</span>
                    <strong>إنشاء مباشر</strong>
                  </Link>
                  <Link className="authSignupLink" href="/auth/vendor">
                    <span>حساب تاجر</span>
                    <strong>طلب حساب</strong>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
