import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Clock3, RotateCw, X } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { apiRequest } from '../lib/api.js';

const STATUS_OPTIONS = [
  'All statuses',
  'Submitted',
  'Received',
  'Under Inspection',
  'In Repair',
  'Ready for Collection',
  'Completed',
  'Cancelled',
];

function RepairHistory() {
  const { user } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiRequest(`/api/requests?customerId=${encodeURIComponent(user.id)}`)
      .then((data) => {
        if (active) setRecords(data.requests || data.data || []);
      })
      .catch((err) => { if (active) setError(err.message || 'Could not load repair history.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.id, refreshKey]);

  const filtered = records.filter((r) => {
    const matchStatus = status === 'All statuses' || r.status?.toLowerCase() === status.toLowerCase();
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      r.id?.toLowerCase().includes(q) ||
      r.deviceModel?.toLowerCase().includes(q) ||
      r.brand?.toLowerCase().includes(q) ||
      r.model?.toLowerCase().includes(q) ||
      r.issueCategory?.toLowerCase().includes(q) ||
      r.issueDescription?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="repair-history-page">
      <PageHeader
        eyebrow="SERVICE OVERVIEW"
        title="Repair history"
        description="Track the progress and outcomes of all your device repair requests."
      />

      <div className="panel history-panel">
        <div className="history-panel__head">
          <div>
            <h2>Repair requests</h2>
            <p>Search by request ID or device, or filter by status.</p>
          </div>
          <div className="history-panel__filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, device, or issue"
              aria-label="Search repair history"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="history-load-error" role="alert">
            <span>{error}</span>
            <button type="button" className="button button--secondary" onClick={() => setRefreshKey((key) => key + 1)}>
              <RotateCw size={14} /> Try again
            </button>
          </div>
        )}

        {!loading && !error && (search || status !== 'All statuses') && (
          <button className="history-clear" type="button" onClick={() => { setSearch(''); setStatus('All statuses'); }}>
            <X size={13} /> Clear filters
          </button>
        )}

        <div className="history-table-wrap">
          <table>
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>DEVICE</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6}>
                  <div className="history-table-empty">Loading repair history…</div>
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="history-table-empty">
                    <Clock3 size={22} />
                    <strong>{records.length ? 'No matching repair records' : 'No repair requests yet'}</strong>
                    <small>{records.length ? 'Try a different search or status filter.' : 'Your active and completed repairs will appear here.'}</small>
                    {!records.length && <Link className="button button--secondary" to="/new-repair">Create a repair request</Link>}
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td>
                  <td>{r.deviceModel || [r.brand, r.model].filter(Boolean).join(' ') || '—'}</td>
                  <td>{r.issueCategory || r.category || '—'}</td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : '—'}</td>
                  <td><StatusBadge status={r.status || 'Submitted'} /></td>
                  <td>
                    <Link to={`/requests/${r.id}`} className="history-table__link">
                      View <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="history-panel__count">
          {!loading && `Showing ${filtered.length} of ${records.length} repair record${records.length !== 1 ? 's' : ''}.`}
        </p>
      </div>
    </div>
  );
}

export default RepairHistory;
