const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com";
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

export async function apiJson(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const separator = cleanPath.includes("?") ? "&" : "?";
  // Add microsecond timestamp to bypass any Nginx/Cloudflare/Browser aggressive cache
  const urlWithBuster = `${API_BASE_URL}${cleanPath}${options.noBust ? "" : `${separator}_t=${Date.now()}`}`;

  const response = await fetch(urlWithBuster, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      ...(options.headers || {}),
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function apiForm(path, formData, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const separator = cleanPath.includes("?") ? "&" : "?";
  const urlWithBuster = `${API_BASE_URL}${cleanPath}${options.noBust ? "" : `${separator}_t=${Date.now()}`}`;

  const response = await fetch(urlWithBuster, {
    ...options,
    body: formData,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      ...(options.headers || {}),
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
