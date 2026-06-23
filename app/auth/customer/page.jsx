import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import AuthForm from "../../../components/AuthForm";
import GoogleAuthButton from "../../../components/GoogleAuthButton";

export default function CustomerRegisterPage({ searchParams }) {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading
            title="إنشاء حساب عميل"
            subtitle="ابدأ بسرعة عبر Google أو البريد الإلكتروني أو الهاتف، ثم انتقل مباشرة إلى التسوق."
          />

          <div className="authShell">
            <div className="authIntro cardPanel">
              <span className="dashboardHeroTag">SudanZon Customer</span>
              <h3>حساب واحد لكل المشتريات والمتابعة</h3>
              <p>
                أنشئ حسابك في لحظات، واحفظ بياناتك بشكل آمن، وابدأ في تصفح المنتجات وإضافة الطلبات ومتابعة الشحنات
                من مكان واحد.
              </p>

              <div className="authBenefitGrid">
                <div className="authBenefitCard">
                  <strong>Google أولًا</strong>
                  <span>تسجيل فوري إذا كان حساب Google مفعّلًا في جهازك.</span>
                </div>
                <div className="authBenefitCard">
                  <strong>بريد أو هاتف</strong>
                  <span>أكمل التسجيل بالطريقة التي تفضّلها بدون تعقيد.</span>
                </div>
                <div className="authBenefitCard">
                  <strong>جاهز للتسوق</strong>
                  <span>استعرض العروض، أضف للسلة، وراجع الطلبات مباشرة بعد التسجيل.</span>
                </div>
              </div>
            </div>

            <div className="authStack">
              <GoogleAuthButton returnTo={searchParams?.returnTo || "/"} label="التسجيل عبر Google" />

              <div className="authDivider">
                <span>أو أكمل بالبريد أو الهاتف</span>
              </div>

              <AuthForm
                title="إنشاء حساب عميل"
                subtitle="استخدم الاسم مع بريد إلكتروني أو هاتف وكلمة مرور، ثم سيُحفظ الدخول تلقائيًا."
                endpoint="/api/auth/register/customer"
                submitLabel="إنشاء الحساب"
                returnTo={searchParams?.returnTo || "/"}
                fields={[
                  { name: "name", placeholder: "الاسم الكامل" },
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
