"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewMealPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [data, setData] = useState({
     startDate: "", endDate: "", energyLevel: "Medium", profileIds: [] as string[], numPeople: 0, ingredientsOnHand: [] as string[]
  });

  useEffect(() => {
     fetch("/api/profile").then(r => r.json()).then(setProfiles).catch(() => {});
  }, []);

  // Auto-calculate numPeople from selected profiles
  useEffect(() => {
     setData(prev => ({ ...prev, numPeople: prev.profileIds.length || 1 }));
  }, [data.profileIds.length]);

  const handleGenerate = async (e: React.FormEvent, overrideClash: boolean = false) => {
      e.preventDefault();
      if (data.profileIds.length === 0) return setError("Please select at least one family member.");
      setLoading(true);
      setError("");

      try {
          const res = await fetch("/api/mealplans/ai", {
              method: "POST",
              headers: { 
                 "Content-Type": "application/json",
                 ...(overrideClash ? { "x-override-clash": "true" } : {})
              },
              body: JSON.stringify(data)
          });
          
          if (res.status === 409) {
              const confirmOverwrite = confirm("⚠️ Conflict Detected: You already have a meal plan scheduled during these dates. Do you want to erase the previous plan and generate a new one?");
              if (confirmOverwrite) {
                  return handleGenerate(e, true);
              } else {
                  setLoading(false);
                  return;
              }
          }
          
          if (!res.ok) throw new Error(await res.text());
          
          const result = await res.json();
          router.push(`/mealplans/${result.id}`);
      } catch (err: any) {
          setError(err.message || "Generation failed.");
          setLoading(false);
      }
  };

  const toggleProfile = (id: string) => {
      if (data.profileIds.includes(id)) {
          setData({ ...data, profileIds: data.profileIds.filter(pid => pid !== id) });
      } else {
          setData({ ...data, profileIds: [...data.profileIds, id] });
      }
  };

  const addIngredient = () => {
      const trimmed = ingredientInput.trim();
      if (trimmed && !data.ingredientsOnHand.includes(trimmed)) {
          setData({ ...data, ingredientsOnHand: [...data.ingredientsOnHand, trimmed] });
      }
      setIngredientInput("");
  };

  const removeIngredient = (item: string) => {
      setData({ ...data, ingredientsOnHand: data.ingredientsOnHand.filter(i => i !== item) });
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: "700px", margin: "0 auto" }}>
       <div style={{ marginBottom: "2rem" }}>
         <Link href="/mealplans" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Meal Plans</Link>
       </div>
       <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "2rem", marginBottom: "0.5rem" }}>
           <span style={{ color: "var(--accent-primary)" }}>📅</span> Generate Meal Plan
       </h2>
       <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", fontSize: "1.1rem" }}>
           Input the parameters for the week, and AI will balance the database recipes against your family's objectives.
       </p>

       <form onSubmit={(e) => handleGenerate(e, false)} className="card">
         {/* Dates */}
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
             <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" required value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} />
             </div>
             <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" required value={data.endDate} onChange={e => setData({...data, endDate: e.target.value})} />
             </div>
         </div>
 
         {/* Energy + People */}
         <div className="form-row">
            <div className="form-group">
                <label className="form-label">Prep Energy Level</label>
                <select value={data.energyLevel} onChange={e => setData({...data, energyLevel: e.target.value})}>
                    <option value="Low">Low (Quick & Easy Prep)</option>
                    <option value="Medium">Medium (Standard Prep)</option>
                    <option value="High">High (Elaborate Prep)</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">People Count</label>
                <input 
                    type="number" 
                    min={1} 
                    value={data.numPeople} 
                    onChange={e => setData({...data, numPeople: parseInt(e.target.value) || 1})} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    Auto-set from selected members
                </p>
            </div>
          </div>

         {/* Family Member Selection */}
         <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">Cooking For (Select Members)</label>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
               {profiles.length === 0 && <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No profiles found. <Link href="/profile" style={{ color: 'var(--brand-orange)', textDecoration: 'underline' }}>Create one first →</Link></span>}
               {profiles.map(p => {
                    const selected = data.profileIds.includes(p.id);
                    return (
                        <div 
                           key={p.id} 
                           onClick={() => toggleProfile(p.id)}
                           style={{ 
                               cursor: "pointer", 
                               padding: "0.6rem 1.2rem", 
                               borderRadius: "20px", 
                               border: `2px solid ${selected ? "var(--brand-green)" : "var(--border-color)"}`,
                               background: selected ? "var(--brand-green-light)" : "transparent",
                               transition: "all 0.2s"
                           }}
                        >
                            <div style={{ fontWeight: selected ? "700" : "400", color: selected ? "var(--brand-green)" : "var(--text-primary)", fontSize: '0.95rem' }}>
                              {p.name} {p.age ? `(${p.age})` : ""}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                              {p.objective} {p.gender ? `• ${p.gender}` : ""}
                            </div>
                        </div>
                    );
               })}
            </div>
         </div>

         {/* Ingredients on Hand */}
         <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">🥬 Ingredients You Already Have (Optional)</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
               The AI will prefer recipes that use these ingredients to minimize waste.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                placeholder="e.g. Chicken breast"
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={addIngredient} className="btn btn-teal" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>
                Add
              </button>
            </div>
            {data.ingredientsOnHand.length > 0 && (
              <div className="tag-list">
                {data.ingredientsOnHand.map(item => (
                  <span key={item} className="tag-chip">
                    {item}
                    <button type="button" onClick={() => removeIngredient(item)}>×</button>
                  </span>
                ))}
              </div>
            )}
         </div>

         <button disabled={loading} type="submit" className="btn btn-primary btn-large" style={{ width: "100%", fontSize: "1.1rem", background: 'linear-gradient(135deg, #10b981, #047857)' }}>
            {loading ? "🤖 Analyzing & Planning..." : "🚀 Generate AI Meal Plan"}
         </button>
         {error && <p style={{ color: "#f85149", marginTop: "1.5rem", textAlign: "center", fontWeight: "600" }}>{error}</p>}
       </form>
    </div>
  )
}
