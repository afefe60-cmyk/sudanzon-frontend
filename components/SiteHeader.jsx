"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api";
import { readCart } from "../lib/cart";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "جميع المنتجات" },
  { href: "/products?q=عروض", label: "عروض اليوم", highlight: true },
  { href: "/orders", label: "متابعة الطلبات" },
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
  "قطع غيار السيارات",
];

const megaMenuGroups = [
  {
    icon: "⚡",
    title: "التصنيفات الرئيسية",
    links: categoryItems.map((item) => ({
      href: `/products?category=${encodeURIComponent(item)}`,
      label: item,
      icon: "📦",
    })),
  },
  {
    icon: "🔥",
    title: "أفضل العروض والخصومات",
    links: [
      { href: "/products?q=عرض", label: "تخفيضات كبرى", icon: "🏷️" },
      { href: "/products?sort=new", label: "وصل حديثًا للمنصة", icon: "🆕" },
      { href: "/products?sort=popular", label: "المنتجات الأكثر مبيعًا", icon: "⭐" },
      { href: "/products?q=شحن", label: "منتجات بشحن مجاني", icon: "🚚" },
    ],
  },
  {
    icon: "👤",
    title: "حسابك والطلبات",
    links: [
      { href: "/account", label: "الملف الشخصي والإعدادات", icon: "👤" },
      { href: "/orders", label: "سجل الطلبات والشحنات", icon: "📦" },
      { href: "/cart", label: "سلة المشتريات", icon: "🛒" },
    ],
  },
  {
    icon: "🏬",
    title: "التجار والمبيعات",
    links: [
      { href: "/seller", label: "لوحة تحكم البائع", icon: "🏪", roles: ["VENDOR", "ADMIN"] },
      { href: "/auth/vendor", label: "انضم كتاجر جديد", icon: "💼" },
      { href: "/admin", label: "إدارة النظام والمنصة", icon: "⚙️", roles: ["ADMIN"] },
    ],
  },
];

export default function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [cartBump, setCartBump] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    if (!token || !notificationId) return;

    try {
      await apiJson(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Keep UI responsive
    } finally {
      window.dispatchEvent(new Event("sudanzon-notifications-updated"));
    }
  };

  const markAllNotificationsRead = async () => {
    const token = window.localStorage.getItem("sudanzonToken");
    if (!token) return;

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

  const handleLogout = () => {
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
  };

  useEffect(() => {
    const syncCart = () => {
      const items = readCart();
      const newCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      setCartCount(newCount);
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
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
    if (!canSeeNotifications) return undefined;
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [canSeeNotifications, loadNotifications]);

  return (
    <header className="szSiteHeader">
      {/* Top Banner Bar */}
      <div className="szTopBanner">
        <div className="container szTopBannerInner">
          <div className="szBannerNotice">
            <span className="szNoticeBadge">🇸🇩 شحن محلي</span>
            <span>توصيل سريع لكافة المدن السودانية | الدفع عند الاستلام وبنكك</span>
          </div>
          <div className="szBannerLinks">
            <Link href="/seller" className="szBannerLink">كن بائعاً في سودان زون</Link>
            <span className="szBannerDivider">•</span>
            <Link href="/products?q=شحن" className="szBannerLink">خدمات الشحن</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="szMainNavbar">
        <div className="container szMainNavbarInner">
          {/* Logo & Location */}
          <div className="szBrandWrap">
            <Link href="/" className="szLogoLink" aria-label="الرئيسية - سودان زون">
              <img src="/logo.png" alt="سودان زون - SudanZon" className="szLogoImg" />
            </Link>

            <div className="szLocationChip" title="منطقة التوصيل المحددة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="szLocIcon">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="szLocText">
                <span className="szLocLabel">التوصيل إلى</span>
                <strong className="szLocCity">الخرطوم & السودان</strong>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form className="szSearchBar" action="/products" method="get">
            <div className="szSearchCatSelect">
              <select name="category" defaultValue="" aria-label="تصفية حسب التصنيف">
                <option value="">كل التصنيفات</option>
                {categoryItems.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="szSelectArrow">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            
            <div className="szSearchInputWrap">
              <input
                type="search"
                name="q"
                placeholder="ابحث عن منتج، متجر، أو تصنيف..."
                aria-label="البحث عن منتجات"
                autoComplete="off"
              />
            </div>

            <button type="submit" className="szSearchBtn" aria-label="تنفيذ البحث">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="szSearchBtnText">بحث</span>
            </button>
          </form>

          {/* Action Buttons (Account, Notifications, Cart) */}
          <div className="szNavActions">
            {currentUser ? (
              <div className="szUserMenuWrap">
                <Link className="szActionItem szUserItem" href="/account">
                  <div className="szActionIcon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="szActionText">
                    <span className="szActionSub">مرحباً بك</span>
                    <strong className="szActionMain">{currentUser.name?.split(" ")[0] || "حسابي"}</strong>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="szLogoutMiniBtn"
                  title="تسجيل الخروج"
                  aria-label="تسجيل الخروج"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link className="szActionItem" href="/auth/login">
                <div className="szActionIcon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="szActionText">
                  <span className="szActionSub">مرحباً، تفضل</span>
                  <strong className="szActionMain">تسجيل الدخول</strong>
                </div>
              </Link>
            )}

            <Link className="szActionItem szOrdersItem" href="/orders">
              <div className="szActionIcon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div className="szActionText">
                <span className="szActionSub">تتبع</span>
                <strong className="szActionMain">الطلبات</strong>
              </div>
            </Link>

            {canSeeNotifications && (
              <div className="szNotificationWrap">
                <button
                  type="button"
                  className="szActionItem szNotifBtn"
                  onClick={() => setNotificationsOpen((v) => !v)}
                  aria-expanded={notificationsOpen}
                  aria-label="الإشعارات والتنبيهات"
                >
                  <div className="szActionIcon szNotifIconWrap">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="szNotifBadge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    )}
                  </div>
                  <div className="szActionText">
                    <span className="szActionSub">التنبيهات</span>
                    <strong className="szActionMain">الإشعارات</strong>
                  </div>
                </button>

                {notificationsOpen && (
                  <div className="szNotifDropdown">
                    <div className="szNotifDropdownHeader">
                      <strong>الإشعارات الأخيرة</strong>
                      <button type="button" onClick={markAllNotificationsRead} className="szNotifReadAllBtn">
                        قراءة الكل
                      </button>
                    </div>
                    <div className="szNotifList">
                      {notificationsLoading ? (
                        <p className="szNotifEmpty">جارِ تحميل الإشعارات...</p>
                      ) : notifications.length > 0 ? (
                        notifications.map((item) => (
                          <Link
                            key={item.id}
                            href={item.payload?.orderUrl || item.payload?.reviewUrl || "/account"}
                            className={`szNotifItem ${item.readAt ? "" : "is-unread"}`}
                            onClick={() => {
                              markNotificationRead(item.id);
                              setNotificationsOpen(false);
                            }}
                          >
                            <div className="szNotifDot" />
                            <div className="szNotifContent">
                              <strong className="szNotifTitle">{item.title}</strong>
                              <p className="szNotifMsg">{item.message}</p>
                              <time className="szNotifTime">
                                {new Date(item.createdAt).toLocaleString("ar-SD", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </time>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="szNotifEmpty">لا توجد إشعارات حالياً</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <Link className={`szCartAction ${cartBump ? "is-bump" : ""}`} href="/cart" aria-label="سلة التسوق">
              <div className="szCartIconWrap">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="szCartCount">{cartCount}</span>
              </div>
              <div className="szCartText">
                <span className="szCartLabel">السلة</span>
                <strong className="szCartPrompt">المشتريات</strong>
              </div>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="szMobileMenuBtn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة الرئيسية"
              aria-expanded={mobileMenuOpen}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Subnav & Mega Menu Strip */}
      <nav className="szSubnav" aria-label="التنقل الثانوي">
        <div className="container szSubnavInner">
          <div className="szSubnavRight">
            <button
              type="button"
              className={`szMegaToggleBtn ${megaOpen ? "is-active" : ""}`}
              onClick={() => setMegaOpen(!megaOpen)}
              aria-expanded={megaOpen}
            >
              <span className="szMegaIcon">☰</span>
              <span>كل الأقسام</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className={`szChevron ${megaOpen ? "is-flipped" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div className="szNavLinks">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`szNavLink ${item.highlight ? "is-highlight" : ""}`}
                >
                  {item.highlight && <span className="szFireIcon">🔥</span>}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="szSubnavLeft">
            <span className="szHelpBadge">📞 خدمة العملاء والدعم الفني متاحة 24/7</span>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {megaOpen && (
          <>
            <div className="szMegaMenuModal">
              <div className="container szMegaGrid">
                {visibleMegaMenuGroups.map((group) => (
                  <div className="szMegaGroup" key={group.title}>
                    <div className="szMegaGroupHeader">
                      <span className="szGroupIcon">{group.icon}</span>
                      <strong className="szGroupTitle">{group.title}</strong>
                    </div>
                    <ul className="szGroupList">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="szGroupLink"
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className="szLinkIcon">{link.icon || "•"}</span>
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="szMegaBackdrop" onClick={() => setMegaOpen(false)} />
          </>
        )}
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="szMobileDrawer">
          <div className="szDrawerHeader">
            <strong>قائمة سودان زون</strong>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="szDrawerClose">
              ✕
            </button>
          </div>
          <div className="szDrawerBody">
            <div className="szDrawerSection">
              <span className="szDrawerHeading">روابط سريعة</span>
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="szDrawerLink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="szDrawerSection">
              <span className="szDrawerHeading">التصنيفات</span>
              {categoryItems.map((cat) => (
                <Link
                  key={cat}
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  className="szDrawerLink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📦 {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
