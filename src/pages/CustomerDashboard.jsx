import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Plus, Wrench, CheckCircle2, Smartphone } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { apiRequest } from '../lib/api.js';

function CustomerDashboard() {
  const { user } = useOutletContext();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [requests, setRequests] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      apiRequest('/api/requests'),
      apiRequest('/api/devices'),
    ]).then(([reqResult, devResult]) => {
      if (!mounted) return;
      if (reqResult.status === 'fulfilled') {
        const all = reqResult.value.requests || reqResult.value.data || [];
        const mine = all.filter((r) => r.userId === user.id || r.customerId === user.id || r.customerEmail === user.email);
        setRequests(mine);
      }
      if (devResult.status === 'fulfilled') {
        const all = devResult.value.devices || devResult.value.data || [];
        setDevices(all.filter((d) => d.userId === user.id));
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [user]);

  const activeRepairs = requests.filter((r) => !['completed', 'cancelled'].includes((r.status || '').toLowerCase()));
  const readyToCollect = requests.filter((r) => (r.status || '').toLowerCase().includes('ready'));
  const recentRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="CUSTOMER OVERVIEW"
        title={`${greeting}, ${user.name}`}
        description="Here's what's happening with your devices today."
        action={<Link className="button" to="/new-repair"><Plus size={17} /> New repair</Link>}
      />

      <section className="dashboard-summary" aria-label="Repair summary">
        <SummaryCard
          label="Active repairs"
          value={loading ? '—' : activeRepairs.length}
          note={loading ? 'Loading…' : activeRepairs.length === 1 ? '1 request in progress' : `${activeRepairs.length} requests in progress`}
          icon={<Wrench size={19} />}
          tone="blue"
        />
        <SummaryCard
          label="Ready to collect"
          value={loading ? '—' : readyToCollect.length}
          note={loading ? 'Loading…' : readyToCollect.length > 0 ? 'Your device is waiting!' : 'Nothing ready yet'}
          icon={<CheckCircle2 size={19} />}
          tone="green"
        />
        <SummaryCard
          label="Registered devices"
          value={loading ? '—' : devices.length}
          note={loading ? 'Loading…' : devices.length === 1 ? '1 device on file' : `${devices.length} devices on file`}
          icon={<Smartphone size={19} />}
          tone="purple"
        />
      </section>

      <section className="dashboard-content-grid">
        <div className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR ACTIVITY</p>
              <h2>Recent repair requests</h2>
            </div>
            <Link className="panel-link" to="/history">View all <ArrowRight size={15} /></Link>
          </div>

          {loading && <div className="request-empty"><p>Loading your requests…</p></div>}

          {!loading && recentRequests.length === 0 && (
            <div className="request-empty">
              <span className="request-empty__icon"><Wrench size={19} /></span>
              <strong>No repair requests yet</strong>
              <p>Your repair updates will appear here after you submit a request.</p>
              <Link className="button button--secondary" to="/new-repair">Create a repair request <ArrowRight size={15} /></Link>
            </div>
          )}

          {!loading && recentRequests.length > 0 && (
            <ul className="recent-requests-list">
              {recentRequests.map((r) => (
                <li key={r.id}>
                  <Link to={`/requests/${r.id}`} className="recent-request-item">
                    <div className="recent-request-item__left">
                      <strong>{r.id}</strong>
                      <span>{r.deviceType ? `${r.deviceType} — ` : ''}{r.deviceModel || [r.brand, r.model].filter(Boolean).join(' ')}</span>
                      <span className="recent-request-item__date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : ''}</span>
                    </div>
                    <div className="recent-request-item__right">
                      <StatusBadge status={r.status || 'Submitted'} />
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="next-step-card">
          <div className="next-step-card__spark" aria-hidden="true">✦</div>
          <p className="eyebrow">YOUR FIXFLOW SPACE</p>
          <h2>Your repairs,<br />all in one place.</h2>
          <p>When you add devices and submit requests, their details and updates will be easy to find here.</p>
          <Link to="/devices" className="next-step-card__link">Explore your devices <ArrowRight size={16} /></Link>
          <div className="next-step-card__decoration"><span /><span /><span /></div>
        </aside>
      </section>

      <section className="dashboard-bottom">
        <div className="tip-card">
          <span className="tip-card__icon"><Smartphone size={18} /></span>
          <div>
            <strong>Keep your devices close</strong>
            <p>Add a device once to make future repair requests quicker.</p>
          </div>
          <Link to="/devices">My devices <ArrowRight size={15} /></Link>
        </div>
        <div className="dashboard-help">
          <span>Need help with a repair?</span>
          <Link to="/help">Visit our help center <ArrowRight size={14} /></Link>
        </div>
      </section>
    </div>
  );
}

export default CustomerDashboard;
