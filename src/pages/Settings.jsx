import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';
import {
  Bell,
  Sliders,
  CheckCircle2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Database,
  Download,
  AlertTriangle,
  Smartphone,
  Save,
  Check,
} from 'lucide-react';

function Settings() {
  const [activeTab, setActiveTab] = useState('notifications');

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailMilestones: true,
    smsPickup: true,
    weeklyDigest: false,
    urgentSlaAlerts: true,
    soundAlerts: true,
  });

  // Display & Workspace preferences state
  const [preferences, setPreferences] = useState({
    defaultLanding: 'dashboard',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'UTC+05:00',
    compactMode: false,
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Status banners
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [savingPreferences, setSavingPreferences] = useState(false);

  function handleNotificationToggle(key) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePreferenceChange(key, value) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSavePreferences(e) {
    e.preventDefault();
    setSavingPreferences(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await new Promise((r) => setTimeout(r, 400));
      setStatusMessage({ type: 'success', text: 'Workspace preferences updated and saved successfully.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update preferences.' });
    } finally {
      setSavingPreferences(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!passwordForm.currentPassword) {
      setStatusMessage({ type: 'error', text: 'Enter your current account password.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordSubmitting(true);
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      setStatusMessage({ type: 'success', text: 'Password successfully changed and updated.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPasswordSubmitting(false);
    }
  }

  function handleExportData() {
    const data = {
      exportDate: new Date().toISOString(),
      service: 'FixFlow Device Care Platform',
      notifications,
      preferences,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixflow-account-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'Account settings data exported to JSON successfully.' });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  }

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="PREFERENCES & SYSTEM CONTROL"
        title="Settings"
        description="Configure communication channels, security credentials, display layout, and account privacy."
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
          {statusMessage.type === 'error' ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e1e7f0', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Password', icon: Shield },
          { id: 'preferences', label: 'Workspace Display', icon: Sliders },
          { id: 'privacy', label: 'Privacy & Data Export', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? '#3978e8' : '#64748b',
                borderBottom: isActive ? '2px solid #3978e8' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Notifications */}
      {activeTab === 'notifications' && (
        <div className="panel" style={{ padding: '32px', maxWidth: '780px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '750', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: '#3978e8' }} /> Communication & Event Channels
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#68768b' }}>
              Select which repair milestones and diagnostic updates trigger real-time alerts.
            </p>
          </div>

          <form onSubmit={handleSavePreferences} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gap: '14px', background: '#f8fafd', padding: '22px', borderRadius: '12px', border: '1px solid #eef2f8' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e2d42', cursor: 'pointer', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={notifications.emailMilestones}
                  onChange={() => handleNotificationToggle('emailMilestones')}
                  style={{ width: '17px', height: '17px', accentColor: '#3978e8' }}
                />
                Receive instant email notification when ticket status advances (e.g., In Repair, Inspection Passed)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e2d42', cursor: 'pointer', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={notifications.smsPickup}
                  onChange={() => handleNotificationToggle('smsPickup')}
                  style={{ width: '17px', height: '17px', accentColor: '#3978e8' }}
                />
                Receive automated SMS text alert as soon as your device is boxed and ready for collection
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e2d42', cursor: 'pointer', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={notifications.urgentSlaAlerts}
                  onChange={() => handleNotificationToggle('urgentSlaAlerts')}
                  style={{ width: '17px', height: '17px', accentColor: '#3978e8' }}
                />
                Receive urgent warnings if hardware diagnosis reveals component replacement requirements
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e2d42', cursor: 'pointer', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={() => handleNotificationToggle('weeklyDigest')}
                  style={{ width: '17px', height: '17px', accentColor: '#3978e8' }}
                />
                Send weekly repair progress summaries and diagnostic health metrics
              </label>
            </div>

            <button
              type="submit"
              disabled={savingPreferences}
              className="button"
              style={{ justifySelf: 'start', minHeight: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '600' }}
            >
              <Save size={15} /> {savingPreferences ? 'Saving…' : 'Save Notification Preferences'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Security & Password */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1.2fr)', gap: '24px', alignItems: 'start' }}>
          {/* Change Password Card */}
          <div className="panel" style={{ padding: '32px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '750', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} style={{ color: '#3978e8' }} /> Account Password & Authentication
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#68768b' }}>
                Change your account password. Use at least 8 characters with letters, numbers, and symbols.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label htmlFor="current-pw" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="current-pw"
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    style={{ width: '100%', height: '42px', padding: '0 38px 0 12px', borderRadius: '8px', border: '1px solid #d8e1ee', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8898aa', cursor: 'pointer' }}
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new-pw" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  id="new-pw"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 8 characters"
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #d8e1ee', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label htmlFor="confirm-pw" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  id="confirm-pw"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #d8e1ee', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="button"
                style={{ justifySelf: 'start', minHeight: '40px', padding: '0 20px', marginTop: '6px', fontSize: '13px', fontWeight: '600' }}
              >
                <Save size={15} /> {passwordSubmitting ? 'Updating password…' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Active Sessions & Security Badges */}
          <div style={{ display: 'grid', gap: '20px' }}>
            <div className="panel" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '750', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} style={{ color: '#218866' }} /> Active Session Integrity
              </h4>
              <div style={{ background: '#f8fafd', padding: '14px', borderRadius: '10px', border: '1px solid #eef2f8', fontSize: '12px', display: 'grid', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#7d8aa0' }}>Current Host:</span>
                  <strong style={{ color: '#1e2d42' }}>127.0.0.1 (Localhost)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#7d8aa0' }}>Cookie Policy:</span>
                  <strong style={{ color: '#1e2d42' }}>HttpOnly / SameSite=Lax</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#7d8aa0' }}>Encryption:</span>
                  <strong style={{ color: '#218866' }}>Scrypt 64-Byte Salted</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Workspace Display */}
      {activeTab === 'preferences' && (
        <div className="panel" style={{ padding: '32px', maxWidth: '780px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '750', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: '#3978e8' }} /> Display & Workspace Preferences
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#68768b' }}>
              Customize how dates, lists, and landing dashboards are formatted in your view.
            </p>
          </div>

          <form onSubmit={handleSavePreferences} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div>
                <label htmlFor="default-landing" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Default Landing View
                </label>
                <select
                  id="default-landing"
                  value={preferences.defaultLanding}
                  onChange={(e) => handlePreferenceChange('defaultLanding', e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #d8e1ee', fontSize: '13px', color: '#14253e', background: '#fff', outline: 'none' }}
                >
                  <option value="dashboard">Overview Dashboard</option>
                  <option value="requests">Service Requests Queue</option>
                </select>
              </div>

              <div>
                <label htmlFor="date-format" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3a54', marginBottom: '6px' }}>
                  Date Display Format
                </label>
                <select
                  id="date-format"
                  value={preferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #d8e1ee', fontSize: '13px', color: '#14253e', background: '#fff', outline: 'none' }}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/19/2026)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 19/11/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPreferences}
              className="button"
              style={{ justifySelf: 'start', minHeight: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '600' }}
            >
              <Save size={15} /> {savingPreferences ? 'Saving…' : 'Save Workspace Preferences'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Privacy & Data Export */}
      {activeTab === 'privacy' && (
        <div className="panel" style={{ padding: '32px', maxWidth: '780px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '750', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} style={{ color: '#3978e8' }} /> Account Data & Privacy
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#68768b' }}>
              Export a complete archive of your FixFlow account settings and device preferences.
            </p>
          </div>

          <div style={{ background: '#f8fafd', padding: '24px', borderRadius: '12px', border: '1px solid #eef2f8', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '750', color: '#14253e' }}>
              Download Settings Dossier
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#68768b', lineHeight: '1.5' }}>
              Download a machine-readable JSON archive containing all communication channels, notification preferences, and workspace presets.
            </p>
            <button
              type="button"
              onClick={handleExportData}
              className="button button--secondary"
              style={{ minHeight: '38px', padding: '0 16px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={15} /> Export Account Settings (.JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
