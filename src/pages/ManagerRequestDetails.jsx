import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  Tablet,
  User,
  Mail,
  Phone,
  Shield,
  Send,
  Save,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

function ManagerRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Editable fields
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [technician, setTechnician] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    apiRequest(`/api/requests/${id}`)
      .then((data) => {
        if (!isMounted) return;
        const item = data.request;
        setRequest(item);
        setStatus(item.status || 'in-repair');
        setPriority(item.priority || 'medium');
        setTechnician(item.assignedTechnician || 'Unassigned');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatusMessage({ type: 'error', text: err.message || 'Could not load service ticket.' });
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  async function handleUpdateStatus(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const payload = {
        status,
        priority,
        assignedTechnician: technician,
      };

      if (newNote.trim()) {
        payload.newNote = {
          text: newNote.trim(),
          author: 'Facility Manager',
          role: 'Manager Station',
        };
      }

      const res = await apiRequest(`/api/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      setRequest(res.request);
      setNewNote('');
      setStatusMessage({ type: 'success', text: 'Service ticket updated and synced successfully.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update ticket.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="workspace">
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '400px' }}>
          <p style={{ color: '#7d899b', fontSize: '14px', fontWeight: '500' }}>Loading service ticket #{id}…</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="workspace">
        <Link to="/manager/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3978e8', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to active requests
        </Link>
        <div className="panel" style={{ padding: '48px 32px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
          <AlertCircle size={36} style={{ color: '#ad3d4a', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '20px', color: '#14253e', margin: '0 0 8px' }}>Service Ticket Not Found</h2>
          <p style={{ color: '#68768b', fontSize: '14px', margin: '0 0 24px' }}>Ticket #{id} could not be located in the facility database.</p>
          <button className="button" onClick={() => navigate('/manager/requests')} type="button">
            View All Requests
          </button>
        </div>
      </div>
    );
  }

  const DeviceIcon = request.deviceType === 'Laptop' ? Laptop : request.deviceType === 'Tablet' ? Tablet : Smartphone;

  return (
    <div className="workspace">
      <Link to="/manager/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3978e8', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Manage Requests
      </Link>

      <PageHeader
        eyebrow={`FACILITY CONTROL • TICKET #${request.id}`}
        title={request.deviceModel || 'Client Hardware'}
        description={`Opened on ${new Date(request.createdAt).toLocaleDateString()} • Assigned: ${request.assignedTechnician || 'Unassigned'}`}
        action={
          <span className={`status-badge status-badge--${request.status || 'in-repair'}`} style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}>
            {request.status ? request.status.replace(/-/g, ' ').toUpperCase() : 'IN PROGRESS'}
          </span>
        }
      />

      {statusMessage.text && (
        <div
          role="alert"
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: '500',
            background: statusMessage.type === 'error' ? '#fff1f1' : '#eaf7f0',
            color: statusMessage.type === 'error' ? '#ad3d4a' : '#218866',
            border: `1px solid ${statusMessage.type === 'error' ? '#fed3d3' : '#b7ebcf'}`,
          }}
        >
          {statusMessage.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Defect Details & Operations Timeline */}
        <div style={{ display: 'grid', gap: '24px' }}>
          
          {/* Card: Diagnosis & Hardware Details */}
          <div className="panel" style={{ padding: '28px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#edf2fc', color: '#3978e8', display: 'grid', placeItems: 'center' }}>
                <DeviceIcon size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#14253e' }}>Reported Problem & Diagnostics</h3>
                <span style={{ fontSize: '12px', color: '#7d8aa0', fontWeight: '500' }}>Category: {request.issueCategory || 'General Diagnostics'}</span>
              </div>
            </div>

            <p style={{ margin: '0 0 20px', fontSize: '14px', lineHeight: '1.6', color: '#34445c', background: '#f8fafd', padding: '16px', borderRadius: '10px', border: '1px solid #eef2f8' }}>
              {request.issueDescription}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid #edf1f7' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#7d8aa0', fontWeight: '600', textTransform: 'uppercase' }}>Serial Number</span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '600', color: '#1e2d42', fontFamily: 'monospace' }}>{request.deviceSerial || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#7d8aa0', fontWeight: '600', textTransform: 'uppercase' }}>Target Completion</span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '600', color: '#1e2d42' }}>
                  {request.estimatedCompletion ? new Date(request.estimatedCompletion).toLocaleDateString() : 'Pending assignment'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#7d8aa0', fontWeight: '600', textTransform: 'uppercase' }}>Priority Level</span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '700', textTransform: 'capitalize', color: request.priority === 'high' ? '#e24d4d' : '#3978e8' }}>
                  {request.priority || 'Normal'}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Technician Notes & Audit Trail */}
          <div className="panel" style={{ padding: '28px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#3978e8' }} /> Technician Logs & Station Notes
            </h3>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              {Array.isArray(request.notes) && request.notes.length > 0 ? (
                request.notes.map((note) => (
                  <div key={note.id} style={{ background: '#f8fafd', border: '1px solid #eef2f8', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#1f2e46' }}>
                        {note.author} <span style={{ fontSize: '11px', fontWeight: '500', color: '#7d8aa0' }}>({note.role})</span>
                      </strong>
                      <span style={{ fontSize: '11px', color: '#8898aa' }}>
                        {new Date(note.date).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#34445c', lineHeight: '1.5' }}>{note.text}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#7d8aa0', fontSize: '13px', fontStyle: 'italic', margin: '8px 0' }}>No technician notes logged yet.</p>
              )}
            </div>

            {/* Quick Note Input */}
            <form onSubmit={handleUpdateStatus} style={{ display: 'grid', gap: '12px' }}>
              <label htmlFor="new-technician-note" style={{ fontSize: '12px', fontWeight: '600', color: '#2a3a54' }}>
                Add Manager Inspection Note
              </label>
              <textarea
                id="new-technician-note"
                rows="3"
                placeholder="Log diagnostic updates, parts ordered, or bench test conclusions…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '9px',
                  border: '1px solid #d8e1ee',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
              <button
                type="submit"
                disabled={saving}
                className="button"
                style={{ justifySelf: 'start', minHeight: '38px', padding: '0 16px', fontSize: '13px' }}
              >
                <Save size={15} /> {saving ? 'Saving changes…' : 'Save Status & Add Note'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Manager Control Center & Customer Bio */}
        <div style={{ display: 'grid', gap: '24px' }}>
          
          {/* Card: Manager Operations Station */}
          <div className="panel" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '15px', fontWeight: '750', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={17} style={{ color: '#3978e8' }} /> Operations Management
            </h3>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label htmlFor="select-status" style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#68768b', marginBottom: '6px' }}>
                  Lifecycle Status
                </label>
                <select
                  id="select-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8e1ee',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1f2e46',
                    background: '#fff',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="under-inspection">Under Inspection</option>
                  <option value="in-repair">In Repair</option>
                  <option value="ready-for-collection">Ready for Collection</option>
                  <option value="completed">Completed & Closed</option>
                </select>
              </div>

              <div>
                <label htmlFor="select-priority" style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#68768b', marginBottom: '6px' }}>
                  Priority Level
                </label>
                <select
                  id="select-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8e1ee',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1f2e46',
                    background: '#fff',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent SLA)</option>
                </select>
              </div>

              <div>
                <label htmlFor="select-technician" style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#68768b', marginBottom: '6px' }}>
                  Assigned Technician
                </label>
                <input
                  id="select-technician"
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  placeholder="e.g. Tariq Mahmood (Bay 2)"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #d8e1ee',
                    fontSize: '13px',
                    color: '#1f2e46',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={saving}
                className="button"
                style={{ width: '100%', height: '42px', marginTop: '6px', fontSize: '13px', fontWeight: '600' }}
              >
                <Save size={15} /> {saving ? 'Updating…' : 'Apply Operations Changes'}
              </button>
            </div>
          </div>

          {/* Card: Customer Information */}
          <div className="panel" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e9edf4' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '750', color: '#14253e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={17} style={{ color: '#3978e8' }} /> Customer Dossier
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#3978e8', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '700', fontSize: '15px' }}>
                {request.customerName ? request.customerName[0].toUpperCase() : 'C'}
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#14253e', display: 'block' }}>{request.customerName || 'Registered Client'}</strong>
                <span style={{ fontSize: '11px', color: '#7d8aa0' }}>ID: {request.userId ? request.userId.slice(0, 8) : 'GUEST'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: '#34445c', paddingTop: '14px', borderTop: '1px solid #edf1f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={15} style={{ color: '#7d8aa0', flexShrink: 0 }} />
                <a href={`mailto:${request.customerEmail}`} style={{ color: '#3978e8', textDecoration: 'none', wordBreak: 'break-all' }}>
                  {request.customerEmail || 'No email provided'}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={15} style={{ color: '#7d8aa0', flexShrink: 0 }} />
                <span>{request.customerPhone || 'No phone provided'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ManagerRequestDetails;
