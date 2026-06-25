export const productImages = {
  default: "/products/default.svg",
  electronics: "/products/electronics.svg",
  phones: "/products/phones.svg",
  computer: "/products/computer.svg",
  perfume: "/products/perfume.svg",
  fashion: "/products/fashion.svg",
  shoes: "/products/shoes.svg",
  home: "/products/home.svg",
  grocery: "/products/grocery.svg",
  beauty: "/products/beauty.svg",
  auto: "/products/auto.svg",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const categoryMap = {
  إلكترونيات: "electronics",
  موبايلات: "phones",
  كمبيوتر: "computer",
  عطور: "perfume",
  ملابس: "fashion",
  أحذية: "shoes",
  "أدوات منزلية": "home",
  "سوبر ماركت": "grocery",
  "مستحضرات تجميل": "beauty",
  "قطع غيار السيارات": "auto",
};

export function getProductImage(product = {}) {
  if (product.image) {
    if (String(product.image).startsWith("/uploads/")) {
      return `${API_BASE_URL}${product.image}`;
    }

    return product.image;
  }

  const key = categoryMap[product.category?.name || product.category] || "default";
  return productImages[key] || productImages.default;
}

export const heroSlides = [
  "/banners/hero-1.svg",
  "/banners/hero-2.svg",
  "/banners/hero-3.svg",
];
