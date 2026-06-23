import "./globals.css";

export const metadata = {
  title: "سودان زون | سوق متعدد البائعين",
  description: "منصة سودانية متعددة البائعين للتسوق، وإدارة الطلبات، والدفع عند الاستلام، وتجربة بيع حديثة داخل السودان.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
