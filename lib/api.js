const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sudanzon.com";
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

export async function apiJson(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${cleanPath}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: options.cache || "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function apiForm(path, formData, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${cleanPath}`;

  const response = await fetch(fullUrl, {
    ...options,
    body: formData,
    headers: {
      ...(options.headers || {}),
    },
    cache: options.cache || "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
