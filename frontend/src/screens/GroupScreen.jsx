import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Shield, Users } from 'lucide-react';
import { getGroup, getGroupMembers, approveMember, rejectMember } from '../api/groups';
import { useAuth } from '../context/AuthContext';

export default function GroupScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup]     = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([getGroup(Number(id)), getGroupMembers(Number(id))])
      .then(([g, m]) => { setGroup(g); setMembers(m); })
      .catch(err => setError(err.message || 'Could not load group.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isLeader = group?.leaderUserId === user?.id;

  const handleApprove = async (userId) => {
    await approveMember(group.id, userId);
    setMembers(m => m.map(mb => mb.userId === userId ? { ...mb, status: 'active' } : mb));
  };

  const handleReject = async (userId) => {
    await rejectMember(group.id, userId);
    setMembers(m => m.map(mb => mb.userId === userId ? { ...mb, status: 'rejected' } : mb));
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    alert(`Invite code copied: ${group.inviteCode}`);
  };

  if (loading) return <div style={{ padding: 24 }} className="skeleton" />;
  if (error) return <div className="error-msg" style={{ margin: 24 }}>{error}</div>;
  if (!group) return null;

  const pending = members.filter(m => m.status === 'pending');
  const active  = members.filter(m => m.status === 'active');

  return (
    <>
      <button className="back-link" onClick={() => navigate('/home')}>← Back</button>

      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {group.isPrivate && <Shield size={16} style={{ color: 'var(--color-gold)' }} />}
          <div className="greeting"><em>{group.name}</em></div>
        </div>
        {group.description && <div className="subgreet">{group.description}</div>}
      </div>

      {isLeader && (
        <div className="invite-code-box" onClick={copyInviteCode}>
          <div className="invite-code-label">Invite Code</div>
          <div className="invite-code-value">
            {group.inviteCode}
            <Copy size={14} style={{ marginLeft: 8, opacity: 0.6 }} />
          </div>
          <div className="invite-code-hint">Tap to copy · share with new members</div>
        </div>
      )}

      {isLeader && pending.length > 0 && (
        <>
          <div className="section-label">Pending Requests</div>
          <div className="member-list">
            {pending.map(m => (
              <div key={m.userId} className="member-row">
                <div className="avatar sm">{m.displayName[0]}</div>
                <div className="member-info">
                  <div className="member-name">{m.displayName}</div>
                  <div className="member-role">{m.role}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="rsvp-btn going" onClick={() => handleApprove(m.userId)}>Approve</button>
                  <button className="rsvp-btn" onClick={() => handleReject(m.userId)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-label">
        <Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Members ({active.length})
      </div>
      <div className="member-list">
        {active.map(m => (
          <div key={m.userId} className="member-row">
            <div className="avatar sm">{m.displayName[0]}</div>
            <div className="member-info">
              <div className="member-name">
                {m.displayName}
                {m.userId === group.leaderUserId && (
                  <span className="leader-badge"> · Leader</span>
                )}
              </div>
              <div className="member-role">{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
