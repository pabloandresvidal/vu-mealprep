import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section fade-in-up">
        <div className="hero-content">
          <div className="hero-badge badge-glow">✨ AI-Powered Nutrition</div>
          <h1 className="hero-title">
            Intelligent Meal Prepping <br/>
            <span className="text-gradient">For Your Family</span>
          </h1>
          <p className="hero-subtitle">
            Eliminate the Sunday stress. Use Gemini AI to automatically discover perfect recipes, tailor them to your family's fitness goals, and generate a unified "Prep In One Go" workflow in seconds.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-large btn-glow">Start Planning Free</Link>
            <Link href="/login" className="btn btn-outline btn-large">Sign In To Dashboard</Link>
          </div>
          
          <div className="hero-stats delay-2">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Meals Planned</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">5 hrs</span>
              <span className="stat-label">Saved Weekly</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Customized</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual delay-1">
          <div className="glass-card mockup-card">
            <div className="mockup-header">
              <div className="mockup-dots"><span></span><span></span><span></span></div>
              <div className="mockup-title">PrepMaster Dashboard</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-item">
                <div className="mockup-icon" style={{background: 'var(--brand-green-light)', color: 'var(--brand-green)'}}>🥗</div>
                <div className="mockup-text">
                  <div className="mockup-line w-100"></div>
                  <div className="mockup-line w-60"></div>
                </div>
              </div>
              <div className="mockup-item">
                <div className="mockup-icon" style={{background: 'var(--brand-orange-light)', color: 'var(--brand-orange)'}}>🥩</div>
                <div className="mockup-text">
                  <div className="mockup-line w-80"></div>
                  <div className="mockup-line w-40"></div>
                </div>
              </div>
              <div className="mockup-btn">Generate Shopping List ✨</div>
            </div>
          </div>
          {/* Background decorations */}
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section fade-in-up delay-2">
        <div className="section-header">
          <h2 className="section-title">Everything you need to eat better.</h2>
          <p className="section-subtitle">A central operating system for your kitchen.</p>
        </div>
        
        <div className="features-grid">
          <div className="card feature-card feature-hover">
            <div className="feature-icon-wrapper icon-teal">✨</div>
            <h3>AI Recipe Discovery</h3>
            <p>Just describe what you crave. The culinary assistant crafts perfect macros, ingredient tables, and instructions in seconds.</p>
          </div>
          <div className="card feature-card feature-hover">
            <div className="feature-icon-wrapper icon-orange">👥</div>
            <h3>Household Profiles</h3>
            <p>Log dietary restrictions and fitness goals for every family member to ensure the calendar accommodates everyone.</p>
          </div>
          <div className="card feature-card feature-hover">
            <div className="feature-icon-wrapper icon-green">⚡</div>
            <h3>The One-Go Optimizer</h3>
            <p>Automatically merges the entire week's ingredients into a sleek shopping list and a deduplicated chronologic prep workflow.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section fade-in-up delay-2">
        <div className="how-it-works-container">
          <div className="how-it-works-content">
            <h2 className="section-title" style={{textAlign: 'left', marginBottom: '1.5rem'}}>How PrepMaster Works</h2>
            <div className="step-row mt-4">
              <div className="step-circle step-active" style={{background: 'var(--brand-teal)', color: 'white'}}>1</div>
              <div>
                <h4 className="step-title" style={{margin: '0 0 0.25rem 0', color: 'var(--brand-teal)', fontSize: '1.1rem'}}>Tell AI what you want</h4>
                <p className="step-desc" style={{margin: 0, color: 'var(--text-secondary)'}}>"High protein lunches for a couple, no dairy."</p>
              </div>
            </div>
            <div className="step-row" style={{marginTop: '1.5rem'}}>
              <div className="step-circle step-active" style={{background: 'var(--brand-teal)', color: 'white'}}>2</div>
              <div>
                <h4 className="step-title" style={{margin: '0 0 0.25rem 0', color: 'var(--brand-teal)', fontSize: '1.1rem'}}>Review the customized menu</h4>
                <p className="step-desc" style={{margin: 0, color: 'var(--text-secondary)'}}>Swap meals, adjust portions, and finalize.</p>
              </div>
            </div>
            <div className="step-row" style={{marginTop: '1.5rem'}}>
              <div className="step-circle step-active" style={{background: 'var(--brand-teal)', color: 'white'}}>3</div>
              <div>
                <h4 className="step-title" style={{margin: '0 0 0.25rem 0', color: 'var(--brand-teal)', fontSize: '1.1rem'}}>Prep in one go</h4>
                <p className="step-desc" style={{margin: 0, color: 'var(--text-secondary)'}}>Shop with a consolidated list and follow a chronologic prep guide.</p>
              </div>
            </div>
            <div style={{marginTop: '2.5rem'}}>
              <Link href="/register" className="btn btn-primary btn-glow" style={{maxWidth: '220px'}}>Try it yourself ➔</Link>
            </div>
          </div>
          
          <div className="how-it-works-image">
            <div className="glass-card visual-card">
              <div className="card-header" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem'}}>
                <div className="card-icon-wrapper icon-yellow" style={{width: 40, height: 40, fontSize: '1.2rem', borderRadius: 10}}>🛒</div>
                <div style={{fontWeight: 700, fontSize: '1.2rem', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center'}}>Consolidated List</div>
              </div>
              <ul className="mock-list">
                <li><span className="check">✓</span> <span style={{fontWeight: 600}}>2 lbs</span> Chicken Breast</li>
                <li><span className="check">✓</span> <span style={{fontWeight: 600}}>3 cups</span> Quinoa</li>
                <li><span className="check">✓</span> <span style={{fontWeight: 600}}>1 bunch</span> Asparagus</li>
                <li style={{opacity: 0.5}}><span className="check empty"></span> <span style={{fontWeight: 600}}>2 tbsp</span> Olive Oil</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer fade-in-up delay-2">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-icon logo-small">PM</div>
            <div className="logo-text-wrapper">
              <span className="logo-main">PrepMaster</span>
              <span className="logo-sub">Intelligent Nutrition</span>
            </div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem', maxWidth: '250px'}}>
              The smart way to plan, prep, and enjoy your family&apos;s meals.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <Link href="/recipes">Recipes</Link>
              <Link href="/mealplans">Meal Plans</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="#">About Us</Link>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PrepMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
