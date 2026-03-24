"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ recipeCount: 0, profileCount: 0, activePlansCount: 0 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
        fetch("/api/dashboard").then(r => r.json()).then(setStats);
    }
  }, [status, router]);

  const handleRandomRecipe = async () => {
      const res = await fetch("/api/recipes");
      const arr = await res.json();
      if(arr.length === 0) {
          alert("No recipes in your database. Let the AI generate some first!");
          return;
      }
      const random = arr[Math.floor(Math.random() * arr.length)];
      alert(`🍽️ Random Recipe Selected:\n\n${random.title}\nEnergy: ${random.energyLevel}`);
  }

  if (status !== "authenticated") return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
          <div className="spinner">Loading...</div>
      </div>
  );

  return (
    <div className="fade-in-up">
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
           <div>
               <h1 style={{ fontSize: "2.5rem", marginBottom: "0.2rem" }}>
                 Welcome back, <span style={{ color: "var(--accent-primary)" }}>{session.user?.email?.split("@")[0]}</span>
               </h1>
               <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", margin: 0 }}>
                 Here is an overview of your culinary ecosystem.
               </p>
           </div>
           <button onClick={() => { /* Implement Logout or use signout from next-auth */ }} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>Account Options</button>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
          <div className="card" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", padding: "2.5rem 1rem" }}>
             <div style={{ fontSize: "3.5rem", fontWeight: "800", color: "var(--accent-primary)", lineHeight: 1 }}>{stats.recipeCount}</div>
             <div style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "1px", marginTop: "0.5rem", fontWeight: "600" }}>Total Recipes</div>
          </div>
          <div className="card" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", padding: "2.5rem 1rem" }}>
             <div style={{ fontSize: "3.5rem", fontWeight: "800", color: "#a371f7", lineHeight: 1 }}>{stats.profileCount}</div>
             <div style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "1px", marginTop: "0.5rem", fontWeight: "600" }}>Family Members</div>
          </div>
          <div className="card" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", padding: "2.5rem 1rem" }}>
             <div style={{ fontSize: "3.5rem", fontWeight: "800", color: "#3fb950", lineHeight: 1 }}>{stats.activePlansCount}</div>
             <div style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "1px", marginTop: "0.5rem", fontWeight: "600" }}>Meal Plans</div>
          </div>
       </div>

       <h2 style={{ marginBottom: "1.5rem", fontSize: "1.8rem" }}>Quick Actions</h2>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          <Link href="/mealplans/new" className="card" style={{ textDecoration: "none", border: "1px solid var(--accent-primary)", background: "rgba(88, 166, 255, 0.05)", transition: "all 0.2s" }}>
             <h3 style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>📅 Generate Meal Plan</h3>
             <p style={{ color: "var(--text-secondary)", margin: 0 }}>Use AI to construct an optimized multi-day prep plan for your family.</p>
          </Link>
          <Link href="/recipes/ai" className="card" style={{ textDecoration: "none", transition: "all 0.2s" }}>
             <h3 style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>✨ Discover Recipes</h3>
             <p style={{ color: "var(--text-secondary)", margin: 0 }}>Ask the AI culinary assistant to find or invent a new meal.</p>
          </Link>
          <button 
             onClick={handleRandomRecipe} 
             className="card" 
             style={{ textAlign: "left", cursor: "pointer", background: "var(--card-bg)", transition: "all 0.2s" }}
          >
             <h3 style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>🎲 Random Recipe Prep</h3>
             <p style={{ color: "var(--text-secondary)", margin: 0 }}>Pick a random recipe from your collection for tonight's dinner.</p>
          </button>
       </div>
    </div>
  )
}
