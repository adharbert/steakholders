import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { getMeatups, getMeatup } from '../api/meatups';
import { getBill, createBill, markPaid } from '../api/bill';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = ['', 'blue', 'green', 'gold', 'blue', 'green'];

export default function BillScreen() {
  const { user } = useAuth();
  const [meatups, setMeatups]   = useState([]);
  const [meatupIdx, setMeatupIdx] = useState(0);
  const [detail, setDetail]     = useState(null);
  const [bill, setBill]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [billLoading, setBillLoading] = useState(false);

  // Record bill form
  const [showForm, setShowForm]   = useState(false);
  const [total, setTotal]         = useState('');
  const [tip, setTip]             = useState('20');
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    getMeatups({ past: true }).then(ms => {
      setMeatups(ms);
      setLoading(false);
    });
  }, []);

  const selectedMeatup = meatups[meatupIdx];

  useEffect(() => {
    if (!selectedMeatup) return;
    setBillLoading(true);
    Promise.all([
      getMeatup(selectedMeatup.id),
      getBill(selectedMeatup.id).catch(() => null),
    ]).then(([d, b]) => {
      setDetail(d);
      setBill(b);
    }).finally(() => setBillLoading(false));
  }, [selectedMeatup?.id]);

  const handleTogglePaid = async (userId, currentPaid) => {
    const optimistic = !currentPaid;
    setBill(b => ({
      ...b,
      payments: b.payments.map(p => p.userId === userId ? { ...p, paid: optimistic, paidAt: optimistic ? new Date().toISOString() : null } : p)
    }));
    try {
      await markPaid(selectedMeatup.id, userId, optimistic);
    } catch {
      setBill(b => ({
        ...b,
        payments: b.payments.map(p => p.userId === userId ? { ...p, paid: currentPaid } : p)
      }));
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setFormError('');
    const totalNum = parseFloat(total);
    if (!total || isNaN(totalNum) || totalNum <= 0) { setFormError('Enter a valid total amount.'); return; }
    setFormLoading(true);
    try {
      const b = await createBill(selectedMeatup.id, { totalAmount: totalNum, tipPercent: parseInt(tip) || 0, taxIncluded });
      setBill(b);
      setShowForm(false);
      setTotal(''); setTip('20');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-gold-dim)' }}>Loading…</div>
  );

  if (meatups.length === 0) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-state-title">No meatups yet.</div>
      <div className="empty-state-sub">Attend your first meatup to track the bill.</div>
    </div>
  );

  return (
    <>
      <div className="screen-header">
        <div className="greeting">The <em>Bill</em></div>
        <div className="subgreet">
          {selectedMeatup?.restaurantName}
          {' · '}
          {new Date(selectedMeatup?.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        {meatups.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <button
              onClick={() => setMeatupIdx(i => Math.max(0, i - 1))}
              disabled={meatupIdx === 0}
              style={{ background: 'none', border: 'none', color: meatupIdx === 0 ? 'var(--color-border)' : 'var(--color-gold)', fontSize: 20 }}
            >←</button>
            <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--color-gold-dim)' }}>
              {meatupIdx + 1} / {meatups.length}
            </span>
            <button
              onClick={() => setMeatupIdx(i => Math.min(meatups.length - 1, i + 1))}
              disabled={meatupIdx === meatups.length - 1}
              style={{ background: 'none', border: 'none', color: meatupIdx === meatups.length - 1 ? 'var(--color-border)' : 'var(--color-gold)', fontSize: 20 }}
            >→</button>
          </div>
        )}
      </div>

      {billLoading ? (
        <div style={{ margin: '16px 24px', height: 160, borderRadius: 20 }} className="skeleton" />
      ) : bill ? (
        <>
          <div className="bill-summary">
            <div className="bill-total">
              <span className="currency">$</span>
              {Math.floor(bill.totalAmount)}
              <span style={{ fontSize: 28, color: 'var(--color-gold)' }}>
                .{String(Math.round((bill.totalAmount % 1) * 100)).padStart(2, '0')}
              </span>
            </div>
            <div className="bill-sub">Total · {bill.tipPercent}% Tip{bill.taxIncluded ? ' + Tax' : ''} Included</div>
            <div className="split-row">
              Split between {bill.attendeeCount} → <strong>${bill.splitAmount.toFixed(2)} each</strong>
            </div>
          </div>

          <div className="section-label">Shareholders</div>
          {bill.payments.map((p, i) => (
            <div key={p.userId} className="member-item">
              <div className={`avatar sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>{p.displayName[0]}</div>
              <div>
                <div className="member-name">{p.displayName}</div>
                <div className="member-role">{p.role}</div>
              </div>
              {p.paid
                ? <div className="paid-badge" onClick={() => handleTogglePaid(p.userId, p.paid)}><Check size={10} /> PAID</div>
                : <div className="pending-badge" onClick={() => handleTogglePaid(p.userId, p.paid)}>PENDING</div>
              }
            </div>
          ))}
        </>
      ) : showForm ? (
        <form onSubmit={handleCreateBill} style={{ padding: '8px 24px 24px' }}>
          <div className="field-group">
            <label className="field-label">Total Amount ($)</label>
            <input className="field-input" type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} placeholder="e.g. 1284.50" disabled={formLoading} />
          </div>
          <div className="field-group">
            <label className="field-label">Tip (%)</label>
            <input className="field-input" type="number" value={tip} onChange={e => setTip(e.target.value)} placeholder="20" disabled={formLoading} />
          </div>
          <div className="field-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="taxIncluded" checked={taxIncluded} onChange={e => setTaxIncluded(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--color-gold)' }} />
            <label htmlFor="taxIncluded" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--color-gold-dim)', textTransform: 'uppercase', cursor: 'pointer' }}>Tax Included</label>
          </div>
          {formError && <div className="error-msg">{formError}</div>}
          <button className="submit-btn" type="submit" disabled={formLoading}>{formLoading ? 'Recording…' : 'Record Bill'}</button>
          <button type="button" style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: 'var(--color-gold-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }} onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      ) : (
        <div style={{ padding: '24px 24px' }}>
          {detail?.attendees && (
            <>
              <div className="section-label" style={{ padding: '0 0 12px' }}>Attendees</div>
              {detail.attendees.filter(a => a.status === 'going').map((a, i) => (
                <div key={a.userId} className="member-item" style={{ padding: '12px 0' }}>
                  <div className={`avatar sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>{a.displayName[0]}</div>
                  <div>
                    <div className="member-name">{a.displayName}</div>
                    <div className="member-role">{a.role}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          <button className="submit-btn" style={{ marginTop: 20 }} onClick={() => setShowForm(true)}>Record the Bill</button>
        </div>
      )}
    </>
  );
}
