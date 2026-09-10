import SiteHeader from "../../../components/SiteHeader";
import CourierRegisterClient from "../../../components/CourierRegisterClient";

export const metadata = {
  title: "انضم كمندوب أو شركة توصيل | سودان زون (SudanZon)",
  description:
    "انضم إلى شبكة مناديب وشركات التوصيل في منصة سودان زون. استلم طلبات التوصيل والشحن يومياً وحقق أرباحاً ممتازة وتسويات فورية.",
};

export default function CourierRegisterPage() {
  return (
    <main className="szPageShell">
      <SiteHeader />
      <CourierRegisterClient />
    </main>
  );
}
