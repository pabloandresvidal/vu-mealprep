"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchHistory();
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/mealplans?history=true");
      if (res.ok) {
        setPlans(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status !== "authenticated" || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
        <div className="spinner">Loading History...</div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <h1 style={{ marginBottom: '0.5rem' }}>⏱️ Meal Prep History</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Review your past meal plans and optimization results.
      </p>

      {plans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No past meal plans found. Your journey starts here!</p>
          <Link href="/mealplans/new" className="btn btn-teal" style={{ marginTop: '1.5rem', width: 'auto' }}>Create your first plan</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {plans.map(p => {
            const start = new Date(p.startDate).toLocaleDateString();
            const end = new Date(p.endDate).toLocaleDateString();
            const isCompleted = new Date(p.endDate) < new Date();
            
            return (
              <div key={p.id} className="card" style={{ borderLeft: isCompleted ? '4px solid var(--text-muted)' : '4px solid var(--brand-green)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>{start} - {end}</h3>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      {p.numPeople} People • {p.energyLevel} Energy • {isCompleted ? 'Completed' : 'Active'}
                    </div>
                  </div>
                  <Link href={`/mealplans/${p.id}`} className="btn btn-outline" style={{ width: 'auto' }}>View Details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
