import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import AuthForm from "../../../components/AuthForm";

export default function VendorRegisterPage({ searchParams }) {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading title="طلب حساب تاجر" />

          <div className="authLoginCenter">
            <div className="authStack authLoginPanel">
              <AuthForm
                title="إنشاء طلب تاجر"
                subtitle=""
                endpoint="/api/auth/register/vendor"
                submitLabel="إرسال الطلب"
                returnTo=""
                fields={[
                  { name: "name", placeholder: "اسم المسؤول" },
                  { name: "storeName", placeholder: "اسم المتجر" },
                  { name: "phone", placeholder: "رقم الهاتف", required: false },
                  { name: "email", placeholder: "البريد الإلكتروني", required: false },
                  { name: "password", placeholder: "كلمة المرور", type: "password" },
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
