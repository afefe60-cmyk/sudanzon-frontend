"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";

const categoryImages = {
  "إلكترونيات": "/products/electronics.jpg",
  "موبايلات": "/products/phones.jpg",
  "كمبيوتر": "/products/computer.jpg",
  "عطور": "/products/perfume.jpg",
  "ملابس": "/products/fashion.jpg",
  "أحذية": "/products/shoes.jpg",
  "أدوات منزلية": "/products/home.jpg",
  "سوبر ماركت": "/products/grocery.jpg",
  "مستحضرات تجميل": "/products/beauty.jpg",
  "قطع غيار السيارات": "/products/auto.jpg",
};

const categoryGradients = {
  "إلكترونيات": "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
  "موبايلات": "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
  "كمبيوتر": "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  "عطور": "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)",
  "ملابس": "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
  "أحذية": "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
  "أدوات منزلية": "linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)",
  "سوبر ماركت": "linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)",
  "مستحضرات تجميل": "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
  "قطع غيار السيارات": "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
};

export default function CategoryStrip({ categories = [], categoryIcons = {} }) {
  const scrollRef = useRef(null);

  const items = useMemo(() => {
    const source = categories.length > 0 ? categories : Object.keys(categoryImages);

    return source.map((name) => ({
      name,
      icon: categoryIcons[name] || categoryImages[name] || categoryImages["إلكترونيات"],
      bg: categoryGradients[name] || "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    }));
  }, [categories, categoryIcons]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="szCategoryStripSection" aria-label="أقسام التسوق">
      <div className="container szCategoryStripContainer">
        <div className="szCategoryHeaderRow">
          <div className="szCategoryTitleGroup">
            <h2 className="szCategoryMainTitle">تسوق حسب التصنيف</h2>
            <span className="szCategorySubtitle">اكتشف آلاف المنتجات عبر تصنيفاتنا المتنوعة</span>
          </div>
        </div>

        <div className="szCategoryTrack" ref={scrollRef}>
          {items.map((item) => (
            <Link
              href={`/products?category=${encodeURIComponent(item.name)}`}
              className="szCategoryCard"
              key={item.name}
            >
              <div className="szCategoryIconWrap" style={{ background: item.bg }}>
                <img src={item.icon} alt={item.name} loading="lazy" className="szCategoryIconImg" />
              </div>
              <span className="szCategoryName">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
