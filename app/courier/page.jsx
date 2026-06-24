"use client";

import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import RoleGate from "../../components/RoleGate";
import CourierOrdersClient from "../../components/CourierOrdersClient";

export default function CourierPage() {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <RoleGate allowedRoles={["COURIER", "ADMIN"]} fallback="/account">
            <SectionHeading
              title="لوحة المندوب"
              subtitle="استلام الشحنة، تحديث الموقع، وتسليم الطلب من صفحة واحدة واضحة."
            />

            <div className="dashboardHero">
              <div className="dashboardHeroTop">
                <div>
                  <span className="dashboardHeroTag">SudanZon Courier</span>
                  <h3 style={{ margin: "12px 0 8px", fontSize: "1.5rem" }}>
                    متابعة الطلبات المخصصة للمندوب وتحديث حالتها
                  </h3>
                  <p style={{ margin: 0, color: "var(--amazon-muted)", lineHeight: 1.7, maxWidth: 760 }}>
                    هذه الواجهة مخصصة للمندوب فقط لتسجيل الاستلام ثم تحديث الشحنة إلى في الطريق ثم تم التسليم
                    بعد إتمام عملية التوصيل.
                  </p>
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
