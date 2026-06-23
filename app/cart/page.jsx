import SiteHeader from "../../components/SiteHeader";
import SectionHeading from "../../components/SectionHeading";
import CartPageClient from "../../components/CartPageClient";

export default function CartPage() {
  return (
    <main className="pageShell">
      <SiteHeader />
      <section className="sectionBlock">
        <div className="container">
          <SectionHeading title="السلة" subtitle="مراجعة المنتجات ثم إنشاء الطلب الحقيقي" />
          <CartPageClient />
        </div>
      </section>
    </main>
  );
}

