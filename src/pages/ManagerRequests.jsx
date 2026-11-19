import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';
import { Wrench, ArrowRight } from 'lucide-react';

function ManagerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    apiRequest('/api/requests')
      .then((data) => setRequests(data?.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="OPERATIONS CONTROL"
        title="Manage Requests"
        description="Review, monitor, assign, and update statuses for all active customer repair tickets."
      />

      <div className="panel recent-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0', fontSize: '15px', color: '#24334a' }}>Repair Queue</h3>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#7d899b' }}>Showing {filteredRequests.length} total tickets</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'in-repair', 'ready-for-collection', 'completed'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                style={{
                  minHeight: '34px',
                  padding: '0 14px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1px solid #dbe2ef',
                  cursor: 'pointer',
                  background: filterStatus === status ? '#3978e8' : '#fff',
                  color: filterStatus === status ? '#fff' : '#34445c',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {status.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#7d899b', padding: '20px 0' }}>Loading requests database…</p>
        ) : filteredRequests.length === 0 ? (
          <div className="request-empty">
            <div className="request-empty__icon"><Wrench size={20} /></div>
            <strong>No matching repair requests found</strong>
            <p>Try switching your status filter to view other active queues.</p>
          </div>
        ) : (
          <div className="request-list">
            {filteredRequests.map((req) => (
              <div key={req.id} className="request-row">
                <div className="device-avatar device-avatar--purple"><Wrench size={16} /></div>
                <div className="request-row__main">
                  <strong>{req.deviceModel || 'Registered Device'}</strong>
                  <small>
                    Customer ID: {req.userId || 'Guest'} <span>•</span> {req.issueDescription || 'Standard diagnostics'}
                  </small>
                </div>
                <div className="request-row__date">
                  {new Date(req.createdAt || Date.now()).toLocaleDateString()}
                </div>
                <span className={`status-badge status-badge--${req.status || 'in-repair'}`}>
                  {req.status ? req.status.replace(/-/g, ' ') : 'In Progress'}
                </span>
                <Link to={`/manager/requests/${req.id}`} className="request-row__arrow" aria-label="View ticket">
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerRequests;