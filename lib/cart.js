const CART_KEY = "sudanzonCart";

export function getCartItemId(item) {
  if (item.cartItemId) return item.cartItemId;
  if (item.variantId) return `${item.productId || item.id}__${item.variantId}`;
  return item.productId || item.id;
}

export function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      cartItemId: getCartItemId(item),
    }));
  } catch {
    return [];
  }
}

export function writeCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = (items || []).map((item) => ({
    ...item,
    cartItemId: getCartItemId(item),
  }));

  localStorage.setItem(CART_KEY, JSON.stringify(normalized));
}

export function addToCartItem(product, quantity = 1, variant = null, selectedOptions = {}) {
  const cart = readCart();
  const productId = product.id;
  const variantId = variant?.id || null;
  const targetKey = variantId ? `${productId}__${variantId}` : String(productId);

  const existingIndex = cart.findIndex((item) => getCartItemId(item) === targetKey);

  let nextCart = [...cart];
  if (existingIndex >= 0) {
    nextCart[existingIndex] = {
      ...nextCart[existingIndex],
      quantity: nextCart[existingIndex].quantity + Math.max(1, quantity),
    };
  } else {
    let variantTitle = null;
    if (variant) {
      if (variant.optionValues && variant.optionValues.length > 0) {
        variantTitle = variant.optionValues.map((ov) => ov.value || ov.valueId).join(" / ");
      } else if (Object.keys(selectedOptions).length > 0) {
        variantTitle = Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(" • ");
      }
    }

    const unitPrice = variant ? Number(variant.price) : Number(product.price || 0);
    const itemImage = variant?.image || product.image || (product.images && product.images[0]) || null;

    nextCart.push({
      cartItemId: targetKey,
      productId: product.id,
      variantId,
      variantTitle,
      sku: variant?.sku || null,
      selectedOptions: selectedOptions || {},
      name: product.name,
      image: itemImage,
      price: unitPrice,
      quantity: Math.max(1, quantity),
      vendor: product.vendor?.storeName || product.vendor || "سودان زون",
    });
  }

  writeCart(nextCart);
  return nextCart;
}

export function removeCartItem(cartItemId) {
  const nextCart = readCart().filter((item) => getCartItemId(item) !== cartItemId && item.productId !== cartItemId);
  writeCart(nextCart);
  return nextCart;
}

export function setCartQuantity(cartItemId, quantity) {
  const nextCart = readCart()
    .map((item) => (getCartItemId(item) === cartItemId || item.productId === cartItemId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeCart(nextCart);
  return nextCart;
}


