import SiteHeader from "../../components/SiteHeader";
import CourierDashboardClient from "../../components/CourierDashboardClient";

export const metadata = {
  title: "لوحة تحكم كباتن التوصيل | سودان زون (SudanZon)",
  description: "لوحة تحكم وإدارة شحنات التوصيل لكباتن ومناديب منصة سودان زون.",
};

export default function CourierPage() {
  return (
    <main className="szPageShell">
      <SiteHeader />
      <CourierDashboardClient />
    </main>
  );
}
