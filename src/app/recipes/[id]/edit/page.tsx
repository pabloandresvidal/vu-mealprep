"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/recipes?id=${id}`)
      .then(res => res.json())
      .then(d => {
        setData({
          ...d,
          ingredients: JSON.parse(d.ingredients),
          miseEnPlace: JSON.parse(d.miseEnPlace),
          instructions: JSON.parse(d.instructions)
        });
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch("/api/recipes", {
      method: "PUT", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ ...data, id })
    });
    
    if (res.ok) {
      router.push("/recipes");
    } else {
      alert("Failed to update recipe");
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

  if (fetching) return <div className="spinner">Loading Recipe...</div>;
  if (!data) return <div>Recipe not found.</div>;

  return (
    <div className="fade-in-up" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
       <div style={{ marginBottom: "2rem" }}>
         <Link href="/recipes" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Recipes</Link>
       </div>
       <h2 style={{ marginBottom: "0.5rem" }}>Edit Recipe: {data.title}</h2>

       <form onSubmit={handleSave} className="card">
         <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Recipe Title</label>
            <input required value={data.title} onChange={e => setData({...data, title: e.target.value})} />
         </div>

         <div className="form-row">
            <div className="form-group">
                <label className="form-label">Energy Required</label>
                <select value={data.energyLevel} onChange={e => setData({...data, energyLevel: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Base Servings</label>
                <input type="number" min={1} value={data.servings} onChange={e => setData({...data, servings: parseInt(e.target.value) || 1})} />
            </div>
         </div>

         {/* Ingredients */}
         <div style={{ marginBottom: "2.5rem" }}>
            <h3 className="form-label">Ingredients</h3>
            {data.ingredients.map((ing: any, idx: number) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 3fr", gap: "1rem", marginBottom: "0.5rem" }}>
                    <input required value={ing.amount} onChange={e => updateIngredient(idx, "amount", e.target.value)} />
                    <input value={ing.unit} onChange={e => updateIngredient(idx, "unit", e.target.value)} />
                    <input required value={ing.name} onChange={e => updateIngredient(idx, "name", e.target.value)} />
                </div>
            ))}
            <button type="button" onClick={addIngredient} className="btn btn-secondary">+ Add</button>
         </div>

         {/* Mise En Place */}
         <div style={{ marginBottom: "2.5rem" }}>
            <h3 className="form-label">Mise En Place (Prep)</h3>
            {data.miseEnPlace.map((step: string, idx: number) => (
                <div key={idx} style={{ marginBottom: "0.5rem", display: "flex", gap: "1rem" }}>
                    <input required value={step} onChange={e => updateArray("miseEnPlace", idx, e.target.value)} />
                </div>
            ))}
            <button type="button" onClick={() => addArrayItem("miseEnPlace")} className="btn btn-secondary">+ Add Step</button>
         </div>

         {/* Instructions */}
         <div style={{ marginBottom: "2.5rem" }}>
            <h3 className="form-label">Instructions</h3>
            {data.instructions.map((step: string, idx: number) => (
                <div key={idx} style={{ marginBottom: "0.5rem" }}>
                    <textarea required rows={2} value={step} onChange={e => updateArray("instructions", idx, e.target.value)} />
                </div>
            ))}
            <button type="button" onClick={() => addArrayItem("instructions")} className="btn btn-secondary">+ Add Step</button>
         </div>

         <button disabled={loading} type="submit" className="btn btn-primary btn-large" style={{ width: "100%" }}>
            {loading ? "Updating..." : "Save Changes"}
         </button>
       </form>
    </div>
  );
}
