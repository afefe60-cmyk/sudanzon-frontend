"use client";

import { useState } from "react";

const PRESETS = [
  {
    name: "👕 ملابس (مقاس + لون)",
    options: [
      { name: "المقاس", values: ["S", "M", "L", "XL", "XXL"] },
      { name: "اللون", values: ["أسود", "أبيض", "أزرق", "رمادي"] },
    ],
  },
  {
    name: "👟 أحذية (مقاس + لون)",
    options: [
      { name: "المقاس", values: ["40", "41", "42", "43", "44"] },
      { name: "اللون", values: ["أسود", "أبيض", "كحلي"] },
    ],
  },
  {
    name: "📱 هاتف (لون + تخزين + RAM)",
    options: [
      { name: "اللون", values: ["أسود", "أزرق", "تيتانيوم"] },
      { name: "سعة التخزين", values: ["128GB", "256GB", "512GB"] },
      { name: "RAM", values: ["8GB", "12GB"] },
    ],
  },
  {
    name: "💻 لابتوب (RAM + SSD)",
    options: [
      { name: "RAM", values: ["16GB", "32GB"] },
      { name: "سعة SSD", values: ["512GB", "1TB"] },
    ],
  },
  {
    name: "🧴 عطور ومستحضرات (حجم + نوع)",
    options: [
      { name: "الحجم", values: ["50ml", "100ml"] },
      { name: "النوع", values: ["رجالي", "نسائي", "للجنسين"] },
    ],
  },
];

export function generateCartesianVariants(options, basePrice = 0, defaultStock = 10) {
  const valid = options.filter((o) => o.name.trim() && Array.isArray(o.values) && o.values.length > 0);
  if (valid.length === 0) return [];

  let combs = [[]];
  for (const opt of valid) {
    const next = [];
    for (const comb of combs) {
      for (const val of opt.values) {
        if (String(val).trim()) {
          next.push([...comb, { optionName: opt.name.trim(), value: String(val).trim() }]);
        }
      }
    }
    combs = next;
  }

  return combs.map((comb, i) => {
    const codeParts = comb.map((c) => {
      const v = c.value.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "").slice(0, 4);
      return v.toUpperCase() || "OPT";
    });
    return {
      id: "var_temp_" + i + "_" + Date.now(),
      sku: `SKU-${codeParts.join("-")}`,
      price: basePrice > 0 ? String(basePrice) : "25000",
      comparePrice: "",
      stock: String(defaultStock > 0 ? defaultStock : 10),
      image: "",
      isActive: true,
      optionValues: comb,
    };
  });
}

export default function ProductOptionsBuilder({
  hasVariants,
  setHasVariants,
  options,
  setOptions,
  variants,
  setVariants,
  basePrice,
  galleryImages = [],
}) {
  const [newValueInputs, setNewValueInputs] = useState({});
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const addOption = () => {
    setOptions([...options, { name: "", values: [] }]);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionName = (index, name) => {
    const updated = [...options];
    updated[index].name = name;
    setOptions(updated);
  };

  const addValueToOption = (index, val) => {
    const trimmed = String(val).trim();
    if (!trimmed) return;
    const updated = [...options];
    if (!updated[index].values.includes(trimmed)) {
      updated[index].values = [...updated[index].values, trimmed];
      setOptions(updated);
    }
    setNewValueInputs({ ...newValueInputs, [index]: "" });
  };

  const removeValueFromOption = (optIndex, valIndex) => {
    const updated = [...options];
    updated[optIndex].values = updated[optIndex].values.filter((_, i) => i !== valIndex);
    setOptions(updated);
  };

  const applyPreset = (preset) => {
    setOptions(preset.options);
    const vars = generateCartesianVariants(preset.options, Number(basePrice) || 25000, 10);
    setVariants(vars);
  };

  const handleGenerate = () => {
    const vars = generateCartesianVariants(options, Number(basePrice) || 25000, 10);
    setVariants(vars);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const applyBulkPrice = () => {
    if (!bulkPrice) return;
    setVariants(variants.map((v) => ({ ...v, price: bulkPrice })));
  };

  const applyBulkStock = () => {
    if (!bulkStock) return;
    setVariants(variants.map((v) => ({ ...v, stock: bulkStock })));
  };

  return (
    <div className="szOptionsBuilderCard">
      {/* Product Type Toggle */}
      <div className="szOptionTypeToggleHeader">
        <label className="szFormSectionHeading">نوع المنتج ونظام الخيارات (Product Type):</label>
        <div className="szRadioGroupHorizontal">
          <label className={`szRadioLabel ${!hasVariants ? "is-selected" : ""}`}>
            <input
              type="radio"
              name="hasVariantsRadio"
              checked={!hasVariants}
              onChange={() => setHasVariants(false)}
            />
            <span>📦 منتج عادي (Simple Product) - سعر ومخزون موحد</span>
          </label>
          <label className={`szRadioLabel ${hasVariants ? "is-selected" : ""}`}>
            <input
              type="radio"
              name="hasVariantsRadio"
              checked={hasVariants}
              onChange={() => {
                setHasVariants(true);
                if (options.length === 0) {
                  setOptions([{ name: "المقاس", values: ["S", "M", "L", "XL"] }]);
                }
              }}
            />
            <span>✨ منتج بخيارات متعددة (Variable Product) - مقاس، لون، سعة، إلخ</span>
          </label>
        </div>
      </div>

      {hasVariants && (
        <div className="szOptionsMainSection">
          {/* Quick Presets Strip */}
          <div className="szPresetsStrip">
            <span className="szPresetsLabel">⚡ قوالب خيارات سريعة:</span>
            <div className="szPresetsButtons">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="szPresetBtn"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Options List */}
          <div className="szOptionsList">
            <div className="szOptionsHeaderRow">
              <h4>1. خصائص وخيارات المنتج (Product Options):</h4>
              <button
                type="button"
                onClick={addOption}
                className="szAddOptionBtn"
              >
                + إضافة خيار آخر (Option)
              </button>
            </div>

            {options.map((opt, optIdx) => (
              <div key={optIdx} className="szOptionRowCard">
                <div className="szOptionNameRow">
                  <div className="szOptionNameField">
                    <label>اسم الخيار (مثال: المقاس، اللون، سعة التخزين):</label>
                    <input
                      type="text"
                      placeholder="مثال: المقاس"
                      value={opt.name}
                      onChange={(e) => updateOptionName(optIdx, e.target.value)}
                      className="szOptionInput"
                    />
                  </div>
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(optIdx)}
                      className="szRemoveOptionBtn"
                      title="حذف هذا الخيار"
                    >
                      ✕ حذف الخيار
                    </button>
                  )}
                </div>

                {/* Values Tags */}
                <div className="szOptionValuesContainer">
                  <label>قيم الخيار (Values):</label>
                  <div className="szValuesWrap">
                    {opt.values.map((val, valIdx) => (
                      <span key={valIdx} className="szValueTag">
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => removeValueFromOption(optIdx, valIdx)}
                          className="szRemoveTagBtn"
                        >
                          ✕
                        </button>
                      </span>
                    ))}

                    <div className="szAddValueInputWrap">
                      <input
                        type="text"
                        placeholder="أدخل قيمة واضغط Enter..."
                        value={newValueInputs[optIdx] || ""}
                        onChange={(e) =>
                          setNewValueInputs({ ...newValueInputs, [optIdx]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addValueToOption(optIdx, newValueInputs[optIdx]);
                          }
                        }}
                        className="szNewValueInput"
                      />
                      <button
                        type="button"
                        onClick={() => addValueToOption(optIdx, newValueInputs[optIdx])}
                        className="szAddValBtn"
                      >
                        + إضافة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Generate Button */}
            <div className="szGenerateSection">
              <button
                type="button"
                onClick={handleGenerate}
                className="szGenerateVariantsBtn"
              >
                🔄 توليد جميع المتغيرات والتركيبات تلقائياً (Generate Variants)
              </button>
              <small className="szGenerateHint">
                يقوم النظام بإنشاء جميع التركيبات وتجهيزها لتحديد السعر والمخزون لكل منها.
              </small>
            </div>
          </div>

          {/* Variants Matrix Table */}
          {variants.length > 0 && (
            <div className="szVariantsMatrixSection">
              <div className="szVariantsMatrixHeader">
                <div>
                  <h4>2. جدول المتغيرات والمخزون ({variants.length} متغير):</h4>
                  <p>حدد السعر، المخزون، والـ SKU لكل متغير على حدة.</p>
                </div>

                {/* Bulk Actions */}
                <div className="szBulkActionsWrap">
                  <div className="szBulkInputGroup">
                    <input
                      type="number"
                      placeholder="السعر للجميع"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                      className="szBulkInput"
                    />
                    <button type="button" onClick={applyBulkPrice} className="szBulkBtn">
                      تطبيق السعر
                    </button>
                  </div>

                  <div className="szBulkInputGroup">
                    <input
                      type="number"
                      placeholder="المخزون للجميع"
                      value={bulkStock}
                      onChange={(e) => setBulkStock(e.target.value)}
                      className="szBulkInput"
                    />
                    <button type="button" onClick={applyBulkStock} className="szBulkBtn">
                      تطبيق المخزون
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="szVariantsTableResponsive">
                <table className="szVariantsTable">
                  <thead>
                    <tr>
                      <th>التركيبة / الخيارات</th>
                      <th>رمز SKU</th>
                      <th>السعر (ج.س) *</th>
                      <th>سعر المقارنة</th>
                      <th>المخزون *</th>
                      <th>صورة المتغير</th>
                      <th>الحالة</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, vIdx) => {
                      const title = (v.optionValues || [])
                        .map((ov) => ov.value || ov.valueId)
                        .join(" + ");

                      return (
                        <tr key={v.id || vIdx} className={!v.isActive ? "is-inactive" : ""}>
                          <td>
                            <div className="szVarTitleBadge">
                              <strong>{title}</strong>
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={v.sku || ""}
                              onChange={(e) => updateVariant(vIdx, "sku", e.target.value)}
                              placeholder="SKU-..."
                              className="szTableInput szTableInput--sku"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => updateVariant(vIdx, "price", e.target.value)}
                              className="szTableInput szTableInput--price"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={v.comparePrice || ""}
                              onChange={(e) => updateVariant(vIdx, "comparePrice", e.target.value)}
                              placeholder="اختياري"
                              className="szTableInput"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => updateVariant(vIdx, "stock", e.target.value)}
                              className="szTableInput szTableInput--stock"
                              required
                            />
                          </td>
                          <td>
                            {galleryImages.length > 0 ? (
                              <select
                                value={v.image || ""}
                                onChange={(e) => updateVariant(vIdx, "image", e.target.value)}
                                className="szTableSelect"
                              >
                                <option value="">(الصورة الأساسية)</option>
                                {galleryImages.map((img, imgI) => (
                                  <option key={imgI} value={img.url}>
                                    صورة {imgI + 1}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={v.image || ""}
                                onChange={(e) => updateVariant(vIdx, "image", e.target.value)}
                                placeholder="رابط الصورة"
                                className="szTableInput"
                              />
                            )}
                          </td>
                          <td>
                            <label className="szToggleActiveLabel">
                              <input
                                type="checkbox"
                                checked={v.isActive !== false}
                                onChange={(e) => updateVariant(vIdx, "isActive", e.target.checked)}
                              />
                              <span>{v.isActive !== false ? "متوفر" : "معطل"}</span>
                            </label>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeVariant(vIdx)}
                              className="szDeleteVarBtn"
                              title="حذف هذا المتغير"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
