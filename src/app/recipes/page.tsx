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
                  <div className="card-header">
                      <div className="card-icon-wrapper icon-green">🥗</div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "var(--brand-green-light)", borderRadius: "4px", color: "var(--brand-green)", fontWeight: 700 }}>
                            {r.energyLevel}
                        </span>
                      </div>
                  </div>
                  <h3 className="card-title">{r.title}</h3>
                  <div style={{ display: 'flex', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                    <span>👥 {r.servings} Servings</span>
                    <span>🥕 {ings.length} items</span>
                  </div>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/recipes/${r.id}`} className="btn btn-teal" style={{ flex: 1 }}>Open</Link>
                    <Link href={`/recipes/${r.id}/edit`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', width: 'auto' }}>
                        ✏️
                    </Link>
                    <button onClick={() => deleteRecipe(r.id)} className="btn btn-secondary" style={{ width: 'auto' }}>
                        🗑️
                    </button>
                  </div>
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
