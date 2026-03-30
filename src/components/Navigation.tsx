"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname.startsWith(path) ? "active" : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = session?.user?.email?.charAt(0).toUpperCase() || "?";

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} ref={menuRef}>
              <div className="user-welcome" style={{ display: 'none' }}>
                {/* Hidden on mobile, shown via CSS if desired */}
              </div>
              <div className="avatar-menu-container">
                <button 
                  className="avatar-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Account menu"
                >
                  <span>{userInitial}</span>
                </button>
                {menuOpen && (
                  <div className="avatar-dropdown">
                    <div className="avatar-dropdown-header">
                      <div className="avatar-dropdown-email">{session.user?.email}</div>
                    </div>
                    <div className="avatar-dropdown-divider" />
                    <Link href="/account" className="avatar-dropdown-item" onClick={() => setMenuOpen(false)}>
                      ⚙️ Account Settings
                    </Link>
                    <Link href="/profile" className="avatar-dropdown-item" onClick={() => setMenuOpen(false)}>
                      👨‍👩‍👧‍👦 Family Profiles
                    </Link>
                    <Link href="/history" className="avatar-dropdown-item" onClick={() => setMenuOpen(false)}>
                      ⏱️ History
                    </Link>
                    <div className="avatar-dropdown-divider" />
                    <button 
                      onClick={() => signOut({ callbackUrl: "/" })} 
                      className="avatar-dropdown-item avatar-dropdown-signout"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="nav-links">
              <Link href="/login" className="btn btn-outline" style={{ width: 'auto' }}>Log In</Link>
              <Link href="/register" className="btn btn-primary" style={{ width: 'auto', background: "linear-gradient(135deg, #10b981, #047857)" }}>Get Started</Link>
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
          </div>
        </div>
      )}
    </>
  );
}
