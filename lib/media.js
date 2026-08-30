export const productImages = {
  default: "/products/electronics.jpg",
  electronics: "/products/electronics.jpg",
  phones: "/products/phones.jpg",
  computer: "/products/computer.jpg",
  perfume: "/products/perfume.jpg",
  fashion: "/products/fashion.jpg",
  shoes: "/products/shoes.jpg",
  home: "/products/home.jpg",
  grocery: "/products/grocery.jpg",
  beauty: "/products/beauty.jpg",
  auto: "/products/auto.jpg",
};

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com";
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

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

const productNameMap = {
  "قهوة عربية": "/products/grocery.jpg",
  "معطر جو": "/products/grocery.jpg",
  "شيبس عائلي": "/products/grocery.jpg",
  "مقلاة غير لاصقة": "/products/home.jpg",
  "مكواة بخار": "/products/home.jpg",
  "منظف مطبخ": "/products/home.jpg",
  "شاحن سريع": "/products/phones.jpg",
  "هاتف ذكي": "/products/phones.jpg",
  "لوشن جسم": "/products/beauty.jpg",
  "طقم عناية شخصية": "/products/beauty.jpg",
  "كريم وجه": "/products/beauty.jpg",
  "ساعة ذكية": "/products/smartwatch.jpg",
  "سماعات لاسلكية": "/products/electronics.jpg",
  "سماعة ألعاب": "/products/electronics.jpg",
  "لابتوب عملي": "/products/computer.jpg",
  "ماوس لاسلكي": "/products/computer.jpg",
  "عطر فاخر": "/products/perfume.jpg",
  "حذاء رياضي": "/products/shoes.jpg",
  "بلوزة قطنية": "/products/fashion.jpg",
  "شنطة يد": "/products/fashion.jpg",
  "إطارات سيارة": "/products/auto.jpg",
  "زيت محرك": "/products/auto.jpg",
};

export function parseImageList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseImageList(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.flatMap((item) => parseImageList(item)).filter(Boolean);
        }
      } catch {
        // ignore
      }
    }
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

export function resolveImageUrl(image) {
  if (!image) {
    return "";
  }

  let cleanImage = String(image).trim();

  // If old placeholder .svg is passed from server/database, replace with high-res studio .jpg
  if (cleanImage.startsWith("/products/") && cleanImage.endsWith(".svg")) {
    const baseName = cleanImage.replace(/^\/products\//, "").replace(/\.svg$/, "");
    if (baseName === "default") {
      cleanImage = "/products/electronics.jpg";
    } else {
      cleanImage = `/products/${baseName}.jpg`;
    }
  } else if (cleanImage.endsWith(".svg")) {
    cleanImage = cleanImage.replace(/\.svg$/, ".jpg");
  }

  if (cleanImage.startsWith("/uploads/")) {
    return `${API_BASE_URL}${cleanImage}`;
  }

  return cleanImage;
}

export function getProductImage(product = {}) {
  // 1. Check if product has custom uploaded images first
  const parsedGallery = parseImageList(product.images);
  const firstImage = product.image || parsedGallery[0];

  if (firstImage) {
    const resolved = resolveImageUrl(firstImage);
    if (resolved && !resolved.endsWith(".svg")) {
      return resolved;
    }
  }

  // 2. If no uploaded image, check predefined named seeds
  if (product.name && productNameMap[product.name.trim()]) {
    return productNameMap[product.name.trim()];
  }

  // 3. Fallback to category icon
  const key = categoryMap[product.category?.name || product.category] || "default";
  return productImages[key] || productImages.default;
}

export function getProductImages(product = {}) {
  const gallery = parseImageList(product.images);
  const images = gallery.length ? gallery : product.image ? [product.image] : [];
  const resolved = images
    .map(resolveImageUrl)
    .filter((img) => img && !img.endsWith(".svg"))
    .slice(0, 4);

  if (resolved.length > 0) {
    return resolved;
  }

  return [getProductImage(product)];
}

export const heroSlides = [
  "/banners/hero-1.jpg",
  "/banners/hero-2.jpg",
  "/banners/hero-3.jpg",
];
