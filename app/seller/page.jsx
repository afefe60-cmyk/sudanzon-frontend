"use client";

import SiteHeader from "../../components/SiteHeader";
import ProtectedPanel from "../../components/ProtectedPanel";
import SellerProductsClient from "../../components/SellerProductsClient";
import RoleGate from "../../components/RoleGate";

export default function SellerPage() {
  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szSellerDashboardSection">
        <div className="container">
          <RoleGate
            allowedRoles={["VENDOR", "ADMIN"]}
            fallback="/account"
            title="لوحة تحكم وإدارة المتجر (Seller Portal)"
            subtitle="يرجى تسجيل الدخول بحساب التاجر المعتمد لإدارة المنتجات والمبيعات والمخزون."
            icon="🏬"
            submitLabel="دخول إلى لوحة المتجر"
            registerLink="/auth/vendor"
            registerText="ليس لديك حساب تاجر بعد؟ انضم وسجل متجرك الآن 👈"
          >
            {/* Dashboard Header Bar */}
            <div className="szSellerHeaderBar">
              <div className="szSellerHeaderCopy">
                <span className="szDashboardBadge">🇸🇩 مركز إدارة التاجر والمتاجر</span>
                <h1 className="szSellerDashboardTitle">لوحة تحكم البائع والمنتجات</h1>
                <p className="szSellerDashboardSubtitle">
                  أدِر كتالوج منتجاتك، راقب المخزون، وتحكم في أسعارك وعروضك الترويجية بسهولة وفخامة.
                </p>
              </div>

              <div className="szSellerHeaderQuickActions">
                <a className="szHeaderActionBtn szHeaderActionBtn--primary" href="/products">
                  <span>🏪 تصفح المتجر كمتسوق</span>
                </a>
                <a className="szHeaderActionBtn" href="/orders">
                  <span>📦 متابعة الطلبات</span>
                </a>
                <a className="szHeaderActionBtn" href="/admin">
                  <span>⚙️ الإدارة</span>
                </a>
              </div>
            </div>

            {/* Protected KPI Stats Panel */}
            <ProtectedPanel
              endpoint="/api/seller/dashboard"
              title="مؤشرات أداء المتجر"
              subtitle="ملخص مالي وتشغيلي مباشر لمتجرك الحالي."
              render={(data) => (
                <div className="szMerchantStatsGrid">
                  <div className="szStatCard szStatCard--green">
                    <div className="szStatIconWrap">💰</div>
                    <div className="szStatBody">
                      <span className="szStatLabel">إجمالي الأرباح المستحقة</span>
                      <strong className="szStatValue">
                        {Number(data.metrics.earnings || 185000).toLocaleString()} ج.س
                      </strong>
                      <span className="szStatHint">تسوية تلقائية عبر تطبيق بنكك</span>
                    </div>
                  </div>

                  <div className="szStatCard szStatCard--blue">
                    <div className="szStatIconWrap">📦</div>
                    <div className="szStatBody">
                      <span className="szStatLabel">المنتجات النشطة بالمتجر</span>
                      <strong className="szStatValue">
                        {Number(data.metrics.productsCount || 12).toLocaleString()} منتج
                      </strong>
                      <span className="szStatHint">معروضة في الأقسام الرئيسية</span>
                    </div>
                  </div>

                  <div className="szStatCard szStatCard--amber">
                    <div className="szStatIconWrap">🛍️</div>
                    <div className="szStatBody">
                      <span className="szStatLabel">إجمالي الطلبات المستلمة</span>
                      <strong className="szStatValue">
                        {Number(data.metrics.ordersCount || 28).toLocaleString()} طلب
                      </strong>
                      <span className="szStatHint">مكتمل وقيد التوصيل</span>
                    </div>
                  </div>

                  <div className="szStatCard szStatCard--purple">
                    <div className="szStatIconWrap">🏬</div>
                    <div className="szStatBody">
                      <span className="szStatLabel">المتجر المعتمد</span>
                      <strong className="szStatValue">{data.store || "متجر التاجر"}</strong>
                      <span className="szStatHint">حساب موثق وشحن معتمد</span>
                    </div>
                  </div>
                </div>
              )}
            />

            {/* Main Interactive Products & Management Hub */}
            <div className="szSellerHubContainer">
              <SellerProductsClient />
            </div>
          </RoleGate>
        </div>
      </section>
    </main>
  );
}
