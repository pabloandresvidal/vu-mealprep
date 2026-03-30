"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else setError("Something went wrong. Please try again.");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem", padding: "0 1rem" }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Reset Password</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && <p style={{ color: "#f85149", marginBottom: "1rem", textAlign: "center" }}>{error}</p>}

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
            <p style={{ color: "var(--brand-green)", fontWeight: 600, marginBottom: "1rem" }}>Check your email!</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              If an account exists for {email}, you&apos;ll receive a reset link.
            </p>
            <Link href="/login" className="btn btn-outline" style={{ marginTop: "1.5rem", justifyContent: "center" }}>← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <button type="submit" className="btn btn-teal" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link href="/login" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>← Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
