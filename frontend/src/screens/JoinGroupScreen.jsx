import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchGroups, joinGroup } from '../api/groups';
import { useAuth } from '../context/AuthContext';

export default function JoinGroupScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [searchZip, setSearchZip]   = useState(user?.zipCode ?? '');
  const [results, setResults]       = useState(null);
  const [error, setError]           = useState('');
  const [joining, setJoining]       = useState(null);
  const [loading, setLoading]       = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    if (!searchZip.trim()) { setError('Enter a zip code to search.'); return; }
    setLoading(true);
    try {
      const data = await searchGroups(searchZip.trim());
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (groupId, code = null) => {
    setJoining(groupId);
    setError('');
    try {
      const res = await joinGroup(groupId, code || inviteCode.trim() || null);
      const msg = res.status === 'active' ? 'Joined!' : 'Request sent — awaiting leader approval.';
      alert(msg);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Could not join group.');
    } finally {
      setJoining(null);
    }
  };

  return (
    <>
      <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
      <div className="screen-header">
        <div className="greeting">Join a <em>Group</em></div>
        <div className="subgreet">Find your people. Eat great steak.</div>
      </div>

      <div className="form-wrap" style={{ paddingTop: 16 }}>
        {/* Invite code shortcut */}
        <div className="group-join-section">
          <div className="section-label" style={{ margin: '0 0 12px' }}>Have an Invite Code?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="field-input"
              style={{ flex: 1 }}
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. STEAK001"
            />
            <button
              className="submit-btn"
              style={{ width: 'auto', padding: '0 20px' }}
              disabled={!inviteCode.trim() || joining !== null}
              onClick={async () => {
                // Find the group by code — need to search then join
                // For simplicity, search nearby and find matching, or use a dedicated endpoint
                // We'll just show the search results after entering the code
                setError('');
                setLoading(true);
                try {
                  const data = await searchGroups('');
                  const match = data.find(g => g.inviteCode === inviteCode.trim());
                  if (match) {
                    await handleJoin(match.id, inviteCode.trim());
                  } else {
                    setError('No group found with that invite code.');
                  }
                } catch {
                  setError('Could not look up invite code.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Join
            </button>
          </div>
        </div>

        <div className="divider-ornament">· or search ·</div>

        {/* Search by zip */}
        <form onSubmit={handleSearch}>
          <div className="field-group">
            <label className="field-label">Search Near Zip Code</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="field-input"
                style={{ flex: 1 }}
                type="text"
                inputMode="numeric"
                value={searchZip}
                onChange={e => setSearchZip(e.target.value)}
                placeholder="e.g. 33602"
                disabled={loading}
              />
              <button
                className="submit-btn"
                style={{ width: 'auto', padding: '0 20px' }}
                type="submit"
                disabled={loading}
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

        {results !== null && (
          results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No groups found</div>
              <div className="empty-state-sub">Try a different zip or create your own group.</div>
            </div>
          ) : (
            <div className="group-list">
              {results.map(g => (
                <div key={g.id} className="group-card">
                  <div className="group-card-info">
                    <div className="group-card-name">{g.name}</div>
                    <div className="group-card-meta">{g.memberCount} members · {g.zipCode}</div>
                  </div>
                  <button
                    className="rsvp-btn"
                    disabled={joining === g.id}
                    onClick={() => handleJoin(g.id)}
                  >
                    {joining === g.id ? '...' : 'Request'}
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        <div className="divider-ornament" style={{ marginTop: 24 }}>· · ·</div>
        <button className="auth-link" onClick={() => navigate('/groups/new')}>
          Start your own group →
        </button>
      </div>
    </>
  );
}
