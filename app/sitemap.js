const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com").replace(/\/+$/, "");
const SITE_URL = "https://sudanzon.com";

async function fetchWithTimeout(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export default async function sitemap() {
  const staticRoutes = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/stores`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/auth/vendor`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/seller`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/orders`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const categoryNames = [
    "ملابس",
    "إلكترونيات",
    "عطور",
    "موبايلات",
    "كمبيوتر",
    "أحذية",
    "أدوات منزلية",
    "سوبر ماركت",
    "مستحضرات تجميل",
    "قطع غيار السيارات",
  ];

  const categoryRoutes = categoryNames.map((cat) => ({
    url: `${SITE_URL}/products?category=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Fetch Live Stores with fast timeout
  let storeRoutes = [];
  const storesData = await fetchWithTimeout(`${API_BASE}/api/products/stores`, 3000);
  if (storesData?.items && Array.isArray(storesData.items)) {
    storeRoutes = storesData.items.map((store) => {
      const slug = store.storeSlug || store.id || store.storeName;
      return {
        url: `${SITE_URL}/stores/${encodeURIComponent(slug)}`,
        lastModified: store.createdAt ? new Date(store.createdAt) : new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      };
    });
  }

  // Fetch Live Products with fast timeout
  let productRoutes = [];
  const productsData = await fetchWithTimeout(`${API_BASE}/api/products`, 3000);
  if (productsData?.items && Array.isArray(productsData.items)) {
    productRoutes = productsData.items.map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));
  }

  return [...staticRoutes, ...categoryRoutes, ...storeRoutes, ...productRoutes];
}
