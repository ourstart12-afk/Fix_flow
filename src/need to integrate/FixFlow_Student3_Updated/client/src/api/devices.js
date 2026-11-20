const BASE = "http://localhost:5000/api";
async function call(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body;
}
export const getDevices = () => call("/devices");
export const addDevice = data => call("/devices", { method: "POST", body: JSON.stringify(data) });
export const updateDevice = (id, data) => call(`/devices/${id}`, { method: "PUT", body: JSON.stringify(data) });
export async function getDevice(id) {
  const result = await getDevices();
  return (result.data || []).find(item => String(item.id) === String(id)) || null;
}

export const getRepairHistory = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== "All statuses") query.set(key, value);
  });
  return call(`/repairs${query.toString() ? `?${query.toString()}` : ""}`);
};
