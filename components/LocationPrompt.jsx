"use client";

import { useEffect, useState } from "react";
import {
  SUDAN_CITIES,
  getUserSavedLocation,
  requestUserLocation,
  setUserManualCity,
} from "../lib/location";

export default function LocationPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [selectedCity, setSelectedCity] = useState("الخرطوم");

  useEffect(() => {
    // Check saved location
    const saved = getUserSavedLocation();
    if (saved) {
      setCurrentLocation(saved);
      setSelectedCity(saved.city || "الخرطوم");
    } else {
      // If not prompted yet, show subtle prompt after 2 seconds
      const hasPrompted = localStorage.getItem("sudanzon_location_prompted");
      if (!hasPrompted) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2200);
        return () => clearTimeout(timer);
      }
    }

    const handleOpenModal = () => {
      setErrorMsg("");
      setIsOpen(true);
    };

    const handleLocationUpdated = (e) => {
      if (e.detail) {
        setCurrentLocation(e.detail);
        setSelectedCity(e.detail.city || "الخرطوم");
      }
    };

    window.addEventListener("sudanzon-open-location-modal", handleOpenModal);
    window.addEventListener("sudanzon-location-updated", handleLocationUpdated);

    return () => {
      window.removeEventListener("sudanzon-open-location-modal", handleOpenModal);
      window.removeEventListener("sudanzon-location-updated", handleLocationUpdated);
    };
  }, []);

  const handleRequestGps = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const loc = await requestUserLocation();
      setCurrentLocation(loc);
      setIsOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "تعذر تحديد الموقع تلقائياً، يمكنك اختياره يدوياً من القائمة.");
      setShowManualSelect(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManual = () => {
    const loc = setUserManualCity(selectedCity);
    setCurrentLocation(loc);
    setIsOpen(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("sudanzon_location_prompted", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="szLocModalOverlay" onClick={handleDismiss}>
      <div
        className="szLocModalBox"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="szLocTitle"
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="szLocCloseBtn"
          aria-label="إغلاق"
        >
          ✕
        </button>

        <div className="szLocIconHeader">
          <div className="szLocGpsPulse">
            <span className="szLocGpsDot">📍</span>
          </div>
        </div>

        <h3 id="szLocTitle" className="szLocTitle">
          تحديد موقعك في سودان زون
        </h3>
        <p className="szLocDesc">
          اسمح للموقع أو التطبيق بالوصول إلى موقعك الجغرافي لتوفير أفضل تجربة مخصصة لك في السودان:
        </p>

        {/* 3 User Types Benefits */}
        <div className="szLocBenefitsList">
          <div className="szLocBenefitItem">
            <span className="szLocBenefitIcon">🛍️</span>
            <div>
              <strong>للمتسوقين:</strong>
              <p>حساب أسعار التوصيل بدقة لمدينتك وحيك وعرض أسرع المتاجر القريبة منك.</p>
            </div>
          </div>

          <div className="szLocBenefitItem">
            <span className="szLocBenefitIcon">🛵</span>
            <div>
              <strong>للكباتن ومندوبي التوصيل:</strong>
              <p>استلام أقرب طلبات الاستلام والتسليم وتتبع خط السير الجغرافي لحظياً.</p>
            </div>
          </div>

          <div className="szLocBenefitItem">
            <span className="szLocBenefitIcon">🏪</span>
            <div>
              <strong>للتجار والمتاجر:</strong>
              <p>تثبيت عنوان متجرك ومستودعك على الخريطة ليسهل على المندوبين الوصول إليك.</p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="szLocAlertMsg">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {currentLocation && (
          <div className="szLocCurrentDetected">
            <span>📍 موقعك المحدد حالياً:</span>
            <strong>{currentLocation.formatted || currentLocation.city}</strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="szLocActions">
          <button
            type="button"
            onClick={handleRequestGps}
            disabled={loading}
            className="szLocBtnPrimary"
          >
            {loading ? (
              <span>⏳ جاري تحديد موقعك عبر GPS...</span>
            ) : (
              <span>📍 تفعيل وتحديد موقعي الحالي تلقائياً</span>
            )}
          </button>

          {!showManualSelect ? (
            <button
              type="button"
              onClick={() => setShowManualSelect(true)}
              className="szLocBtnSecondary"
            >
              🗺️ اختيار المدينة يدوياً من القائمة
            </button>
          ) : (
            <div className="szLocManualPicker">
              <label htmlFor="szCitySelect" className="szLocPickerLabel">
                اختر مدينتك أو ولايتك:
              </label>
              <div className="szLocPickerRow">
                <select
                  id="szCitySelect"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="szLocSelect"
                >
                  {SUDAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveManual}
                  className="szLocBtnSaveManual"
                >
                  تأكيد
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="szLocBtnSkip"
          >
            تخطي الآن والمتابعة
          </button>
        </div>
      </div>

      <style jsx>{`
        .szLocModalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 15, 29, 0.75);
          backdrop-filter: blur(6px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: szFadeIn 0.25s ease-out;
        }

        .szLocModalBox {
          position: relative;
          background: #0f172a;
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 20px;
          max-width: 480px;
          width: 100%;
          padding: 24px;
          color: #f8fafc;
          text-align: right;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 158, 11, 0.1);
          animation: szScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .szLocCloseBtn {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .szLocCloseBtn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }

        .szLocIconHeader {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .szLocGpsPulse {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 70%);
          border: 2px solid #f59e0b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.35);
          animation: szPulseGps 2s infinite ease-in-out;
        }

        .szLocTitle {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px;
          text-align: center;
        }

        .szLocDesc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0 0 16px;
          text-align: center;
        }

        .szLocBenefitsList {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .szLocBenefitItem {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.82rem;
          line-height: 1.4;
        }

        .szLocBenefitIcon {
          font-size: 1.2rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .szLocBenefitItem strong {
          color: #fbbf24;
          display: inline;
          margin-left: 4px;
        }

        .szLocBenefitItem p {
          margin: 2px 0 0;
          color: #cbd5e1;
        }

        .szLocAlertMsg {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          margin-bottom: 12px;
        }

        .szLocCurrentDetected {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 14px;
        }

        .szLocActions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .szLocBtnPrimary {
          width: 100%;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.95rem;
          padding: 12px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
          transition: all 0.2s;
        }
        .szLocBtnPrimary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
        }
        .szLocBtnPrimary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .szLocBtnSecondary {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .szLocBtnSecondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .szLocManualPicker {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px;
        }

        .szLocPickerLabel {
          font-size: 0.8rem;
          color: #94a3b8;
          display: block;
          margin-bottom: 6px;
        }

        .szLocPickerRow {
          display: flex;
          gap: 8px;
        }

        .szLocSelect {
          flex: 1;
          background: #0f172a;
          border: 1px solid #334155;
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .szLocBtnSaveManual {
          background: #10b981;
          color: #ffffff;
          border: none;
          font-weight: 700;
          padding: 0 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .szLocBtnSkip {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.8rem;
          padding: 4px;
          cursor: pointer;
          text-align: center;
          text-decoration: underline;
        }
        .szLocBtnSkip:hover {
          color: #94a3b8;
        }

        @keyframes szFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes szScaleUp {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes szPulseGps {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(245, 158, 11, 0.35); }
          50% { transform: scale(1.08); box-shadow: 0 0 25px rgba(245, 158, 11, 0.6); }
        }
      `}</style>
    </div>
  );
}
