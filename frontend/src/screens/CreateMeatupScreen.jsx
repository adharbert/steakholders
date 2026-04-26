import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { createMeatup } from '../api/meatups';
import { getMyGroups } from '../api/groups';
import { searchRestaurants } from '../api/restaurants';

const VENUE_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'home',       label: 'Home' },
  { value: 'park',       label: 'Park' },
  { value: 'other',      label: 'Other' },
];

export default function CreateMeatupScreen() {
  const navigate = useNavigate();

  const [venueType, setVenueType]         = useState('restaurant');
  const [groupId, setGroupId]             = useState('');
  const [date, setDate]                   = useState('');
  const [time, setTime]                   = useState('');
  const [notes, setNotes]                 = useState('');

  // Restaurant search
  const [restaurantQuery, setRQuery]      = useState('');
  const [restaurantResults, setRResults]  = useState([]);
  const [selectedRestaurant, setSelected] = useState(null);
  const [searching, setSearching]         = useState(false);

  // Non-restaurant venue
  const [venueName, setVenueName]         = useState('');
  const [venueCity, setVenueCity]         = useState('');
  const [venueState, setVenueState]       = useState('');
  const [venueZip, setVenueZip]           = useState('');

  const [groups, setGroups]               = useState([]);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    getMyGroups().then(setGroups).catch(() => {});
  }, []);

  const searchRest = async () => {
    if (!restaurantQuery.trim()) return;
    setSearching(true);
    try {
      const data = await searchRestaurants({ q: restaurantQuery.trim() });
      setRResults(data.restaurants ?? []);
    } catch {
      setRResults([]);
    } finally {
      setSearching(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !time) { setError('Date and time are required.'); return; }
    const eventDate = new Date(`${date}T${time}`);
    if (eventDate <= new Date()) { setError('Date must be in the future.'); return; }

    if (venueType === 'restaurant' && !selectedRestaurant) {
      setError('Select a restaurant from search results.'); return;
    }
    if (venueType !== 'restaurant' && !venueName.trim()) {
      setError('Venue name is required.'); return;
    }

    setLoading(true);
    try {
      await createMeatup({
        venueType,
        eventDate: eventDate.toISOString(),
        groupId: groupId ? Number(groupId) : null,
        notes: notes.trim() || null,
        restaurantId: venueType === 'restaurant' ? selectedRestaurant?.id : null,
        venueName: venueType !== 'restaurant' ? venueName.trim() : null,
        venueCity: venueType !== 'restaurant' ? venueCity.trim() || null : null,
        venueState: venueType !== 'restaurant' ? venueState.trim() || null : null,
        venueZip: venueType !== 'restaurant' ? venueZip.trim() || null : null,
      });
      navigate('/home');
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
        {/* Venue Type */}
        <div className="field-group">
          <label className="field-label">Venue Type</label>
          <div className="venue-type-row">
            {VENUE_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                className={`venue-type-btn ${venueType === t.value ? 'active' : ''}`}
                onClick={() => { setVenueType(t.value); setSelected(null); setRResults([]); }}
                disabled={loading}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Group picker */}
        {groups.length > 0 && (
          <div className="field-group">
            <label className="field-label">Group <span className="field-optional">(optional)</span></label>
            <select
              className="field-input"
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              disabled={loading}
            >
              <option value="">No group (personal)</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {groupId && <div className="field-hint">All active group members will get an RSVP request.</div>}
          </div>
        )}

        {/* Restaurant search */}
        {venueType === 'restaurant' && (
          <div className="field-group">
            <label className="field-label">Restaurant</label>
            {selectedRestaurant ? (
              <div className="selected-restaurant">
                <div className="selected-restaurant-name">{selectedRestaurant.name}</div>
                <div className="selected-restaurant-addr">{selectedRestaurant.city}, {selectedRestaurant.state}</div>
                <button type="button" className="clear-selection" onClick={() => setSelected(null)}>
                  Change ×
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="field-input"
                    style={{ flex: 1 }}
                    value={restaurantQuery}
                    onChange={e => setRQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchRest())}
                    placeholder="Search restaurant name or city…"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="submit-btn"
                    style={{ width: 'auto', padding: '0 16px' }}
                    onClick={searchRest}
                    disabled={searching || loading}
                  >
                    <Search size={16} />
                  </button>
                </div>
                {restaurantResults.length > 0 && (
                  <div className="restaurant-results">
                    {restaurantResults.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        className="restaurant-result-item"
                        onClick={() => { setSelected(r); setRResults([]); setRQuery(''); }}
                      >
                        <div className="restaurant-result-name">{r.name}</div>
                        <div className="restaurant-result-addr">{r.city}, {r.state} · {r.zip}</div>
                      </button>
                    ))}
                  </div>
                )}
                {restaurantResults.length === 0 && restaurantQuery && !searching && (
                  <div className="field-hint">No results. Try a different name or <button type="button" className="inline-link" onClick={() => navigate('/restaurants')}>add a restaurant</button>.</div>
                )}
              </>
            )}
          </div>
        )}

        {/* Non-restaurant venue */}
        {venueType !== 'restaurant' && (
          <>
            <div className="field-group">
              <label className="field-label">Venue Name</label>
              <input
                className="field-input"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                placeholder={venueType === 'home' ? "e.g. Katie's house" : venueType === 'park' ? "e.g. Riverside Park" : "Venue name"}
                disabled={loading}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">City <span className="field-optional">(optional)</span></label>
              <input className="field-input" value={venueCity} onChange={e => setVenueCity(e.target.value)} placeholder="e.g. Tampa" disabled={loading} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="field-group" style={{ flex: 1 }}>
                <label className="field-label">State</label>
                <input className="field-input" value={venueState} onChange={e => setVenueState(e.target.value)} placeholder="FL" maxLength={2} disabled={loading} />
              </div>
              <div className="field-group" style={{ flex: 1 }}>
                <label className="field-label">Zip</label>
                <input className="field-input" type="text" inputMode="numeric" value={venueZip} onChange={e => setVenueZip(e.target.value)} placeholder="33602" disabled={loading} />
              </div>
            </div>
          </>
        )}

        <div className="field-group">
          <label className="field-label">Date</label>
          <input className="field-input" type="date" value={date} onChange={e => setDate(e.target.value)} disabled={loading} required />
        </div>
        <div className="field-group">
          <label className="field-label">Time</label>
          <input className="field-input" type="time" value={time} onChange={e => setTime(e.target.value)} disabled={loading} required />
        </div>
        <div className="field-group">
          <label className="field-label">Notes <span className="field-optional">(optional)</span></label>
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
