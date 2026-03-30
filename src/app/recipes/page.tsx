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

  const [showBulkUpload, setShowBulkUpload] = useState(false);

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
          <button onClick={() => setShowBulkUpload(!showBulkUpload)} className="btn btn-outline" style={{ width: "auto" }}>📦 Bulk Upload</button>
          <Link href="/recipes/create" className="btn btn-outline" style={{ width: "auto" }}>+ Add Manually</Link>
          <Link href="/recipes/ai" className="btn btn-teal" style={{ width: "auto" }}>✨ AI Generate</Link>
        </div>
      </div>

      {showBulkUpload && (
        <div className="card fade-in-up" style={{ marginBottom: "1.5rem" }}>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#113f36' }}>
            <span style={{ color: '#eab308' }}>📦</span> Bulk Upload Recipes
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 500, fontSize: '0.9rem' }}>
            Download a CSV template, fill it out, and upload to add many recipes at once.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
            }} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              📥 Download Template
            </button>
            <label className="btn btn-teal" style={{ flex: 1, cursor: 'pointer', justifyContent: 'center' }}>
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
                    setShowBulkUpload(false);
                    fetchRecipes();
                  } else {
                    alert('Upload failed. Please check your CSV format.');
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}

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
