import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';
import { Wrench, Clock, CheckCircle2, ArrowRight, Activity, TrendingUp, Users, ShieldAlert } from 'lucide-react';

function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/requests')
      .then((data) => setRequests(data?.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const total = requests.length;
  const inRepair = requests.filter((r) => r.status === 'in-repair' || r.status === 'under-inspection').length;
  const ready = requests.filter((r) => r.status === 'ready-for-collection').length;
  const completed = requests.filter((r) => r.status === 'completed' || r.status === 'collected').length;

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="MANAGER ANALYTICS & OPERATIONS"
        title="Facility Control Center"
        description="Monitor repair throughput, technician workload distributions, and real-time SLA metrics."
        action={
          <Link className="button" to="/manager/requests">
            <Activity size={16} /> Manage active queue
          </Link>
        }
      />

      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-card__icon summary-card__icon--blue"><Wrench size={20} /></div>
          <div>
            <p className="summary-card__label">Total Tickets</p>
            <p className="summary-card__value">{total}</p>
            <p className="summary-card__note"><TrendingUp size={12} style={{ display: 'inline' }} /> +12% from last week</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon summary-card__icon--green"><Clock size={20} /></div>
          <div>
            <p className="summary-card__label">Active Repairs</p>
            <p className="summary-card__value">{inRepair}</p>
            <p className="summary-card__note">In workshop queue</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon summary-card__icon--purple"><CheckCircle2 size={20} /></div>
          <div>
            <p className="summary-card__label">Ready for Collection</p>
            <p className="summary-card__value">{ready}</p>
            <p className="summary-card__note">Awaiting client pickup</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon summary-card__icon--blue"><Users size={20} /></div>
          <div>
            <p className="summary-card__label">Completed Jobs</p>
            <p className="summary-card__value">{completed}</p>
            <p className="summary-card__note">Successfully resolved</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LIVE QUEUE MONITOR</p>
              <h2>Priority Service Requests</h2>
            </div>
            <Link className="panel-link" to="/manager/requests">
              View all requests <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ padding: '24px', color: '#7d899b', fontSize: '13px' }}>Loading analytics queue…</p>
          ) : requests.length === 0 ? (
            <div className="request-empty">
              <div className="request-empty__icon"><ShieldAlert size={20} /></div>
              <strong>No active service requests in queue</strong>
              <p>Incoming customer repair tickets will populate here instantly.</p>
            </div>
          ) : (
            <div className="request-list">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="request-row">
                  <div className="device-avatar device-avatar--blue"><Wrench size={16} /></div>
                  <div className="request-row__main">
                    <strong>{req.deviceModel || 'Unnamed Device'}</strong>
                    <small>
                      Ticket #{req.id} <span>•</span> {req.issueDescription || 'Standard diagnosis'}
                    </small>
                  </div>
                  <div className="request-row__date">
                    {new Date(req.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                  <span className={`status-badge status-badge--${req.status || 'in-repair'}`}>
                    {req.status ? req.status.replace(/-/g, ' ') : 'In Progress'}
                  </span>
                  <Link to={`/manager/requests/${req.id}`} className="request-row__arrow" aria-label="View request details">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="next-step-card">
          <div className="next-step-card__spark" aria-hidden="true">📊</div>
          <p className="eyebrow">FACILITY HEALTH</p>
          <h2>Throughput & Efficiency</h2>
          <p>
            Facility turnaround time is averaging 2.4 business days. All diagnostic stations are operating normally.
          </p>
          <Link to="/manager/requests" className="next-step-card__link">
            Review technician assignments <ArrowRight size={16} />
          </Link>
          <div className="next-step-card__decoration">
            <span />
            <span />
            <span />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ManagerDashboard;