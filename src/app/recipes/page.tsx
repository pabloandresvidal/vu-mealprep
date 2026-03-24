"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecipesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchRecipes();
  }, [status, router]);

  const fetchRecipes = async () => {
    const res = await fetch("/api/recipes");
    if (res.ok) setRecipes(await res.json());
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    const res = await fetch(`/api/recipes?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchRecipes();
  }

  if (status !== "authenticated") return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
          <div className="spinner">Loading...</div>
      </div>
  );

  return (
    <div className="fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2>My Recipes</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/recipes/create" className="btn btn-secondary">Add Manually</Link>
          <Link href="/recipes/ai" className="btn btn-primary">✨ Generate with AI</Link>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {recipes.map(r => {
             const ings = JSON.parse(r.ingredients);
             const insts = JSON.parse(r.instructions);
             return (
              <div key={r.id} className="card">
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                     <h3 style={{ margin: 0, paddingRight: "1rem", fontSize: "1.2rem" }}>{r.title}</h3>
                     <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "var(--bg-secondary)", borderRadius: "4px", color: "var(--accent-primary)", whiteSpace: "nowrap" }}>
                         {r.energyLevel} Energy
                     </span>
                 </div>
                 <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                     {ings.length} Ingredients • {insts.length} Steps
                 </p>
                 <button onClick={() => deleteRecipe(r.id)} className="btn btn-secondary" style={{ width: "100%", borderColor: "rgba(248, 81, 73, 0.4)", color: "#f85149" }}>Delete Recipe</button>
              </div>
          )
        })}
        {recipes.length === 0 && (
            <div style={{ color: "var(--text-secondary)", gridColumn: "1 / -1", padding: "2rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "16px", border: "1px dashed var(--border-color)" }}>
                No recipes yet. Try generating one with AI!
            </div>
        )}
      </div>
    </div>
  );
}
