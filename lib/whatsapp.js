// Central WhatsApp & Cart Feature Flags & Utilities for SudanZon

export const ENABLE_CART_ORDERING = false; // When false, cart checkout is paused and orders go directly to merchant WhatsApp
export const DEFAULT_WHATSAPP_NUMBER = "249907620105"; // SudanZon Official Customer Support

/**
 * Format any Sudan/International phone number into standard WhatsApp format (e.g. 249912345678)
 */
export function formatSudanWhatsAppNumber(rawPhone) {
  if (!rawPhone) return DEFAULT_WHATSAPP_NUMBER;
  let digits = String(rawPhone).replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP_NUMBER;

  // If starts with 00249, remove 00
  if (digits.startsWith("00249")) digits = digits.slice(2);
  // If starts with 249
  if (digits.startsWith("249")) return digits;
  // If starts with 0 (e.g. 09... or 01...)
  if (digits.startsWith("0") && digits.length >= 10) {
    return "249" + digits.slice(1);
  }
  // If starts with 9 or 1 (e.g. 912345678 or 123456789)
  if ((digits.startsWith("9") || digits.startsWith("1")) && digits.length === 9) {
    return "249" + digits;
  }
  return digits.length >= 9 ? digits : DEFAULT_WHATSAPP_NUMBER;
}

/**
 * Generate a WhatsApp order URL for a specific product and merchant
 */
export function getProductWhatsAppOrderUrl({
  product,
  quantity = 1,
  selectedOptions = {},
  variant = null,
  currentPrice = null,
}) {
  if (!product) return `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`;

  const vendorPhone = product.vendor?.phone || product.vendor?.user?.phone;
  const targetPhone = formatSudanWhatsAppNumber(vendorPhone);
  const vendorName = product.vendor?.storeName || product.vendor?.name || "متجر سودان زون";

  const price = currentPrice || (variant?.price ? Number(variant.price) : Number(product.price || 0));
  const total = (price * quantity).toLocaleString();

  const optionsStr = Object.entries(selectedOptions || {})
    .filter(([_, v]) => Boolean(v))
    .map(([k, v]) => `${k}: ${v}`)
    .join(" ، ");

  const productUrl = typeof window !== "undefined" && window.location.origin
    ? `${window.location.origin}/products/${product.id}`
    : `https://sudanzon.com/products/${product.id}`;

  let text = `السلام عليكم ورحمة الله،\nأود طلب المنتج التالي من متجركم (${vendorName}) عبر منصة سودان زون:\n\n`;
  text += `📦 المنتج: ${product.name}\n`;
  if (optionsStr) {
    text += `🎨 الخيارات: ${optionsStr}\n`;
  }
  text += `🔢 الكمية: ${quantity}\n`;
  text += `💰 الإجمالي: ${total} ج.س (${price.toLocaleString()} ج.س للقطعة)\n`;
  text += `🔗 رابط المنتج: ${productUrl}\n\n`;
  text += `يرجى تأكيد توفر الطلب وترتيب طريقة الدفع (كاش / بنكك) والتوصيل. شكراً لكم!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
