import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDevices } from "../api/devices";
export default function MyDevices({ refreshKey }) {
  const [devices,setDevices] = useState([]), [loading,setLoading] = useState(true), [error,setError] = useState("");
  useEffect(() => { let live=true; setLoading(true); getDevices().then(r=>{if(live)setDevices(r.data||[])}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setLoading(false)}); return ()=>{live=false}; },[refreshKey]);
  return <>
    <div className="heading"><div><small className="eyebrow">YOUR INVENTORY</small><h1>My Devices</h1><p>View and manage the devices registered to your account.</p></div><Link className="btn primary" to="/devices/new">＋ Add device</Link></div>
    <div className="summary"><span className="summary-icon">▦</span><div><small>REGISTERED DEVICES</small><b>{loading?"—":devices.length}</b></div><span className="muted push">Synced with device records</span></div>
    {loading&&<div className="panel message">Loading your devices…</div>}
    {error&&<div className="alert">{error}. Check that the backend is running on port 5000.</div>}
    {!loading&&!error&&!devices.length&&<div className="panel empty"><span className="empty-icon">＋</span><h2>No devices yet</h2><p>Add your first device to keep its details and repair activity together.</p><Link className="btn primary" to="/devices/new">Add your first device</Link></div>}
    {!loading&&!error&&devices.length>0&&<div className="cards">{devices.map(d=><article className="device-card" key={d.id}><div className="card-top"><span className="device-icon">{d.type?.toLowerCase().includes("mobile")?"▯":"▱"}</span><span className="pill">Registered</span></div><small className="eyebrow">{d.type||"DEVICE"}</small><h3>{d.nickname||`${d.brand} ${d.model}`}</h3><p>{d.brand} · {d.model}</p><div className="serial"><span>Serial number</span><b>{d.serial||"Not provided"}</b></div><Link className="link" to={`/devices/${d.id}`}>View device details　→</Link></article>)}</div>}
  </>;
}
