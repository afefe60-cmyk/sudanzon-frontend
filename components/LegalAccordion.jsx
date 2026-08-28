"use client";

import { useState } from "react";

export default function LegalAccordion({ sections = [], defaultOpenId = null }) {
  const [openItems, setOpenItems] = useState(
    defaultOpenId ? [defaultOpenId] : sections.length ? [sections[0].id] : []
  );
  const [search, setSearch] = useState("");

  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenItems(sections.map((s) => s.id));
  };

  const collapseAll = () => {
    setOpenItems([]);
  };

  const filteredSections = sections.filter((sec) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      (sec.content && sec.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="szLegalAccordionWrapper">
      {/* Controls Bar: Search + Expand/Collapse */}
      <div className="szLegalControlsBar">
        <div className="szLegalSearchWrap">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="ابحث في بنود السياسة والشروط..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="szLegalSearchInput"
          />
        </div>

        <div className="szLegalActionButtons">
          <button type="button" onClick={expandAll} className="szLegalToggleBtn">
            توسيع الكل
          </button>
          <button type="button" onClick={collapseAll} className="szLegalToggleBtn">
            طي الكل
          </button>
        </div>
      </div>

      {/* Accordion Cards List */}
      <div className="szAccordionCardsStack">
        {filteredSections.length === 0 ? (
          <div className="szLegalEmpty">
            <span>🔍</span>
            <p>لا توجد بنود مطابقة لكلمة البحث "{search}".</p>
          </div>
        ) : (
          filteredSections.map((sec) => {
            const isOpen = openItems.includes(sec.id);
            return (
              <div
                key={sec.id}
                className={`szAccordionCard ${isOpen ? "is-open" : ""}`}
                id={sec.id}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(sec.id)}
                  className="szAccordionHeader"
                  aria-expanded={isOpen}
                >
                  <div className="szAccordionHeaderLeft">
                    <span className="szAccordionIcon">{sec.icon}</span>
                    <h3 className="szAccordionTitle">{sec.title}</h3>
                  </div>

                  <div className="szAccordionHeaderRight">
                    {sec.badge && <span className="szAccordionBadge">{sec.badge}</span>}
                    <span className="szAccordionChevron">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="szAccordionBody">
                    <div className="szAccordionContent">
                      {sec.paragraphs &&
                        sec.paragraphs.map((p, idx) => (
                          <p key={idx} className="szLegalParagraph">
                            {p}
                          </p>
                        ))}

                      {sec.bullets && (
                        <ul className="szLegalBulletsList">
                          {sec.bullets.map((b, idx) => (
                            <li key={idx}>
                              <strong>{b.title ? `${b.title}: ` : ""}</strong>
                              <span>{b.desc || b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {sec.alertBox && (
                        <div className={`szLegalAlertBox szLegalAlertBox--${sec.alertBox.type || "info"}`}>
                          <span className="szAlertBoxIcon">{sec.alertBox.icon || "💡"}</span>
                          <div>
                            <strong>{sec.alertBox.title}</strong>
                            <p>{sec.alertBox.text}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
