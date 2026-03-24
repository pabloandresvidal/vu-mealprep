"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Highlight active tabs
  const isActive = (path: string) => pathname.startsWith(path) ? "active" : "";

  return (
    <>
      <header className="navbar">
        <Link href="/" className="logo-container">
          <div className="logo-icon">👩‍🍳</div>
          <div className="logo-text-wrapper">
            <span className="logo-main">PrepMaster</span>
            <span className="logo-sub">AI Kitchen Assistant</span>
          </div>
        </Link>
        
        <div className="nav-user-section">
          {status === "authenticated" ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="user-welcome">
                <div className="user-welcome-title">Welcome back!</div>
                <div className="user-welcome-sub">{session.user?.email}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/account" className={`pill-tab ${isActive("/account")}`} style={{ padding: '0.4rem 0.8rem', width: 'auto' }}>
                   <span style={{ fontSize: '1.2rem' }}>👤</span>
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-secondary" style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>
                   Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="nav-links">
              <Link href="/login" className="btn btn-outline">Log In</Link>
              <Link href="/register" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #10b981, #047857)" }}>Get Started</Link>
            </div>
          )}
        </div>
      </header>

      {status === "authenticated" && (
        <div className="pill-nav-container fade-in-up">
          <div className="pill-nav">
            <Link href="/dashboard" className={`pill-tab ${isActive("/dashboard") || pathname === "/" ? "active" : ""}`}>
              <span className="pill-icon-teal">📊</span> Dashboard
            </Link>
            <Link href="/recipes" className={`pill-tab ${isActive("/recipes")}`}>
              <span className="pill-icon-teal">🥗</span> Recipes
            </Link>
            <Link href="/mealplans" className={`pill-tab ${isActive("/mealplans")}`}>
              <span className="pill-icon-green">📆</span> Meal Prep
            </Link>
            <Link href="/history" className={`pill-tab ${isActive("/history")}`}>
              <span className="pill-icon-teal">⏱️</span> History
            </Link>
            <Link href="/profile" className={`pill-tab ${isActive("/profile")}`}>
              <span className="pill-icon-teal">👨‍👩‍👧‍👦</span> Family
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
