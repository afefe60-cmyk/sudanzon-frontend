"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";

export default function GoogleAuthButton({
  endpoint = "/api/auth/google",
  returnTo = "/",
  label = "المتابعة عبر Google",
}) {
  const buttonRef = useRef(null);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!clientId || !buttonRef.current) {
      return;
    }

    let cancelled = false;

    const mountButton = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setMessage("");
            const result = await apiJson(endpoint, {
              method: "POST",
              body: JSON.stringify({ credential: response.credential }),
            });

            if (typeof window !== "undefined") {
              localStorage.setItem("sudanzonToken", result.token);
              localStorage.setItem("sudanzonUser", JSON.stringify(result.user));
            }

            window.dispatchEvent(new Event("sudanzon-user-updated"));
            router.push(returnTo);
          } catch (error) {
            setMessage(error.message);
          }
        },
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: buttonRef.current.clientWidth || 360,
      });
      setReady(true);
    };

    if (window.google?.accounts?.id) {
      mountButton();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector('script[data-sudanzon-google="true"]');
    const script =
      existing ||
      Object.assign(document.createElement("script"), {
        src: "https://accounts.google.com/gsi/client",
        async: true,
        defer: true,
      });

    if (!existing) {
      script.dataset.sudanzonGoogle = "true";
      script.addEventListener("load", mountButton, { once: true });
      document.head.appendChild(script);
    } else if (existing.readyState === "complete") {
      mountButton();
    } else {
      script.addEventListener("load", mountButton, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, [clientId, endpoint, returnTo, router]);

  if (!clientId) {
    return (
      <div className="googleAuthNotice">
        <strong>Google غير مفعّل بعد</strong>
        <p>
          أضف <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> إلى ملف البيئة الخاص بالواجهة ثم أعد التشغيل لتفعيل
          التسجيل عبر Google.
        </p>
      </div>
    );
  }

  return (
    <div className="googleAuthWrap">
      <div ref={buttonRef} className="googleAuthButton" aria-label={label} />
      {ready ? <p className="googleAuthHint">يمكنك المتابعة مباشرة بحساب Google.</p> : null}
      {message ? <p className="googleAuthError">{message}</p> : null}
    </div>
  );
}
