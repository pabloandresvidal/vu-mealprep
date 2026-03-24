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
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuggestions([]);

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

  const handleSelect = async (suggestion: Suggestion) => {
    setIsGenerating(suggestion.title);
    setError("");

    try {
      const res = await fetch("/api/recipes/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suggestion),
      });
      if (!res.ok) throw new Error("Failed to generate and save recipe");
      
      const data = await res.json();
      router.push(`/recipes/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(null);
    }
  };

  return (
    <div className="fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>✨ AI Culinary Assistant</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Search the web for highly rated recipes and instantly add them to your repository.</p>
        </div>
        <Link href="/recipes" className="btn btn-outline" style={{ width: 'auto' }}>&larr; Back to Recipes</Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} className="form-row" style={{ marginBottom: 0 }}>
          <div className="form-group" style={{ flex: 3 }}>
            <input 
              type="text" 
              placeholder="e.g., High protein chicken dinner, or authentic Pad Thai..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading || !!isGenerating}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <button type="submit" className="btn btn-teal" disabled={isLoading || !!isGenerating || !prompt.trim()}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
        {error && <div style={{ color: 'red', marginTop: '1rem', fontWeight: 600 }}>{error}</div>}
      </div>

      {suggestions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Suggested Recipes</h3>
          <div className="dashboard-grid fade-in-up">
            {suggestions.map((s: Suggestion, i: number) => (
              <div key={i} className="card" style={{ borderTop: `4px solid var(--brand-orange)` }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>{s.description}</p>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-teal)' }}>
                  <span style={{ background: 'var(--brand-green-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>⏱️ {s.prepTime}</span>
                  <span style={{ background: 'var(--brand-yellow-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>👥 {s.servings} servings</span>
                </div>
                <button 
                  onClick={() => handleSelect(s)}
                  className="btn btn-secondary"
                  disabled={!!isGenerating}
                >
                  {isGenerating === s.title ? "Generating JSON..." : "Add to Database"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
