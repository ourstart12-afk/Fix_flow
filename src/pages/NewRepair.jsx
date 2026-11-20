import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Check, ClipboardCheck, Clock3, Plus, ShieldCheck, Smartphone, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';

const DEVICE_TYPES = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Other'];
const CATEGORIES = [
  'Screen & Display',
  'Battery & Power',
  'Charging Port',
  'Software & Performance',
  'Camera System',
  'Liquid Damage',
  'Keyboard / Trackpad',
  'Speaker / Microphone',
  'Other',
];

const empty = {
  deviceType: '',
  savedDeviceId: '',
  brand: '',
  model: '',
  deviceSerial: '',
  problemCategory: '',
  problemDescription: '',
  contact: '',
};

function NewRepair() {
  const { user } = useOutletContext();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    let active = true;
    apiRequest('/api/devices')
      .then((data) => {
        if (active) setDevices(data.devices || data.data || []);
      })
      .catch(() => {
        // Saving a repair should still work when the customer has no saved devices.
      });
    return () => { active = false; };
  }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  }

  function chooseSavedDevice(e) {
    const savedDeviceId = e.target.value;
    const device = devices.find((item) => String(item.id) === savedDeviceId);
    setForm((current) => ({
      ...current,
      savedDeviceId,
      ...(device ? {
        deviceType: device.type || current.deviceType,
        brand: device.brand || current.brand,
        model: device.model || current.model,
        deviceSerial: device.serial || current.deviceSerial,
      } : {}),
    }));
    setFieldErrors({});
  }

  function validate() {
    const errs = {};
    if (!form.deviceType) errs.deviceType = 'Please select a device type.';
    if (!form.brand.trim()) errs.brand = 'Brand is required.';
    if (!form.model.trim()) errs.model = 'Model is required.';
    if (!form.problemCategory) errs.problemCategory = 'Please select a problem category.';
    if (!form.problemDescription.trim()) errs.problemDescription = 'Description is required.';
    if (!form.contact.trim()) errs.contact = 'Contact number is required.';
    else if (form.contact.replace(/\D/g, '').length < 7) errs.contact = 'Enter a valid contact number.';
    return errs;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiRequest('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          deviceType: form.deviceType,
          deviceId: form.savedDeviceId || undefined,
          brand: form.brand.trim(),
          model: form.model.trim(),
          deviceSerial: form.deviceSerial.trim(),
          problemCategory: form.problemCategory,
          problemDescription: form.problemDescription.trim(),
          contact: form.contact.trim(),
          customerName: user.name,
          customerEmail: user.email,
        }),
      });
      setSuccess(data.request || data.data);
    } catch (err) {
      setError(err.message || 'Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="new-repair-page">
        <div className="new-repair-success">
          <div className="success-icon" aria-hidden="true">✓</div>
          <h1>Request submitted!</h1>
          <p>Your request ID is <strong>{success.id}</strong>. You can track its progress from your dashboard.</p>
          <div className="success-actions">
            <Link className="button" to={`/requests/${success.id}`}>
              View request details <ArrowRight size={15} />
            </Link>
            <Link className="button button--secondary" to="/track">
              Track a request
            </Link>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => { setSuccess(null); setForm(empty); }}
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new-repair-page">
      <PageHeader
        eyebrow="REPAIR SERVICES"
        title="New repair request"
        description="Tell us about your device and the issue. We'll get it looked at right away."
        action={<Link className="button button--secondary" to="/track"><Wrench size={15} /> Track existing</Link>}
      />

      {error && <div className="form-alert" role="alert">{error}</div>}

      <div className="repair-workspace">
      <form className="repair-form panel" onSubmit={submit} noValidate>
        {/* Device section */}
        <div className="repair-form__section">
          <h2 className="repair-form__section-title">
            <span className="repair-form__section-num">1</span> Device information
          </h2>
          <div className="repair-form__grid">
            {devices.length > 0 && (
              <div className="form-field repair-form__full">
                <label htmlFor="savedDeviceId">Use a saved device <span className="form-field__optional">(optional)</span></label>
                <select id="savedDeviceId" name="savedDeviceId" value={form.savedDeviceId} onChange={chooseSavedDevice}>
                  <option value="">Enter device details below</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {[device.nickname, `${device.brand} ${device.model}`].filter(Boolean).join(' · ')}
                    </option>
                  ))}
                </select>
                <span className="form-field__hint">Choosing a saved device fills in its details for you.</span>
              </div>
            )}
            <div className="form-field">
              <label htmlFor="deviceType">Device type *</label>
              <select
                id="deviceType"
                name="deviceType"
                value={form.deviceType}
                onChange={change}
                required
                aria-invalid={Boolean(fieldErrors.deviceType)}
              >
                <option value="">Select type…</option>
                {DEVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {fieldErrors.deviceType && <span className="field-error">{fieldErrors.deviceType}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="brand">Brand *</label>
              <input
                id="brand"
                name="brand"
                value={form.brand}
                onChange={change}
                maxLength={80}
                required
                placeholder="e.g. Apple, Samsung, Dell"
                aria-invalid={Boolean(fieldErrors.brand)}
              />
              {fieldErrors.brand && <span className="field-error">{fieldErrors.brand}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="model">Model *</label>
              <input
                id="model"
                name="model"
                value={form.model}
                onChange={change}
                maxLength={100}
                required
                placeholder="e.g. iPhone 14 Pro, XPS 15"
                aria-invalid={Boolean(fieldErrors.model)}
              />
              {fieldErrors.model && <span className="field-error">{fieldErrors.model}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="deviceSerial">Serial number <span className="form-field__optional">(optional)</span></label>
              <input
                id="deviceSerial"
                name="deviceSerial"
                value={form.deviceSerial}
                onChange={change}
                maxLength={80}
                placeholder="Located on the device label"
              />
            </div>
          </div>
        </div>

        {/* Problem section */}
        <div className="repair-form__section">
          <h2 className="repair-form__section-title">
            <span className="repair-form__section-num">2</span> Problem details
          </h2>
          <div className="repair-form__grid">
            <div className="form-field">
              <label htmlFor="problemCategory">Problem category *</label>
              <select
                id="problemCategory"
                name="problemCategory"
                value={form.problemCategory}
                onChange={change}
                required
                aria-invalid={Boolean(fieldErrors.problemCategory)}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {fieldErrors.problemCategory && <span className="field-error">{fieldErrors.problemCategory}</span>}
            </div>

            <div className="form-field repair-form__full">
              <label htmlFor="problemDescription">Describe the issue *</label>
              <textarea
                id="problemDescription"
                name="problemDescription"
                rows={4}
                value={form.problemDescription}
                onChange={change}
                maxLength={1000}
                required
                placeholder="Describe what's wrong in as much detail as you can…"
                aria-invalid={Boolean(fieldErrors.problemDescription)}
              />
              {fieldErrors.problemDescription && <span className="field-error">{fieldErrors.problemDescription}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="contact">Contact number *</label>
              <input
                id="contact"
                name="contact"
                type="tel"
                value={form.contact}
                onChange={change}
                maxLength={30}
                required
                placeholder="e.g. +92 300 1234567"
                aria-invalid={Boolean(fieldErrors.contact)}
              />
              {fieldErrors.contact && <span className="field-error">{fieldErrors.contact}</span>}
            </div>
          </div>
        </div>

        <div className="repair-form__actions">
          <Link className="button button--secondary" to="/dashboard">Cancel</Link>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : <><Plus size={15} /> Submit request</>}
          </button>
        </div>
      </form>
      <aside className="repair-guidance panel" aria-label="What happens next">
        <span className="repair-guidance__icon"><ClipboardCheck size={19} /></span>
        <p className="eyebrow">A CLEAR REPAIR JOURNEY</p>
        <h2>Here’s what happens next</h2>
        <ol className="repair-guidance__steps">
          <li><span><Check size={14} /></span><div><strong>We review your request</strong><small>Our team checks the device and issue details.</small></div></li>
          <li><span><Clock3 size={14} /></span><div><strong>We keep you updated</strong><small>Follow each status from your tracking page.</small></div></li>
          <li><span><ShieldCheck size={14} /></span><div><strong>Your details stay together</strong><small>Request information is saved to your FixFlow account.</small></div></li>
        </ol>
        <Link className="repair-guidance__link" to="/track"><Smartphone size={15} /> Track an existing repair <ArrowRight size={14} /></Link>
      </aside>
      </div>
    </div>
  );
}

export default NewRepair;
