import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { getDevice, getRepairHistory } from "../api/devices";
export default function DeviceDetails(){
 const {id}=useParams();const [device,setDevice]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const [repairs,setRepairs]=useState([]),[repairError,setRepairError]=useState("");
 useEffect(()=>{
  let active=true;
  getDevice(id).then(d=>{if(active)setDevice(d)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});
  getRepairHistory({deviceId:id}).then(r=>{if(active)setRepairs(r.data||[])}).catch(e=>{if(active)setRepairError(e.message)});
  return ()=>{active=false};
 },[id]);
 return <><div className="heading"><div><small className="eyebrow">DEVICE PROFILE</small><h1>Device details</h1><p>Review the information saved for this device.</p></div><Link className="btn secondary" to="/devices">← My devices</Link></div>
 {loading&&<div className="panel message">Loading device details…</div>}{error&&<div className="alert">{error}</div>}
 {!loading&&!error&&!device&&<div className="panel empty"><h2>Device not found</h2><Link className="btn primary" to="/devices">Back to devices</Link></div>}
 {device&&<><div className="panel details"><div className="detail-head"><span className="device-icon big">▱</span><div className="detail-name"><span className="pill">Registered</span><h2>{device.nickname||`${device.brand} ${device.model}`}</h2><p>{device.type} · {device.brand} {device.model}</p></div><Link className="btn primary" to={`/devices/${id}/edit`}>Edit device</Link></div>
 <div className="detail-grid">{[["DEVICE TYPE",device.type],["BRAND",device.brand],["MODEL",device.model],["SERIAL NUMBER",device.serial||"Not provided"],["NICKNAME",device.nickname||"Not set"],["DATE ADDED",device.createdAt?new Date(device.createdAt).toLocaleDateString():"—"]].map(([k,v])=><div key={k}><small>{k}</small><b>{v}</b></div>)}</div></div>
 <div className="section-title"><small className="eyebrow">SERVICE ACTIVITY</small><h2>Related repair requests</h2></div><div className="panel history"><div className="table-wrap"><table><thead><tr><th>REQUEST ID</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>
 {repairError&&<tr><td colSpan="3">{repairError}</td></tr>}
 {!repairError&&repairs.length===0&&<tr><td colSpan="3"><div className="table-empty"><b>No repair requests for this device</b><small>New linked requests will appear here.</small></div></td></tr>}
 {repairs.map(r=><tr key={r.id}><td><b>{r.id}</b></td><td>{r.date||"—"}</td><td><span className="pill">{r.status}</span></td></tr>)}
 </tbody></table></div><p className="integration">Development sample records are shown until the shared repair-request API is available.</p></div></>}
 </>;
}
