export default function Home() {
  return (
    <div className="hero-section fade-in-up">
      <div className="hero-badge">AI-Powered Nutrition</div>
      <h1 className="hero-title">Intelligent Meal Prepping For Your Family</h1>
      <p className="hero-subtitle">
        Eliminate the Sunday stress. Use Gemini AI to automatically discover perfect recipes, tailor them to your family's fitness goals, and generate a unified "Prep In One Go" workflow.
      </p>
      <div className="hero-actions">
        <a href="/register" className="btn btn-primary btn-large">Start Planning Free</a>
        <a href="/login" className="btn btn-secondary btn-large">Sign In To Dashboard</a>
      </div>

      <div className="features-grid fade-in-up delay-2">
        <div className="card feature-card">
          <div className="feature-icon">✨</div>
          <h3>AI Recipe Discovery</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Just describe what you crave. The culinary assistant crafts perfect macros, ingredient tables, and instructions in seconds.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">🥗</div>
          <h3>Household Profiles</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Log dietary restrictions and fitness goals for every family member to ensure the calendar accommodates everyone.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">⚡</div>
          <h3>The One-Go Optimizer</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Automatically merges the entire week's ingredients into a sleek shopping list and a deduplicated chronologic prep workflow.</p>
        </div>
      </div>
    </div>
  );
}
