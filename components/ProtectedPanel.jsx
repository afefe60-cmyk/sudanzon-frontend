"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiJson } from "../lib/api";

export default function ProtectedPanel({ endpoint, title, subtitle, render }) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("جاري تحميل البيانات...");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("sudanzonToken");
    if (!token) {
      router.replace(`/auth/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    apiJson(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        setData(result);
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, [endpoint, pathname, router]);

  return (
    <div className="cardPanel">
      <h3>{title}</h3>
      <p style={{ color: "var(--amazon-muted)", marginTop: 8 }}>{subtitle}</p>
      {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
      {data ? render(data) : null}
    </div>
  );
}
