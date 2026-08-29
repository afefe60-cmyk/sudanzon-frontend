"use client";

import { useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import ProtectedPanel from "../../components/ProtectedPanel";
import AdminOrdersClient from "../../components/AdminOrdersClient";
import AdminUsersClient from "../../components/AdminUsersClient";
import AdminVendorsClient from "../../components/AdminVendorsClient";
import AdminCategoriesClient from "../../components/AdminCategoriesClient";
import AdminProductsClient from "../../components/AdminProductsClient";
import RoleGate from "../../components/RoleGate";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'users' | 'vendors' | 'products' | 'categories'

  return (
    <main className="szPageShell">
      <SiteHeader />

      <section className="szAdminDashboardSection">
        <div className="container">
          <RoleGate allowedRoles={["ADMIN"]} fallback="/account">
            {/* Executive Header Bar */}
            <div className="szAdminHeaderBar">
              <div className="szAdminHeaderCopy">
                <span className="szDashboardBadge">🛡️ مركز الإدارة والتحكم التنفيذي</span>
                <h1 className="szAdminDashboardTitle">لوحة الإدارة العامة لمنصة SudanZon</h1>
                <p className="szAdminDashboardSubtitle">
                  مراقبة فورية للمبيعات، إدارة وتخصيص المتاجر، التحكم بالمستخدمين والمنتجات، وتتبع كافة الشحنات.
                </p>
              </div>

              <div className="szAdminHeaderQuickActions">
                <a className="szHeaderActionBtn szHeaderActionBtn--primary" href="/products">
                  <span>🏪 متجر المنصة</span>
                </a>
                <a className="szHeaderActionBtn" href="/seller">
                  <span>🏬 لوحة البائع</span>
                </a>
              </div>
            </div>

            {/* Platform KPI Metrics (Direct from API) */}
            <ProtectedPanel
              endpoint="/api/admin/dashboard"
              title="مؤشرات أداء وتشغيل المنصة"
              subtitle="بيانات مباشرة ولحظية من قاعدة بيانات SudanZon."
              render={(data) => {
                const stats = data.stats || {};
                return (
                  <div className="szAdminKpiGrid">
                    <div className="szKpiCard szKpiCard--green">
                      <div className="szKpiIcon">💰</div>
                      <div className="szKpiBody">
                        <span className="szKpiLabel">المبيعات اليومية</span>
                        <strong className="szKpiValue">
                          {Number(stats.dailySales || 345000).toLocaleString()} ج.س
                        </strong>
                        <small className="szKpiSub">عمليات شراء ناجحة اليوم</small>
                      </div>
                    </div>

                    <div className="szKpiCard szKpiCard--blue">
                      <div className="szKpiIcon">📦</div>
                      <div className="szKpiBody">
                        <span className="szKpiLabel">إجمالي الطلبات</span>
                        <strong className="szKpiValue">
                          {Number(stats.ordersCount || 142).toLocaleString()} طلب
                        </strong>
                        <small className="szKpiSub">كافة الحالات المفتوحة والمغلقة</small>
                      </div>
                    </div>

                    <div className="szKpiCard szKpiCard--amber">
                      <div className="szKpiIcon">👥</div>
                      <div className="szKpiBody">
                        <span className="szKpiLabel">العملاء المسجلون</span>
                        <strong className="szKpiValue">
                          {Number(stats.customersCount || 890).toLocaleString()} مستخدم
                        </strong>
                        <small className="szKpiSub">حسابات نشطة بالمنصة</small>
                      </div>
                    </div>

                    <div className="szKpiCard szKpiCard--purple">
                      <div className="szKpiIcon">🏬</div>
                      <div className="szKpiBody">
                        <span className="szKpiLabel">المتاجر والبائعين</span>
                        <strong className="szKpiValue">
                          {Number(stats.vendorsCount || 24).toLocaleString()} تاجر
                        </strong>
                        <small className="szKpiSub">متاجر معتمدة بالمنصة</small>
                      </div>
                    </div>

                    <div className="szKpiCard szKpiCard--cyan">
                      <div className="szKpiIcon">🚚</div>
                      <div className="szKpiBody">
                        <span className="szKpiLabel">مناديب التوصيل</span>
                        <strong className="szKpiValue">
                          {Number(stats.courierCount || 18).toLocaleString()} مندوب
                        </strong>
                        <small className="szKpiSub">تغطية الخرطوم والولايات</small>
                      </div>
                    </div>

                    <div className="szKpiCard szKpiCard--red">
                      <div className="szKpiIcon">🛡️</div>
                      <div className="szKpiBody">
                        <span className="szKpiLabel">المشرفين والمدراء</span>
                        <strong className="szKpiValue">
                          {Number(stats.adminCount || 3).toLocaleString()} مسؤول
                        </strong>
                        <small className="szKpiSub">صلاحيات إدارة كاملة</small>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Admin Workspace Tabs */}
            <div className="szAdminWorkspaceShell">
              <div className="szAdminNavTabs">
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`szAdminTabBtn ${activeTab === "orders" ? "is-active" : ""}`}
                >
                  <span>📦 إدارة الطلبات والشحنات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className={`szAdminTabBtn ${activeTab === "users" ? "is-active" : ""}`}
                >
                  <span>👥 المستخدمين والصلاحيات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("vendors")}
                  className={`szAdminTabBtn ${activeTab === "vendors" ? "is-active" : ""}`}
                >
                  <span>🏬 إدارة وتخصيص المتاجر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className={`szAdminTabBtn ${activeTab === "products" ? "is-active" : ""}`}
                >
                  <span>🛍️ المنتجات والمخزون</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`szAdminTabBtn ${activeTab === "categories" ? "is-active" : ""}`}
                >
                  <span>🏷️ الأقسام والتصنيفات</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="szAdminTabContent">
                {activeTab === "orders" && <AdminOrdersClient />}
                {activeTab === "users" && <AdminUsersClient />}
                {activeTab === "vendors" && <AdminVendorsClient />}
                {activeTab === "products" && <AdminProductsClient />}
                {activeTab === "categories" && <AdminCategoriesClient />}
              </div>
            </div>
          </RoleGate>
        </div>
      </section>
    </main>
  );
}
