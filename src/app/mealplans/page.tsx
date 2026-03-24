"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MealPlansPage() {
  const { status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchPlans();
  }, [status, router]);

  const fetchPlans = async () => {
    const res = await fetch("/api/mealplans");
    if (res.ok) setPlans(await res.json());
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this Meal Plan entirely?")) return;
    const res = await fetch(`/api/mealplans?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchPlans();
  };

  if (status !== "authenticated") return <div className="spinner">Loading...</div>;

  return (
    <div className="fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2>My Meal Plans</h2>
        <Link href="/mealplans/new" className="btn btn-primary btn-large">📅 Create New Plan</Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
         {plans.length === 0 && <p style={{ color: "var(--text-secondary)" }}>You don't have any active meal plans. Generate one to simplify your cooking!</p>}
         {plans.map(p => {
             const start = new Date(p.startDate).toLocaleDateString();
             const end = new Date(p.endDate).toLocaleDateString();
             const profilesCount = JSON.parse(p.profiles).length;
             return (
                 <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                     <div>
                         <h3 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                             <span style={{ color: "var(--accent-primary)" }}>•</span> {start} to {end}
                         </h3>
                         <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                             Planned for {profilesCount} family members • <span style={{ color: "#a371f7", fontWeight: "600" }}>{p.energyLevel} Energy Required</span>
                         </div>
                     </div>
                     <div style={{ display: "flex", gap: "1rem" }}>
                         <Link href={`/mealplans/${p.id}`} className="btn btn-primary">View / Optimize</Link>
                         <button onClick={() => deletePlan(p.id)} className="btn btn-secondary" style={{ borderColor: "#f85149", color: "#f85149" }}>Discard</button>
                     </div>
                 </div>
             )
         })}
      </div>
    </div>
  )
}
