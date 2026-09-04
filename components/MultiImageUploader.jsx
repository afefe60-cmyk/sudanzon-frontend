"use client";

import { useRef } from "react";
import { resolveImageUrl } from "../lib/media";

export default function MultiImageUploader({
  images = [],
  onChange,
  maxImages = 8,
  label = "صور المنتج (أضف حتى 8 صور عالية الدقة)",
}) {
  const fileInputRef = useRef(null);

  const handleFilesAdded = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, Math.max(0, remainingSlots));

    const newItems = filesToAdd.map((file) => ({
      id: "new_" + Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      file: file,
      isNew: true,
    }));

    const updated = [...images, ...newItems];
    onChange(updated);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSetPrimary = (index) => {
    if (index === 0 || index >= images.length) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    const updated = [target, ...rest];
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const triggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="szMultiUploaderRoot">
      <div className="szMultiUploaderHeader">
        <label className="szFormLabel">{label}</label>
        <span className="szImagesCounter">
          {images.length} / {maxImages} صور
        </span>
      </div>

      <div className="szGalleryGrid">
        {/* Render Image Cards */}
        {images.map((item, index) => {
          const isPrimary = index === 0;
          const displayUrl = item.url ? (item.isNew ? item.url : resolveImageUrl(item.url)) : "";

          return (
            <div
              key={item.id || item.url || index}
              className={`szGalleryTile ${isPrimary ? "szGalleryTile--primary" : ""}`}
            >
              <img src={displayUrl} alt={`صورة ${index + 1}`} className="szGalleryImg" />

              {/* Primary Badge */}
              {isPrimary && (
                <div className="szPrimaryBadge">
                  <span>⭐ الصورة الأساسية</span>
                </div>
              )}

              {/* Action Buttons Overlay */}
              <div className="szTileActions">
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="szTileBtn szTileBtn--primary"
                    title="تعيين كصورة أساسية للمنتج"
                  >
                    ⭐ أساسية
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="szTileBtn szTileBtn--remove"
                  title="حذف الصورة"
                  aria-label="حذف"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {/* Plus Button Card */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={triggerPicker}
            className="szAddImageTile"
            aria-label="إضافة صورة أخرى"
            title="إضافة صورة أخرى للمنتج"
          >
            <div className="szPlusIconCircle">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="szAddTileText">
              {images.length === 0 ? "إضافة صور" : "+ إضافة صورة أخرى"}
            </span>
            <span className="szAddTileHint">JPG, PNG, WebP</span>
          </button>
        )}
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFilesAdded}
        style={{ display: "none" }}
      />

      <style jsx>{`
        .szMultiUploaderRoot {
          margin-top: 4px;
        }

        .szMultiUploaderHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .szImagesCounter {
          font-size: 0.76rem;
          font-weight: 700;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 99px;
        }

        .szGalleryGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .szGalleryTile {
          position: relative;
          width: 105px;
          height: 105px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: #f8fafc;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .szGalleryTile--primary {
          border-color: #059669;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
        }

        .szGalleryImg {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #ffffff;
          padding: 4px;
        }

        .szPrimaryBadge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          text-align: center;
          padding: 3px 2px;
          line-height: 1.2;
        }

        .szTileActions {
          position: absolute;
          top: 4px;
          right: 4px;
          left: 4px;
          display: flex;
          justify-content: space-between;
          gap: 4px;
        }

        .szTileBtn {
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.65rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .szTileBtn:hover {
          transform: scale(1.05);
        }

        .szTileBtn--remove {
          width: 22px;
          height: 22px;
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
          margin-left: auto;
        }
        .szTileBtn--remove:hover {
          background: #dc2626;
        }

        .szTileBtn--primary {
          background: rgba(15, 23, 42, 0.85);
          color: #fbbf24;
          padding: 2px 6px;
          height: 22px;
        }
        .szTileBtn--primary:hover {
          background: #059669;
          color: #ffffff;
        }

        .szAddImageTile {
          width: 105px;
          height: 105px;
          border-radius: 12px;
          border: 2px dashed #059669;
          background: #ecfdf5;
          color: #059669;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          padding: 6px;
          transition: all 0.2s ease;
        }

        .szAddImageTile:hover {
          background: #d1fae5;
          border-color: #047857;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
        }

        .szPlusIconCircle {
          width: 34px;
          height: 34px;
          border-radius: 99px;
          background: #ffffff;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.2);
        }

        .szAddTileText {
          font-size: 0.72rem;
          font-weight: 800;
          text-align: center;
          line-height: 1.2;
        }

        .szAddTileHint {
          font-size: 0.6rem;
          color: #6ee7b7;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
