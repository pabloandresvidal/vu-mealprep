"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [newProfile, setNewProfile] = useState({ name: "", objective: "", dietaryRestrictions: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchProfiles();
    }
  }, [status, router]);

  const fetchProfiles = async () => {
    const res = await fetch("/api/profile");
    if (res.ok) {
      setProfiles(await res.json());
    }
  };

  const addProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfile),
    });
    setLoading(false);
    if (res.ok) {
        setNewProfile({ name: "", objective: "", dietaryRestrictions: "" });
        fetchProfiles();
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to remove this family member?")) return;
    const res = await fetch(`/api/profile?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchProfiles();
  };

  if (status !== "authenticated") return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
          <div className="spinner">Loading...</div>
      </div>
  );

  return (
    <div className="fade-in-up">
      <h2>Household Profiles</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Manage members of your household, their nutritional objectives, and restrictions. We use this to optimize the meal plan recommendations.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {profiles.map(p => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "var(--accent-primary)" }}>{p.name}</h3>
              <button 
                onClick={() => deleteProfile(p.id)} 
                className="btn btn-secondary" 
                style={{ padding: "0.2rem 0.6rem", borderColor: "rgba(248, 81, 73, 0.4)", color: "#f85149", fontSize: "0.85rem" }}>
                Remove
              </button>
            </div>
            <p><strong>Goal:</strong> {p.objective}</p>
            {p.dietaryRestrictions && <p><strong>Dietary:</strong> {p.dietaryRestrictions}</p>}
          </div>
        ))}
        {profiles.length === 0 && (
            <div style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No household members created yet.</div>
        )}
      </div>

      <div className="card" style={{ maxWidth: "600px" }}>
        <h3>Add New Member</h3>
        <form onSubmit={addProfile}>
          <div className="form-group" style={{ marginTop: "1.5rem" }}>
            <label className="form-label">Name</label>
            <input 
                required 
                placeholder="E.g. Pablo"
                value={newProfile.name} 
                onChange={e => setNewProfile({...newProfile, name: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Objective</label>
            <select 
                required 
                value={newProfile.objective} 
                onChange={e => setNewProfile({...newProfile, objective: e.target.value})} 
                style={{ width: "100%", padding: "0.8rem", backgroundColor: "#0d1117", borderColor: "var(--border-color)", color: "var(--text-primary)", borderRadius: "8px" }}
            >
                <option value="" disabled>Select Objective</option>
                <option value="Lose Weight">Lose Weight</option>
                <option value="Gain Muscle">Gain Muscle</option>
                <option value="Maintain Weight">Maintain Weight</option>
                <option value="Eat Healthier">Eat Healthier</option>
                <option value="No Specific Goal">No Specific Goal</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dietary Restrictions (Optional)</label>
            <input 
                placeholder="E.g. Peanut allergy, Vegan, Gluten-free"
                value={newProfile.dietaryRestrictions} 
                onChange={e => setNewProfile({...newProfile, dietaryRestrictions: e.target.value})} 
            />
          </div>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
