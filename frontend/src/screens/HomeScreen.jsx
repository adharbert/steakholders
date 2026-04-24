import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Flame, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMeatups, rsvp } from '../api/meatups';
import { getReviews, getMyStats } from '../api/reviews';

const AVATAR_COLORS = ['', 'blue', 'green', 'gold', 'blue', 'green'];

function greeting(name) {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return `Good morning, `;
  if (h >= 12 && h < 17) return `Good afternoon, `;
  if (h >= 17 && h < 24) return `Good evening, `;
  return `Late night, `;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState(null);
  const [stats, setStats]       = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getMeatups({ upcoming: true }),
      getMyStats(),
      getReviews({ limit: 5 }),
    ]).then(([meatups, s, r]) => {
      setUpcoming(meatups[0] ?? null);
      setStats(s);
      setReviews(r.reviews);
    }).finally(() => setLoading(false));
  }, []);

  const handleRsvp = async () => {
    if (!upcoming) return;
    const newStatus = upcoming.myRsvpStatus === 'going' ? 'not_going' : 'going';
    const updated = await rsvp(upcoming.id, newStatus);
    setUpcoming(u => ({ ...u, myRsvpStatus: updated.status }));
  };

  const goingCount = upcoming?.attendeeCount ?? 0;

  return (
    <>
      <div className="screen-header">
        <div className="brand-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img className="brand-logo" src="/icons/icon-192.png" alt="" aria-hidden="true" />
            <div className="brand-mark">Steakholders · Meatup</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/meatups/new')}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold)', padding: 4 }}
              aria-label="Schedule a meatup"
            >
              <Plus size={20} />
            </button>
            <div className={`avatar md`}>{user?.displayName?.[0] ?? '?'}</div>
          </div>
        </div>
        <div className="greeting">{greeting(user?.displayName)}<em>{user?.displayName}</em></div>
        <div className="subgreet">Your next cut awaits.</div>
      </div>

      <div className="section-label">Upcoming Meatup</div>
      {loading ? (
        <div style={{ margin: '0 24px', height: 220, borderRadius: 20 }} className="skeleton" />
      ) : upcoming ? (
        <div className="upcoming-card">
          <div
            className="upcoming-hero"
            style={{
              background: `
                linear-gradient(180deg, rgba(10,6,4,0.15) 0%, rgba(18,9,7,0.97) 100%),
                url('/icons/icon-512.png') center 18% / cover no-repeat
              `
            }}
          >
            <div className="flame-chip"><Flame size={11} /> PRIME</div>
          </div>
          <div className="upcoming-body">
            <div className="date-chip">
              <Calendar size={11} />
              {new Date(upcoming.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).toUpperCase()}
            </div>
            <div className="restaurant-name">{upcoming.restaurantName}</div>
            <div className="restaurant-location"><MapPin size={13} /> {upcoming.location}</div>
            <div className="attendees">
              <div className="avatar-stack">
                {Array.from({ length: Math.min(goingCount, 4) }).map((_, i) => (
                  <div key={i} className={`avatar sm ${AVATAR_COLORS[i]}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="attendee-count">
                <strong>{goingCount} shareholders</strong> confirmed
              </div>
              <button
                className={`rsvp-btn ${upcoming.myRsvpStatus === 'going' ? 'going' : ''}`}
                onClick={handleRsvp}
              >
                {upcoming.myRsvpStatus === 'going' ? 'GOING ✓' : 'RSVP'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ margin: '0 24px' }}>
          <div className="empty-state">
            <div className="empty-state-title">No meatup scheduled</div>
            <div className="empty-state-sub">The shareholders await your call.</div>
          </div>
          <button className="submit-btn" onClick={() => navigate('/meatups/new')}>
            Schedule a Meatup
          </button>
        </div>
      )}

      <div className="section-label">The Ledger</div>
      {loading ? (
        <div className="stats-row">
          {[0,1,2].map(i => <div key={i} className="stat-card skeleton" style={{ height: 72 }} />)}
        </div>
      ) : (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{stats?.meatupCount ?? '—'}</div>
            <div className="stat-label">Meatups</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats?.averageScore > 0 ? stats.averageScore.toFixed(1) : '—'}</div>
            <div className="stat-label">Avg Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">${Math.round(stats?.totalSpend ?? 0)}</div>
            <div className="stat-label">Your Spend</div>
          </div>
        </div>
      )}

      <div className="section-label">Recent Reviews</div>
      {loading ? (
        [0,1,2].map(i => (
          <div key={i} className="review-item" style={{ gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 12 }} className="skeleton" />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
          </div>
        ))
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-sub">No reviews yet. Attend a meatup to get started.</div>
        </div>
      ) : reviews.map(r => (
        <div
          key={r.id}
          className="review-item"
          onClick={() => navigate(`/review/${r.id}`)}
        >
          <div className="review-thumb"><div className="marbling" /></div>
          <div className="review-content">
            <div className="review-title">{r.cutName}</div>
            <div className="review-meta">
              {r.displayName} · {r.restaurantName} {r.weightOz ? `· ${r.weightOz} OZ` : ''}
            </div>
            {r.notes && <div className="review-desc">{r.notes}</div>}
          </div>
          <div className="review-score">
            <div className="score-num">{r.overallScore.toFixed(1)}<span>/5</span></div>
          </div>
        </div>
      ))}
    </>
  );
}
