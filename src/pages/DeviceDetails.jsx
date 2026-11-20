import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Smartphone, Laptop, Tablet, Monitor, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { apiRequest } from '../lib/api.js';

function deviceIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('smartphone') || t.includes('mobile')) return <Smartphone size={22} />;
  if (t.includes('laptop')) return <Laptop size={22} />;
  if (t.includes('tablet')) return <Tablet size={22} />;
  return <Monitor size={22} />;
}

function DeviceDetails() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [repairError, setRepairError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    apiRequest(`/api/devices/${id}`)
      .then((data) => setDevice(data.device || data.data))
      .catch((err) => {
        if (err.status === 404) setError('This device could not be found.');
        else setError(err.message || 'Could not load device.');
      })
      .finally(() => setLoading(false));

    // Load related repairs
    apiRequest(`/api/requests?deviceId=${encodeURIComponent(id)}`)
      .then((data) => setRepairs(data.requests || data.data || []))
      .catch((err) => setRepairError(err.message || 'Could not load repair history.'));
  }, [id]);

  if (loading) return <div className="panel devices-message">Loading device details…</div>;

  if (error) {
    return (
      <div className="device-details-page">
        <div className="panel devices-empty">
          <h2>Device not found</h2>
          <p>{error}</p>
          <Link className="button button--secondary" to="/devices"><ArrowLeft size={15} /> Back to devices</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="device-details-page">
      <PageHeader
        eyebrow="DEVICE PROFILE"
        title="Device details"
        description="Review the information saved for this device."
        action={<Link className="button button--secondary" to="/devices"><ArrowLeft size={15} /> My devices</Link>}
      />

      {device && (
        <>
          <div className="panel device-detail-panel">
            <div className="device-detail-head">
              <div className="device-avatar device-avatar--purple">{deviceIcon(device.type)}</div>
              <div className="device-detail-info">
                <span className="status-badge status-badge--registered">Registered</span>
                <h2>{device.nickname || `${device.brand} ${device.model}`}</h2>
                <p>{device.type} · {device.brand} {device.model}</p>
              </div>
              <Link className="button" to={`/devices/${id}/edit`}><Pencil size={14} /> Edit device</Link>
            </div>

            <div className="device-detail-grid">
              {[
                ['DEVICE TYPE', device.type],
                ['BRAND', device.brand],
                ['MODEL', device.model],
                ['SERIAL NUMBER', device.serial || 'Not provided'],
                ['NICKNAME', device.nickname || 'Not set'],
                ['DATE ADDED', device.createdAt ? new Date(device.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
              ].map(([label, val]) => (
                <div key={label} className="device-detail-field">
                  <small>{label}</small>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Related repairs */}
          <div className="panel device-repairs">
            <div className="device-repairs__head">
              <div>
                <p className="eyebrow">SERVICE ACTIVITY</p>
                <h2>Related repair requests</h2>
              </div>
              <Link className="button button--secondary" to="/new-repair">New repair</Link>
            </div>

            {repairError && <p className="form-alert">{repairError}</p>}

            {!repairError && repairs.length === 0 && (
              <div className="track-list__empty">
                <strong>No repair requests for this device yet</strong>
                <p>New repair requests linked to this device will appear here.</p>
              </div>
            )}

            {repairs.length > 0 && (
              <ul className="track-list__items">
                {repairs.map((r) => (
                  <li key={r.id}>
                    <Link to={`/requests/${r.id}`} className="track-list__item">
                      <div className="track-list__item-left">
                        <strong>{r.id}</strong>
                        <span>{r.issueCategory || r.category || '—'}</span>
                        <span className="track-list__item-date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="track-list__item-right">
                        <StatusBadge status={r.status || 'Submitted'} />
                        <ArrowRight size={15} className="track-list__arrow" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DeviceDetails;
