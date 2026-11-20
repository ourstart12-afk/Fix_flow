import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  Settings as SettingsIcon,
} from 'lucide-react';

function Profile() {
  const outletContext = useOutletContext() || {};
  const sessionUser = outletContext.user || {};

  const [profile, setProfile] = useState({
    id: sessionUser.id || '',
    name: sessionUser.name || '',
    email: sessionUser.email || '',
    phone: sessionUser.phone || '',
    address: sessionUser.address || '',
    contactPreference: sessionUser.contactPreference || 'email',
    role: sessionUser.role || 'customer',
    createdAt: sessionUser.createdAt || '2026-01-15T10:00:00.000Z',
  });

  const [loading, setLoading] = useState(!sessionUser.email);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let isMounted = true;
    apiRequest('/api/auth/me')
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          setProfile({
            id: data.user.id || '',
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '+92 300 1234567',
            address: data.user.address || 'Sector F-8, Blue Area, Islamabad',
            contactPreference: data.user.contactPreference || 'email',
            role: data.user.role || 'customer',
            createdAt: data.user.createdAt || '2026-01-15T10:00:00.000Z',
          });
        }
      })
      .catch(() => {
        if (isMounted) setStatusMessage({ type: 'error', text: 'Could not sync session details.' });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    if (!profile.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name cannot be empty.' });
      setSaving(false);
      return;
    }

    try {
      const res = await apiRequest('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim(),
          contactPreference: profile.contactPreference,
        }),
      });

      if (res?.user) {
        setProfile((prev) => ({
          ...prev,
          name: res.user.name || prev.name,
          email: res.user.email || prev.email,
          phone: res.user.phone || prev.phone,
          address: res.user.address || prev.address,
          contactPreference: res.user.contactPreference || prev.contactPreference,
        }));
      }

      setStatusMessage({ type: 'success', text: 'Profile information updated and saved successfully.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="workspace">
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '350px' }}>
          <p style={{ color: '#7d899b', fontSize: '14px', fontWeight: '500' }}>Loading your profile data…</p>
        </div>
      </div>
    );
  }

  const initials = profile.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const isManager = profile.role === 'manager';
  const settingsLink = isManager ? '/manager/settings' : '/settings';

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="ACCOUNT & SECURITY DOSSIER"
        title="My Profile"
        description="View and update your personal identity, contact channels, and authenticated FixFlow credentials."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: isManager ? '#0e1828' : '#eaf0ff',
                color: isManager ? '#79a3ff' : '#2867d3',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid ' + (isManager ? '#20324d' : '#d2e0fb'),
              }}
            >
              <ShieldCheck size={15} />
              {isManager ? 'Verified Manager Account' : 'Verified FixFlow Customer'}
            </span>
          </div>
        }
      />

      {statusMessage.text && (
        <div
          role="alert"
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: '500',
            background: statusMessage.type === 'error' ? '#fff1f1' : '#eaf7f0',
            color: statusMessage.type === 'error' ? '#ad3d4a' : '#218866',
            border: `1px solid ${statusMessage.type === 'error' ? '#fed3d3' : '#b7ebcf'}`,
          }}
        >
          {statusMessage.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Quick Summary Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '18px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e9edf4', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#edf2fc', color: '#3978e8', display: 'grid', placeItems: 'center' }}>
            <UserRound size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#7d8aa0', fontWeight: '600', textTransform: 'uppercase' }}>Account Status</span>
            <strong style={{ display: 'block', fontSize: '14px', color: '#14253e', textTransform: 'capitalize' }}>Active & Verified</strong>
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e9edf4', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#edf2fc', color: '#3978e8', display: 'grid', placeItems: 'center' }}>
            <Calendar size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#7d8aa0', fontWeight: '600', textTransform: 'uppercase' }}>Member Since</span>
            <strong style={{ display: 'block', fontSize: '14px', color: '#14253e' }}>
              {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </strong>
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e9edf4', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#edf2fc', color: '#3978e8', display: 'grid', placeItems: 'center' }}>
            <Mail size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#7d8aa0', fontWeight: '600', textTransform: 'uppercase' }}>Primary Channel</span>
            <strong style={{ display: 'block', fontSize: '14px', color: '#14253e', textTransform: 'capitalize' }}>
              {profile.contactPreference} Alerts
            </strong>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Card: Fully Editable Customer Form */}
        <div className="panel" style={{ padding: '32px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '750', color: '#14253e' }}>
              Personal & Contact Information
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#68768b' }}>
              Keep your contact details up to date so the repair team can reach you regarding diagnostics and collection.
            </p>
          </div>

          <form onSubmit={handleSave} style={{ display: 'grid', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div>
                <label htmlFor="full-name" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  id="full-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Shahzaib Hassan"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8e1ee',
                    fontSize: '13px',
                    color: '#14253e',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label htmlFor="email-address" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  id="email-address"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8e1ee',
                    fontSize: '13px',
                    color: '#14253e',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div>
                <label htmlFor="phone-number" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8e1ee',
                    fontSize: '13px',
                    color: '#14253e',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label htmlFor="contact-preference" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Preferred Communication Method
                </label>
                <select
                  id="contact-preference"
                  value={profile.contactPreference}
                  onChange={(e) => setProfile({ ...profile, contactPreference: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8e1ee',
                    fontSize: '13px',
                    color: '#14253e',
                    background: '#fff',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="email">Email Notifications</option>
                  <option value="sms">SMS Text Messaging</option>
                  <option value="phone">Phone Call on Critical Updates</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="user-address" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                Pickup / Shipping Address
              </label>
              <input
                id="user-address"
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Sector / House / Street Address for pickup"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #d8e1ee',
                  fontSize: '13px',
                  color: '#14253e',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginTop: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="submit"
                disabled={saving}
                className="button"
                style={{ minHeight: '42px', padding: '0 20px', fontSize: '13px', fontWeight: '600' }}
              >
                <Save size={16} /> {saving ? 'Saving changes…' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Account Dossier & Quick Security Widget */}
        <div style={{ display: 'grid', gap: '20px' }}>
          
          {/* Identity Card */}
          <div className="panel" style={{ padding: '28px 24px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                fontSize: '22px',
                margin: '0 auto 16px',
                background: 'linear-gradient(145deg, #5186ee, #376fd7)',
                color: '#fff',
                fontWeight: '750',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                boxShadow: '0 6px 16px rgba(52, 109, 212, 0.25)',
              }}
            >
              {initials}
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '750', color: '#14253e' }}>
              {profile.name || 'FixFlow Account'}
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#7d899b', wordBreak: 'break-all' }}>
              {profile.email}
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '20px',
                background: '#edf0ff',
                color: '#2867d3',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'capitalize',
              }}
            >
              {profile.role} Portal Member
            </span>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #edf1f7', textAlign: 'left', fontSize: '12px', display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7d8aa0' }}>Account ID:</span>
                <strong style={{ color: '#14253e', fontFamily: 'monospace' }}>
                  {profile.id ? profile.id.slice(0, 13) + '…' : 'CUST-ID'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7d8aa0' }}>Security Level:</span>
                <strong style={{ color: '#218866' }}>Standard SSL / Scrypt</strong>
              </div>
            </div>
          </div>

          {/* Quick Settings Shortcut */}
          <div className="panel" style={{ padding: '22px', background: 'linear-gradient(145deg, #f5f8ff, #faf7ff)', border: '1px solid #e3e9fa', borderRadius: '16px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '750', color: '#1f3354', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingsIcon size={16} style={{ color: '#3978e8' }} /> Account Security & Settings
            </h4>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#687a98', lineHeight: '1.5' }}>
              Need to update your password, two-factor authentication, or notification thresholds?
            </p>
            <Link
              to={settingsLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#3978e8',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              Go to Account Settings <ArrowRight size={14} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;
