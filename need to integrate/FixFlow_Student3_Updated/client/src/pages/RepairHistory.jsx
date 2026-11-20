import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRepairHistory } from "../api/devices";

const statuses = ["Submitted", "Received", "Under Inspection", "In Repair", "Ready for Collection", "Completed", "Cancelled"];

export default function RepairHistory() {
  const [status, setStatus] = useState("All statuses");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getRepairHistory({ status, search }).then((result) => {
      if (active) setRecords(result.data || []);
    }).catch((err) => {
      if (active) setError(err.message || "Could not load repair history.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [status, search]);

  return <>
    <div className="heading"><div><small className="eyebrow">SERVICE OVERVIEW</small><h1>Repair history</h1><p>Track the progress and outcomes of your device repair requests.</p></div></div>
    <div className="panel history">
      <div className="history-head"><div><h2>Repair requests</h2><p>Search by request ID or device, or filter by status.</p></div>
        <div className="filters">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search request ID or device…" />
          <select value={status} onChange={e => setStatus(e.target.value)}><option>All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="table-wrap"><table><thead><tr><th>REQUEST ID</th><th>DEVICE</th><th>DATE</th><th>FINAL STATUS</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan="4"><div className="table-empty">Loading repair history…</div></td></tr> :
          records.length === 0 ? <tr><td colSpan="4"><div className="table-empty"><span className="empty-icon">◷</span><b>No matching repair records</b><small>Try another request ID or status.</small></div></td></tr> :
          records.map(item => <tr key={item.id}><td><b>{item.id}</b></td><td>{item.device}</td><td>{item.date ? new Date(item.date).toLocaleDateString() : "—"}</td><td><span className="pill">{item.status}</span></td></tr>)}
        </tbody>
      </table></div>
      <p className="integration">Showing {records.length} repair record(s). These are development sample records until the shared repair-request API is integrated.</p>
    </div>
  </>;
}
