"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "code">("password");
  const [data, setData] = useState({ email: "", password: "" });
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) setError("Invalid email or password");
    else { router.push("/dashboard"); router.refresh(); }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email })
    });
    setLoading(false);
    if (res.ok) setCodeSent(true);
    else setError("Failed to send code. Try again.");
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, code })
    });
    if (res.ok) {
      const signInRes = await signIn("email-code", { email: data.email, redirect: false });
      setLoading(false);
      if (signInRes?.error) setError("Login failed. Try again.");
      else { router.push("/dashboard"); router.refresh(); }
    } else {
      setLoading(false);
      setError(await res.text());
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem", padding: "0 1rem" }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Welcome Back</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Sign in to your PrepMaster account
        </p>

        {/* Mode Toggle */}
        <div style={{ display: "flex", marginBottom: "1.5rem", background: "var(--bg-color)", borderRadius: "10px", padding: "0.3rem", gap: "0.3rem" }}>
          <button onClick={() => { setMode("password"); setCodeSent(false); setError(""); }}
            style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", fontFamily: "'Outfit', sans-serif",
              background: mode === "password" ? "var(--surface-color)" : "transparent",
              color: mode === "password" ? "var(--brand-teal)" : "var(--text-secondary)",
              boxShadow: mode === "password" ? "var(--shadow-sm)" : "none" }}>
            🔒 Password
          </button>
          <button onClick={() => { setMode("code"); setError(""); }}
            style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", fontFamily: "'Outfit', sans-serif",
              background: mode === "code" ? "var(--surface-color)" : "transparent",
              color: mode === "code" ? "var(--brand-teal)" : "var(--text-secondary)",
              boxShadow: mode === "code" ? "var(--shadow-sm)" : "none" }}>
            ✉️ Email Code
          </button>
        </div>

        {error && <p style={{ color: "#f85149", marginBottom: "1rem", fontSize: "0.9rem", textAlign: "center" }}>{error}</p>}

        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required value={data.email} onChange={e => setData({...data, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required value={data.password} onChange={e => setData({...data, password: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-teal" style={{ width: "100%", marginTop: "1rem" }}>Sign In</button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link href="/forgot-password" style={{ color: "var(--brand-orange)", fontSize: "0.85rem", fontWeight: 600 }}>Forgot password?</Link>
            </div>
          </form>
        ) : (
          !codeSent ? (
            <form onSubmit={handleSendCode}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" required value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="your@email.com" />
              </div>
              <button type="submit" className="btn btn-teal" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
                {loading ? "Sending..." : "Send Login Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <p style={{ color: "var(--brand-green)", fontSize: "0.9rem", marginBottom: "1rem", fontWeight: 600 }}>
                ✅ Code sent to {data.email}
              </p>
              <div className="form-group">
                <label className="form-label">6-Digit Code</label>
                <input type="text" required maxLength={6} value={code} onChange={e => setCode(e.target.value)} placeholder="123456"
                  style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px", fontWeight: 700 }} />
              </div>
              <button type="submit" className="btn btn-teal" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button type="button" onClick={() => { setCodeSent(false); setCode(""); }} style={{ background: "none", border: "none", width: "100%", marginTop: "0.5rem", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem" }}>
                ← Send a new code
              </button>
            </form>
          )
        )}

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Don&apos;t have an account? <Link href="/register" style={{ color: "var(--brand-green)", fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
