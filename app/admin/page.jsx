"use client";

import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import ProtectedPanel from "../../components/ProtectedPanel";
import AdminOrdersClient from "../../components/AdminOrdersClient";
import AdminUsersClient from "../../components/AdminUsersClient";
import RoleGate from "../../components/RoleGate";

const adminItems = [
  {
    title: "إدارة المنتجات",
    note: "مراجعة الإضافة والتحديث والحذف على مستوى المنصة.",
  },
  {
    title: "إدارة التصنيفات",
    note: "تنظيم الأقسام بما يحافظ على وضوح التصفح.",
  },
  {
    title: "إدارة البائعين",
    note: "متابعة المتاجر وتفعيل الحسابات المعتمدة.",
  },
  {
    title: "إدارة العملاء",
    note: "الوصول إلى الحسابات والطلبات المرتبطة بها.",
  },
  {
    title: "إدارة الطلبات",
    note: "مراقبة الحالات والتحديثات بشكل لحظي.",
  },
  {
    title: "إدارة الشحن",
    note: "متابعة التوصيل وربط الشحنات بالمدن والمناطق.",
  },
  {
    title: "إدارة العمولات",
    note: "مراجعة نسب الربح وتوزيعها على البائعين.",
  },
];

const adminHighlights = [
  { label: "التحكم", value: "مركزي" },
  { label: "الإشراف", value: "لحظي" },
  { label: "التقارير", value: "واضحة" },
  { label: "العمولات", value: "محددة" },
];

const adminActions = [
  {
    title: "إنشاء حساب",
    note: "أضف عميلاً أو بائعًا أو مديرًا من نفس الواجهة.",
  },
  {
    title: "مراجعة طلب",
    note: "راقب الحالة، وعدّلها، واتبِع سير الطلبات المفتوحة.",
  },
  {
    title: "إدارة متجر",
    note: "اعتماد متاجر البائعين وربطها بحساباتهم مباشرة.",
  },
];

const adminRoleSummary = [
  { label: "العملاء", value: "تسجيل ذاتي + Google" },
  { label: "البائعون", value: "منشؤون من الإدارة" },
  { label: "المديرون", value: "صلاحيات كاملة" },
  { label: "المندوبون", value: "تحديث وتسليم" },
];

export default function AdminPage() {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <RoleGate allowedRoles={["ADMIN"]} fallback="/account">
            <SectionHeading title="لوحة الإدارة" subtitle="إحصائيات وإدارة عامة للمنصة من مكان واحد." />

            <div className="dashboardHero">
              <div className="dashboardHeroTop">
                <div>
                  <span className="dashboardHeroTag">SudanZon Admin</span>
                  <h3 style={{ margin: "12px 0 8px", fontSize: "1.55rem" }}>
                    صورة تشغيلية واضحة للمنصة من أول نظرة
                  </h3>
                  <p style={{ margin: 0, color: "var(--amazon-muted)", lineHeight: 1.7, maxWidth: 720 }}>
                    راقب الأداء العام، تابع الطلبات المفتوحة، وأنشئ الحسابات المعتمدة للبائعين والعملاء
                    والموظفين من لوحة واحدة مصممة للوضوح والقرار السريع.
                  </p>
                </div>

                <div className="dashboardHeroActions">
                  <a className="dashboardHeroAction" href="/orders">
                    مراجعة الطلبات
                  </a>
                  <a className="dashboardHeroAction" href="/products">
                    تصفح المنتجات
                  </a>
                  <a className="dashboardHeroAction" href="/seller">
                    لوحة البائع
                  </a>
                </div>
              </div>

              <div className="adminHeroLayout">
                <div className="dashboardHeroStats">
                  {adminHighlights.map((item) => (
                    <div className="dashboardHeroCard" key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="adminHeroAside">
                  <strong>خريطة الأدوار</strong>
                  <div className="adminRoleList">
                    {adminRoleSummary.map((item) => (
                      <div className="adminRoleRow" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="adminOverviewGrid">
              {adminActions.map((item) => (
                <div className="adminOverviewCard" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>

            <AdminUsersClient />

            <ProtectedPanel
              endpoint="/api/admin/dashboard"
              title="إحصائيات الإدارة"
              subtitle="بيانات مباشرة من قاعدة البيانات."
              render={(data) => (
                <>
                  <div className="statsGrid" style={{ marginTop: 16 }}>
                    <div className="miniStat">
                      <strong>{Number(data.stats.ordersCount).toLocaleString()}</strong>
                      <span>عدد الطلبات</span>
                    </div>
                    <div className="miniStat">
                      <strong>{Number(data.stats.customersCount).toLocaleString()}</strong>
                      <span>عدد العملاء</span>
                    </div>
                    <div className="miniStat">
                      <strong>{Number(data.stats.vendorsCount).toLocaleString()}</strong>
                      <span>عدد البائعين</span>
                    </div>
                    <div className="miniStat">
                      <strong>{Number(data.stats.adminCount).toLocaleString()}</strong>
                      <span>عدد المدراء</span>
                    </div>
                    <div className="miniStat">
                      <strong>{Number(data.stats.courierCount).toLocaleString()}</strong>
                      <span>عدد المندوبين</span>
                    </div>
                    <div className="miniStat">
                      <strong>{Number(data.stats.dailySales).toLocaleString()} جنيه سوداني</strong>
                      <span>المبيعات اليومية</span>
                    </div>
                  </div>

                  <div className="adminCapabilityGrid">
                    {adminItems.map((item) => (
                      <div className="adminCapabilityCard" key={item.title}>
                        <strong>{item.title}</strong>
                        <p>{item.note}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            />

            <div style={{ marginTop: 18 }}>
              <AdminOrdersClient />
            </div>
          </RoleGate>
        </div>
      </section>
    </main>
  );
}
