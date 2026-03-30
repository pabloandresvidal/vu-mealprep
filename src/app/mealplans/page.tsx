"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function MealPlansPage() {
  const { status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [newSched, setNewSched] = useState({
    dayOfWeek: 0, energyLevel: "Medium", daysAhead: 7, profileIds: [] as string[]
  });
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetchPlans();
      fetchSchedules();
      fetch("/api/profile").then(r => r.json()).then(setProfiles).catch(() => {});

      // Register service worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").then(() => {
          if ("Notification" in window) {
            setNotifEnabled(Notification.permission === "granted");
          }
        });
      }
    }
  }, [status, router]);

  const fetchPlans = async () => {
    const res = await fetch("/api/mealplans");
    if (res.ok) setPlans(await res.json());
  };

  const fetchSchedules = async () => {
    const res = await fetch("/api/mealplans/schedule");
    if (res.ok) setSchedules(await res.json());
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this Meal Plan entirely?")) return;
    const res = await fetch(`/api/mealplans?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchPlans();
  };

  const toggleScheduleProfile = (id: string) => {
    if (newSched.profileIds.includes(id)) {
      setNewSched({ ...newSched, profileIds: newSched.profileIds.filter(p => p !== id) });
    } else {
      setNewSched({ ...newSched, profileIds: [...newSched.profileIds, id] });
    }
  };

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSched.profileIds.length === 0) return alert("Select at least one family member.");
    
    const res = await fetch("/api/mealplans/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSched)
    });

    if (res.ok) {
      fetchSchedules();
      setShowScheduler(false);
      setNewSched({ dayOfWeek: 0, energyLevel: "Medium", daysAhead: 7, profileIds: [] });

      // Show confirmation notification if allowed
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🍳 PrepMaster", {
          body: `Scheduled! Your meal plan will auto-generate every ${DAY_NAMES[newSched.dayOfWeek]}.`,
          icon: "/icons/icon-192.png"
        });
      }
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("Remove this schedule?")) return;
    const res = await fetch(`/api/mealplans/schedule?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchSchedules();
  };

  const toggleScheduleActive = async (sched: any) => {
    await fetch(`/api/mealplans/schedule?id=${sched.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !sched.active })
    });
    fetchSchedules();
  };

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotifEnabled(permission === "granted");
      if (permission === "granted") {
        new Notification("🍳 PrepMaster", {
          body: "Notifications enabled! You'll be notified when meal plans are generated.",
          icon: "/icons/icon-192.png"
        });
      }
    }
  };

  if (status !== "authenticated") return <div className="spinner">Loading...</div>;

  return (
    <div className="fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2>My Meal Plans</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => setShowScheduler(!showScheduler)} className="btn btn-outline" style={{ width: "auto" }}>
            ⏰ {showScheduler ? "Hide Scheduler" : "Auto-Schedule"}
          </button>
          <Link href="/mealplans/new" className="btn btn-primary btn-large" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>📅 Create New Plan</Link>
        </div>
      </div>

      {/* Scheduler Section */}
      {showScheduler && (
        <div className="card fade-in-up" style={{ marginBottom: "2rem", borderTop: "4px solid var(--brand-orange)" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>⏰ Automatic Meal Plan Scheduler</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Set a day of the week and PrepMaster will automatically generate your meal plan for you. You&apos;ll get a notification when it&apos;s ready.
          </p>

          {/* Enable Notifications Button */}
          {!notifEnabled && (
            <button onClick={enableNotifications} className="btn btn-secondary" style={{ marginBottom: "1.5rem" }}>
              🔔 Enable Notifications
            </button>
          )}

          {/* Active Schedules */}
          {schedules.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "0.5rem" }}>Active Schedules</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {schedules.map(s => (
                  <div key={s.id} style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    padding: "0.8rem 1rem", borderRadius: "10px", background: s.active ? "var(--brand-green-light)" : "#f1f5f9",
                    border: `1px solid ${s.active ? "var(--brand-green)" : "var(--border-color)"}`
                  }}>
                    <div>
                      <strong style={{ color: s.active ? "var(--brand-green)" : "var(--text-secondary)" }}>
                        Every {DAY_NAMES[s.dayOfWeek]}
                      </strong>
                      <span style={{ fontSize: "0.8rem", marginLeft: "0.5rem", color: "var(--text-secondary)" }}>
                        · {s.daysAhead} days · {s.energyLevel} energy
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      <button onClick={() => toggleScheduleActive(s)} className="btn btn-outline" style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                        {s.active ? "Pause" : "Resume"}
                      </button>
                      <button onClick={() => deleteSchedule(s.id)} className="btn btn-secondary" style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create New Schedule Form */}
          <form onSubmit={createSchedule}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Generate Every</label>
                <select value={newSched.dayOfWeek} onChange={e => setNewSched({...newSched, dayOfWeek: parseInt(e.target.value)})}>
                  {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Plan Length (Days)</label>
                <input type="number" min={3} max={14} value={newSched.daysAhead} onChange={e => setNewSched({...newSched, daysAhead: parseInt(e.target.value) || 7})} />
              </div>
              <div className="form-group">
                <label className="form-label">Energy Level</label>
                <select value={newSched.energyLevel} onChange={e => setNewSched({...newSched, energyLevel: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Include Family Members</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {profiles.map(p => {
                  const sel = newSched.profileIds.includes(p.id);
                  return (
                    <div key={p.id} onClick={() => toggleScheduleProfile(p.id)} style={{
                      cursor: "pointer", padding: "0.4rem 1rem", borderRadius: "20px",
                      border: `2px solid ${sel ? "var(--brand-green)" : "var(--border-color)"}`,
                      background: sel ? "var(--brand-green-light)" : "transparent",
                      fontSize: "0.9rem", fontWeight: sel ? 700 : 400,
                      color: sel ? "var(--brand-green)" : "var(--text-primary)"
                    }}>
                      {p.name} {p.age ? `(${p.age})` : ""}
                    </div>
                  );
                })}
                {profiles.length === 0 && <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No family members. Add some first.</span>}
              </div>
            </div>

            <button type="submit" className="btn btn-teal">
              ✅ Create Schedule
            </button>
          </form>
        </div>
      )}

      {/* Plans List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
         {plans.length === 0 && <p style={{ color: "var(--text-secondary)" }}>You don&apos;t have any active meal plans. Generate one to simplify your cooking!</p>}
         {plans.map(p => {
             const start = new Date(p.startDate).toLocaleDateString();
             const end = new Date(p.endDate).toLocaleDateString();
             let profilesCount = 0;
             try { profilesCount = JSON.parse(p.profiles).length; } catch { profilesCount = 0; }
             return (
                 <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                     <div>
                         <h3 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                             <span style={{ color: "var(--brand-orange)" }}>•</span> {start} to {end}
                         </h3>
                         <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                             Planned for {profilesCount} family members · <span style={{ color: "var(--brand-green)", fontWeight: "600" }}>{p.energyLevel} Energy</span>
                             {p.generatedPlan && <span style={{ marginLeft: "0.5rem", color: "var(--brand-orange)" }}>⚡ Optimized</span>}
                         </div>
                     </div>
                     <div style={{ display: "flex", gap: "0.5rem" }}>
                         <Link href={`/mealplans/${p.id}`} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>View / Optimize</Link>
                         <button onClick={() => deletePlan(p.id)} className="btn btn-secondary" style={{ width: "auto" }}>🗑️</button>
                     </div>
                 </div>
             )
         })}
      </div>
    </div>
  )
}
