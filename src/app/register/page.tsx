"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        setError(text);
        return;
      }

      await signIn("credentials", {
        ...data,
        redirect: false,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Create Account</h2>
        {error && <p style={{ color: "#f85149", marginBottom: "1rem" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              required 
              value={data.email}
              onChange={(e) => setData({...data, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required 
              value={data.password}
              onChange={(e) => setData({...data, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
            Sign Up
          </button>
        </form>
        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Already have an account? <a href="/login" style={{ color: "var(--accent-primary)" }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}
