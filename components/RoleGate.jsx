"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiJson } from "../lib/api";

export default function RoleGate({ allowedRoles = [], fallback = "/account", children }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = window.localStorage.getItem("sudanzonToken");

    if (!token) {
      router.replace(`/auth/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    apiJson("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        const role = result?.user?.role || null;

        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          router.replace(fallback);
          return;
        }

        window.localStorage.setItem("sudanzonUser", JSON.stringify(result.user));
        window.dispatchEvent(new Event("sudanzon-user-updated"));
        setAllowed(true);
        setReady(true);
      })
      .catch(() => {
        router.replace(`/auth/login?returnTo=${encodeURIComponent(pathname)}`);
      });
  }, [allowedRoles, fallback, pathname, router]);

  if (!ready || !allowed) {
    return (
      <div className="cardPanel">
        <p>جارِ التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return children;
}
