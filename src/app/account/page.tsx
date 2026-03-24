"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") return <div className="spinner">Loading Account...</div>;

  return (
    <div className="fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>⚙️ Account Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Manage your personal information and application preferences.
      </p>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Profile Information</h3>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" value={session?.user?.email || ""} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Email cannot be changed currently. Contact support for assistance.
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand-orange)' }}>Preferences</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Adjust how PrepMaster calculates your meal plans and notifications.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/profile" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                Manage Household/Family Profiles 👨‍👩‍👧‍👦
            </Link>
            <button className="btn btn-secondary" disabled>
                Change Password (Coming Soon)
            </button>
        </div>
      </div>

      {message.text && (
        <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: message.type === "success" ? 'var(--brand-green-light)' : '#ffebe9',
            color: message.type === "success" ? 'var(--brand-green)' : '#cf222e',
            border: `1px solid ${message.type === "success" ? 'var(--brand-green)' : '#cf222e'}`
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
