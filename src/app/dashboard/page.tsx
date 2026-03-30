"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [numPeople, setNumPeople] = useState(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/recipes").then(r => r.json()).then(setRecipes).catch(() => {});
      fetch("/api/mealplans").then(r => r.json()).then(setPlans).catch(() => {});
    }
  }, [status]);

  const activePlan = plans.find(p => new Date(p.endDate) >= new Date());

  const handleSinglePrep = async () => {
    if (!selectedRecipe) return alert("Please select a recipe first.");
    setLoading(true);
    try {
      const res = await fetch("/api/mealplans/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: selectedRecipe, numPeople })
      });
      if (res.ok) {
        const data = await res.json();
        // Open a new print window with the single recipe plan
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html><head><title>Single Recipe Prep - PrepMaster</title>
            <style>
              body { font-family: 'Segoe UI', sans-serif; padding: 2rem; color: #113f36; }
              h1,h2,h3 { margin-bottom: 0.5rem; }
              ul,ol { padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
            </style></head><body>
            <h1>🍳 PrepMaster — Single Recipe Prep</h1>
            <p>Scaled for ${numPeople} people</p><hr/>
            <h2>🛒 Shopping List</h2>
            <ul>${(data.shoppingList || []).map((i: any) => `<li><strong>${i.combinedAmount}</strong> ${i.item}</li>`).join('')}</ul>
            <h2>🔪 Mise En Place</h2>
            <ol>${(data.unifiedMiseEnPlace || []).map((s: string) => `<li>${s}</li>`).join('')}</ol>
            <h2>👨‍🍳 Instructions</h2>
            <ol>${(data.unifiedInstructions || []).map((s: string) => `<li>${s}</li>`).join('')}</ol>
            </body></html>
          `);
          printWindow.document.close();
        }
      } else {
        alert("Failed to generate single recipe plan.");
      }
    } catch {
      alert("Error generating plan.");
    }
    setLoading(false);
  };

  if (status !== "authenticated") return <div className="spinner">Loading...</div>;

  return (
    <>
      <div className="dashboard-grid fade-in-up delay-1">
        {/* Total Recipes */}
        <div className="card card-orange">
          <div className="card-icon-wrapper">👨‍🍳</div>
          <div style={{ marginTop: 'auto' }}>
            <div className="card-title">Total Recipes</div>
            <div className="card-subtitle">In your repository</div>
          </div>
          <div className="large-metric">{recipes.length}</div>
        </div>

        {/* Current Plan */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon-wrapper icon-green">📅</div>
            <Link href={activePlan ? `/mealplans/${activePlan.id}` : "/mealplans/new"} className="card-action-link link-green">
              {activePlan ? "View Plan" : "Plan Now"}
            </Link>
          </div>
          <div className="card-title">Current Plan</div>
          <div className="card-subtitle">
            {activePlan ? `Active until ${new Date(activePlan.endDate).toLocaleDateString()}` : "No active plan"}
          </div>
        </div>

        {/* AI Recipes */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon-wrapper icon-yellow">✨</div>
            <Link href="/recipes/ai" className="card-action-link link-yellow">
              Find Recipes
            </Link>
          </div>
          <div className="card-title">AI Assistant</div>
          <div className="card-subtitle">Discover new recipes with AI</div>
        </div>
      </div>

      <div className="dashboard-grid-bottom fade-in-up delay-2">
        {/* Single Recipe Prep */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#113f36' }}>
            <span style={{ color: '#10b981' }}>👥</span> Single Recipe Prep
          </h3>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">SELECT RECIPE</label>
              <select value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)}>
                <option value="" disabled>Choose a recipe...</option>
                {recipes.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">PEOPLE</label>
              <input type="number" value={numPeople} onChange={e => setNumPeople(parseInt(e.target.value) || 1)} min={1} />
            </div>
          </div>
          <button className="btn btn-teal" onClick={handleSinglePrep} disabled={loading}>
            {loading ? "Generating..." : "Generate Single Recipe Plan"}
          </button>
        </div>

        {/* Bulk Upload */}
        <div className="card">
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#113f36' }}>
            <span style={{ color: '#eab308' }}>📦</span> Bulk Upload Recipes
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 500, fontSize: '0.9rem' }}>
            Download a CSV template, fill it out, and upload to add many recipes at once.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => {
              alert(
                "📋 Template Instructions:\n\n" +
                "1. Open the CSV in Excel or Google Sheets\n" +
                "2. Replace or add rows below the examples\n" +
                "3. For ingredients, miseEnPlace, and instructions columns:\n" +
                "   → Separate each item with a pipe character: |\n" +
                "   → Example: 2 lbs chicken | 3 tbsp butter | 4 cloves garlic\n" +
                "4. Save as CSV and upload below\n\n" +
                "Click OK to download the template."
              );
              window.location.href = "/api/recipes/template";
            }} className="btn btn-outline" style={{ justifyContent: 'center' }}>
              📥 Download Template
            </button>
            <label className="btn btn-teal" style={{ cursor: 'pointer', justifyContent: 'center' }}>
              📤 Upload Filled Template
              <input 
                type="file" 
                accept=".csv" 
                style={{ display: 'none' }} 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await fetch('/api/recipes/upload', { method: 'POST', body: formData });
                  if (res.ok) {
                    const data = await res.json();
                    alert(`Successfully imported ${data.count} recipes!`);
                    fetch("/api/recipes").then(r => r.json()).then(setRecipes);
                  } else {
                    alert('Upload failed. Please check your CSV format.');
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
