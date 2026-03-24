"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AiRecipePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/recipes/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
      setLoading(true);
      const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result)
      });
      if (res.ok) router.push("/recipes");
      else setError("Failed to save recipe");
      setLoading(false);
  }

  return (
    <div className="fade-in-up" style={{ maxWidth: "800px", margin: "0 auto" }}>
       <div style={{ marginBottom: "2rem" }}>
         <Link href="/recipes" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Recipes</Link>
       </div>
       <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "2rem", marginBottom: "0.5rem" }}>
           <span style={{ color: "var(--accent-primary)" }}>✨</span> AI Culinary Assistant
       </h2>
       <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.1rem" }}>
           Describe the meal you want to create. The AI will formulate the perfect recipe, format the ingredients, and optimize the prep instructions.
       </p>

       <form onSubmit={handleGenerate} className="card" style={{ marginBottom: "2rem" }}>
         <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ fontSize: "1.1rem" }}>Recipe Prompt</label>
            <textarea 
               rows={5} 
               required
               style={{ resize: "vertical", fontSize: "1rem", lineHeight: "1.5" }}
               placeholder="E.g. I need a high protein, low calorie chicken dinner for two. Must be quick to make and require low energy after a long day at work."
               value={prompt}
               onChange={e => setPrompt(e.target.value)}
            />
         </div>
         <button disabled={loading} type="submit" className="btn btn-primary btn-large" style={{ width: "100%", fontSize: "1.1rem" }}>
            {loading ? "Generating Magic... (This traces AI calls)" : "Generate Recipe"}
         </button>
         {error && <p style={{ color: "#f85149", marginTop: "1rem", textAlign: "center" }}>{error}</p>}
       </form>

       {result && (
           <div className="card fade-in-up" style={{ borderTop: "4px solid var(--accent-primary)", padding: "3rem 2rem" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                   <h3 style={{ margin: 0, fontSize: "2rem", color: "var(--text-primary)" }}>{result.title}</h3>
                   <span style={{ fontSize: "0.9rem", padding: "0.4rem 1rem", background: "rgba(88, 166, 255, 0.1)", color: "var(--accent-primary)", borderRadius: "20px", fontWeight: "600" }}>
                       {result.energyLevel} Energy Required
                   </span>
               </div>
               
               <div style={{ marginBottom: "2rem" }}>
                   <h4 style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem", marginBottom: "1rem" }}>Ingredients</h4>
                   <ul style={{ paddingLeft: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                       {result.ingredients.map((i: any, idx: number) => (
                           <li key={idx}><span style={{ color: "white" }}>{i.amount} {i.unit}</span> {i.name}</li>
                       ))}
                   </ul>
               </div>

               <div style={{ marginBottom: "2rem", background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "12px" }}>
                   <h4 style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem", marginBottom: "1rem" }}>Mise En Place (Prioritized Prep)</h4>
                   <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                       {result.miseEnPlace.map((step: string, idx: number) => <li key={idx} style={{ marginBottom: "0.5rem" }}>{step}</li>)}
                   </ol>
               </div>

               <div style={{ marginBottom: "3rem" }}>
                   <h4 style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem", marginBottom: "1rem" }}>Cooking Instructions</h4>
                   <ol style={{ paddingLeft: "1.5rem" }}>
                       {result.instructions.map((step: string, idx: number) => <li key={idx} style={{ marginBottom: "0.5rem" }}>{step}</li>)}
                   </ol>
               </div>

               <button disabled={loading} onClick={handleSave} className="btn btn-primary btn-large" style={{ width: "100%", fontSize: "1.2rem", padding: "1rem" }}>
                   Save to Database
               </button>
           </div>
       )}
    </div>
  )
}
