import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Smartphone, Laptop, Tablet, Monitor, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import { apiRequest } from '../lib/api.js';

function deviceIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('smartphone') || t.includes('mobile')) return <Smartphone size={19} />;
  if (t.includes('laptop')) return <Laptop size={19} />;
  if (t.includes('tablet')) return <Tablet size={19} />;
  return <Monitor size={19} />;
}

function MyDevices() {
  const { user } = useOutletContext();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiRequest('/api/devices')
      .then((data) => {
        const all = data.devices || data.data || [];
        if (active) setDevices(all.filter((device) => device.userId === user.id));
      })
      .catch((err) => { if (active) setError(err.message || 'Could not load devices.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.id, refreshKey]);

  return (
    <div className="my-devices-page">
      <PageHeader
        eyebrow="DEVICE INVENTORY"
        title="My devices"
        description="Manage the devices registered to your account for faster future repair requests."
        action={<Link className="button" to="/devices/new"><Plus size={15} /> Add device</Link>}
      />

      <section className="dashboard-summary dashboard-summary--devices" aria-label="Device summary">
        <SummaryCard
          label="Registered devices"
          value={loading ? '—' : devices.length}
          note="Devices linked to your account"
          icon={<Smartphone size={19} />}
          tone="purple"
        />
      </section>

      {error && (
        <div className="devices-load-error" role="alert">
          <span>{error}</span>
          <button className="button button--secondary" type="button" onClick={() => setRefreshKey((key) => key + 1)}>
            Retry
          </button>
        </div>
      )}

      {loading && <div className="panel devices-message">Loading your devices…</div>}

      {!loading && !error && devices.length === 0 && (
        <div className="panel devices-empty">
          <span className="devices-empty__icon"><Plus size={22} /></span>
          <h2>No devices yet</h2>
          <p>Add your first device to keep its details and repair history together in one place.</p>
          <Link className="button" to="/devices/new">Add your first device</Link>
        </div>
      )}

      {!loading && !error && devices.length > 0 && (
        <div className="devices-grid">
          {devices.map((d) => (
            <article key={d.id} className="device-card-item">
              <div className="device-card-item__top">
                <div className="device-avatar device-avatar--purple">{deviceIcon(d.type)}</div>
                <span className="status-badge status-badge--registered">Registered</span>
              </div>
              <p className="device-card-item__type eyebrow">{d.type || 'DEVICE'}</p>
            <h3 className="device-card-item__name">{d.nickname || [d.brand, d.model].filter(Boolean).join(' ') || 'Unnamed device'}</h3>
            <p className="device-card-item__sub">{[d.brand, d.model].filter(Boolean).join(' · ') || 'Device details not provided'}</p>
              <div className="device-card-item__serial">
                <span>Serial</span>
                <strong>{d.serial || 'Not provided'}</strong>
              </div>
              <Link className="device-card-item__link" to={`/devices/${d.id}`}>
                View device details <ArrowRight size={13} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDevices;
