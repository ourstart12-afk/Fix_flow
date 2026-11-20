import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, ArrowRight, Wrench, Clock3, RotateCw } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { apiRequest } from '../lib/api.js';

function Track() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [searching, setSearching] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setListError('');
    apiRequest(`/api/requests?customerId=${encodeURIComponent(user.id)}`)
      .then((data) => {
        if (active) setMyRequests(data.requests || data.data || []);
      })
      .catch((error) => {
        if (active) setListError(error.message || 'Could not load your requests.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.id, refreshKey]);

  async function handleSearch(e) {
    e.preventDefault();
    const id = searchId.trim().toUpperCase();
    if (!id) {
      setSearchError('Enter a request ID to search.');
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const data = await apiRequest(`/api/requests/${encodeURIComponent(id)}`);
      const request = data.request || data.data;
      const belongsToUser = request && (
        request.userId === user.id || request.customerId === user.id ||
        request.customerEmail?.toLowerCase() === user.email?.toLowerCase()
      );
      if (!belongsToUser) {
        setSearchError('No request found with that ID.');
        return;
      }
      navigate(`/requests/${encodeURIComponent(request.id)}`);
    } catch (error) {
      setSearchError(error.status === 404
        ? 'No request found with that ID.'
        : error.message || 'Could not search. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="track-page">
      <PageHeader
        eyebrow="REPAIR TRACKING"
        title="Track a request"
        description="Search by your request ID or select from your recent repair history below."
        action={<Link className="button" to="/new-repair"><Wrench size={15} /> New repair</Link>}
      />

      {/* ID search */}
      <div className="panel track-search">
        <h2 className="track-search__title">Search by request ID</h2>
        <form onSubmit={handleSearch} className="track-search__form">
          <div className="track-search__field">
          <Search size={17} aria-hidden="true" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => { setSearchId(e.target.value); setSearchError(''); }}
            placeholder="Enter your request ID"
            className="track-search__input"
            aria-label="Request ID"
            autoComplete="off"
          />
          </div>
          <button type="submit" className="button" disabled={searching}>
            <Search size={15} /> {searching ? 'Searching…' : 'Find request'}
          </button>
        </form>
        {searchError && <p className="track-search__error" role="alert">{searchError}</p>}
      </div>

      {/* My requests list */}
      <div className="panel track-list">
        <div className="track-list__head">
          <div>
            <p className="eyebrow">YOUR HISTORY</p>
            <h2>Recent repair requests</h2>
          </div>
          <Link className="panel-link" to="/history">View all <ArrowRight size={14} /></Link>
        </div>

        {loading && <div className="track-list__message">Loading your requests…</div>}

        {!loading && listError && (
          <div className="track-list__load-error" role="alert">
            <p>{listError}</p>
            <button type="button" className="button button--secondary" onClick={() => setRefreshKey((key) => key + 1)}>
              <RotateCw size={14} /> Try again
            </button>
          </div>
        )}

        {!loading && !listError && myRequests.length === 0 && (
          <div className="track-list__empty">
            <span className="track-list__empty-icon"><Clock3 size={22} /></span>
            <strong>No repair requests yet</strong>
            <p>Once you submit a repair, its status will appear here.</p>
            <Link className="button button--secondary" to="/new-repair">Create your first request <ArrowRight size={14} /></Link>
          </div>
        )}

        {!loading && !listError && myRequests.length > 0 && (
          <ul className="track-list__items">
            {myRequests.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/requests/${r.id}`}
                  className="track-list__item"
                  aria-label={`Request ${r.id}, status ${r.status || 'Submitted'}, view details`}
                >
                  <div className="track-list__item-left">
                    <strong>{r.id}</strong>
                    <span>{r.deviceType ? `${r.deviceType} · ` : ''}{r.deviceModel || `${r.brand || ''} ${r.model || ''}`.trim() || 'Device details pending'}</span>
                    <span className="track-list__item-date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'}</span>
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
    </div>
  );
}

export default Track;
