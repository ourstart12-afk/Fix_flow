import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./mock";

export default function NewRepair() {
  const [form, setForm] = useState({ deviceType: "", brand: "", model: "", category: "", description: "", contact: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    // Validation - Invalid form creates NOTHING
    if (!form.deviceType || !form.brand || !form.model || !form.category || !form.description || !form.contact) {
      setError("Please fill all required fields! Invalid form creates nothing.");
      return;
    }
    setError("");
    const res = api.createRequest(form); // POST /api/requests
    if (res.status === 201) setSuccess(res.data);
  };

  if (success) {
    return (
      <div style={{ maxWidth: 500, margin: "30px auto", textAlign: "center" }}>
        <h2>✅ Request Created!</h2>
        <h3>Request ID: {success.id}</h3>
        <Link to={`/requests/${success.id}`} style={{ display: "block", padding: 12, background: "#2a6cff", color: "white", borderRadius: 8 }}>View Details →</Link>
        <br /><Link to="/track">Go to Track →</Link>
      </div>
    );
  }

  const style = { display: "block", width: "100%", padding: 10, marginBottom: 10 };
  return (
    <div style={{ maxWidth: 500, margin: "30px auto" }}>
      <h2>New Repair Request</h2>
      <form onSubmit={submit}>
        <select style={style} value={form.deviceType} onChange={e => setForm({ ...form, deviceType: e.target.value })}>
          <option value="">Device Type *</option><option>Mobile</option><option>Laptop</option><option>Tablet</option><option>Other</option>
        </select>
        <input style={style} placeholder="Brand *" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <input style={style} placeholder="Model *" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
        <select style={style} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          <option value="">Problem Category *</option><option>Screen</option><option>Battery</option><option>Charging</option><option>Software</option><option>Other</option>
        </select>
        <textarea style={style} placeholder="Description *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input style={style} placeholder="Contact *" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
        <button style={{ width: "100%", padding: 12, background: "#2a6cff", color: "white", border: "none", borderRadius: 8 }}>Submit Request</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}