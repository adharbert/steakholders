import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeatup } from '../api/meatups';

export default function CreateMeatupScreen() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState('');
  const [location, setLocation]     = useState('');
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('');
  const [notes, setNotes]           = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!restaurant.trim()) { setError('Restaurant name is required.'); return; }
    if (!location.trim())   { setError('Location is required.'); return; }
    if (!date || !time)     { setError('Date and time are required.'); return; }

    const eventDate = new Date(`${date}T${time}`);
    if (eventDate <= new Date()) { setError('Date must be in the future.'); return; }

    setLoading(true);
    try {
      await createMeatup({ restaurantName: restaurant.trim(), location: location.trim(), eventDate: eventDate.toISOString(), notes: notes.trim() || null });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
      <div className="screen-header">
        <div className="greeting">Schedule a <em>Meatup</em></div>
        <div className="subgreet">The shareholders await your call.</div>
      </div>

      <form onSubmit={submit} className="form-wrap" style={{ paddingTop: 16 }}>
        <div className="field-group">
          <label className="field-label">Restaurant Name</label>
          <input className="field-input" value={restaurant} onChange={e => setRestaurant(e.target.value)} placeholder="e.g. Bern's Steak House" disabled={loading} />
        </div>
        <div className="field-group">
          <label className="field-label">Location</label>
          <input className="field-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Tampa, Florida" disabled={loading} />
        </div>
        <div className="field-group">
          <label className="field-label">Date</label>
          <input className="field-input" type="date" value={date} onChange={e => setDate(e.target.value)} disabled={loading} />
        </div>
        <div className="field-group">
          <label className="field-label">Time</label>
          <input className="field-input" type="time" value={time} onChange={e => setTime(e.target.value)} disabled={loading} />
        </div>
        <div className="field-group">
          <label className="field-label">Notes (optional)</label>
          <textarea className="notes-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reservation details, dress code, etc." disabled={loading} rows={3} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Scheduling…' : 'Call the Meatup'}
        </button>
      </form>
    </>
  );
}
