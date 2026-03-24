"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid Email or Password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login</h2>
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
            Sign In
          </button>
        </form>
        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Don't have an account? <a href="/register" style={{ color: "var(--accent-primary)" }}>Register</a>
        </p>
      </div>
    </div>
  );
}
