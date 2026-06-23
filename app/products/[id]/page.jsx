import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SectionHeading from "../../../components/SectionHeading";
import AddToCartButton from "../../../components/AddToCartButton";
import { apiJson } from "../../../lib/api";
import { getProductImage } from "../../../lib/media";
import { products as fallbackProducts } from "../../../lib/mock-data";

async function loadProduct(id) {
  try {
    const result = await apiJson(`/api/products/${id}`);
    return result.item;
  } catch {
    return fallbackProducts.find((item) => item.id === id) || fallbackProducts[0];
  }
}

async function loadSimilarProducts(category, currentId) {
  try {
    const result = await apiJson(`/api/products?category=${encodeURIComponent(category || "")}`);
    return (result.items || []).filter((item) => item.id !== currentId).slice(0, 4);
  } catch {
    return fallbackProducts.filter((item) => item.category === category && item.id !== currentId).slice(0, 4);
  }
}

function buildSpecs(product) {
  return [
    { label: "التصنيف", value: product.category?.name || product.category || "غير محدد" },
    { label: "البائع", value: product.vendor?.storeName || product.vendor || "سودان زون" },
    { label: "المخزون", value: `${product.stock ?? 0} قطعة` },
    { label: "التقييم", value: `${product.rating || "4.5"} / 5` },
    { label: "الخصم", value: `${product.discount || 0}%` },
    { label: "طريقة الدفع", value: "الدفع عند الاستلام" },
  ];
}

export default async function ProductPage({ params }) {
  const product = await loadProduct(params.id);
  const similarProducts = await loadSimilarProducts(product.category?.name || product.category, product.id);
  const specs = buildSpecs(product);
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  const stock = Number(product.stock || 0);

  return (
    <main className="pageShell amazonPage">
      <SiteHeader />

      <section className="sectionBlock">
        <div className="container">
          <div className="productShowcase cardPanel">
            <div className="productShowcaseCopy">
              <span className="dashboardHeroTag">SudanZon Product</span>
              <h1 className="productTitle">{product.name}</h1>
              <p className="productSubtitle">{product.description}</p>
              <div className="productShowcasePills">
                <span className="productShowcasePill">{product.category?.name || product.category || "تصنيف"}</span>
                <span className="productShowcasePill">{stock} قطعة متوفرة</span>
                <span className="productShowcasePill">خصم {discount}%</span>
                <span className="productShowcasePill">دفع عند الاستلام</span>
              </div>
            </div>

            <div className="productShowcaseAside">
              <div className="productShowcasePrice">
                <strong>{price.toLocaleString()} جنيه سوداني</strong>
                <span>السعر الحالي</span>
              </div>
              <div className="productShowcaseInfo">
                <div>
                  <span>التقييم</span>
                  <strong>{product.rating || "4.5"} / 5</strong>
                </div>
                <div>
                  <span>المخزون</span>
                  <strong>{stock}</strong>
                </div>
                <div>
                  <span>البائع</span>
                  <strong>{product.vendor?.storeName || product.vendor || "سودان زون"}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="productHeroBar">
            <div>
              <span className="amazonBadge">عرض المنتج</span>
              <h1 className="productTitle">{product.name}</h1>
              <p className="productSubtitle">{product.description}</p>
            </div>
            <div className="productHeroLinks">
              <Link className="secondaryBtn" href="/products">
                العودة إلى المنتجات
              </Link>
              <Link className="secondaryBtn" href="/cart">
                الذهاب إلى السلة
              </Link>
            </div>
          </div>

          <div className="amazonDetailLayout productDetailLayout">
            <div className="amazonDetailGallery productGalleryPanel">
              <div className="amazonGalleryMain productMainImage">
                <img src={getProductImage(product)} alt={product.name} />
              </div>
              <div className="amazonGalleryThumbs productThumbs">
                {[1, 2, 3, 4].map((index) => (
                  <span key={index}>
                    <img src={getProductImage(product)} alt={`${product.name} ${index}`} />
                  </span>
                ))}
              </div>
            </div>

            <div className="amazonDetailInfo productInfoPanel">
              <div className="productPriceRow">
                <strong className="productMainPrice">{price.toLocaleString()} جنيه سوداني</strong>
                <span className="amazonMiniTag">خصم {product.discount || 0}%</span>
              </div>

              <div className="productMetaRow">
                <span>المخزون {stock}</span>
                <span>التقييم {product.rating || "4.5"}</span>
                <span>{product.category?.name || product.category || "تصنيف"}</span>
              </div>

              <div className="amazonBuyBox productBuyBox">
                <h3>اطلب الآن</h3>
                <p>الدفع عند الاستلام داخل السودان مع تجربة طلب بسيطة وواضحة.</p>
                <AddToCartButton product={product} />
                <Link className="amazonSecondaryBtn" href="/orders">
                  متابعة الطلبات
                </Link>
              </div>

              <div className="productVendorCard">
                <h3>عن المتجر</h3>
                <p>{product.vendor?.storeName || product.vendor || "سودان زون"}</p>
                <small>{product.vendor?.description || "متجر موثوق يقدم منتجات مختارة بعناية داخل المنصة."}</small>
              </div>

              <div className="productAssuranceCard">
                <strong>لماذا هذا العرض مناسب؟</strong>
                <ul>
                  <li>عرض واضح للسعر والتقييم والمخزون.</li>
                  <li>دعم الطلب المباشر عبر السلة.</li>
                  <li>عرض مشابهات لتوسيع المقارنة بسهولة.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="productLowerGrid">
            <div className="cardPanel productSpecCard">
              <SectionHeading title="مواصفات المنتج" subtitle="معلومات واضحة تساعد على المقارنة واتخاذ القرار." />
              <div className="productSpecGrid">
                {specs.map((item) => (
                  <div className="productSpecRow" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="cardPanel productNotesCard">
              <SectionHeading title="الوصف الكامل" subtitle="تفاصيل إضافية تعرض مزايا المنتج بشكل منظم وجاهز للنشر." />
              <p className="productParagraph">
                {product.description} هذه المساحة جاهزة لاحقًا لإضافة الفيديو، المواصفات التفصيلية، التقييمات، والأسئلة الشائعة مع الحفاظ على واجهة واضحة وسريعة.
              </p>
              <div className="productTrustGrid">
                <div>شحن محلي</div>
                <div>الدفع عند الاستلام</div>
                <div>إرجاع مرن</div>
                <div>دعم البائع</div>
              </div>
            </div>
          </div>

          <section className="sectionBlock" style={{ paddingBottom: 0 }}>
            <SectionHeading
              title="منتجات مشابهة"
              subtitle="اقتراحات مرتبطة بنفس التصنيف لزيادة الاستكشاف والشراء."
            />
            <div className="amazonDealsGrid similarProductsGrid">
              {similarProducts.map((item) => (
                <Link href={`/products/${item.id}`} className="amazonDealCard" key={item.id}>
                  <div className="amazonDealImageWrap">
                    <img className="amazonDealImage" src={getProductImage(item)} alt={item.name} />
                  </div>
                  <span className="amazonDealTag">{item.vendor?.storeName || item.vendor || "سودان زون"}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="amazonDealMeta">
                    <strong>{Number(item.price).toLocaleString()} جنيه سوداني</strong>
                    <span>المخزون {item.stock}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
