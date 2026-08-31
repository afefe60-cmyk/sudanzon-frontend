"use client";

import Link from "next/link";
import AuthForm from "./AuthForm";

export default function VendorRegisterClient() {
  return (
    <section className="szVendorOnboardingSection">
      <div className="container">
        {/* Hero Intro */}
        <div className="szVendorHeroCard">
          <div className="szVendorHeroBadge">
            <span>🇸🇩 بوابة التجار والبائعين المعتمدين</span>
          </div>
          <h1 className="szVendorHeroTitle">ابدأ البيع ووسع تجارتك عبر منصة سودان زون</h1>
          <p className="szVendorHeroSubtitle">
            سجل متجرك الآن واعرض منتجاتك لآلاف المتسوقين في الخرطوم وبورتسودان وكافة ولايات السودان مع إدارة المخزون، التحصيل عبر بنكك، والشحن الموثوق.
          </p>

          {/* Merchant Benefits Grid */}
          <div className="szVendorBenefitsGrid">
            <div className="szBenefitCard">
              <div className="szBenefitIcon">🏬</div>
              <h3>صفحة متجر مخصصة</h3>
              <p>رابط متجر رسمي خاص بك، مع شعارك وبنرك وأزرار التواصل المباشر عبر واتساب.</p>
            </div>

            <div className="szBenefitCard">
              <div className="szBenefitIcon">💰</div>
              <h3>دفع فوري وتسوية بنكك</h3>
              <p>خيارات دفع مرنة عند الاستلام وعبر تطبيق بنكك مع تسويات مالية دقيقة وآمنة.</p>
            </div>

            <div className="szBenefitCard">
              <div className="szBenefitIcon">🚚</div>
              <h3>تغطية شحن لكافة الولايات</h3>
              <p>شبكة مناديب وتوصيل سريع وموثوق تصل بمنتجاتك إلى كل بيت سوداني.</p>
            </div>
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="szVendorFormContainer">
          <div className="szVendorFormWrapper">
            <AuthForm
              title="إنشاء حساب متجر وتاجر جديد"
              subtitle="أدخل بيانات المسؤول والمتجر للانضمام لمنظومة التجار"
              endpoint="/api/auth/register/vendor"
              submitLabel="🚀 إنشاء الحساب والبدء"
              returnTo="/auth/login?notice=vendor-pending"
              fields={[
                { name: "name", placeholder: "اسم التاجر / المسؤول" },
                { name: "storeName", placeholder: "اسم المتجر التجاري" },
                { name: "phone", placeholder: "رقم الهاتف / الواتساب" },
                { name: "email", placeholder: "البريد الإلكتروني", required: false },
                { name: "city", placeholder: "المدينة / الولاية (مثلاً: الخرطوم، بورتسودان)", required: false },
                { name: "password", placeholder: "كلمة المرور", type: "password" },
              ]}
            />

            <div className="szVendorAlreadyRegistered">
              <span>لديك حساب تاجر مسجل بالفعل؟</span>
              <Link href="/seller" className="szLoginLink">
                تسجيل الدخول إلى لوحة البائع ❯
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .szVendorOnboardingSection {
          padding: 40px 0 70px;
          direction: rtl;
        }
        .szVendorHeroCard {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 28px;
          padding: 48px 32px;
          text-align: center;
          color: #ffffff;
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 40px;
        }
        .szVendorHeroBadge {
          display: inline-flex;
          padding: 6px 18px;
          border-radius: 99px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }
        .szVendorHeroTitle {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1.35;
        }
        .szVendorHeroSubtitle {
          margin: 16px auto 0;
          max-width: 720px;
          font-size: 1.05rem;
          color: #cbd5e1;
          line-height: 1.7;
        }
        .szVendorBenefitsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-top: 36px;
          text-align: right;
        }
        .szBenefitCard {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px 20px;
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .szBenefitCard:hover {
          transform: translateY(-3px);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .szBenefitIcon {
          font-size: 2.2rem;
          margin-bottom: 12px;
        }
        .szBenefitCard h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
        }
        .szBenefitCard p {
          margin: 8px 0 0 0;
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.6;
        }
        .szVendorFormContainer {
          max-width: 520px;
          margin: 0 auto;
        }
        .szVendorFormWrapper {
          background: #ffffff;
          border-radius: 24px;
          padding: 36px 28px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
        }
        .szVendorAlreadyRegistered {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .szLoginLink {
          color: #059669;
          font-weight: 800;
          text-decoration: none;
        }
        .szLoginLink:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .szVendorHeroTitle {
            font-size: 1.6rem;
          }
          .szVendorHeroCard {
            padding: 32px 18px;
          }
        }
      `}</style>
    </section>
  );
}
