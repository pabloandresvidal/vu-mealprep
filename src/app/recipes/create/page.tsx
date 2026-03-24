"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
     title: "", 
     energyLevel: "Medium", 
     servings: 2,
     ingredients: [{ name: "", amount: "", unit: "" }], 
     miseEnPlace: [""], 
     instructions: [""]
  });

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      const res = await fetch("/api/recipes", {
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(data)
      });
      
      if (res.ok) {
        router.push("/recipes");
      } else {
        alert("Failed to save recipe");
        setLoading(false);
      }
  }

  const updateIngredient = (index: number, field: string, val: string) => {
      const ings = [...data.ingredients];
      ings[index] = { ...ings[index], [field]: val };
      setData({ ...data, ingredients: ings });
  }

  const addIngredient = () => setData({ ...data, ingredients: [...data.ingredients, { name: "", amount: "", unit: "" }] });
  
  const updateArray = (arrName: "miseEnPlace" | "instructions", index: number, val: string) => {
      const arr = [...data[arrName]];
      arr[index] = val;
      setData({ ...data, [arrName]: arr });
  }

  const addArrayItem = (arrName: "miseEnPlace" | "instructions") => setData({ ...data, [arrName]: [...data[arrName], ""] });

  return (
    <div className="fade-in-up" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
       <div style={{ marginBottom: "2rem" }}>
         <Link href="/recipes" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Recipes</Link>
       </div>
       <h2 style={{ marginBottom: "0.5rem" }}>
           Add Recipe Manually
       </h2>
       <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.1rem" }}>
           Input your family's favorite recipes into the database. You can use these later to formulate entire meal plans.
       </p>

       <form onSubmit={handleSave} className="card">
         <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ fontSize: "1.1rem" }}>Recipe Title</label>
            <input 
               required
               placeholder="E.g. Garlic Butter Steak Bites"
               value={data.title}
               onChange={e => setData({...data, title: e.target.value})}
            />
         </div>

          <div className="form-row">
            <div className="form-group">
                <label className="form-label">Energy Required</label>
                <select 
                value={data.energyLevel}
                onChange={e => setData({...data, energyLevel: e.target.value})}
                >
                    <option value="Low">Low (Quick & Easy)</option>
                    <option value="Medium">Medium (Standard Meal)</option>
                    <option value="High">High (Elaborate Prep)</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Base Servings</label>
                <input 
                    type="number" 
                    min={1} 
                    value={data.servings} 
                    onChange={e => setData({...data, servings: parseInt(e.target.value) || 1})} 
                />
            </div>
          </div>

         {/* Ingredients */}
         <div style={{ marginBottom: "2.5rem" }}>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "1.1rem" }}>Ingredients</h3>
            {data.ingredients.map((ing, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 3fr", gap: "1rem", marginBottom: "0.5rem" }}>
                    <input required placeholder="Amount (e.g. 2)" value={ing.amount} onChange={e => updateIngredient(idx, "amount", e.target.value)} />
                    <input placeholder="Unit (e.g. lbs)" value={ing.unit} onChange={e => updateIngredient(idx, "unit", e.target.value)} />
                    <input required placeholder="Name (e.g. Chicken breast)" value={ing.name} onChange={e => updateIngredient(idx, "name", e.target.value)} />
                </div>
            ))}
            <button type="button" onClick={addIngredient} className="btn btn-secondary" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>+ Add Ingredient</button>
         </div>

         {/* Mise En Place */}
         <div style={{ marginBottom: "2.5rem" }}>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "1.1rem" }}>Mise En Place (Prep)</h3>
            {data.miseEnPlace.map((step, idx) => (
                <div key={idx} style={{ marginBottom: "0.5rem", display: "flex", gap: "1rem" }}>
                    <span style={{ paddingTop: "0.8rem", color: "var(--text-secondary)" }}>{idx + 1}.</span>
                    <input required placeholder="E.g. Chop vegetables" value={step} onChange={e => updateArray("miseEnPlace", idx, e.target.value)} />
                </div>
            ))}
            <button type="button" onClick={() => addArrayItem("miseEnPlace")} className="btn btn-secondary" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>+ Add Prep Step</button>
         </div>

         {/* Instructions */}
         <div style={{ marginBottom: "2.5rem" }}>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "1.1rem" }}>Cooking Instructions</h3>
            {data.instructions.map((step, idx) => (
                <div key={idx} style={{ marginBottom: "0.5rem", display: "flex", gap: "1rem" }}>
                    <span style={{ paddingTop: "0.8rem", color: "var(--text-secondary)" }}>{idx + 1}.</span>
                    <textarea required rows={2} placeholder="E.g. Heat the pan..." value={step} onChange={e => updateArray("instructions", idx, e.target.value)} style={{ resize: "vertical" }} />
                </div>
            ))}
            <button type="button" onClick={() => addArrayItem("instructions")} className="btn btn-secondary" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>+ Add Instruction Step</button>
         </div>

         <button disabled={loading} type="submit" className="btn btn-primary btn-large" style={{ width: "100%", fontSize: "1.2rem", padding: "1rem" }}>
            {loading ? "Saving..." : "Save Recipe"}
         </button>
       </form>
    </div>
  )
}
