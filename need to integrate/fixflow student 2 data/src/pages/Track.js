import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./mock";

export default function Track() {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const list = api.getCustomerRequests("C1");

  const search = (e) => {
    e.preventDefault();
    const res = api.getRequest(id.trim().toUpperCase()); // GET /api/requests/:id
    if (res.status === 404) setError("404 - Request Not Found");
    else navigate(`/requests/${res.data.id}`);
  };

  return (
    <div style={{ maxWidth: 600, margin: "30px auto" }}>
      <h2>Track Your Repair</h2>
      <form onSubmit={search} style={{ display: "flex", gap: 10 }}>
        <input placeholder="Enter ID e.g. FX-1001" value={id} onChange={e => setId(e.target.value)} style={{ flex: 1, padding: 12 }} />
        <button style={{ padding: "12px 20px", background: "#2a6cff", color: "white", border: "none" }}>Search</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h3>Or Pick From List</h3>
      {list.map(r => (
        <Link key={r.id} to={`/requests/${r.id}`} style={{ display: "block", padding: 12, border: "1px solid #ddd", marginBottom: 8, borderRadius: 8 }}>
          {r.id} - {r.brand} {r.model} - <b>{r.status}</b> →
        </Link>
      ))}
    </div>
  );
}