"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";

export default function AuthForm({ title, subtitle, endpoint, fields, submitLabel, returnTo = "/" }) {
  const [form, setForm] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || "" }), {})
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await apiJson(endpoint, {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("sudanzonToken", result.token);
        localStorage.setItem("sudanzonUser", JSON.stringify(result.user));
        window.dispatchEvent(new Event("sudanzon-user-updated"));
      }

      setMessage(result.message || "تمت العملية بنجاح");
      if (returnTo) {
        router.push(returnTo);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cardPanel formPanel">
      <div>
        <h3>{title}</h3>
        {subtitle ? <p style={{ color: "var(--muted)", marginTop: 8 }}>{subtitle}</p> : null}
      </div>

      <form onSubmit={onSubmit} className="formPanel">
        {fields.map((field) => (
          <input
            key={field.name}
            className="input"
            name={field.name}
            type={field.type || "text"}
            placeholder={field.placeholder}
            value={form[field.name]}
            onChange={onChange}
            required={field.required !== false}
          />
        ))}

        <button className="primaryBtn" type="submit" disabled={loading}>
          {loading ? "جاري الإرسال..." : submitLabel}
        </button>
      </form>

      {message ? <p style={{ marginTop: 12, color: "#ffd84d" }}>{message}</p> : null}
    </div>
  );
}
