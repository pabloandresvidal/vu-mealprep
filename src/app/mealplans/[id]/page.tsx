"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";

export default function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<any>(null);
  const [optimized, setOptimized] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Meal Plan - PrepMaster</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 2rem; color: #113f36; }
        h1,h2,h3 { margin-bottom: 0.5rem; }
        ul,ol { padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; }
        .section { margin-bottom: 2rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>🍳 PrepMaster — Meal Plan</h1>
      <p>Date Range: ${formatDate(plan.startDate)} to ${formatDate(plan.endDate)}</p>
      <p>Energy Level: ${plan.energyLevel} | People: ${plan.numPeople}</p>
      <hr/>
      ${content.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  if (!plan) return <div className="spinner">Loading...</div>;

  const rawRefs = JSON.parse(plan.recipeRefs);

  // Use actual dates from the daily assignments if available, otherwise fall back to plan dates
  const assignmentDates = rawRefs.map((r: any) => r.date).sort();
  const displayStart = assignmentDates.length > 0 ? assignmentDates[0] : formatDate(plan.startDate);
  const displayEnd = assignmentDates.length > 0 ? assignmentDates[assignmentDates.length - 1] : formatDate(plan.endDate);

  return (
    <div className="fade-in-up" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "4rem" }}>
       <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
         <Link href="/mealplans" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Meal Plans</Link>
         {optimized && (
           <button onClick={handleDownloadPDF} className="btn btn-teal" style={{ width: "auto" }}>📄 Download PDF</button>
         )}
       </div>

       <div className="card" style={{ marginBottom: "3rem", borderTop: "4px solid var(--brand-orange)" }}>
           <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: 'var(--brand-teal)' }}>
             Meal Plan: {displayStart} to {displayEnd}
           </h2>
           <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem" }}>
             Target Energy: <span style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>{plan.energyLevel}</span> · 
             <span style={{ marginLeft: '0.5rem' }}>👥 {plan.numPeople} People</span>
           </p>

           <h3 style={{ textTransform: "uppercase", fontSize: "0.9rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "1rem" }}>Daily Assignments</h3>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
               {rawRefs.map((ref: any, idx: number) => (
                   <div key={idx} className="card" style={{ padding: "1.2rem", border: "1px solid var(--border-color)", background: "#fff" }}>
                       <strong style={{ display: "block", color: "var(--brand-orange)", marginBottom: "0.5rem" }}>{ref.date} - {ref.meal}</strong>
                       <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: 'var(--brand-teal)', fontWeight: 500 }}>{ref.reason}</p>
                   </div>
               ))}
           </div>
       </div>

       {!optimized ? (
           <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
               <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Master Your Sunday Prep</h3>
               <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
                   Use AI to combine your entire week&apos;s recipes into one unified shopping list and a chronologically optimized &quot;Prep in One Go&quot; timeline.
               </p>
               <button disabled={loading} onClick={handleOptimize} className="btn btn-primary btn-large" style={{ fontSize: "1.2rem", padding: "1rem 2.5rem", background: 'linear-gradient(135deg, #10b981, #047857)' }}>
                   {loading ? "Optimizing the week..." : "⚡ Optimize In One Go"}
               </button>
           </div>
       ) : (
           <div className="fade-in-up" ref={printRef}>
               <h2 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center", color: "var(--brand-teal)" }}>⚡ Optimized "Prep in One Go"</h2>
               
               <div className="card section" style={{ marginBottom: "2rem" }}>
                   <h3 style={{ color: "var(--brand-green)", textTransform: "uppercase", fontSize: "1rem", letterSpacing: "1px", marginBottom: "1rem" }}>🛒 Shopping List</h3>
                   <ul style={{ paddingLeft: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                       {optimized.shoppingList?.map((i: any, idx: number) => (
                           <li key={idx}><strong>{i.combinedAmount}</strong> {i.item}</li>
                       ))}
                   </ul>
               </div>

               <div className="card section" style={{ marginBottom: "2rem" }}>
                   <h3 style={{ color: "#a371f7", textTransform: "uppercase", fontSize: "1rem", letterSpacing: "1px", marginBottom: "1rem" }}>🔪 Unified Mise En Place</h3>
                   <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                       {optimized.unifiedMiseEnPlace?.map((step: string, idx: number) => <li key={idx} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>{step}</li>)}
                   </ol>
               </div>

               <div className="card section" style={{ marginBottom: "2rem" }}>
                   <h3 style={{ color: "var(--brand-teal)", textTransform: "uppercase", fontSize: "1rem", letterSpacing: "1px", marginBottom: "1rem" }}>👨‍🍳 Day-of Instructions</h3>
                   <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                       {optimized.unifiedInstructions?.map((step: string, idx: number) => <li key={idx} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>{step}</li>)}
                   </ol>
               </div>
           </div>
       )}
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-CA'); // YYYY-MM-DD format
}
