"use client";

import { useState, useRef, useEffect } from "react";

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "مرحباً بك في سودان زون 🇸🇩! كيف يمكننا خدمتك اليوم؟ يمكنك الاتصال بنا، مراسلتنا واتساب، أو اختيار سؤال سريع:",
      time: "الآن",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);

  const WHATSAPP_NUMBER = "249907620105";
  const PHONE_NUMBER = "0116731488";

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend) => {
    const query = textToSend || inputVal.trim();
    if (!query) return;

    const userMsg = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("ar-SD", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");

    setTimeout(() => {
      let replyText = `شكراً لتواصلك! يمكنك أيضاً محادثتنا مباشرة عبر واتساب على 0907620105 أو الاتصال هاتفياً على ${PHONE_NUMBER} وسيقوم ممثل خدمة العملاء بالرد عليك فوراً.`;
      
      const q = query.toLowerCase();
      if (q.includes("تتبع") || q.includes("طلبي") || q.includes("شحن")) {
        replyText = "📦 لتتبع طلبك: يمكنك فتح صفحة 'متابعة الطلبات' في القائمة العلوية، أو تزويدنا برقم الطلب عبر واتساب 0907620105 للربط المباشر مع مندوب التوصيل في مدينتك.";
      } else if (q.includes("تاجر") || q.includes("بائع") || q.includes("انضمام") || q.includes("تسجيل")) {
        replyText = "🏬 فتح متجر على سودان زون مجاني 100%! توجّه إلى صفحة 'كن بائعاً في سودان زون' للتسجيل الفوري أو اتصل بنا مباشرة على 0116731488.";
      } else if (q.includes("دفع") || q.includes("بنكك") || q.includes("كاش") || q.includes("تحويل")) {
        replyText = "💳 طرق الدفع المتاحة: الدفع عند الاستلام (كاش) في كافة الولايات، أو التحويل الفوري عبر تطبيق بنكك (Bankak).";
      } else if (q.includes("مرحبا") || q.includes("السلام") || q.includes("هلا")) {
        replyText = "أهلاً وسهلاً بك في منصة سودان زون! فريقنا متواجد 24/7 لمساعدتك في أي استفسار أو طلب شراء.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString("ar-SD", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 600);
  };

  return (
    <aside className="szSupportWidgetRoot" dir="rtl" aria-label="مركز الدعم والمساعدة المباشرة">
      {/* Expanded Support Window */}
      {isOpen && (
        <div className="szSupportBox" role="dialog" aria-modal="true" aria-label="محادثة الدعم المباشر">
          {/* Header */}
          <div className="szSupportHeader">
            <div className="szSupportHeaderInfo">
              <div className="szSupportAvatar">🎧</div>
              <div>
                <h4 className="szSupportTitle">خدمة عملاء سودان زون</h4>
                <p className="szSupportSubtitle">
                  <span className="szLiveDot" />
                  متاحون لخدمتك ومساعدتك فوراً
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="szSupportCloseBtn"
              aria-label="إغلاق نافذة الدعم"
            >
              ✕
            </button>
          </div>

          {/* Quick Contact Action Bar */}
          <div className="szSupportActionGrid">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً سودان زون، أود الاستفسار والمساعدة.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="szSupportActionCard szSupportActionCard--whatsapp"
            >
              <div className="szSupportActionIcon szSupportActionIcon--wa">💬</div>
              <div className="szSupportActionText">
                <span className="szSupportActionLabel">واتساب مباشر</span>
                <span className="szSupportActionVal" dir="ltr">0907620105</span>
              </div>
              <span className="szSupportActionBadge">رد فوري</span>
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="szSupportActionCard szSupportActionCard--phone"
            >
              <div className="szSupportActionIcon szSupportActionIcon--phone">📞</div>
              <div className="szSupportActionText">
                <span className="szSupportActionLabel">اتصال هاتفي</span>
                <span className="szSupportActionVal" dir="ltr">0116731488</span>
              </div>
              <span className="szSupportActionBadge">اتصال سريع</span>
            </a>
          </div>

          {/* Chat Messages */}
          <div className="szSupportChatArea">
            <div className="szSupportChatHeaderNote">
              ⚡ المساعد التفاعلي الذكي (سودان زون)
            </div>

            <div className="szSupportChatList">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`szChatMsgWrap ${
                    msg.sender === "user" ? "szChatMsgWrap--user" : "szChatMsgWrap--bot"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="szChatBotIcon">SZ</div>
                  )}
                  <div className="szChatBubble">
                    <p className="szChatBubbleText">{msg.text}</p>
                    <span className="szChatTime">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Chips */}
            <div className="szSupportChipsTrack">
              <button
                type="button"
                onClick={() => handleSend("أود تتبع حالة طلبي")}
                className="szSupportChip"
              >
                📦 تتبع طلبي
              </button>
              <button
                type="button"
                onClick={() => handleSend("كيف أسجل كتاجر جديد؟")}
                className="szSupportChip"
              >
                🏬 تسجيل متجر جديد
              </button>
              <button
                type="button"
                onClick={() => handleSend("ما هي خيارات الدفع؟")}
                className="szSupportChip"
              >
                💳 خيارات الدفع وبنكك
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="szSupportInputRow"
            >
              <input
                type="text"
                placeholder="اكتب استفسارك هنا..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="szSupportInputField"
              />
              <button
                type="submit"
                className="szSupportSendBtn"
                aria-label="إرسال الرسالة"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`szSupportFloatingBtn ${isOpen ? "szSupportFloatingBtn--active" : ""}`}
        aria-label="فتح مركز المساعدة والتواصل"
      >
        <span className="szSupportFloatingRing" />
        <span className="szSupportFloatingIcon">
          {isOpen ? "✕" : "💬"}
        </span>
        {!isOpen && unreadCount > 0 && (
          <span className="szSupportBadgeCount">{unreadCount}</span>
        )}
      </button>

      <style jsx>{`
        .szSupportWidgetRoot {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 99999;
          font-family: inherit;
        }

        .szSupportFloatingBtn {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 10px 28px rgba(16, 185, 129, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          outline: none;
        }

        .szSupportFloatingBtn:hover {
          transform: scale(1.08);
          box-shadow: 0 14px 34px rgba(16, 185, 129, 0.55);
        }

        .szSupportFloatingBtn--active {
          background: #0f172a;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.35);
        }

        .szSupportFloatingRing {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(16, 185, 129, 0.5);
          animation: szPulseRing 2.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
          pointer-events: none;
        }

        @keyframes szPulseRing {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .szSupportFloatingIcon {
          font-size: 1.6rem;
          line-height: 1;
        }

        .szSupportBadgeCount {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }

        .szSupportBox {
          position: absolute;
          bottom: 74px;
          left: 0;
          width: 360px;
          max-width: calc(100vw - 32px);
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: szSupportPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes szSupportPop {
          0% { opacity: 0; transform: translateY(16px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .szSupportHeader {
          background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
          padding: 16px 18px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .szSupportHeaderInfo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .szSupportAvatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .szSupportTitle {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
        }

        .szSupportSubtitle {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .szLiveDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
          box-shadow: 0 0 6px #10b981;
        }

        .szSupportCloseBtn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #cbd5e1;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          transition: background 0.2s ease;
        }

        .szSupportCloseBtn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .szSupportActionGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 12px 14px;
          background: #f8fafc;
          border-bottom: 1px solid #edf2f7;
        }

        .szSupportActionCard {
          display: flex;
          flex-direction: column;
          padding: 10px;
          border-radius: 14px;
          text-decoration: none;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .szSupportActionCard:hover {
          transform: translateY(-2px);
        }

        .szSupportActionCard--whatsapp {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
        }

        .szSupportActionCard--phone {
          background: #fffbeb;
          border: 1.5px solid #fde68a;
        }

        .szSupportActionIcon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          margin-bottom: 6px;
        }

        .szSupportActionIcon--wa {
          background: #10b981;
          color: #ffffff;
        }

        .szSupportActionIcon--phone {
          background: #f59e0b;
          color: #0f172a;
        }

        .szSupportActionLabel {
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          display: block;
        }

        .szSupportActionVal {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0f172a;
          display: block;
          font-family: monospace;
          margin-top: 1px;
        }

        .szSupportActionBadge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 99px;
          background: rgba(15, 23, 42, 0.08);
          color: #0f172a;
        }

        .szSupportChatArea {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .szSupportChatHeaderNote {
          padding: 8px 14px;
          background: #f1f5f9;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          text-align: center;
        }

        .szSupportChatList {
          padding: 12px 14px;
          height: 190px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
        }

        .szChatMsgWrap {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          max-width: 88%;
        }

        .szChatMsgWrap--bot {
          align-self: flex-start;
        }

        .szChatMsgWrap--user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .szChatBotIcon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .szChatBubble {
          padding: 9px 12px;
          border-radius: 16px;
          position: relative;
        }

        .szChatMsgWrap--bot .szChatBubble {
          background: #f1f5f9;
          color: #0f172a;
          border-top-right-radius: 4px;
        }

        .szChatMsgWrap--user .szChatBubble {
          background: #10b981;
          color: #ffffff;
          border-top-left-radius: 4px;
        }

        .szChatBubbleText {
          margin: 0;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .szChatTime {
          display: block;
          font-size: 0.62rem;
          color: #94a3b8;
          text-align: left;
          margin-top: 4px;
        }

        .szChatMsgWrap--user .szChatTime {
          color: rgba(255, 255, 255, 0.8);
        }

        .szSupportChipsTrack {
          display: flex;
          gap: 6px;
          padding: 6px 12px;
          background: #f8fafc;
          border-top: 1px solid #edf2f7;
          overflow-x: auto;
          white-space: nowrap;
        }

        .szSupportChip {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .szSupportChip:hover {
          background: #ecfdf5;
          border-color: #10b981;
          color: #059669;
        }

        .szSupportInputRow {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px 12px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
        }

        .szSupportInputField {
          flex: 1;
          height: 38px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          font-size: 0.82rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .szSupportInputField:focus {
          border-color: #10b981;
        }

        .szSupportSendBtn {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #10b981;
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform: rotate(180deg);
          transition: background 0.2s ease;
        }

        .szSupportSendBtn:hover {
          background: #059669;
        }
      `}</style>
    </aside>
  );
}
