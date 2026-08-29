import { Tajawal } from "next/font/google";
import "./globals.css";
import SiteSplashScreen from "../components/SiteSplashScreen";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://sudanzon.com"),
  title: {
    default: "سودان زون | سوق متعدد البائعين والتسوق الإلكتروني في السودان (SudanZon)",
    template: "%s | سودان زون",
  },
  description:
    "سودان زون (SudanZon) - المنصة السودانية الأولى المتكاملة للتجارة والتسوق الإلكتروني متعدد البائعين. تسوق أفضل العروض على الأزياء، العبايات، الهواتف، الإلكترونيات، العطور والمستلزمات المنزلية مع خيارات الدفع عند الاستلام وبنكك والتوصيل لكافة الولايات.",
  keywords: [
    "سودان زون",
    "سودانزون",
    "SudanZon",
    "sudan zon",
    "sudanzon.com",
    "سوق سودان زون",
    "منصة سودان زون",
    "تسوق أونلاين السودان",
    "متجر إلكتروني السودان",
    "موقع تسوق سوداني",
    "عبايات سودانية",
    "هواتف السودان",
    "عطور سودانية",
    "دفع عند الاستلام بنكك",
    "بيع وشراء السودان",
    "متاجر الخرطوم",
    "بورتسودان تسوق",
  ],
  authors: [{ name: "SudanZon Team", url: "https://sudanzon.com" }],
  creator: "SudanZon",
  publisher: "SudanZon",
  applicationName: "سودان زون",
  alternates: {
    canonical: "https://sudanzon.com",
  },
  openGraph: {
    type: "website",
    locale: "ar_SD",
    url: "https://sudanzon.com",
    siteName: "سودان زون | SudanZon",
    title: "سودان زون | سوق متعدد البائعين والتسوق الإلكتروني في السودان",
    description:
      "المنصة السودانية الأولى للتسوق الإلكتروني. تسوق آلاف المنتجات والعروض مع التوصيل السريع والدفع عند الاستلام وبنكك.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "سودان زون - SudanZon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سودان زون | SudanZon",
    description: "المنصة السودانية الأولى للتسوق والتجارة الإلكترونية متعددة البائعين.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://sudanzon.com/#website",
      "url": "https://sudanzon.com",
      "name": "سودان زون | SudanZon",
      "alternateName": [
        "سودان زون",
        "سودانزون",
        "SudanZon",
        "Sudan Zon",
        "سوق سودان زون",
        "منصة سودان زون",
      ],
      "description":
        "المنصة السودانية الأولى المتكاملة للتجارة والتسوق الإلكتروني متعدد البائعين.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://sudanzon.com/products?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
      "inLanguage": "ar-SD",
    },
    {
      "@type": "Organization",
      "@id": "https://sudanzon.com/#organization",
      "name": "سودان زون | SudanZon",
      "url": "https://sudanzon.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sudanzon.com/logo.png",
      },
      "sameAs": [
        "https://facebook.com",
        "https://wa.me/249907620105",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+249907620105",
        "contactType": "customer service",
        "areaServed": "SD",
        "availableLanguage": ["Arabic", "English"],
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={tajawal.className}>
        <SiteSplashScreen />
        {children}
      </body>
    </html>
  );
}
