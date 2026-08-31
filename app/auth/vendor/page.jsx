import SiteHeader from "../../../components/SiteHeader";
import VendorRegisterClient from "../../../components/VendorRegisterClient";

export const metadata = {
  title: "كن بائعاً في سودان زون | سجل متجرك وابدأ البيع فوراً",
  description:
    "انضم إلى نخبة تجار منصة سودان زون. اعرض منتجاتك لآلاف المتسوقين، واستفد من خيارات الدفع عبر بنكك وشبكة التوصيل السريع لكافة الولايات.",
};

export default function VendorRegisterPage() {
  return (
    <main className="szPageShell">
      <SiteHeader />
      <VendorRegisterClient />
    </main>
  );
}
