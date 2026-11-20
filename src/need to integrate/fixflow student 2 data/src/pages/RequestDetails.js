import { useParams, Link } from "react-router-dom";
import { api } from "./mock";
import StatusTimeline from "../components/StatusTimeline";

export default function RequestDetails() {
  const { id } = useParams();
  const res = api.getRequest(id); // GET /api/requests/:id

  if (res.status === 404) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h2>404 - Request Not Found</h2>
        <p>ID {id} exist nahi karta.</p>
        <Link to="/track">← Back to Track</Link>
      </div>
    );
  }

  const r = res.data;
  return (
    <div style={{ maxWidth: 600, margin: "30px auto" }}>
      <h2>Request Details - {r.id}</h2>
      <p><b>ID:</b> {r.id}</p>
      <p><b>Date:</b> {r.date}</p>
      <p><b>Device:</b> {r.deviceType} - {r.brand} {r.model}</p>
      <p><b>Problem:</b> {r.category} - {r.description}</p>
      <p><b>Contact:</b> {r.contact}</p>
      <p><b>Status:</b> {r.status}</p>
      <hr />
      <StatusTimeline status={r.status} />
      <hr />
      <Link to="/track">← Back to Track</Link> | <Link to="/new-repair"> New Request</Link>
    </div>
  );
}