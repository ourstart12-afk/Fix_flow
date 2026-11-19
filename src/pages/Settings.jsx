import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import { Bell, Sliders, CheckCircle2, Shield } from 'lucide-react';

function Settings() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    repairDigest: true,
    analyticsOptIn: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleToggle(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="PREFERENCES & NOTIFICATIONS"
        title="Settings"
        description="Configure how FixFlow delivers status updates, notification channels, and account preferences."
      />

      <div className="panel" style={{ padding: '32px', maxWidth: '720px', background: 'var(--surface, #fff)', border: '1px solid var(--line, #e9edf4)', borderRadius: '16px' }}>
        {saved && (
          <div className="form-message" role="alert" style={{ background: '#eaf7f0', color: '#218866', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>Your preference settings have been successfully saved.</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'grid', gap: '26px' }}>
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} style={{ color: '#3978e8' }} /> Notification Channels
            </h3>
            <div style={{ display: 'grid', gap: '14px', background: '#f8f9fd', padding: '20px', borderRadius: '12px', border: '1px solid #e9edf4' }}>
              <label className="check-label" style={{ fontSize: '12px', fontWeight: '500', color: '#34445c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={() => handleToggle('emailAlerts')}
                  style={{ width: '16px', height: '16px', accentColor: '#3978e8' }}
                />
                Receive instant email notifications when repair status milestones change
              </label>
              <label className="check-label" style={{ fontSize: '12px', fontWeight: '500', color: '#34445c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={() => handleToggle('smsAlerts')}
                  style={{ width: '16px', height: '16px', accentColor: '#3978e8' }}
                />
                Receive SMS alerts when registered devices are ready for collection
              </label>
              <label className="check-label" style={{ fontSize: '12px', fontWeight: '500', color: '#34445c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={settings.repairDigest}
                  onChange={() => handleToggle('repairDigest')}
                  style={{ width: '16px', height: '16px', accentColor: '#3978e8' }}
                />
                Send weekly repair progress summaries and device health metrics
              </label>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={16} style={{ color: '#3978e8' }} /> Workspace Privacy
            </h3>
            <div style={{ display: 'grid', gap: '14px', background: '#f8f9fd', padding: '20px', borderRadius: '12px', border: '1px solid #e9edf4' }}>
              <label className="check-label" style={{ fontSize: '12px', fontWeight: '500', color: '#34445c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={settings.analyticsOptIn}
                  onChange={() => handleToggle('analyticsOptIn')}
                  style={{ width: '16px', height: '16px', accentColor: '#3978e8' }}
                />
                Share anonymous diagnostic feedback to help improve repair turnaround benchmarks
              </label>
            </div>
          </div>

          <div style={{ paddingTop: '4px' }}>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving preferences…' : 'Save preferences'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;