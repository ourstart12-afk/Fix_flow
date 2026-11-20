import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Wrench, Calendar, User, Phone, Tag, AlertCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import { apiRequest } from '../lib/api.js';

function RequestDetails() {
  const { id } = useParams();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    apiRequest(`/api/requests/${id}`)
      .then((data) => setRepair(data.request || data.data))
      .catch((err) => {
        if (err.status === 404) setError(`No request found for ID "${id}".`);
        else setError(err.message || 'Could not load request details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="request-details-page">
        <div className="panel request-details__loading">Loading request details…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="request-details-page">
        <div className="panel request-details__error">
          <AlertCircle size={22} />
          <h2>Request not found</h2>
          <p>{error}</p>
          <Link className="button button--secondary" to="/track"><ArrowLeft size={15} /> Back to tracking</Link>
        </div>
      </div>
    );
  }

  if (!repair) return null;

  return (
    <div className="request-details-page">
      <PageHeader
        eyebrow="REPAIR REQUEST"
        title={`Request ${repair.id}`}
        description={`Submitted ${repair.createdAt ? new Date(repair.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}`}
        action={<Link className="button button--secondary" to="/track"><ArrowLeft size={15} /> Back to tracking</Link>}
      />

      {/* Timeline */}
      <div className="panel request-details__timeline-panel">
        <StatusTimeline status={repair.status} />
      </div>

      {/* Core info grid */}
      <div className="request-details__grid">
        {/* Device card */}
        <div className="panel request-details__card">
          <h3 className="request-details__card-title"><Wrench size={15} /> Device</h3>
          <dl className="detail-list">
            <div><dt>Type</dt><dd>{repair.deviceType || '—'}</dd></div>
            <div><dt>Model</dt><dd>{repair.deviceModel || [repair.brand, repair.model].filter(Boolean).join(' ') || '—'}</dd></div>
            {repair.deviceSerial && <div><dt>Serial</dt><dd>{repair.deviceSerial}</dd></div>}
          </dl>
        </div>

        {/* Issue card */}
        <div className="panel request-details__card">
          <h3 className="request-details__card-title"><Tag size={15} /> Issue</h3>
          <dl className="detail-list">
            <div><dt>Category</dt><dd>{repair.issueCategory || repair.category || '—'}</dd></div>
            <div><dt>Description</dt><dd>{repair.issueDescription || repair.description || '—'}</dd></div>
          </dl>
        </div>

        {/* Status card */}
        <div className="panel request-details__card">
          <h3 className="request-details__card-title"><Calendar size={15} /> Status</h3>
          <dl className="detail-list">
            <div><dt>Current status</dt><dd><StatusBadge status={repair.status || 'Submitted'} /></dd></div>
            {repair.priority && <div><dt>Priority</dt><dd>{repair.priority}</dd></div>}
            {repair.assignedTechnician && <div><dt>Technician</dt><dd>{repair.assignedTechnician}</dd></div>}
            {repair.estimatedCompletion && <div><dt>Est. completion</dt><dd>{new Date(repair.estimatedCompletion).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>}
          </dl>
        </div>

        {/* Contact card */}
        <div className="panel request-details__card">
          <h3 className="request-details__card-title"><User size={15} /> Customer</h3>
          <dl className="detail-list">
            <div><dt>Name</dt><dd>{repair.customerName || '—'}</dd></div>
            {repair.customerEmail && <div><dt>Email</dt><dd>{repair.customerEmail}</dd></div>}
            {(repair.customerPhone || repair.contact) && (
              <div><dt>Phone</dt><dd><Phone size={12} /> {repair.customerPhone || repair.contact}</dd></div>
            )}
          </dl>
        </div>
      </div>

      {/* Technician notes */}
      {repair.notes && repair.notes.length > 0 && (
        <div className="panel request-details__notes">
          <h3 className="request-details__notes-title">Technician notes</h3>
          <ul className="notes-list">
            {repair.notes.map((note) => (
              <li key={note.id} className="notes-list__item">
                <div className="notes-list__meta">
                  <strong>{note.author}</strong>
                  <span>{note.role}</span>
                  <time>{note.date ? new Date(note.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</time>
                </div>
                <p className="notes-list__text">{note.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="request-details__footer">
        <Link className="button button--secondary" to="/track"><ArrowLeft size={15} /> Back to tracking</Link>
        <Link className="button button--secondary" to="/new-repair">Submit another request</Link>
      </div>
    </div>
  );
}

export default RequestDetails;
