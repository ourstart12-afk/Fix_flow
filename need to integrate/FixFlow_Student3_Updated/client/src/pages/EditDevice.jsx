import { useEffect,useState } from "react";
import { Link,useNavigate,useParams } from "react-router-dom";
import { getDevice,updateDevice } from "../api/devices";
export default function EditDevice({onSaved}){
 const {id}=useParams(),navigate=useNavigate();const [form,setForm]=useState(null),[error,setError]=useState(""),[saving,setSaving]=useState(false);
 useEffect(()=>{getDevice(id).then(d=>{if(!d)setError("Device not found.");else setForm({type:d.type||"Laptop",brand:d.brand||"",model:d.model||"",serial:d.serial||"",nickname:d.nickname||""})}).catch(e=>setError(e.message))},[id]);
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 async function submit(e){e.preventDefault();setError("");if(!form.brand.trim()||!form.model.trim()){setError("Brand and model are required.");return;}setSaving(true);try{await updateDevice(id,form);onSaved?.();navigate(`/devices/${id}`)}catch(e){setError(e.message)}finally{setSaving(false)}}
 return <><div className="heading"><div><small className="eyebrow">DEVICE INVENTORY</small><h1>Edit device</h1><p>Update the saved information for this device.</p></div><Link className="btn secondary" to={`/devices/${id}`}>← Cancel</Link></div>
 {!form&&!error&&<div className="panel message">Loading device…</div>}{error&&<div className="alert">{error}</div>}
 {form&&<form className="panel form" onSubmit={submit}><div className="form-title"><span className="device-icon big">✎</span><div><h2>Update device information</h2><p>Make your changes and save when ready.</p></div></div><div className="fields">
 <label>Device type *<select name="type" value={form.type} onChange={change}><option>Laptop</option><option>Mobile</option><option>Tablet</option><option>Desktop</option><option>Other</option></select></label>
 <label>Brand *<input name="brand" value={form.brand} onChange={change} required /></label><label>Model *<input name="model" value={form.model} onChange={change} required /></label><label>Serial number<input name="serial" value={form.serial} onChange={change} /></label><label className="wide">Nickname<input name="nickname" value={form.nickname} onChange={change} /></label></div>
 <div className="actions"><Link className="btn secondary" to={`/devices/${id}`}>Cancel</Link><button className="btn primary" disabled={saving}>{saving?"Saving…":"Save changes →"}</button></div></form>}</>;
}
