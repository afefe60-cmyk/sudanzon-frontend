"use client";

import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

export default function ProtectedPanel({ endpoint, title, subtitle, render }) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("جاري تحميل البيانات...");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sudanzonToken") : null;
    if (!token) {
      setMessage("");
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
      .catch((error) => {
        setMessage(error.message || "تعذر جلب البيانات");
      });
  }, [endpoint]);

  return (
    <div className="cardPanel" style={{ background: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
      <h3 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>{title}</h3>
      {subtitle && <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>{subtitle}</p>}
      {message && !data && <p style={{ marginTop: 12, color: "#64748b", fontSize: "0.88rem" }}>{message}</p>}
      {data ? render(data) : null}
    </div>
  );
}
