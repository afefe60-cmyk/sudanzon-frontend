"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";
import { readCart } from "../lib/cart";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/cart", label: "السلة" },
  { href: "/account", label: "حسابي" },
  { href: "/orders", label: "طلباتي" },
  { href: "/seller", label: "لوحة البائع", roles: ["VENDOR", "ADMIN"] },
  { href: "/admin", label: "لوحة الإدارة", roles: ["ADMIN"] },
];

const categoryItems = [
  "إلكترونيات",
  "موبايلات",
  "كمبيوتر",
  "عطور",
  "ملابس",
  "أحذية",
  "أدوات منزلية",
  "سوبر ماركت",
  "مستحضرات تجميل",
];

const megaMenuGroups = [
  {
    icon: "⚡",
    title: "الأقسام السريعة",
    links: categoryItems.map((item) => ({
      href: `/products?category=${encodeURIComponent(item)}`,
      label: item,
      icon: "▸",
    })),
  },
  {
    icon: "✨",
    title: "اختصارات التسوق",
    links: [
      { href: "/products?q=عروض", label: "عروض اليوم", icon: "🏷️" },
      { href: "/products?q=جديد", label: "وصل حديثًا", icon: "🆕" },
      { href: "/products?q=الأكثر", label: "الأكثر مبيعًا", icon: "🔥" },
      { href: "/products?q=شحن", label: "شحن سريع", icon: "🚚" },
    ],
  },
  {
    icon: "👤",
    title: "حسابك",
    links: [
      { href: "/account", label: "الملف الشخصي", icon: "👤" },
      { href: "/orders", label: "الطلبات", icon: "📦" },
      { href: "/cart", label: "السلة", icon: "🛒" },
      { href: "/seller", label: "لوحة البائع", icon: "🏪", roles: ["VENDOR", "ADMIN"] },
    ],
  },
  {
    icon: "🏬",
    title: "ابدأ البيع",
    links: [
      { href: "/seller", label: "إنشاء متجر", icon: "⭐", roles: ["VENDOR", "ADMIN"] },
      { href: "/auth/vendor", label: "طلبات البائعين", icon: "➕", roles: ["ADMIN"] },
      { href: "/admin", label: "إدارة المنصة", icon: "⚙️", roles: ["ADMIN"] },
      { href: "/products", label: "استعراض المتاجر", icon: "✅" },
    ],
  },
];

export default function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [megaOpen, setMegaOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const canSeeItem = (item) => !item.roles || (currentRole && item.roles.includes(currentRole));
  const canSeeNotifications = Boolean(currentUser && ["ADMIN", "VENDOR"].includes(currentRole));
  const visibleNavItems = useMemo(() => navItems.filter(canSeeItem), [currentRole]);
  const visibleMegaMenuGroups = useMemo(
    () =>
      megaMenuGroups
        .map((group) => ({
          ...group,
          links: group.links.filter(canSeeItem),
        }))
        .filter((group) => group.links.length > 0),
    [currentRole]
  );
  const megaSummary = useMemo(
    () => visibleMegaMenuGroups.flatMap((group) => group.links).slice(0, 6),
    [visibleMegaMenuGroups]
  );

  const loadNotifications = useCallback(async () => {
    if (!canSeeNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const token = window.localStorage.getItem("sudanzonToken");
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setNotificationsLoading(true);
    try {
      const result = await apiJson("/api/notifications?limit=6", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(result.items || []);
      setUnreadCount(Number(result.unreadCount || 0));
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, [canSeeNotifications]);

  const markNotificationRead = async (notificationId) => {
    const token = window.localStorage.getItem("sudanzonToken");
    if (!token || !notificationId) {
      return;
    }

    try {
      await apiJson(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Keep the UI responsive even if the request fails.
    } finally {
      window.dispatchEvent(new Event("sudanzon-notifications-updated"));
    }
  };

  const markAllNotificationsRead = async () => {
    const token = window.localStorage.getItem("sudanzonToken");
    if (!token) {
      return;
    }

    try {
      await apiJson("/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      window.dispatchEvent(new Event("sudanzon-notifications-updated"));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const syncCart = () => {
      const items = readCart();
      setCartCount(items.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    };

    const syncRole = () => {
      try {
        const stored = window.localStorage.getItem("sudanzonUser");
        const parsed = stored ? JSON.parse(stored) : null;
        setCurrentUser(parsed);
        setCurrentRole(parsed?.role || null);
      } catch {
        setCurrentUser(null);
        setCurrentRole(null);
      }
    };

    syncCart();
    syncRole();

    window.addEventListener("storage", syncCart);
    window.addEventListener("storage", syncRole);
    window.addEventListener("sudanzon-cart-updated", syncCart);
    window.addEventListener("sudanzon-user-updated", syncRole);
    window.addEventListener("sudanzon-notifications-updated", loadNotifications);
    window.addEventListener("focus", loadNotifications);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("storage", syncRole);
      window.removeEventListener("sudanzon-cart-updated", syncCart);
      window.removeEventListener("sudanzon-user-updated", syncRole);
      window.removeEventListener("sudanzon-notifications-updated", loadNotifications);
      window.removeEventListener("focus", loadNotifications);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!canSeeNotifications) {
      return undefined;
    }

    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [canSeeNotifications, loadNotifications]);

  return (
    <header className="siteHeader amazonHeader">
      <div className="amazonTopbar">
        <div className="container amazonTopbarInner">
          <Link href="/" className="amazonLogo" aria-label="سودان زون">
            <img src="/logo.png" alt="SudanZon" />
          </Link>

          <div className="amazonLocation">
            <span className="amazonEyebrow">التوصيل إلى</span>
            <strong>الخرطوم</strong>
          </div>

          <form className="amazonSearch" action="/products" method="get" aria-label="البحث في سودان زون">
            <select className="amazonSearchCategory" name="category" defaultValue="">
              <option value="">الكل</option>
              <option>إلكترونيات</option>
              <option>موبايلات</option>
              <option>عطور</option>
              <option>ملابس</option>
            </select>
            <input
              type="search"
              name="q"
              placeholder="ابحث عن منتج أو متجر أو تصنيف"
              aria-label="ابحث عن منتج"
            />
            <button type="submit" className="amazonSearchBtn">
              بحث
            </button>
          </form>

          <div className="amazonActions">
            {currentUser ? (
              <Link className="amazonActionLink" href="/account">
                <span>مرحبًا</span>
                <strong>{currentUser.name || "مستخدم"}</strong>
              </Link>
            ) : (
              <Link className="amazonActionLink" href="/auth/login">
                <span>مرحبًا</span>
                <strong>دخول</strong>
              </Link>
            )}
            <Link className="amazonActionLink" href="/orders">
              <span>الطلبات</span>
              <strong>متابعة</strong>
            </Link>
            {canSeeNotifications ? (
              <div className="amazonNotificationsWrap">
                <button
                  type="button"
                  className="amazonActionLink amazonNotificationButton"
                  onClick={() => setNotificationsOpen((value) => !value)}
                  aria-expanded={notificationsOpen}
                  aria-label="الإشعارات"
                >
                  <span>الإشعارات</span>
                  <strong>تنبيهات</strong>
                  {unreadCount > 0 ? <span className="amazonNotificationBadge">{unreadCount}</span> : null}
                </button>

                {notificationsOpen ? (
                  <div className="amazonNotificationMenu">
                    <div className="amazonNotificationMenuHeader">
                      <strong>الإشعارات</strong>
                      <button type="button" onClick={markAllNotificationsRead}>
                        تعيين الكل كمقروء
                      </button>
                    </div>

                    <div className="amazonNotificationList">
                      {notificationsLoading ? (
                        <p className="amazonNotificationEmpty">جارِ تحميل الإشعارات...</p>
                      ) : notifications.length ? (
                        notifications.map((item) => (
                          <Link
                            key={item.id}
                            href={item.payload?.orderUrl || item.payload?.reviewUrl || "/account"}
                            className={`amazonNotificationItem ${item.readAt ? "" : "is-unread"}`}
                            onClick={() => {
                              markNotificationRead(item.id);
                              setNotificationsOpen(false);
                            }}
                          >
                            <strong>{item.title}</strong>
                            <span>{item.message}</span>
                            <small>
                              {new Date(item.createdAt).toLocaleString("ar-SD", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </small>
                          </Link>
                        ))
                      ) : (
                        <p className="amazonNotificationEmpty">لا توجد إشعارات جديدة.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {currentUser ? (
              <button
                type="button"
                className="amazonActionLink amazonLogoutAction"
                onClick={() => {
                  window.localStorage.removeItem("sudanzonToken");
                  window.localStorage.removeItem("sudanzonUser");
                  setCurrentUser(null);
                  setCurrentRole(null);
                  setNotifications([]);
                  setUnreadCount(0);
                  setNotificationsOpen(false);
                  window.dispatchEvent(new Event("sudanzon-user-updated"));
                  window.dispatchEvent(new Event("sudanzon-cart-updated"));
                  window.location.href = "/";
                }}
              >
                <span>الحساب</span>
                <strong>تسجيل خروج</strong>
              </button>
            ) : null}
            <Link className="amazonCart" href="/cart">
              السلة
              <span className="amazonCartBadge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="amazonSubnav">
        <div className="container amazonSubnavInner">
          <div className="amazonSubnavTop">
            <button
              type="button"
              className={`amazonMegaButton ${megaOpen ? "is-open" : ""}`}
              onClick={() => setMegaOpen((value) => !value)}
              aria-expanded={megaOpen}
              aria-controls="sudanzon-mega-menu"
              aria-label="فتح قائمة الأقسام"
            >
              <span className="amazonMegaButtonIcon" aria-hidden="true">
                ☰
              </span>
            </button>

            <nav className="amazonNavLinks" aria-label="التنقل الرئيسي">
              {visibleNavItems.map((item) => (
                <Link key={item.href} href={item.href} className="amazonNavLink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={`amazonMegaMenu ${megaOpen ? "is-open" : ""}`} id="sudanzon-mega-menu">
            {visibleMegaMenuGroups.map((group) => (
              <div className="amazonMegaCol" key={group.title}>
                <div className="amazonMegaColHeader">
                  <span className="amazonMegaColIcon" aria-hidden="true">
                    {group.icon}
                  </span>
                  <strong>{group.title}</strong>
                </div>
                <div className="amazonMegaLinks">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="amazonMegaLink"
                      onClick={() => setMegaOpen(false)}
                    >
                      <span className="amazonMegaLinkIcon" aria-hidden="true">
                        {link.icon || "▸"}
                      </span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {megaOpen ? (
            <button
              type="button"
              className="amazonMegaBackdrop"
              onClick={() => setMegaOpen(false)}
              aria-label="إغلاق قائمة الأقسام"
            >
              <span className="amazonMegaBackdropInner">
                {megaSummary.map((item) => (
                  <span key={item.href} className="amazonMegaBackdropChip">
                    {item.label}
                  </span>
                ))}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
