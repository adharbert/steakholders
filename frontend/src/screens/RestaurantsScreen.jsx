import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, UtensilsCrossed } from 'lucide-react';
import { getPublicRestaurants } from '../api/public';

export default function RestaurantsScreen() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [query, setQuery]             = useState('');

  useEffect(() => {
    getPublicRestaurants()
      .then(setRestaurants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? restaurants.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.location?.toLowerCase().includes(query.toLowerCase()))
    : restaurants;

  return (
    <>
      <div className="screen-header">
        <div className="brand-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img className="brand-logo" src="/icons/icon-192.png" alt="" aria-hidden="true" />
            <div className="brand-mark">Steakholders · Meatup</div>
          </div>
        </div>
        <div className="greeting" style={{ fontSize: 22, marginTop: 14 }}>
          The <em>Steakhouse</em> Directory
        </div>
        <div className="subgreet">Every restaurant the crew has conquered.</div>
      </div>

      <div style={{ padding: '12px 24px 0' }}>
        <div className="landing-search-wrap" style={{ margin: 0 }}>
          <Search size={16} className="landing-search-icon" />
          <input
            className="landing-search-input"
            type="search"
            placeholder="Search by name or location…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="section-label">
        {loading ? 'Loading…' : `${filtered.length} Restaurant${filtered.length !== 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div style={{ padding: '0 24px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14, marginBottom: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No restaurants found</div>
          <div className="empty-state-sub">Try a different search term.</div>
        </div>
      ) : (
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <button
              key={r.name}
              className="restaurant-list-item"
              onClick={() => navigate(`/restaurants/${encodeURIComponent(r.name)}`)}
            >
              <div className="restaurant-list-icon">
                <UtensilsCrossed size={20} />
              </div>
              <div className="restaurant-list-body">
                <div className="restaurant-list-name">{r.name}</div>
                {r.location && (
                  <div className="restaurant-list-location">{r.location}</div>
                )}
                <div className="restaurant-list-meta">
                  {r.avgScore != null && (
                    <span className="restaurant-card-score">
                      <Star size={10} /> {r.avgScore.toFixed(1)}
                    </span>
                  )}
                  <span>{r.reviewCount} {r.reviewCount === 1 ? 'review' : 'reviews'}</span>
                  <span>{r.visitCount} {r.visitCount === 1 ? 'visit' : 'visits'}</span>
                  {r.lastVisit && (
                    <span>
                      Last: {new Date(r.lastVisit).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ color: 'var(--color-gold)', opacity: 0.6, flexShrink: 0 }}>›</div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
