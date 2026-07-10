"use client";

import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import RoleGate from "../../components/RoleGate";
import CourierOrdersClient from "../../components/CourierOrdersClient";

const courierHighlights = [
  { label: "طلبات اليوم", value: "تحديث مباشر" },
  { label: "الشحنات", value: "قيد الحركة" },
  { label: "التسليم", value: "بنقرة واحدة" },
  { label: "المدن", value: "حسب المنطقة" },
];

const courierSteps = [
  { title: "استلام الشحنة", note: "تأكيد استلام الطلب من المركز أو من الإدارة." },
  { title: "في الطريق", note: "إشعار العميل بأن الطلب أصبح في الطريق." },
  { title: "تم التسليم", note: "إغلاق الشحنة وتثبيت العملية كمنجزة." },
];

export default function CourierPage() {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <RoleGate allowedRoles={["COURIER", "ADMIN"]} fallback="/account">
            <SectionHeading title="لوحة المندوب" subtitle="إدارة استلام الشحنات وتسليمها من مكان واحد." />

            <div className="dashboardHero">
              <div className="dashboardHeroTop">
                <div>
                  <span className="dashboardHeroTag">SudanZon Courier</span>
                  <h3 style={{ margin: "12px 0 8px", fontSize: "1.55rem" }}>
                    مسار واضح للشحنة من الاستلام حتى التسليم
                  </h3>
                  <p style={{ margin: 0, color: "var(--amazon-muted)", lineHeight: 1.7, maxWidth: 720 }}>
                    هنا يتعامل المندوب مع الطلبات الجاهزة فقط. يبدأ باستلام الشحنة ثم يحرّكها إلى الطريق ثم يؤكد التسليم.
                  </p>
                </div>
                <div className="dashboardHeroActions">
                  <a className="dashboardHeroAction" href="/orders">
                    عرض الطلبات
                  </a>
                  <a className="dashboardHeroAction" href="/account">
                    الحساب
                  </a>
                </div>
              </div>

              <div className="adminHeroLayout">
                <div className="dashboardHeroStats">
                  {courierHighlights.map((item) => (
                    <div className="dashboardHeroCard" key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="adminHeroAside">
                  <strong>خطوات العمل</strong>
                  <div className="adminRoleList">
                    {courierSteps.map((item) => (
                      <div className="adminRoleRow" key={item.title}>
                        <span>{item.title}</span>
                        <strong>{item.note}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <CourierOrdersClient />
            </div>
          </RoleGate>
        </div>
      </section>
    </main>
  );
}
