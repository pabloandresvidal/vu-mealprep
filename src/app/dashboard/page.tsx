import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const recipeCount = await prisma.recipe.count({ where: { userId: session.user.id } });
  
  const activePlan = await prisma.mealPlan.findFirst({ 
    where: { userId: session.user.id, endDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' }
  });

  const recipes = await prisma.recipe.findMany({ where: { userId: session.user.id } });

  return (
    <>
      <div className="dashboard-grid fade-in-up delay-1">
        {/* Total Recipes */}
        <div className="card card-orange">
          <div className="card-icon-wrapper">
            👨‍🍳
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div className="card-title">Total Recipes</div>
            <div className="card-subtitle">In your repository</div>
          </div>
          <div className="large-metric">{recipeCount}</div>
        </div>

        {/* Current Plan */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon-wrapper icon-green">
              📅
            </div>
            <Link href={activePlan ? `/mealplans/${activePlan.id}` : "/mealplans/new"} className="card-action-link link-green">
              {activePlan ? "View Plan" : "Plan Now"}
            </Link>
          </div>
          <div className="card-title">Current Plan</div>
          <div className="card-subtitle">
            {activePlan ? `Active until ${activePlan.endDate.toLocaleDateString()}` : "No active plan"}
          </div>
        </div>

        {/* Random Recipe */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon-wrapper icon-yellow">
              ✨
            </div>
            <Link href="/recipes/random" className="card-action-link link-yellow">
              Surprise Me
            </Link>
          </div>
          <div className="card-title">Random Recipe</div>
          <div className="card-subtitle">Can't decide? Let us pick!</div>
        </div>
      </div>

      <div className="dashboard-grid-bottom fade-in-up delay-2">
        {/* Single Recipe Prep */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#113f36' }}>
            <span style={{ color: '#10b981' }}>👥</span> Single Recipe Prep
          </h3>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">SELECT RECIPE</label>
              <select defaultValue="">
                <option value="" disabled>Choose a recipe...</option>
                {recipes.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">PEOPLE</label>
              <input type="number" defaultValue={2} />
            </div>
          </div>
          <button className="btn btn-teal">Generate Single Recipe Plan</button>
        </div>

        {/* AI Suggestions */}
        <div className="card">
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#113f36' }}>
            <span style={{ color: '#eab308' }}>✨</span> AI Suggestions
          </h3>
          <p style={{ color: 'var(--brand-teal)', marginBottom: '2rem', fontWeight: 500 }}>Get fresh ideas based on your current repository.</p>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/recipes/ai" className="btn btn-outline" style={{width: '100%', justifyContent: 'center'}}>
              View All Suggestions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
