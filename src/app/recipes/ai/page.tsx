"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Suggestion {
  title: string;
  description: string;
  prepTime: string;
  servings: number;
  energyLevel: string;
}

export default function AILab() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingSet, setAddingSet] = useState<Set<string>>(new Set());
  const [addedSet, setAddedSet] = useState<Set<string>>(new Set());
  const [addingAll, setAddingAll] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuggestions([]);
    setAddedSet(new Set());

    try {
      const res = await fetch("/api/recipes/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecipe = async (suggestion: Suggestion) => {
    const key = suggestion.title;
    setAddingSet(prev => new Set(prev).add(key));
    setError("");

    try {
      const res = await fetch("/api/recipes/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suggestion),
      });
      if (!res.ok) throw new Error("Failed to generate recipe");
      
      setAddedSet(prev => new Set(prev).add(key));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingSet(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleAddAll = async () => {
    setAddingAll(true);
    for (const s of suggestions) {
      if (!addedSet.has(s.title)) {
        await addRecipe(s);
      }
    }
    setAddingAll(false);
  };

  const allAdded = suggestions.length > 0 && suggestions.every(s => addedSet.has(s.title));

  return (
    <div className="fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>✨ AI Culinary Assistant</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Search for recipes and add them to your repository.</p>
        </div>
        <Link href="/recipes" className="btn btn-outline" style={{ width: 'auto' }}>&larr; Back</Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '3 1 200px' }}>
            <input 
              type="text" 
              placeholder="e.g., High protein chicken dinner, authentic Pad Thai..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <button type="submit" className="btn btn-teal" disabled={isLoading || !prompt.trim()}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
        {error && <div style={{ color: '#f85149', marginTop: '1rem', fontWeight: 600 }}>{error}</div>}
      </div>

      {suggestions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Suggested Recipes</h3>
            {!allAdded && (
              <button onClick={handleAddAll} className="btn btn-teal" style={{ width: 'auto' }} disabled={addingAll}>
                {addingAll ? "Adding All..." : `Add All ${suggestions.length} Recipes`}
              </button>
            )}
            {allAdded && <span style={{ color: 'var(--brand-green)', fontWeight: 700 }}>✅ All added!</span>}
          </div>
          <div className="dashboard-grid fade-in-up">
            {suggestions.map((s: Suggestion, i: number) => {
              const isAdding = addingSet.has(s.title);
              const isAdded = addedSet.has(s.title);
              return (
                <div key={i} className="card" style={{ borderTop: `4px solid ${isAdded ? 'var(--brand-green)' : 'var(--brand-orange)'}` }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>{s.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ background: 'var(--brand-green-light)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--brand-green)' }}>⏱️ {s.prepTime}</span>
                    <span style={{ background: 'var(--brand-yellow-light)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--brand-yellow)' }}>👥 {s.servings}</span>
                  </div>
                  <button 
                    onClick={() => addRecipe(s)}
                    className={isAdded ? "btn btn-outline" : "btn btn-secondary"}
                    disabled={isAdding || isAdded}
                    style={isAdded ? { background: 'var(--brand-green-light)', color: 'var(--brand-green)', borderColor: 'var(--brand-green)' } : {}}
                  >
                    {isAdded ? "✅ Added" : isAdding ? "Generating..." : "Add to Recipes"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
