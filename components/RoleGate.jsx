"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "../lib/api";

export default function RoleGate({ allowedRoles = ["ADMIN"], fallback = "/account", children }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const checkAuth = async () => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("sudanzonToken") : null;

    if (!token) {
      setReady(true);
      setAllowed(false);
      return;
    }

    try {
      const result = await apiJson("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const role = result?.user?.role || null;
      setUserRole(role);

      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        setAllowed(false);
      } else {
        setAllowed(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sudanzonUser", JSON.stringify(result.user));
          window.dispatchEvent(new Event("sudanzon-user-updated"));
        }
      }
    } catch {
      setAllowed(false);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword.trim(),
        }),
      });

      if (result.token) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sudanzonToken", result.token);
          window.localStorage.setItem("sudanzonUser", JSON.stringify(result.user));
          window.dispatchEvent(new Event("sudanzon-user-updated"));
        }

        const role = result.user?.role || null;
        setUserRole(role);

        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          setLoginError(`هذا الحساب مسجل كـ (${role}) وليس لديه صلاحية الإدارة (ADMIN).`);
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      }
    } catch (error) {
      setLoginError(error.message || "بيانات الدخول غير صحيحة");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("sudanzonToken");
      window.localStorage.removeItem("sudanzonUser");
      window.dispatchEvent(new Event("sudanzon-user-updated"));
    }
    setAllowed(false);
    setUserRole(null);
  };

  if (!ready) {
    return (
      <div className="szRoleGateLoadingCard">
        <div className="szSpinner" />
        <p>جارِ التحقق من الصلاحيات الإدارية...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="szRoleGateContainer">
        <div className="szRoleGateCard">
          <div className="szRoleGateIcon">🛡️</div>
          <h2 className="szRoleGateTitle">لوحة التحكم والإدارة (Admin Portal)</h2>

          {userRole ? (
            <div className="szRoleGateErrorBox">
              <p>
                أنت مسجل حالياً بحساب ذو صلاحية <strong>({userRole})</strong>. للدخول إلى لوحة الإدارة العامة لمنصة SudanZon يجب تسجيل الدخول بحساب المدير (ADMIN).
              </p>
              <button type="button" onClick={handleLogout} className="szSwitchAccountBtn">
                تسجيل الخروج والتبديل لحساب المدير
              </button>
            </div>
          ) : (
            <p className="szRoleGateSubtitle">
              يرجى تسجيل الدخول بحساب المدير للوصول إلى مركز الإدارة والتحكم التنفيذي.
            </p>
          )}

          {(!userRole || userRole !== "ADMIN") && (
            <form onSubmit={handleAdminLogin} className="szRoleGateForm">
              {loginError && <div className="szRoleGateAlert">⚠️ {loginError}</div>}

              <div className="szFormGroup">
                <label className="szFormLabel">البريد الإلكتروني أو الهاتف</label>
                <input
                  type="text"
                  className="szFormInput"
                  placeholder="admin@sudanzon.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="szFormGroup">
                <label className="szFormLabel">كلمة المرور</label>
                <input
                  type="password"
                  className="szFormInput"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="szSubmitBtn" disabled={loginLoading}>
                {loginLoading ? "جارِ التحقق والدخول..." : "دخول إلى لوحة الإدارة"}
              </button>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <Link href="/" style={{ color: "#64748b", fontSize: "0.85rem", textDecoration: "none" }}>
                  ← العودة إلى الصفحة الرئيسية
                </Link>
              </div>
            </form>
          )}
        </div>

        <style jsx>{`
          .szRoleGateContainer {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 16px;
            direction: rtl;
          }
          .szRoleGateCard {
            width: 100%;
            max-width: 440px;
            background: #ffffff;
            border-radius: 24px;
            padding: 36px 28px;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
            border: 1px solid #e2e8f0;
            text-align: center;
          }
          .szRoleGateIcon {
            font-size: 3rem;
            margin-bottom: 12px;
          }
          .szRoleGateTitle {
            margin: 0;
            font-size: 1.45rem;
            font-weight: 800;
            color: #0f172a;
          }
          .szRoleGateSubtitle {
            margin: 8px 0 20px;
            font-size: 0.88rem;
            color: #64748b;
            line-height: 1.6;
          }
          .szRoleGateErrorBox {
            background: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 16px;
            border-radius: 12px;
            margin: 16px 0;
            color: #92400e;
            font-size: 0.88rem;
            line-height: 1.6;
          }
          .szSwitchAccountBtn {
            margin-top: 10px;
            padding: 8px 14px;
            border-radius: 8px;
            background: #d97706;
            color: #fff;
            border: none;
            cursor: pointer;
            font-weight: 700;
            font-size: 0.85rem;
          }
          .szRoleGateForm {
            text-align: right;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .szRoleGateAlert {
            background: #fef2f2;
            border: 1px solid #fee2e2;
            color: #b91c1c;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 0.85rem;
          }
          .szRoleGateLoadingCard {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
          }
          .szSpinner {
            width: 36px;
            height: 36px;
            border: 3px solid #e2e8f0;
            border-top-color: #059669;
            border-radius: 50%;
            margin: 0 auto 12px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return children;
}
