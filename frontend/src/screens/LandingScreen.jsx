import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Star, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPublicRestaurants, getPublicReviews } from '../api/public';

export default function LandingScreen() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [query, setQuery]             = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect members to their dashboard
  useEffect(() => {
    if (!authLoading && user) navigate('/home', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    Promise.all([getPublicRestaurants(), getPublicReviews(6)])
      .then(([r, rv]) => { setRestaurants(r); setReviews(rv); })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  if (authLoading) return null;

  const filtered = query.trim()
    ? restaurants.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    : restaurants;

  return (
    <div className="landing-page">
      <div className="grain" />

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/icons/icon-192.png" alt="" className="brand-logo" aria-hidden="true" />
            <span className="brand-mark">Steakholders · Meatup</span>
          </div>
          <div className="landing-auth-btns">
            <button className="landing-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="landing-btn-gold"  onClick={() => navigate('/register')}>Join the Table</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <p className="landing-eyebrow">A private dining collective</p>
          <h1 className="landing-headline">Every cut.<br /><em>Every verdict.</em></h1>
          <p className="landing-sub">
            Track every steak your group has ever ordered. Score every bite.
            Archive every meatup — and never forget which restaurant earned the table.
          </p>
          <div className="landing-cta-row">
            <button className="landing-btn-gold landing-btn-lg" onClick={() => navigate('/register')}>
              Claim Your Seat
            </button>
            <button className="landing-btn-ghost" onClick={() => navigate('/restaurants')}>
              <BookOpen size={15} /> Browse Restaurants
            </button>
          </div>
        </div>
        <div className="landing-hero-steak" aria-hidden="true" />
      </section>

      {/* ── Restaurant Search ── */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <div className="section-label" style={{ padding: '0 0 10px' }}>Restaurants Visited</div>
          <div className="landing-search-wrap">
            <Search size={16} className="landing-search-icon" />
            <input
              className="landing-search-input"
              type="search"
              placeholder="Search restaurants…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {dataLoading ? (
            <div className="landing-restaurant-grid">
              {[0,1,2].map(i => (
                <div key={i} className="restaurant-card skeleton" style={{ height: 130 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="landing-empty">No restaurants found.</p>
          ) : (
            <div className="landing-restaurant-grid">
              {filtered.map(r => (
                <button
                  key={r.name}
                  className="restaurant-card"
                  onClick={() => navigate(`/restaurants/${encodeURIComponent(r.name)}`)}
                >
                  <div className="restaurant-card-inner">
                    <UtensilsCrossed size={18} className="restaurant-card-icon" />
                    <div className="restaurant-card-name">{r.name}</div>
                    <div className="restaurant-card-location">{r.location}</div>
                    <div className="restaurant-card-meta">
                      {r.avgScore != null && (
                        <span className="restaurant-card-score">
                          <Star size={11} /> {r.avgScore.toFixed(1)}
                        </span>
                      )}
                      <span>{r.reviewCount} {r.reviewCount === 1 ? 'review' : 'reviews'}</span>
                      <span>{r.visitCount} {r.visitCount === 1 ? 'visit' : 'visits'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <button
              className="landing-btn-ghost"
              style={{ marginTop: 16, width: '100%' }}
              onClick={() => navigate('/restaurants')}
            >
              View all restaurants →
            </button>
          )}
        </div>
      </section>

      {/* ── Recent Reviews ── */}
      {(dataLoading || reviews.length > 0) && (
        <section className="landing-section" style={{ paddingTop: 0 }}>
          <div className="landing-section-inner">
            <div className="section-label" style={{ padding: '0 0 10px' }}>Recent Reviews</div>
            {dataLoading ? (
              [0,1,2].map(i => (
                <div key={i} className="review-item">
                  <div style={{ width: 60, height: 60, borderRadius: 12 }} className="skeleton" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 16, width: '55%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '35%' }} />
                  </div>
                </div>
              ))
            ) : reviews.map(r => (
              <div
                key={r.id}
                className="review-item"
                style={{ cursor: 'default' }}
              >
                {r.photoUrls?.length > 0 ? (
                  <div className="review-thumb" style={{ backgroundImage: `url(${r.photoUrls[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div className="review-thumb"><div className="marbling" /></div>
                )}
                <div className="review-content">
                  <div className="review-title">{r.cutName}</div>
                  <div className="review-meta">
                    {r.weightOz ? `${r.weightOz} OZ · ` : ''}{r.temperature ?? ''}
                  </div>
                  {r.notes && <div className="review-desc">{r.notes}</div>}
                </div>
                <div className="score-num">{r.overallScore.toFixed(1)}<span>/5</span></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer CTA ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <p className="landing-footer-text">Ready to join the table?</p>
          <button className="landing-btn-gold landing-btn-lg" onClick={() => navigate('/register')}>
            Create an Account
          </button>
          <button className="auth-link" onClick={() => navigate('/login')}>
            Already a member? Sign in →
          </button>
        </div>
      </footer>
    </div>
  );
}
