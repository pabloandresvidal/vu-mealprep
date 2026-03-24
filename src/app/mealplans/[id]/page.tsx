"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [plan, setPlan] = useState<any>(null);
  const [optimized, setOptimized] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/mealplans?id=${id}`)
      .then(r => r.json())
      .then(data => {
          setPlan(data);
          if (data.generatedPlan) setOptimized(JSON.parse(data.generatedPlan));
      });
  }, [id]);

  const handleOptimize = async () => {
      setLoading(true);
      const res = await fetch("/api/mealplans/optimize", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: plan.id })
      });
      if (res.ok) setOptimized(await res.json());
      else alert("Failed to optimize");
      setLoading(false);
  }

  const handleDownloadEmail = () => {
      // For demonstration in V1, standard JS alert indicating the export feature
      // You can implement html2canvas + jsPDF here in the future
      alert("Plan is ready to be emailed! In a production build, this would trigger our SMTP provider.");
  }

  if (!plan) return <div className="spinner">Loading...</div>;

  const rawRefs = JSON.parse(plan.recipeRefs);

  return (
    <div className="fade-in-up" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "4rem" }}>
       <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <Link href="/mealplans" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Meal Plans</Link>
         {optimized && <button onClick={handleDownloadEmail} className="btn btn-primary" style={{ background: "#2ea043" }}>📥 Export plan (Email/Download)</button>}
       </div>

       <div className="card" style={{ marginBottom: "3rem", borderTop: "4px solid var(--accent-primary)" }}>
           <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: 'var(--brand-teal)' }}>Meal Plan: {new Date(plan.startDate).toLocaleDateString()} to {new Date(plan.endDate).toLocaleDateString()}</h2>
           <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem" }}>Target Energy: <span style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>{plan.energyLevel}</span></p>

           <h3 style={{ textTransform: "uppercase", fontSize: "0.9rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "1rem" }}>Daily Assignments</h3>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
               {rawRefs.map((ref: any, idx: number) => (
                   <div key={idx} className="card" style={{ padding: "1.2rem", border: "1px solid var(--border-color)", background: "#fff" }}>
                       <strong style={{ display: "block", color: "var(--accent-primary)", marginBottom: "0.5rem" }}>{ref.date} - {ref.meal}</strong>
                       <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: 'var(--brand-teal)', fontWeight: 500 }}>{ref.reason}</p>
                   </div>
               ))}
           </div>
       </div>

       {!optimized ? (
           <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
               <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Master Your Sunday Prep</h3>
               <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
                   Use AI to combine your entire week's recipes into one unified shopping list and a chronologically optimized "Prep in One Go" timeline.
               </p>
               <button disabled={loading} onClick={handleOptimize} className="btn btn-primary btn-large" style={{ fontSize: "1.2rem", padding: "1rem 2.5rem" }}>
                   {loading ? "Optimizing the week..." : "⚡ Optimize In One Go"}
               </button>
           </div>
       ) : (
           <div className="fade-in-up">
               <h2 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center", color: "var(--accent-primary)" }}>⚡ Optimized "Prep in One Go"</h2>
               
               <div className="card" style={{ marginBottom: "2rem" }}>
                   <h3 style={{ color: "var(--accent-primary)", textTransform: "uppercase", fontSize: "1rem", letterSpacing: "1px", marginBottom: "1rem" }}>Shopping List</h3>
                   <ul style={{ paddingLeft: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                       {optimized.shoppingList.map((i: any, idx: number) => (
                           <li key={idx}><strong style={{ color: "var(--text-primary)" }}>{i.combinedAmount}</strong> {i.item}</li>
                       ))}
                   </ul>
               </div>

               <div className="card" style={{ marginBottom: "2rem" }}>
                   <h3 style={{ color: "#a371f7", textTransform: "uppercase", fontSize: "1rem", letterSpacing: "1px", marginBottom: "1rem" }}>Unified Mise En Place</h3>
                   <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                       {optimized.unifiedMiseEnPlace.map((step: string, idx: number) => <li key={idx} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>{step}</li>)}
                   </ol>
               </div>

               <div className="card" style={{ marginBottom: "2rem" }}>
                   <h3 style={{ color: "#3fb950", textTransform: "uppercase", fontSize: "1rem", letterSpacing: "1px", marginBottom: "1rem" }}>Consolidated Day-of Instructions</h3>
                   <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                       {optimized.unifiedInstructions.map((step: string, idx: number) => <li key={idx} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>{step}</li>)}
                   </ol>
               </div>
           </div>
       )}
    </div>
  )
}
