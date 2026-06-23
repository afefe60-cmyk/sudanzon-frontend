const CART_KEY = "sudanzonCart";

export function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCartItem(product, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item.productId === product.id);

  let nextCart;
  if (existing) {
    nextCart = cart.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    nextCart = [
      ...cart,
      {
        productId: product.id,
        quantity,
      },
    ];
  }

  writeCart(nextCart);
  return nextCart;
}

export function removeCartItem(productId) {
  const nextCart = readCart().filter((item) => item.productId !== productId);
  writeCart(nextCart);
  return nextCart;
}

export function setCartQuantity(productId, quantity) {
  const nextCart = readCart()
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeCart(nextCart);
  return nextCart;
}

