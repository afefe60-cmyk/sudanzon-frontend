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

function resolveImageUrl(image) {
  if (!image) {
    return "";
  }

  if (String(image).startsWith("/uploads/")) {
    return `${API_BASE_URL}${image}`;
  }

  return image;
}

export function getProductImage(product = {}) {
  const firstImage = Array.isArray(product.images) && product.images[0] ? product.images[0] : product.image;

  if (firstImage) {
    return resolveImageUrl(firstImage);
  }

  const key = categoryMap[product.category?.name || product.category] || "default";
  return productImages[key] || productImages.default;
}

export function getProductImages(product = {}) {
  const gallery = Array.isArray(product.images) ? product.images : [];
  const images = gallery.length ? gallery : product.image ? [product.image] : [];
  const resolved = images.map(resolveImageUrl).filter(Boolean).slice(0, 4);

  return resolved.length ? resolved : [getProductImage(product)];
}

export const heroSlides = [
  "/banners/hero-1.svg",
  "/banners/hero-2.svg",
  "/banners/hero-3.svg",
];
