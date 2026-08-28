import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata = {
  title: "سودان زون | سوق متعدد البائعين",
  description: "منصة سودانية متعددة البائعين للتسوق، وإدارة الطلبات، والدفع عند الاستلام، وتجربة بيع حديثة داخل السودان.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className={tajawal.className}>{children}</body>
    </html>
  );
}
