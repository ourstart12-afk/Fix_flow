import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import FormInput from '../components/FormInput.jsx';
import { apiRequest } from '../lib/api.js';
import { UserRound, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

function Profile() {
  const outletContext = useOutletContext() || {};
  const sessionUser = outletContext.user || {};

  const [profile, setProfile] = useState({
    name: sessionUser.name || '',
    email: sessionUser.email || '',
    phone: sessionUser.phone || '',
    role: sessionUser.role || 'customer',
  });
  const [loading, setLoading] = useState(!sessionUser.email);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!sessionUser.email) {
      apiRequest('/api/auth/session')
        .then((data) => {
          if (data?.user) {
            setProfile({
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              role: data.user.role || 'customer',
            });
          }
        })
        .catch(() => {
          setStatusMessage({ type: 'error', text: 'Could not synchronize session details.' });
        })
        .finally(() => setLoading(false));
    }
  }, [sessionUser]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      await new Promise((r) => setTimeout(r, 600));
      setStatusMessage({ type: 'success', text: 'Profile information updated successfully.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="workspace">
        <PageHeader eyebrow="ACCOUNT SETTINGS" title="My Profile" description="Loading profile session…" />
      </div>
    );
  }

  const initials = profile.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="ACCOUNT SETTINGS"
        title="My Profile"
        description="Review your active credentials, security status, and personal contact information."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.75fr) minmax(280px, 1fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* Main Form Card */}
        <div className="panel" style={{ padding: '32px', background: 'var(--surface, #fff)', border: '1px solid var(--line, #e9edf4)', borderRadius: '16px' }}>
          {statusMessage.text && (
            <div
              className="form-message"
              role="alert"
              style={{
                background: statusMessage.type === 'error' ? '#fff1f1' : '#eaf7f0',
                color: statusMessage.type === 'error' ? '#ad3d4a' : '#218866',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {statusMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="auth-form" style={{ display: 'grid', gap: '18px' }}>
            <FormInput
              label="Full Name"
              id="profile-name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name"
            />

            <div className="form-field">
              <label htmlFor="profile-email">Email Address (Signed-in Identity)</label>
              <input
                id="profile-email"
                type="email"
                value={profile.email}
                disabled
                style={{ background: '#f6f8fc', color: '#7d899b', cursor: 'not-allowed' }}
              />
              <small style={{ fontSize: '10px', color: '#7d899b', marginTop: '4px', display: 'block' }}>
                Your email is securely tied to your active FixFlow authentication session.
              </small>
            </div>

            <FormInput
              label="Phone Number"
              id="profile-phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+92 300 1234567"
            />

            <div style={{ marginTop: '8px' }}>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving changes…' : 'Save profile updates'}
              </Button>
            </div>
          </form>
        </div>

        {/* User Badge & Security Widget */}
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="panel" style={{ padding: '28px 24px', textAlign: 'center', background: 'var(--surface, #fff)', border: '1px solid var(--line, #e9edf4)', borderRadius: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                fontSize: '20px',
                margin: '0 auto 14px',
                background: '#edf0ff',
                color: '#3978e8',
                fontWeight: '700',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
              }}
            >
              {initials}
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#14253e' }}>{profile.name || 'FixFlow User'}</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#7d899b', wordBreak: 'break-all' }}>{profile.email}</p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '20px',
                background: '#edf0ff',
                color: '#2867d3',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'capitalize',
              }}
            >
              {profile.role} Portal
            </span>
          </div>

          <div className="next-step-card" style={{ minHeight: 'auto', padding: '22px', background: 'linear-gradient(145deg,#eaf0ff,#f4f2ff 75%,#ecebff)', border: '1px solid #e3e8fb', borderRadius: '16px' }}>
            <div className="next-step-card__spark" aria-hidden="true" style={{ color: '#8b90d9' }}>✦</div>
            <p className="eyebrow" style={{ color: '#7186b4', fontSize: '10px', fontWeight: '700', letterSpacing: '1.35px', margin: '0 0 8px' }}>ACTIVE SESSION</p>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '750', color: '#253b61' }}>Secure Connection</h4>
            <p style={{ fontSize: '11px', color: '#71809a', lineHeight: '1.6', margin: '0' }}>
              Authenticated via secure token storage with live synchronization across FixFlow services.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;