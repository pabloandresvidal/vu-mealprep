"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(await res.text());
  };

  if (!token) return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        <p style={{ color: "#f85149" }}>Invalid reset link.</p>
        <Link href="/forgot-password" className="btn btn-outline" style={{ marginTop: "1rem", justifyContent: "center" }}>Request a new one</Link>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem", padding: "0 1rem" }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Set New Password</h2>
        {error && <p style={{ color: "#f85149", marginBottom: "1rem", textAlign: "center" }}>{error}</p>}
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ color: "var(--brand-green)", fontWeight: 600, marginBottom: "1rem" }}>Password updated!</p>
            <Link href="/login" className="btn btn-teal" style={{ justifyContent: "center" }}>Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} minLength={6} />
            </div>
            <button type="submit" className="btn btn-teal" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="spinner">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
