"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const categoryImages = {
  "إلكترونيات": "/products/electronics.svg",
  "موبايلات": "/products/phones.svg",
  "كمبيوتر": "/products/computer.svg",
  "عطور": "/products/perfume.svg",
  "ملابس": "/products/fashion.svg",
  "أحذية": "/products/shoes.svg",
  "أدوات منزلية": "/products/home.svg",
  "سوبر ماركت": "/products/grocery.svg",
  "مستحضرات تجميل": "/products/beauty.svg",
  "قطع غيار السيارات": "/products/auto.svg",
};

const categoryTones = {
  "إلكترونيات": "is-indigo",
  "موبايلات": "is-blue",
  "كمبيوتر": "is-slate",
  "عطور": "is-plum",
  "ملابس": "is-amber",
  "أحذية": "is-emerald",
  "أدوات منزلية": "is-teal",
  "سوبر ماركت": "is-lime",
  "مستحضرات تجميل": "is-pink",
  "قطع غيار السيارات": "is-orange",
};

export default function CategoryStrip({ categories = [], categoryIcons = {} }) {
  const timerRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const items = useMemo(() => {
    const source = categories.length > 0 ? categories : Object.keys(categoryImages);

    return source.map((name) => ({
      name,
      icon: categoryIcons[name] || categoryImages[name] || categoryImages["إلكترونيات"],
      tone: categoryTones[name] || "is-default",
    }));
  }, [categories, categoryIcons]);

  const pages = useMemo(() => {
    const grouped = [];
    for (let index = 0; index < items.length; index += 2) {
      grouped.push(items.slice(index, index + 2));
    }
    return grouped;
  }, [items]);

  const goToPage = (index) => {
    if (!pages.length) return;
    const normalized = (index + pages.length) % pages.length;
    setActivePage(normalized);
  };

  useEffect(() => {
    if (pages.length <= 1) return undefined;

    const step = () => {
      if (isPaused) return;
      setActivePage((current) => (current + 1) % pages.length);
    };

    timerRef.current = window.setInterval(step, 3600);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [pages.length, isPaused]);

  return (
    <section className="noonCategoryStrip">
      <div className="container noonCategoryStripInner">
        <div className="noonCategoryDesktop" aria-label="التصنيفات">
          {items.map((item) => (
            <Link
              href={`/products?category=${encodeURIComponent(item.name)}`}
              className={`noonCategoryTile noonCategoryTile--compact ${item.tone}`}
              key={item.name}
            >
              <span className="noonCategoryIcon">
                <img src={item.icon} alt={item.name} />
              </span>
              <strong>{item.name}</strong>
            </Link>
          ))}
        </div>

        <div className="noonCategoryMobile" aria-label="التصنيفات للجوال">
          <div
            className="noonCategoryCarousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            <div className="noonCategoryCarouselPage" key={`page-${activePage}`}>
              {(pages[activePage] || []).map((item) => (
                <Link
                  href={`/products?category=${encodeURIComponent(item.name)}`}
                  className={`noonCategoryTile noonCategoryTile--compact noonCategoryTile--pair ${item.tone}`}
                  key={item.name}
                >
                  <span className="noonCategoryIcon">
                    <img src={item.icon} alt={item.name} />
                  </span>
                  <strong>{item.name}</strong>
                </Link>
              ))}
            </div>
          </div>

          {pages.length > 1 ? (
            <div className="noonCategoryDots" role="tablist" aria-label="مؤشر التصنيفات">
              {pages.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  className={`noonCategoryDot ${index === activePage ? "is-active" : ""}`}
                  onClick={() => goToPage(index)}
                  aria-label={`الانتقال إلى مجموعة التصنيفات ${index + 1}`}
                  aria-pressed={index === activePage}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
