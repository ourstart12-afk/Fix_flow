import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { addDevice } from "../api/devices";
const empty={type:"Laptop",brand:"",model:"",serial:"",nickname:""};
export default function AddDevice({onSaved}) {
 const [form,setForm]=useState(empty),[error,setError]=useState(""),[saving,setSaving]=useState(false),navigate=useNavigate();
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 async function submit(e){e.preventDefault();setError("");if(!form.type||!form.brand.trim()||!form.model.trim()){setError("Device type, brand and model are required.");return;}setSaving(true);try{await addDevice(form);onSaved?.();navigate("/devices");}catch(err){setError(err.message)}finally{setSaving(false)}}
 return <><div className="heading"><div><small className="eyebrow">DEVICE INVENTORY</small><h1>Add a device</h1><p>Enter the basic information so you can track this device.</p></div><Link className="btn secondary" to="/devices">← Back to devices</Link></div>
 <form className="panel form" onSubmit={submit}><div className="form-title"><span className="device-icon big">＋</span><div><h2>Device information</h2><p>Fields marked with * are required.</p></div></div>{error&&<div className="alert">{error}</div>}
 <div className="fields"><label>Device type *<select name="type" value={form.type} onChange={change}><option>Laptop</option><option>Mobile</option><option>Tablet</option><option>Desktop</option><option>Other</option></select></label>
 <label>Brand *<input name="brand" value={form.brand} onChange={change} placeholder="e.g. Dell, Samsung" required /></label>
 <label>Model *<input name="model" value={form.model} onChange={change} placeholder="e.g. Inspiron 15" required /></label>
 <label>Serial number<input name="serial" value={form.serial} onChange={change} placeholder="Optional" /></label>
 <label className="wide">Nickname<input name="nickname" value={form.nickname} onChange={change} placeholder="e.g. My work laptop" /></label></div>
 <div className="actions"><Link className="btn secondary" to="/devices">Cancel</Link><button className="btn primary" disabled={saving}>{saving?"Saving…":"Save device →"}</button></div></form></>;
}
