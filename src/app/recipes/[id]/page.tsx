"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/recipes?id=${id}`)
      .then(r => r.json())
      .then(setRecipe)
      .catch(() => {});
  }, [id]);

  if (!recipe) return <div className="spinner">Loading recipe...</div>;

  const ingredients = JSON.parse(recipe.ingredients);
  const miseEnPlace = JSON.parse(recipe.miseEnPlace);
  const instructions = JSON.parse(recipe.instructions);

  return (
    <div className="fade-in-up" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/recipes" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>← Back to Recipes</Link>
        <Link href={`/recipes/${id}/edit`} className="btn btn-outline" style={{ width: "auto" }}>✏️ Edit</Link>
      </div>

      <div className="card" style={{ marginBottom: "2rem", borderTop: "4px solid var(--brand-orange)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0" }}>{recipe.title}</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="tag-chip" style={{ background: "var(--brand-orange-light)", color: "var(--brand-orange)" }}>
              {recipe.energyLevel} Energy
            </span>
            <span className="tag-chip">👥 {recipe.servings} Servings</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "var(--brand-green)", textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "1px", marginBottom: "1rem" }}>
          🥕 Ingredients
        </h3>
        <ul style={{ paddingLeft: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {ingredients.map((ing: any, idx: number) => (
            <li key={idx}>
              <strong>{ing.amount || ing.combinedAmount} {ing.unit || ""}</strong> {ing.name || ing.item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#a371f7", textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "1px", marginBottom: "1rem" }}>
          🔪 Mise En Place
        </h3>
        <ol style={{ paddingLeft: "1.5rem" }}>
          {miseEnPlace.map((step: string, idx: number) => (
            <li key={idx} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="card">
        <h3 style={{ color: "var(--brand-teal)", textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "1px", marginBottom: "1rem" }}>
          👨‍🍳 Instructions
        </h3>
        <ol style={{ paddingLeft: "1.5rem" }}>
          {instructions.map((step: string, idx: number) => (
            <li key={idx} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
