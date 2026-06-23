"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readCart } from "../lib/cart";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/cart", label: "السلة" },
  { href: "/account", label: "حسابي" },
  { href: "/orders", label: "طلباتي" },
  { href: "/seller", label: "لوحة البائع" },
  { href: "/admin", label: "لوحة الإدارة" },
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
      { href: "/seller", label: "لوحة البائع", icon: "🏪" },
    ],
  },
  {
    icon: "🏬",
    title: "ابدأ البيع",
    links: [
      { href: "/seller", label: "إنشاء متجر", icon: "⭐" },
      { href: "/auth/vendor", label: "طلبات البائعين", icon: "➕" },
      { href: "/admin", label: "إدارة المنصة", icon: "⚙️" },
      { href: "/products", label: "استعراض المتاجر", icon: "✅" },
    ],
  },
];

export default function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [megaOpen, setMegaOpen] = useState(false);

  const megaSummary = useMemo(() => megaMenuGroups.flatMap((group) => group.links).slice(0, 6), []);

  useEffect(() => {
    const syncCart = () => {
      const items = readCart();
      setCartCount(items.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("sudanzon-cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("sudanzon-cart-updated", syncCart);
    };
  }, []);

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
            <Link className="amazonActionLink" href="/auth/login">
              <span>مرحبًا</span>
              <strong>دخول</strong>
            </Link>
            <Link className="amazonActionLink" href="/orders">
              <span>الطلبات</span>
              <strong>متابعة</strong>
            </Link>
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
              <span className="amazonMegaButtonIcon" aria-hidden="true">☰</span>
            </button>

            <nav className="amazonNavLinks" aria-label="التنقل الرئيسي">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="amazonNavLink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={`amazonMegaMenu ${megaOpen ? "is-open" : ""}`} id="sudanzon-mega-menu">
            {megaMenuGroups.map((group) => (
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
