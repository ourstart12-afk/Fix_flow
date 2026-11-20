import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';
import { Wrench, ArrowRight, Search, Filter, Smartphone, Laptop, Tablet, RefreshCw } from 'lucide-react';

function ManagerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  function fetchRequests() {
    setLoading(true);
    apiRequest('/api/requests')
      .then((data) => setRequests(data?.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      req.id?.toLowerCase().includes(query) ||
      req.deviceModel?.toLowerCase().includes(query) ||
      req.customerName?.toLowerCase().includes(query) ||
      req.issueDescription?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="OPERATIONS CONTROL"
        title="Manage Requests"
        description="Review, monitor, assign, and update statuses for all active customer repair tickets."
        action={
          <button
            type="button"
            className="button"
            onClick={fetchRequests}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh Queue
          </button>
        }
      />

      <div className="panel recent-panel" style={{ padding: '24px' }}>
        {/* Controls: Search and Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '750', color: '#14253e' }}>Repair Queue</h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#7d899b' }}>
              Showing {filteredRequests.length} of {requests.length} total tickets
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b9bb2' }} />
              <input
                type="text"
                placeholder="Search ticket, model, client…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px 0 34px',
                  borderRadius: '8px',
                  border: '1px solid #d8e1ee',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 'under-inspection', 'in-repair', 'ready-for-collection', 'completed'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  style={{
                    minHeight: '36px',
                    padding: '0 12px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: '1px solid ' + (filterStatus === status ? '#3978e8' : '#dbe2ef'),
                    cursor: 'pointer',
                    background: filterStatus === status ? '#3978e8' : '#fff',
                    color: filterStatus === status ? '#fff' : '#34445c',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {status === 'all' ? 'All Tickets' : status.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#7d899b', padding: '32px 0', textAlign: 'center', fontSize: '13px' }}>
            Loading requests database…
          </p>
        ) : filteredRequests.length === 0 ? (
          <div className="request-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="request-empty__icon"><Wrench size={22} /></div>
            <strong>No matching repair requests found</strong>
            <p>Try switching your status filter or clearing your search query.</p>
            {searchQuery && (
              <button
                type="button"
                className="button"
                onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                style={{ marginTop: '12px', fontSize: '12px', minHeight: '34px' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="request-list">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="request-row"
                onClick={() => navigate(`/manager/requests/${req.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="device-avatar device-avatar--purple">
                  <Wrench size={16} />
                </div>
                <div className="request-row__main">
                  <strong>
                    {req.deviceModel || 'Registered Device'}
                    <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: '500', color: '#7d8aa0', background: '#f0f3fa', padding: '2px 6px', borderRadius: '4px' }}>
                      #{req.id}
                    </span>
                  </strong>
                  <small>
                    Client: {req.customerName || req.userId || 'Guest'} <span>•</span> {req.issueDescription || 'Standard diagnostics'}
                  </small>
                </div>
                <div className="request-row__date" style={{ fontSize: '12px', color: '#7d8aa0' }}>
                  {new Date(req.createdAt || Date.now()).toLocaleDateString()}
                </div>
                <span className={`status-badge status-badge--${req.status || 'in-repair'}`}>
                  {req.status ? req.status.replace(/-/g, ' ') : 'In Progress'}
                </span>
                <Link
                  to={`/manager/requests/${req.id}`}
                  className="request-row__arrow"
                  aria-label="View ticket"
                  onClick={(e) => e.stopPropagation()}
                >
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
