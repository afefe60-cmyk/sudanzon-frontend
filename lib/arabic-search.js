/**
 * Arabic Intelligent Search Engine & Morphological Normalizer (Frontend)
 * Handles Stemming, Plurals/Singulars, and Synonyms (e.g. عبايات <-> عباية <-> عبايه)
 */

const SYNONYM_DICTIONARY = [
  // Fashion & Clothing
  ["عباية", "عبايه", "عبايات", "عباءة", "عباءات", "ملابس نسائية", "فستان", "جلابية", "جلابيات", "طرحة", "طرح", "ثوب", "توب"],
  ["شنطة", "شنطه", "شنط", "حقيبة", "حقائب", "شنطة يد", "شنط نسائية", "باغ"],
  ["حذاء", "احذية", "أحذية", "شوز", "كوتشي", "كوتشيات", "جزمة", "جزم", "صندل", "شبشب", "سليبر"],
  ["قميص", "قمصان", "تيشيرت", "تيشيرتات", "ملابس", "بلوزة", "بنطلون", "بناطيل"],

  // Tech & Electronics
  ["تلفون", "تلفونات", "موبايل", "موبايلات", "هاتف", "هواتف", "جوال", "جوالات", "ايفون", "سامسونج", "سمارت فون", "شاومي"],
  ["سماعة", "سماعه", "سماعات", "ايربودز", "هيدفون", "وايرلس", "بلوتوث"],
  ["ساعة", "ساعه", "ساعات", "سمارت واتش", "ساعة ذكية", "ساعه ذكيه"],
  ["لابتوب", "لابتوبات", "حاسوب", "كمبيوتر", "ماك بوك", "نوتبوك", "بي سي"],
  ["شاحن", "شواحن", "كيبل", "سلك", "شاحن سريع", "باور بانك", "ادابتر"],

  // Beauty & Perfumes
  ["عطر", "عطور", "برفان", "برفانات", "بخور", "ريحة", "مسك", "عود", "معطر"],
  ["مكياج", "ميك اب", "تجميل", "مستحضرات تجميل", "سيروم", "كريم", "لوشن", "مرطب", "غسول"],

  // Automotive & Home
  ["اطار", "اطارات", "إطار", "إطارات", "كفر", "كفرات", "تاير", "تواير", "لستك", "لستك سيارة", "قطع غيار", "بطارية"],
  ["زيت", "زيوت", "زيت محرك", "زيت سيارة", "بترومين", "شل", "موبيل"],
  ["قهوة", "قهوه", "بن", "نسكافيه", "اسبريسو", "كافيه", "جبنة"],
  ["مقلاة", "مقلاية", "طاسة", "طوة", "قدر", "حلل", "أواني", "ادوات منزلية", "مكواة", "مكواه"],
];

export function normalizeArabic(text = "") {
  if (!text) return "";

  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "") // Tashkeel
    .replace(/\u0640/g, "") // Tatweel
    .replace(/[أإآٱ]/g, "ا") // Alif forms
    .replace(/ة/g, "ه") // Taa Marbuta
    .replace(/ى/g, "ي") // Alif Maqsura
    .replace(/[ك]/g, "ك")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/[^\w\s\u0600-\u06FF]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stemWord(word = "") {
  let normalized = normalizeArabic(word);
  if (!normalized || normalized.length < 3) return [normalized];

  const stems = new Set([normalized]);

  if (normalized.startsWith("ال") && normalized.length > 3) {
    stems.add(normalized.slice(2));
  }
  if ((normalized.startsWith("و") || normalized.startsWith("ف") || normalized.startsWith("ب")) && normalized.length > 4) {
    const stripped = normalized.slice(1);
    stems.add(stripped);
    if (stripped.startsWith("ال") && stripped.length > 3) {
      stems.add(stripped.slice(2));
    }
  }

  Array.from(stems).forEach((s) => {
    if (s.endsWith("ات") && s.length > 3) {
      const base = s.slice(0, -2);
      stems.add(base);
      stems.add(`${base}ه`);
      stems.add(`${base}ة`);
    }
    if ((s.endsWith("ين") || s.endsWith("ون") || s.endsWith("ان")) && s.length > 4) {
      stems.add(s.slice(0, -2));
    }
    if ((s.endsWith("يه") || s.endsWith("ية")) && s.length > 3) {
      stems.add(s.slice(0, -2));
    }
  });

  return Array.from(stems).filter((s) => s.length >= 2);
}

export function expandSearchTerms(rawQuery = "") {
  if (!rawQuery || !rawQuery.trim()) return [];

  const normalizedInput = normalizeArabic(rawQuery);
  const words = normalizedInput.split(/\s+/).filter(Boolean);
  const expandedTerms = new Set([rawQuery.trim(), normalizedInput]);

  words.forEach((word) => {
    const stems = stemWord(word);
    stems.forEach((s) => expandedTerms.add(s));

    SYNONYM_DICTIONARY.forEach((synGroup) => {
      const normalizedGroup = synGroup.map((w) => normalizeArabic(w));
      const matchesGroup = stems.some((stem) =>
        normalizedGroup.some((syn) => syn.includes(stem) || stem.includes(syn))
      );

      if (matchesGroup) {
        synGroup.forEach((syn) => {
          expandedTerms.add(syn);
          expandedTerms.add(normalizeArabic(syn));
        });
      }
    });
  });

  return Array.from(expandedTerms).filter((t) => t.length >= 2);
}

export function matchesProductSmartly(product, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;

  const terms = expandSearchTerms(rawQuery);
  const productNameNorm = normalizeArabic(product.name || "");
  const productCatNorm = normalizeArabic(product.category?.name || product.category || "");
  const productDescNorm = normalizeArabic(product.description || "");
  const productStoreNorm = normalizeArabic(product.vendor?.storeName || product.storeName || "");

  const fullText = `${productNameNorm} ${productCatNorm} ${productDescNorm} ${productStoreNorm}`;

  return terms.some((term) => {
    const normTerm = normalizeArabic(term);
    return fullText.includes(normTerm);
  });
}
