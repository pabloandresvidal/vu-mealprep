"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [pwLoading, setPwLoading] = useState(false);

  // Partner state
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partner, setPartner] = useState<any>(null);
  const [partnerMsg, setPartnerMsg] = useState({ type: "", text: "" });
  const [partnerLoading, setPartnerLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchPartner();
  }, [status, router]);

  const fetchPartner = async () => {
    const res = await fetch("/api/auth/partner");
    if (res.ok) {
      const data = await res.json();
      setPartner(data.partner);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwMsg({ type: "error", text: "Passwords do not match" }); return; }
    setPwLoading(true);
    setPwMsg({ type: "", text: "" });
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    setPwLoading(false);
    if (res.ok) {
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } else {
      setPwMsg({ type: "error", text: await res.text() });
    }
  };

  const handleLinkPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerLoading(true);
    setPartnerMsg({ type: "", text: "" });
    const res = await fetch("/api/auth/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: partnerEmail })
    });
    setPartnerLoading(false);
    if (res.ok) {
      setPartnerMsg({ type: "success", text: "Partner linked! They'll receive an email notification." });
      setPartnerEmail("");
      fetchPartner();
    } else {
      setPartnerMsg({ type: "error", text: await res.text() });
    }
  };

  const handleUnlinkPartner = async () => {
    if (!confirm("Unlink your partner? You'll no longer share recipes and meal plans.")) return;
    const res = await fetch("/api/auth/partner", { method: "DELETE" });
    if (res.ok) { setPartner(null); setPartnerMsg({ type: "success", text: "Partner unlinked." }); }
  };

  if (status !== "authenticated") return <div className="spinner">Loading...</div>;

  return (
    <div className="fade-in-up" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>⚙️ Account Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Manage your account, security, and shared access.
      </p>

      {/* Profile Info */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Profile Information</h3>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" value={session?.user?.email || ""} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
        </div>
        <Link href="/profile" className="btn btn-outline" style={{ marginTop: '1rem', justifyContent: 'center' }}>Manage Family Profiles 👨‍👩‍👧‍👦</Link>
      </div>

      {/* Change Password */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🔒 Change Password</h3>
        {pwMsg.text && (
          <div style={{ padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem',
            background: pwMsg.type === "success" ? 'var(--brand-green-light)' : '#ffebe9',
            color: pwMsg.type === "success" ? 'var(--brand-green)' : '#cf222e' }}>
            {pwMsg.text}
          </div>
        )}
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-teal" disabled={pwLoading}>
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Partner/Shared Account */}
      <div className="card">
        <h3 style={{ marginBottom: '0.5rem' }}>👫 Shared Account</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Link with your partner so you both see the same recipes, meal plans, and family profiles.
        </p>

        {partnerMsg.text && (
          <div style={{ padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem',
            background: partnerMsg.type === "success" ? 'var(--brand-green-light)' : '#ffebe9',
            color: partnerMsg.type === "success" ? 'var(--brand-green)' : '#cf222e' }}>
            {partnerMsg.text}
          </div>
        )}

        {partner ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--brand-green-light)', borderRadius: '10px', border: '1px solid var(--brand-green)' }}>
            <div>
              <strong style={{ color: 'var(--brand-green)' }}>✅ Linked with</strong>
              <p style={{ fontWeight: 600, marginTop: '0.3rem' }}>{partner.email}</p>
            </div>
            <button onClick={handleUnlinkPartner} className="btn btn-secondary" style={{ width: 'auto' }}>Unlink</button>
          </div>
        ) : (
          <form onSubmit={handleLinkPartner}>
            <div className="form-group">
              <label className="form-label">Partner&apos;s Email</label>
              <input type="email" required value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="partner@email.com" />
            </div>
            <button type="submit" className="btn btn-teal" disabled={partnerLoading}>
              {partnerLoading ? "Linking..." : "Link Partner Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
