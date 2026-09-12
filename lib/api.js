const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com";
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

export async function apiJson(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const separator = cleanPath.includes("?") ? "&" : "?";
  const fullUrl = `${API_BASE_URL}${cleanPath}${isGet && !options.noBust ? `${separator}_t=${Date.now()}` : ""}`;

  const isServer = typeof window === "undefined";
  const fetchOpts = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
    ...(isServer ? { next: { revalidate: 0 } } : {}),
  };

  const response = await fetch(fullUrl, fetchOpts);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function apiForm(path, formData, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${cleanPath}`;

  const isServer = typeof window === "undefined";
  const fetchOpts = {
    ...options,
    body: formData,
    headers: {
      ...(options.headers || {}),
    },
    cache: "no-store",
    ...(isServer ? { next: { revalidate: 0 } } : {}),
  };

  const response = await fetch(fullUrl, fetchOpts);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
