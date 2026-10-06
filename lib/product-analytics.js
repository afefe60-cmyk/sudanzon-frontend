import { API_BASE_URL } from "./api";

const viewedProductsSet = new Set();

export function trackProductView(productId) {
  if (!productId || viewedProductsSet.has(productId)) return;
  viewedProductsSet.add(productId);

  try {
    fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore analytics network errors
  }
}

export function trackProductClick(productId) {
  if (!productId) return;

  try {
    fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore analytics network errors
  }
}
