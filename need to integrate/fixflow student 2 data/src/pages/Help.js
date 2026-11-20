import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  { q: "Request ID kahan se milega?", a: "New Repair form submit karne ke baad ID milta hai, jese FX-1004." },
  { q: "Repair kaise track karoon?", a: "Track page par ID likhein ya list se select karein." },
  { q: "Ghalat ID par kya hoga?", a: "404 - Not Found aaye ga." },
  { q: "Status kaise change hota hai?", a: "Manager status update karta hai, Track page par naya status aa jata hai." },
  { q: "Nayi request kaise bhejoon?", a: "New Repair page par form fill karein." },
  { q: "Repair me kitna time lagta hai?", a: "Problem par depend karta hai, Timeline me har stage dikhta hai." },
];

export default function Help() {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ maxWidth: 600, margin: "30px auto" }}>
      <h2>Help / FAQ</h2>
      {faqs.map((f, i) => (
        <div key={i} style={{ border: "1px solid #ddd", marginBottom: 8, borderRadius: 8 }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", textAlign: "left", padding: 12 }}>{f.q} {open === i ? "▲" : "▼"}</button>
          {open === i && <p style={{ padding: "0 12px 12px" }}>{f.a}</p>}
        </div>
      ))}
      <Link to="/new-repair">New Repair →</Link> | <Link to="/track"> Track →</Link>
    </div>
  );
}