"use client";

import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import ProtectedPanel from "../../components/ProtectedPanel";
import SellerProductsClient from "../../components/SellerProductsClient";
import RoleGate from "../../components/RoleGate";

const sellerItems = [
  {
    title: "إدارة المنتجات",
    note: "إضافة المنتجات وتعديل الصور والأسعار والمخزون.",
  },
  {
    title: "إدارة الطلبات",
    note: "متابعة الطلبات الجديدة والطلبات قيد المعالجة.",
  },
  {
    title: "إدارة الشحن",
    note: "تنسيق التسليم ومتابعة الحالة مع شركة التوصيل.",
  },
  {
    title: "التقارير",
    note: "رؤية مختصرة للمبيعات والاتجاهات اليومية.",
  },
  {
    title: "الأرباح",
    note: "مراجعة العائدات والعمولة المستحقة على كل عملية.",
  },
  {
    title: "الرسائل",
    note: "التواصل مع العملاء ومتابعة الاستفسارات بسرعة.",
  },
];

const sellerHighlights = [
  { label: "المتجر", value: "مفعّل" },
  { label: "المبيعات", value: "مباشرة" },
  { label: "الطلب", value: "سريع" },
  { label: "التسليم", value: "منظّم" },
];

const sellerFlow = [
  {
    title: "أضف المنتج",
    note: "ارفع الصورة وحدد السعر والتصنيف والمخزون خلال دقيقة.",
  },
  {
    title: "تابع الطلب",
    note: "راقب الحالة من جديد إلى تم التسليم بدون فوضى.",
  },
  {
    title: "سلّم واربح",
    note: "عالج الطلبات بسرعة وراجع العائدات والعمولة بسهولة.",
  },
];

export default function SellerPage() {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <RoleGate allowedRoles={["VENDOR", "ADMIN"]} fallback="/account">
            <SectionHeading title="لوحة البائع" subtitle="إدارة متجر التاجر داخل SudanZon" />

            <div className="dashboardHero">
              <div className="dashboardHeroTop">
                <div>
                  <span className="dashboardHeroTag">SudanZon Seller</span>
                  <h3 style={{ margin: "12px 0 8px", fontSize: "1.55rem" }}>
                    متجرك في واجهة مرتبة تساعدك على البيع بسرعة
                  </h3>
                  <p style={{ margin: 0, color: "var(--amazon-muted)", lineHeight: 1.7, maxWidth: 720 }}>
                    أضف المنتجات، راقب الطلبات، وأدِر الشحن والعائدات من مساحة واحدة خفيفة وواضحة ومناسبة
                    للعمل اليومي.
                  </p>
                </div>

                <div className="dashboardHeroActions">
                  <a className="dashboardHeroAction" href="/products">
                    عرض المنتجات
                  </a>
                  <a className="dashboardHeroAction" href="/orders">
                    متابعة الطلبات
                  </a>
                  <a className="dashboardHeroAction" href="/admin">
                    لوحة الإدارة
                  </a>
                </div>
              </div>

              <div className="sellerHeroLayout">
                <div className="dashboardHeroStats">
                  {sellerHighlights.map((item) => (
                    <div className="dashboardHeroCard" key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="sellerHeroAside">
                  <strong>ملاحظات تشغيل سريعة</strong>
                  <p>
                    هذه الصفحة مصممة لتجمع ما يحتاجه البائع يوميًا: إدارة المنتج، متابعة الطلبات، والتأكد
                    من أن كل عملية تسليم واضحة.
                  </p>
                  <div className="sellerQuickGrid">
                    <div className="sellerQuickCard">
                      <span>المنتجات</span>
                      <strong>تحديث سريع</strong>
                    </div>
                    <div className="sellerQuickCard">
                      <span>الطلبات</span>
                      <strong>متابعة فورية</strong>
                    </div>
                    <div className="sellerQuickCard">
                      <span>الشحن</span>
                      <strong>تحكم واضح</strong>
                    </div>
                    <div className="sellerQuickCard">
                      <span>الرسائل</span>
                      <strong>تواصل مباشر</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ProtectedPanel
              endpoint="/api/seller/dashboard"
              title="بيانات المتجر"
              subtitle="ملخص مباشر من المتجر الحالي."
              render={(data) => (
                <>
                  <div className="statsGrid" style={{ marginTop: 16 }}>
                    <div className="miniStat">
                      <strong>{Number(data.metrics.productsCount).toLocaleString()}</strong>
                      <span>عدد المنتجات</span>
                    </div>
                    <div className="miniStat">
                      <strong>{Number(data.metrics.ordersCount).toLocaleString()}</strong>
                      <span>عدد الطلبات</span>
                    </div>
                    <div className="miniStat">
                      <strong>{Number(data.metrics.earnings).toLocaleString()} جنيه سوداني</strong>
                      <span>الأرباح</span>
                    </div>
                    <div className="miniStat">
                      <strong>{data.store}</strong>
                      <span>اسم المتجر</span>
                    </div>
                  </div>

                  <div className="sellerProcessGrid">
                    {sellerFlow.map((item) => (
                      <div className="sellerProcessCard" key={item.title}>
                        <strong>{item.title}</strong>
                        <p>{item.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="featureGrid" style={{ marginTop: 16 }}>
                    {sellerItems.map((item) => (
                      <div className="featureCard" key={item.title}>
                        <strong>{item.title}</strong>
                        <p style={{ margin: "8px 0 0", color: "var(--amazon-muted)", lineHeight: 1.6 }}>
                          {item.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            />

            <div style={{ marginTop: 18 }}>
              <SellerProductsClient />
            </div>
          </RoleGate>
        </div>
      </section>
    </main>
  );
}
