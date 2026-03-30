"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProfile, setNewProfile] = useState({ 
    name: "", objective: "", dietaryRestrictions: "", age: "", gender: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchProfiles();
  }, [status, router]);

  const fetchProfiles = async () => {
    const res = await fetch("/api/profile");
    if (res.ok) setProfiles(await res.json());
  };

  const resetForm = () => {
    setNewProfile({ name: "", objective: "", dietaryRestrictions: "", age: "", gender: "" });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setNewProfile({
      name: p.name,
      objective: p.objective,
      dietaryRestrictions: p.dietaryRestrictions || "",
      age: p.age?.toString() || "",
      gender: p.gender || ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = editingId ? `/api/profile?id=${editingId}` : "/api/profile";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfile),
    });

    setLoading(false);
    if (res.ok) {
      resetForm();
      fetchProfiles();
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to remove this family member?")) return;
    const res = await fetch(`/api/profile?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchProfiles();
  };

  if (status !== "authenticated") return <div className="spinner">Loading...</div>;

  return (
    <div className="fade-in-up">
      <h1 style={{ marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦 Family Profiles</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Manage members of your household, their nutritional objectives, and restrictions.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {profiles.map(p => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => startEdit(p)} className="btn btn-outline" style={{ padding: "0.3rem 0.6rem", width: 'auto', fontSize: "0.8rem" }}>
                  ✏️
                </button>
                <button onClick={() => deleteProfile(p.id)} className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", width: 'auto', fontSize: "0.8rem" }}>
                  🗑️
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <p><strong>Goal:</strong> {p.objective}</p>
                <p><strong>Gender:</strong> {p.gender || "N/A"}</p>
                <p><strong>Age:</strong> {p.age || "N/A"}</p>
            </div>
            {p.dietaryRestrictions && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>Restrictions:</strong> {p.dietaryRestrictions}
                </p>
            )}
          </div>
        ))}
        {profiles.length === 0 && (
            <div style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No household members created yet.</div>
        )}
      </div>

      <div className="card" style={{ maxWidth: "700px" }}>
        <h3>{editingId ? "✏️ Edit Member" : "➕ Add New Member"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ marginTop: "1.5rem" }}>
            <div className="form-group">
                <label className="form-label">Name</label>
                <input required placeholder="E.g. Pablo" value={newProfile.name} onChange={e => setNewProfile({...newProfile, name: e.target.value})} />
            </div>
            <div className="form-group">
                <label className="form-label">Gender</label>
                <select value={newProfile.gender} onChange={e => setNewProfile({...newProfile, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" placeholder="E.g. 30" value={newProfile.age} onChange={e => setNewProfile({...newProfile, age: e.target.value})} />
            </div>
            <div className="form-group">
                <label className="form-label">Objective</label>
                <select required value={newProfile.objective} onChange={e => setNewProfile({...newProfile, objective: e.target.value})}>
                    <option value="" disabled>Select Objective</option>
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Gain Muscle">Gain Muscle</option>
                    <option value="Maintain Weight">Maintain Weight</option>
                    <option value="Eat Healthier">Eat Healthier</option>
                    <option value="No Specific Goal">No Specific Goal</option>
                </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dietary Restrictions (Optional)</label>
            <input placeholder="E.g. Peanut allergy, Vegan, Gluten-free" value={newProfile.dietaryRestrictions} onChange={e => setNewProfile({...newProfile, dietaryRestrictions: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button disabled={loading} type="submit" className="btn btn-teal">
              {loading ? "Saving..." : editingId ? "Update Member" : "Add Member"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-outline">Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
