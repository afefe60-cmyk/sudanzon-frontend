"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="szFooter" dir="rtl">
      <div className="container szFooterInner">
        {/* Brand & Social Column */}
        <div className="szFooterBrand">
          <Link href="/" className="szFooterLogoLink">
            <img src="/logo.png" alt="سودان زون" className="szFooterLogoImg" />
          </Link>
          <p className="szFooterDesc">
            المنصة السودانية الأولى المتكاملة للتجارة الإلكترونية متعددة البائعين. نربط التجار بالمشترين في بيئة آمنة وسهلة مع شحن لكافة الولايات والدفع عند الاستلام وبنكك.
          </p>

          {/* Social Media Strip */}
          <div className="szSocialMediaBlock">
            <span className="szSocialTitle">تابعنا وتواصل معنا عبر:</span>
            <div className="szSocialIconsRow">
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@sudanzon"
                target="_blank"
                rel="noopener noreferrer"
                className="szSocialBtn szSocialBtn--tiktok"
                aria-label="سودان زون على تيك توك"
                title="تيك توك @sudanzon"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V8.81a8.28 8.28 0 0 0 4.81 1.52V6.88a4.85 4.85 0 0 1-.9-.19z" />
                </svg>
                <span>تيك توك</span>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@SudanZon"
                target="_blank"
                rel="noopener noreferrer"
                className="szSocialBtn szSocialBtn--youtube"
                aria-label="سودان زون على يوتيوب"
                title="قناة يوتيوب @SudanZon"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>يوتيوب</span>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/sudanzonsd/"
                target="_blank"
                rel="noopener noreferrer"
                className="szSocialBtn szSocialBtn--facebook"
                aria-label="سودان زون على فيسبوك"
                title="صفحة فيسبوك sudanzonsd"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>فيسبوك</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/249907620105"
                target="_blank"
                rel="noopener noreferrer"
                className="szSocialBtn szSocialBtn--whatsapp"
                aria-label="محادثة واتساب مباشرة"
                title="واتساب 0907620105"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.031 0C5.405 0 .025 5.38.025 12.006c0 2.115.553 4.18 1.603 5.998L0 24l6.168-1.618a11.97 11.97 0 0 0 5.863 1.523h.005c6.626 0 12.006-5.38 12.006-12.006C24.042 5.38 18.662 0 12.031 0zm0 21.99a9.97 9.97 0 0 1-5.083-1.39l-.365-.216-3.774.99.1-3.676-.237-.378a9.96 9.96 0 0 1-1.534-5.314c0-5.518 4.49-10.008 10.01-10.008 2.673 0 5.187 1.042 7.078 2.933a9.94 9.94 0 0 1 2.934 7.076c0 5.519-4.49 10.007-10.01 10.007z" />
                </svg>
                <span>واتساب</span>
              </a>
            </div>
          </div>

          <div className="szPaymentBadges">
            <span className="szPayBadge">💵 الدفع عند الاستلام</span>
            <span className="szPayBadge">🏦 بنكك - Bankak</span>
            <span className="szPayBadge">💳 بطاقات الصراف</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="szFooterLinksGroup">
          <strong>روابط سريعة</strong>
          <Link href="/products">جميع المنتجات</Link>
          <Link href="/stores">دليل المتاجر المعتمدة</Link>
          <Link href="/products?q=عروض">عروض وخصومات</Link>
          <Link href="/orders">متابعة شحنتك</Link>
          <Link href="/cart">سلة الشراء</Link>
        </div>

        {/* Partners & Sellers */}
        <div className="szFooterLinksGroup">
          <strong>للبائعين والشركاء</strong>
          <Link href="/auth/vendor">تسجيل متجر جديد</Link>
          <Link href="/seller">لوحة تحكم البائع</Link>
          <Link href="/terms">الشروط والأحكام</Link>
          <Link href="/privacy">سياسة الخصوصية</Link>
        </div>

        {/* Customer Support */}
        <div className="szFooterLinksGroup">
          <strong>الدعم وخدمة العملاء</strong>
          <a href="tel:0116731488" className="szFooterContactLink">📞 اتصال مباشر: 0116731488</a>
          <a href="https://wa.me/249907620105" target="_blank" rel="noopener noreferrer" className="szFooterContactLink">💬 واتساب: 0907620105</a>
          <span className="szFooterContactLink">✉️ البريد: info@sudanzon.com</span>
          <span className="szFooterContactLink">📍 الخرطوم، جمهورية السودان</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="szFooterBottom">
        <div className="container szFooterBottomInner">
          <p>© {new Date().getFullYear()} سودان زون (SudanZon). جميع الحقوق محفوظة.</p>
          <div className="szFooterBottomLinks">
            <Link href="/privacy">سياسة الخصوصية</Link>
            <span>•</span>
            <Link href="/terms">اتفاقية الاستخدام</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .szSocialMediaBlock {
          margin: 18px 0 14px;
        }

        .szSocialTitle {
          font-size: 0.8rem;
          font-weight: 700;
          color: #94a3b8;
          display: block;
          margin-bottom: 8px;
        }

        .szSocialIconsRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .szSocialBtn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .szSocialBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .szSocialBtn--tiktok {
          background: #000000;
          color: #ffffff;
          border: 1px solid #334155;
        }
        .szSocialBtn--tiktok:hover {
          border-color: #fe2c55;
        }

        .szSocialBtn--youtube {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .szSocialBtn--youtube:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .szSocialBtn--facebook {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .szSocialBtn--facebook:hover {
          background: #1877f2;
          color: #ffffff;
        }

        .szSocialBtn--whatsapp {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .szSocialBtn--whatsapp:hover {
          background: #10b981;
          color: #ffffff;
        }

        .szFooterContactLink {
          display: block;
          font-size: 0.85rem;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 6px;
          transition: color 0.15s ease;
        }

        .szFooterContactLink:hover {
          color: #10b981;
        }
      `}</style>
    </footer>
  );
}
