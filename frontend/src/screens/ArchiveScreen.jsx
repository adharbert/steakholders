import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { getMeatups, getMeatup } from '../api/meatups';

function MeatupItem({ meatup, onClick }) {
  return (
    <div className="review-item" onClick={onClick}>
      <div className="review-thumb"><div className="marbling" /></div>
      <div className="review-content">
        <div className="review-title">{meatup.restaurantName}</div>
        <div className="review-meta">
          {new Date(meatup.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
          {' · '}{meatup.location}
        </div>
      </div>
      {meatup.averageScore != null ? (
        <div className="review-score">
          <div className="score-num">{meatup.averageScore.toFixed(1)}<span>/5</span></div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--color-text-dim)', fontStyle: 'italic', marginLeft: 'auto' }}>—</div>
      )}
    </div>
  );
}

function DetailView({ id }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeatup(id).then(setDetail).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: 24 }}>
      {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12, marginBottom: 12 }} />)}
    </div>
  );
  if (!detail) return null;

  return (
    <>
      <button className="back-link" onClick={() => navigate('/archive')}>← Back</button>
      <div className="screen-header">
        <div className="greeting"><em>{detail.restaurantName}</em></div>
        <div className="subgreet">
          {new Date(detail.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}{detail.location}
        </div>
      </div>

      {detail.reviews.length > 0 && (
        <>
          <div className="section-label">Reviews</div>
          {detail.reviews.map(r => (
            <div key={r.id} className="review-item">
              <div className="review-thumb"><div className="marbling" /></div>
              <div className="review-content">
                <div className="review-title">{r.cutName}</div>
                <div className="review-meta">
                  {r.displayName}{r.weightOz ? ` · ${r.weightOz} OZ` : ''}
                </div>
                {r.notes && <div className="review-desc">{r.notes}</div>}
              </div>
              <div className="review-score">
                <div className="score-num">{r.overallScore.toFixed(1)}<span>/5</span></div>
              </div>
            </div>
          ))}
        </>
      )}

      {detail.bill && (
        <>
          <div className="section-label">The Bill</div>
          <div className="bill-summary" style={{ margin: '0 24px' }}>
            <div className="bill-total">
              <span className="currency">$</span>
              {Math.floor(detail.bill.totalAmount)}
              <span style={{ fontSize: 28, color: 'var(--color-gold)' }}>
                .{String(Math.round((detail.bill.totalAmount % 1) * 100)).padStart(2, '0')}
              </span>
            </div>
            <div className="bill-sub">Total · {detail.bill.tipPercent}% Tip{detail.bill.taxIncluded ? ' + Tax' : ''} Included</div>
            <div className="split-row">
              Split between {detail.bill.attendeeCount} → <strong>${detail.bill.splitAmount.toFixed(2)} each</strong>
            </div>
          </div>
          <div className="section-label">Shareholders</div>
          {detail.bill.payments.map(p => (
            <div key={p.userId} className="member-item">
              <div className="avatar sm">{p.displayName[0]}</div>
              <div>
                <div className="member-name">{p.displayName}</div>
                <div className="member-role">{p.role}</div>
              </div>
              {p.paid
                ? <div className="paid-badge"><Check size={10} /> PAID</div>
                : <div className="pending-badge">PENDING</div>}
            </div>
          ))}
        </>
      )}

      {detail.attendees.length > 0 && (
        <>
          <div className="section-label">Attendees</div>
          {detail.attendees.map(a => (
            <div key={a.userId} className="member-item">
              <div className="avatar sm">{a.displayName[0]}</div>
              <div>
                <div className="member-name">{a.displayName}</div>
                <div className="member-role">{a.role} · {a.status}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default function ArchiveScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [meatups, setMeatups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeatups({ past: true }).then(setMeatups).finally(() => setLoading(false));
  }, []);

  if (id) return <DetailView id={parseInt(id)} />;

  return (
    <>
      <div className="screen-header">
        <div className="greeting">The <em>Archive</em></div>
        <div className="subgreet">Every cut, every verdict.</div>
      </div>

      {loading ? (
        [0,1,2].map(i => (
          <div key={i} className="review-item">
            <div style={{ width: 60, height: 60, borderRadius: 12 }} className="skeleton" />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 18, width: '55%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '35%' }} />
            </div>
          </div>
        ))
      ) : meatups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">The ledger is empty.</div>
          <div className="empty-state-sub">Attend your first meatup to begin the archive.</div>
        </div>
      ) : meatups.map(m => (
        <MeatupItem key={m.id} meatup={m} onClick={() => navigate(`/archive/${m.id}`)} />
      ))}
    </>
  );
}
