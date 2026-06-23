"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    badge: "عروض موسمية",
    title: "عروض قوية لهذا الأسبوع",
    description: "خصومات مختارة على المنتجات الأكثر طلبًا مع تجربة تصفح سريعة وواضحة على الكمبيوتر والجوال.",
    image: "/banners/hero-1.svg",
    ctaPrimary: { label: "تسوق العروض", href: "/products?q=عرض" },
    ctaSecondary: { label: "منتجات جديدة", href: "/products?sort=new" },
    stats: [
      { label: "خصومات", value: "حتى 35%", image: "/icons/discount.svg" },
      { label: "الدفع", value: "عند الاستلام", image: "/icons/cash.svg" },
    ],
  },
  {
    badge: "منتجات مختارة",
    title: "أفضل المنتجات تحت نظرة واحدة",
    description: "بطاقات واضحة للمنتجات المميزة مع إبراز السعر والمخزون، لتسهيل قرار الشراء بسرعة.",
    image: "/products/electronics.svg",
    ctaPrimary: { label: "استعرض المنتجات", href: "/products" },
    ctaSecondary: { label: "الأكثر مبيعًا", href: "/products?sort=popular" },
    stats: [
      { label: "المنتجات", value: "إضافة يومية", image: "/icons/product.svg" },
      { label: "التقييم", value: "مختار بعناية", image: "/icons/rating.svg" },
    ],
  },
  {
    badge: "متاجر مميزة",
    title: "تجار موثوقون بعرض أقوى",
    description: "اعرض متاجر البائعين بصورة راقية مع إبراز اسم المتجر والنشاط والعروض الخاصة.",
    image: "/banners/hero-2.svg",
    ctaPrimary: { label: "افتح متجرًا", href: "/auth/vendor" },
    ctaSecondary: { label: "المتاجر", href: "/seller" },
    stats: [
      { label: "التجار", value: "داخل المنصة", image: "/icons/store.svg" },
      { label: "العرض", value: "احترافي", image: "/icons/product.svg" },
    ],
  },
  {
    badge: "شركاء الخدمة",
    title: "شحن وتوصيل وشركات موثوقة",
    description: "مساحة مناسبة لعرض الشركات الداعمة وخدمات التوصيل داخل السودان بشكل أنيق وواضح.",
    image: "/banners/hero-3.svg",
    ctaPrimary: { label: "خدمات الشحن", href: "/shipping" },
    ctaSecondary: { label: "أقسام سريعة", href: "/products" },
    stats: [
      { label: "الشحن", value: "حسب المدينة", image: "/icons/shipping.svg" },
      { label: "الخدمة", value: "سريعة", image: "/icons/cash.svg" },
    ],
  },
];

export default function PromoHeroSlider() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    timerRef.current = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const goToSlide = (index) => {
    const normalized = (index + slides.length) % slides.length;
    setActive(normalized);
  };

  const pause = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resume = () => {
    if (timerRef.current || slides.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);
  };

  const slide = slides[active];

  return (
    <section className="noonPromoHeroSliderSection">
      <div
        className="noonPromoHeroSlider"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        <article className="noonPromoHeroSlide">
          <div className="noonPromoHeroContent">
            <span className="noonPromoHeroBadge">{slide.badge}</span>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>

            <div className="noonPromoHeroActions">
              <Link className="noonHeroPrimaryBtn" href={slide.ctaPrimary.href}>
                {slide.ctaPrimary.label}
              </Link>
              <Link className="noonHeroSecondaryBtn" href={slide.ctaSecondary.href}>
                {slide.ctaSecondary.label}
              </Link>
            </div>

            <div className="noonPromoHeroStats">
              {slide.stats.map((item) => (
                <div className="noonPromoHeroStat" key={`${slide.title}-${item.label}`}>
                  <div className="noonPromoHeroStatThumb">
                    <img src={item.image} alt={item.label} />
                  </div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="noonPromoHeroVisual">
            <div className="noonPromoHeroVisualFrame">
              <img src={slide.image} alt={slide.title} />
            </div>
            <div className="noonPromoHeroSideCards">
              <div className="noonPromoHeroSideCard is-highlight">
                <div className="noonPromoHeroSideCardThumb">
                  <img src="/icons/store.svg" alt="" aria-hidden="true" />
                </div>
                <span>سودان زون</span>
                <strong>واجهة جاهزة للعرض التجاري الاحترافي</strong>
              </div>
              <div className="noonPromoHeroSideCard">
                <div className="noonPromoHeroSideCardThumb">
                  <img src="/icons/product.svg" alt="" aria-hidden="true" />
                </div>
                <span>الصفحة الرئيسية</span>
                <strong>مساحة مناسبة للإعلانات والهوية التجارية</strong>
              </div>
            </div>
          </div>
        </article>

        <button className="noonPromoHeroArrow is-prev" type="button" onClick={() => goToSlide(active - 1)} aria-label="الشريحة السابقة">
          ‹
        </button>
        <button className="noonPromoHeroArrow is-next" type="button" onClick={() => goToSlide(active + 1)} aria-label="الشريحة التالية">
          ›
        </button>

        <div className="noonPromoHeroDots" role="tablist" aria-label="شرائح الهيرو">
          {slides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={`noonPromoHeroDot ${index === active ? "is-active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`الانتقال إلى ${item.title}`}
              aria-pressed={index === active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
