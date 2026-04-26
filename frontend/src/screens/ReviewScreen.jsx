import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ImagePlus, X } from 'lucide-react';
import { getReviews, getPendingReviews, createOrder, submitReview } from '../api/reviews';
import { uploadPhoto } from '../api/photos';

function StarBtn({ filled, onClick, readOnly }) {
  return (
    <button
      className={`star-btn ${filled ? 'filled' : ''}`}
      onClick={readOnly ? undefined : onClick}
      type="button"
      style={readOnly ? { cursor: 'default' } : {}}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.84 6.48L22 9.53l-5.25 4.98L18.18 22 12 18.27 5.82 22l1.43-7.49L2 9.53l7.16-1.05L12 2z" />
      </svg>
    </button>
  );
}

function Stars({ value, onChange, readOnly = false }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <StarBtn key={n} filled={value >= n} onClick={() => onChange(n)} readOnly={readOnly} />
      ))}
    </div>
  );
}

function ReviewReadOnly({ review }) {
  const navigate = useNavigate();
  return (
    <>
      <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
      <div className="meat-hero">
        <div className="marbling" style={{ opacity: 0.5 }} />
        <div className="meat-hero-label">
          {review.weightOz && <div className="meat-hero-sub">YOUR ORDER · {review.weightOz} OZ</div>}
          <div className="meat-hero-title">{review.cutName}</div>
        </div>
      </div>
      <div className="overall">
        <div className="overall-num">{review.overallScore.toFixed(1)}</div>
        <div className="overall-label">Overall Score</div>
      </div>
      <div className="rating-row"><div className="rating-label">Service</div><Stars value={review.serviceRating} readOnly /></div>
      <div className="rating-row"><div className="rating-label">Ambiance</div><Stars value={review.ambianceRating} readOnly /></div>
      <div className="rating-row"><div className="rating-label">Food Quality</div><Stars value={review.foodQualityRating} readOnly /></div>
      <div className="rating-row"><div className="rating-label">Taste</div><Stars value={review.tasteRating} readOnly /></div>
      {review.notes && (
        <div style={{ padding: '16px 24px', fontStyle: 'italic', color: 'var(--color-text-dim)', fontSize: 16 }}>
          "{review.notes}"
        </div>
      )}
      <div style={{ padding: '8px 24px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--color-gold-dim)', textTransform: 'uppercase' }}>
        {review.displayName} · {review.restaurantName}
      </div>
    </>
  );
}

export default function ReviewScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [reviewDetail, setReviewDetail]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(!!id);

  const [step, setStep]                   = useState(0);
  const [pending, setPending]             = useState([]);
  const [loadingPending, setLoadingPending] = useState(!id);
  const [selectedMeatup, setSelectedMeatup] = useState(null);
  const [cutName, setCutName]             = useState('');
  const [weightOz, setWeightOz]           = useState('');
  const [orderId, setOrderId]             = useState(null);
  const [reviewId, setReviewId]           = useState(null);
  const [ratings, setRatings]             = useState({ service: 0, ambiance: 0, foodQuality: 0, taste: 0 });
  const [notes, setNotes]                 = useState('');
  const [error, setError]                 = useState('');
  const [submitting, setSubmitting]       = useState(false);

  // Photo upload state (step 3)
  const [pendingPhotos, setPendingPhotos] = useState([]); // { file, preview }
  const [uploadedUrls, setUploadedUrls]   = useState([]);
  const [uploading, setUploading]         = useState(false);
  const [uploadError, setUploadError]     = useState('');

  useEffect(() => {
    if (id) {
      getReviews({}).then(r => {
        const found = r.reviews.find(rv => rv.id === parseInt(id));
        setReviewDetail(found ?? null);
      }).finally(() => setDetailLoading(false));
    } else {
      getPendingReviews().then(setPending).finally(() => setLoadingPending(false));
    }
  }, [id]);

  useEffect(() => {
    if (!id && !loadingPending && pending.length === 1) {
      setSelectedMeatup(pending[0]);
      setStep(1);
    }
  }, [pending, loadingPending, id]);

  if (id) {
    if (detailLoading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-gold-dim)' }}>Loading…</div>;
    if (reviewDetail) return <ReviewReadOnly review={reviewDetail} />;
    return <div className="empty-state"><div className="empty-state-sub">Review not found.</div></div>;
  }

  const avg = Object.values(ratings).filter(v => v > 0).length > 0
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).filter(v => v > 0).length).toFixed(1)
    : '—';

  const handleCutSubmit = async (e) => {
    e.preventDefault();
    if (!cutName.trim()) { setError('Please enter the name of your cut.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const order = await createOrder(selectedMeatup.id, { cutName: cutName.trim(), weightOz: weightOz ? parseInt(weightOz) : null });
      setOrderId(order.id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    const filled = Object.values(ratings).filter(v => v > 0);
    if (filled.length === 0) { setError('Please rate at least one category.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const review = await submitReview(orderId, {
        serviceRating:    ratings.service    || 1,
        ambianceRating:   ratings.ambiance   || 1,
        foodQualityRating: ratings.foodQuality || 1,
        tasteRating:      ratings.taste      || 1,
        notes: notes.trim() || null,
      });
      setReviewId(review.id);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPendingPhotos(prev => [...prev, ...previews]);
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPendingPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadAndFinish = async () => {
    if (pendingPhotos.length === 0) { setStep(4); return; }
    setUploading(true);
    setUploadError('');
    try {
      const urls = await Promise.all(
        pendingPhotos.map(({ file }) => uploadPhoto(reviewId, file).then(r => r.url))
      );
      setUploadedUrls(urls);
      setStep(4);
    } catch {
      setUploadError('One or more photos failed to upload. You can try again or skip.');
    } finally {
      setUploading(false);
    }
  };

  const resetAndGoHome = () => {
    pendingPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    setStep(0); setSelectedMeatup(null); setCutName(''); setWeightOz('');
    setOrderId(null); setReviewId(null);
    setRatings({ service: 0, ambiance: 0, foodQuality: 0, taste: 0 });
    setNotes(''); setPendingPhotos([]); setUploadedUrls([]);
    navigate('/home');
  };

  // Step 4: Success
  if (step === 4) return (
    <div className="submitted-wrap">
      <div className="check-circle"><Check size={38} strokeWidth={3} /></div>
      <div className="submitted-title">Review <em style={{ color: 'var(--color-gold)' }}>committed.</em></div>
      <div className="submitted-sub">
        Your cut is in the ledger.
        {uploadedUrls.length > 0 && ` ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} attached.`}
      </div>
      <button className="submit-btn" style={{ marginTop: 32 }} onClick={resetAndGoHome}>
        Return Home
      </button>
    </div>
  );

  // Step 3: Photo upload
  if (step === 3) return (
    <>
      <button className="back-link" onClick={() => setStep(2)}>← Back</button>
      <div className="screen-header">
        <div className="greeting">Add <em>Photos</em></div>
        <div className="subgreet">Optional — attach shots of your steak.</div>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {/* Previews */}
        {pendingPhotos.length > 0 && (
          <div className="photo-preview-grid">
            {pendingPhotos.map((p, i) => (
              <div key={i} className="photo-preview-item">
                <img src={p.preview} alt={`Photo ${i + 1}`} className="photo-preview-img" />
                <button className="photo-remove-btn" onClick={() => removePhoto(i)} type="button">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <button
          className="photo-add-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <ImagePlus size={18} />
          <span>Add Photos</span>
        </button>

        {uploadError && <div className="error-msg" style={{ marginTop: 12 }}>{uploadError}</div>}

        <button
          className="submit-btn"
          style={{ marginTop: 16 }}
          onClick={handleUploadAndFinish}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : pendingPhotos.length > 0 ? `Upload & Finish` : 'Skip & Finish'}
        </button>
      </div>
    </>
  );

  // Step 0: Select meatup
  if (step === 0) {
    if (loadingPending) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-gold-dim)' }}>Loading…</div>;
    if (pending.length === 0) return (
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="empty-state-title">All cuts are in the ledger.</div>
        <div className="empty-state-sub">Nothing left to review right now.</div>
        <button className="submit-btn" style={{ marginTop: 24, maxWidth: 280, margin: '24px auto 0' }} onClick={() => navigate('/archive')}>
          Browse the Archive →
        </button>
      </div>
    );
    return (
      <>
        <div className="screen-header">
          <div className="greeting">Which <em>meatup</em>?</div>
          <div className="subgreet">Select the dinner you're reviewing.</div>
        </div>
        {pending.map(m => (
          <div key={m.id} className="review-item" onClick={() => { setSelectedMeatup(m); setStep(1); }}>
            <div className="review-thumb"><div className="marbling" /></div>
            <div className="review-content">
              <div className="review-title">{m.restaurantName}</div>
              <div className="review-meta">
                {new Date(m.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                {' · '}{m.location}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Step 1: Enter cut
  if (step === 1) return (
    <>
      <button className="back-link" onClick={() => { setStep(0); setSelectedMeatup(null); }}>← Back</button>
      <div className="screen-header">
        <div className="greeting">Your <em>Cut</em></div>
        <div className="subgreet">{selectedMeatup.restaurantName} · {new Date(selectedMeatup.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
      </div>
      <form onSubmit={handleCutSubmit} style={{ padding: '8px 24px 24px' }}>
        <div className="field-group">
          <label className="field-label">What did you order?</label>
          <input className="field-input" value={cutName} onChange={e => setCutName(e.target.value)} placeholder="e.g. Dry-Aged Ribeye" disabled={submitting} />
        </div>
        <div className="field-group">
          <label className="field-label">Weight (oz, optional)</label>
          <input className="field-input" type="number" value={weightOz} onChange={e => setWeightOz(e.target.value)} placeholder="e.g. 22" disabled={submitting} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="submit-btn" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Continue'}</button>
      </form>
    </>
  );

  // Step 2: Rate
  return (
    <>
      <button className="back-link" onClick={() => setStep(1)}>← Back</button>
      <div className="meat-hero">
        <div className="marbling" style={{ opacity: 0.5 }} />
        <div className="meat-hero-label">
          {weightOz && <div className="meat-hero-sub">YOUR ORDER · {weightOz} OZ</div>}
          <div className="meat-hero-title">{cutName}</div>
        </div>
      </div>
      <div className="overall">
        <div className="overall-num">{avg}</div>
        <div className="overall-label">Overall Score</div>
      </div>
      <div className="rating-row">
        <div className="rating-label">Service</div>
        <Stars value={ratings.service} onChange={v => setRatings(r => ({ ...r, service: v }))} />
      </div>
      <div className="rating-row">
        <div className="rating-label">Ambiance</div>
        <Stars value={ratings.ambiance} onChange={v => setRatings(r => ({ ...r, ambiance: v }))} />
      </div>
      <div className="rating-row">
        <div className="rating-label">Food Quality</div>
        <Stars value={ratings.foodQuality} onChange={v => setRatings(r => ({ ...r, foodQuality: v }))} />
      </div>
      <div className="rating-row">
        <div className="rating-label">Taste</div>
        <Stars value={ratings.taste} onChange={v => setRatings(r => ({ ...r, taste: v }))} />
      </div>
      <div className="divider-ornament">· · ·</div>
      <div style={{ padding: '0 24px' }}>
        <textarea
          className="notes-field"
          placeholder="Tasting notes... What did the crust tell you?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
        <button className="submit-btn" style={{ marginTop: 16 }} onClick={handleReviewSubmit} disabled={submitting}>
          {submitting ? 'Committing…' : 'Commit Review'}
        </button>
      </div>
    </>
  );
}
