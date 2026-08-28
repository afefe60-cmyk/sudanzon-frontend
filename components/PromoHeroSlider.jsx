"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    id: 1,
    tag: "🔥 مهرجان التوفير الأكبر",
    title: "أقوى عروض الموسم وخصومات حتى 45%",
    subtitle: "تسوق أفضل الهواتف، العطور الفاخرة، والإلكترونيات مع شحن فوري ودفع عند الاستلام وبنكك.",
    image: "/banners/hero-1.jpg",
    ctaPrimary: { label: "تسوق العروض الآن", href: "/products?q=عروض" },
    ctaSecondary: { label: "وصل حديثاً ✨", href: "/products?sort=new" },
    badgeText: "خصم يصل 45%",
    accentColor: "#fbbf24",
  },
  {
    id: 2,
    tag: "⚡ عالم التكنولوجيا والابتكار",
    title: "أحدث الأجهزة الذكية واللابتوبات الأصلية",
    subtitle: "اكتشف أحدث الهواتف الذكية والساعات وسماعات الصوت الفاخرة بضمان معتمد وأفضل الأسعار في السوق.",
    image: "/banners/hero-2.jpg",
    ctaPrimary: { label: "استكشف الأجهزة", href: "/products?category=إلكترونيات" },
    ctaSecondary: { label: "تصفح الموبايلات", href: "/products?category=موبايلات" },
    badgeText: "أجهزة أصلية 100%",
    accentColor: "#38bdf8",
  },
  {
    id: 3,
    tag: "👑 الأناقة والعطور الملكية",
    title: "عطور شرقية فاخرة ومقتنيات مميزة",
    subtitle: "تشكيلة حصرية من أرقى العطور والعود الملكي والأزياء العصرية لتكتمل إطلالتك في كل مناسبة.",
    image: "/banners/hero-3.jpg",
    ctaPrimary: { label: "تسوق العطور", href: "/products?category=عطور" },
    ctaSecondary: { label: "أزياء وأحذية", href: "/products?category=ملابس" },
    badgeText: "ثبات وفوحان راقٍ",
    accentColor: "#f472b6",
  },
];

export default function PromoHeroSlider() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const duration = 6500; // ms per slide
  const stepTime = 50;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
    }, stepTime);

    timerRef.current = setInterval(() => {
      setActive((curr) => (curr + 1) % slides.length);
      setProgress(0);
    }, duration);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [active]);

  const goToSlide = (idx) => {
    setActive((idx + slides.length) % slides.length);
  };

  const pause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const resume = () => {
    resetTimer();
  };

  const slide = slides[active];

  return (
    <section className="szHeroMasterSection">
      <div className="container">
        <div className="szHeroMasterGrid">
          {/* Main Large Slider (70%) */}
          <div
            className="szHeroMainSlider"
            onMouseEnter={pause}
            onMouseLeave={resume}
          >
            <div className="szHeroSlideBgWrap">
              <img
                src={slide.image}
                alt={slide.title}
                className="szHeroSlideBgImg"
                key={`bg-${slide.id}`}
              />
              <div className="szHeroSlideOverlay" />
            </div>

            <div className="szHeroSlideContent">
              <div className="szHeroTopPills">
                <span className="szHeroPillBadge" style={{ borderColor: slide.accentColor, color: slide.accentColor }}>
                  {slide.tag}
                </span>
                <span className="szHeroDiscountPill">{slide.badgeText}</span>
              </div>

              <h1 className="szHeroMainHeading">{slide.title}</h1>
              <p className="szHeroMainSubtitle">{slide.subtitle}</p>

              <div className="szHeroMainActions">
                <Link className="szHeroCtaPrimary" href={slide.ctaPrimary.href}>
                  <span>{slide.ctaPrimary.label}</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </Link>
                <Link className="szHeroCtaSecondary" href={slide.ctaSecondary.href}>
                  {slide.ctaSecondary.label}
                </Link>
              </div>

              {/* Quick Perks Bar */}
              <div className="szHeroPerks">
                <div className="szHeroPerk">
                  <span className="szPerkIcon">🚚</span>
                  <span>توصيل لكافة المدن</span>
                </div>
                <div className="szHeroPerk">
                  <span className="szPerkIcon">💵</span>
                  <span>الدفع عند الاستلام وبنكك</span>
                </div>
                <div className="szHeroPerk">
                  <span className="szPerkIcon">🛡️</span>
                  <span>ضمان استبدال وإرجاع</span>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <button
              type="button"
              onClick={() => goToSlide(active - 1)}
              className="szHeroNavArrow szHeroNavArrow--prev"
              aria-label="الشريحة السابقة"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goToSlide(active + 1)}
              className="szHeroNavArrow szHeroNavArrow--next"
              aria-label="الشريحة التالية"
            >
              ›
            </button>

            {/* Modern Indicators with Progress */}
            <div className="szHeroNavIndicators">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`szHeroTabIndicator ${idx === active ? "is-active" : ""}`}
                  aria-label={`الانتقال إلى ${s.title}`}
                >
                  <span className="szTabNumber">0{idx + 1}</span>
                  {idx === active && (
                    <div className="szTabProgressBar">
                      <div className="szTabProgressFill" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Side Highlights Column (30%) */}
          <aside className="szHeroSideDeals">
            {/* Side Card 1 */}
            <Link href="/products?category=أحذية" className="szSideDealCard szSideDealCard--gold">
              <div className="szSideCardImageWrap">
                <img src="/banners/side-1.jpg" alt="عروض الأحذية الرياضية" />
                <span className="szSideBadge">خصم 35%</span>
              </div>
              <div className="szSideCardBody">
                <span className="szSideSuperTag">صفقة اليوم السريعة 🔥</span>
                <strong className="szSideTitle">أحذية رياضية وسنيكرز أصلية</strong>
                <div className="szSideActionRow">
                  <span className="szSidePrice">تبدأ من 27,000 ج.س</span>
                  <span className="szSideLinkText">تسوق الآن ❯</span>
                </div>
              </div>
            </Link>

            {/* Side Card 2 */}
            <Link href="/products?category=إلكترونيات" className="szSideDealCard szSideDealCard--tech">
              <div className="szSideCardImageWrap">
                <img src="/banners/side-2.jpg" alt="ساعات ذكية وإلكترونيات" />
                <span className="szSideBadge szSideBadge--blue">جديد</span>
              </div>
              <div className="szSideCardBody">
                <span className="szSideSuperTag">الأكثر طلباً ⚡</span>
                <strong className="szSideTitle">ساعات ذكية وملحقات هواتف</strong>
                <div className="szSideActionRow">
                  <span className="szSidePrice">تبدأ من 18,500 ج.س</span>
                  <span className="szSideLinkText">استكشف ❯</span>
                </div>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
