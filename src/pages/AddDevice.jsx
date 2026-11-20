import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { apiRequest } from '../lib/api.js';

const DEVICE_TYPES = ['Laptop', 'Smartphone', 'Tablet', 'Desktop', 'Other'];

const empty = { type: 'Laptop', brand: '', model: '', serial: '', nickname: '' };

function AddDevice() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  }

  function validate() {
    const errs = {};
    if (!form.brand.trim()) errs.brand = 'Brand is required.';
    if (!form.model.trim()) errs.model = 'Model is required.';
    return errs;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setSaving(true);
    try {
      await apiRequest('/api/devices', {
        method: 'POST',
        body: JSON.stringify({
          type: form.type,
          brand: form.brand.trim(),
          model: form.model.trim(),
          serial: form.serial.trim(),
          nickname: form.nickname.trim(),
        }),
      });
      navigate('/devices');
    } catch (err) {
      setError(err.message || 'Could not save device. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="add-device-page">
      <PageHeader
        eyebrow="DEVICE INVENTORY"
        title="Add a device"
        description="Enter the basic information so you can track this device and its repair history."
        action={<Link className="button button--secondary" to="/devices"><ArrowLeft size={15} /> Back to devices</Link>}
      />

      {error && <div className="form-alert" role="alert">{error}</div>}

      <form className="panel device-form" onSubmit={submit} noValidate>
        <div className="device-form__header">
          <span className="device-form__icon"><Plus size={22} /></span>
          <div>
            <h2>Device information</h2>
            <p>Fields marked with * are required.</p>
          </div>
        </div>

        <div className="device-form__fields">
          <div className="form-field">
            <label htmlFor="type">Device type *</label>
            <select id="type" name="type" value={form.type} onChange={change}>
              {DEVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="brand">Brand *</label>
            <input
              id="brand"
              name="brand"
              value={form.brand}
              onChange={change}
              placeholder="e.g. Dell, Samsung, Apple"
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
              placeholder="e.g. Inspiron 15, Galaxy S23"
              aria-invalid={Boolean(fieldErrors.model)}
            />
            {fieldErrors.model && <span className="field-error">{fieldErrors.model}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="serial">Serial number <span className="form-field__optional">(optional)</span></label>
            <input id="serial" name="serial" value={form.serial} onChange={change} placeholder="Located on the label underneath the device" />
          </div>

          <div className="form-field device-form__full">
            <label htmlFor="nickname">Nickname <span className="form-field__optional">(optional)</span></label>
            <input id="nickname" name="nickname" value={form.nickname} onChange={change} placeholder="e.g. My work laptop" />
          </div>
        </div>

        <div className="device-form__actions">
          <Link className="button button--secondary" to="/devices">Cancel</Link>
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save device →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDevice;
