import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../api/groups';

export default function CreateGroupScreen() {
  const navigate = useNavigate();
  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [zipCode, setZipCode]     = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Group name is required.'); return; }
    if (!zipCode.trim()) { setError('Zip code is required.'); return; }

    setLoading(true);
    try {
      const group = await createGroup({ name: name.trim(), description: description.trim() || null, zipCode: zipCode.trim(), isPrivate });
      navigate(`/groups/${group.id}`);
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
        <div className="greeting">Found a <em>Group</em></div>
        <div className="subgreet">Rally your fellow shareholders.</div>
      </div>

      <form onSubmit={submit} className="form-wrap" style={{ paddingTop: 16 }}>
        <div className="field-group">
          <label className="field-label">Group Name</label>
          <input
            className="field-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Tampa Steakholders"
            disabled={loading}
            required
          />
        </div>
        <div className="field-group">
          <label className="field-label">Description <span className="field-optional">(optional)</span></label>
          <textarea
            className="notes-field"
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="What's your group about?"
            disabled={loading}
            rows={3}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Zip Code</label>
          <input
            className="field-input"
            type="text"
            inputMode="numeric"
            value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            placeholder="e.g. 33602"
            disabled={loading}
            required
          />
        </div>
        <div className="field-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              disabled={loading}
            />
            <span>Private group</span>
          </label>
          <div className="field-hint">
            {isPrivate
              ? 'Members can only join with your invite code.'
              : 'Anyone can find and request to join this group.'}
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Founding...' : 'Found Group'}
        </button>
      </form>
    </>
  );
}