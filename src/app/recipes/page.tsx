"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecipesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [search, setSearch] = useState("");

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
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return recipes;
    const q = search.toLowerCase();
    return recipes.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.energyLevel.toLowerCase().includes(q)
    );
  }, [recipes, search]);

  if (status !== "authenticated") return <div className="spinner">Loading...</div>;

  return (
    <div className="fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>My Recipes</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/recipes/create" className="btn btn-outline" style={{ width: "auto" }}>+ Add Manually</Link>
          <Link href="/recipes/ai" className="btn btn-teal" style={{ width: "auto" }}>✨ AI Generate</Link>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input 
          type="text" 
          placeholder="🔍 Search recipes by title or energy level..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: "500px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {filtered.map(r => {
             let ings: any[] = [];
             try { ings = JSON.parse(r.ingredients); } catch {}
             return (
               <div key={r.id} className="card">
                  <div className="card-header">
                      <div className="card-icon-wrapper icon-green">🥗</div>
                      <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "var(--brand-green-light)", borderRadius: "4px", color: "var(--brand-green)", fontWeight: 700 }}>
                          {r.energyLevel}
                      </span>
                  </div>
                  <h3 className="card-title" style={{ fontSize: "1.1rem" }}>{r.title}</h3>
                  <div style={{ display: 'flex', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 500 }}>
                    <span>👥 {r.servings} Servings</span>
                    <span>🥕 {ings.length} items</span>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/recipes/${r.id}`} className="btn btn-teal" style={{ flex: 1 }}>Open</Link>
                    <Link href={`/recipes/${r.id}/edit`} className="btn btn-outline" style={{ padding: '0.5rem 0.8rem', width: 'auto' }}>✏️</Link>
                    <button onClick={() => deleteRecipe(r.id)} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem', width: 'auto' }}>🗑️</button>
                  </div>
               </div>
             );
        })}
        {filtered.length === 0 && recipes.length > 0 && (
          <div style={{ color: "var(--text-secondary)", gridColumn: "1 / -1", padding: "2rem", textAlign: "center" }}>
            No recipes match &quot;{search}&quot;
          </div>
        )}
        {recipes.length === 0 && (
            <div style={{ color: "var(--text-secondary)", gridColumn: "1 / -1", padding: "2rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "16px", border: "1px dashed var(--border-color)" }}>
                No recipes yet. Try generating one with AI!
            </div>
        )}
      </div>
    </div>
  );
}
