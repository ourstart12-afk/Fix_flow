// FixFlow - Student 2 | Mock Data + API Simulation

export const allRequests = [
  {
    id: "FX-1001",
    customerId: "C1",
    deviceType: "Mobile",
    brand: "Apple",
    model: "iPhone 13",
    category: "Screen",
    description: "Screen Cracked",
    contact: "0312-9876543",
    date: "2026-11-10",
    status: "In Repair"
  },
  {
    id: "FX-1002",
    customerId: "C1",
    deviceType: "Laptop",
    brand: "HP",
    model: "Pavilion 15",
    category: "Battery",
    description: "Battery drains fast",
    contact: "0312-9876543",
    date: "2026-11-12",
    status: "New"
  },
  {
    id: "FX-1003",
    customerId: "C2",
    deviceType: "Mobile",
    brand: "Samsung",
    model: "S22",
    category: "Charging",
    description: "Charging port issue",
    contact: "0301-1111111",
    date: "2026-11-14",
    status: "Ready"
  },
];

// Timeline ke 6 Steps
export const timelineSteps = [
  "Submitted",
  "Received",
  "Inspection",
  "In Repair",
  "Ready",
  "Completed"
];

// Status ko Timeline se map karne ke liye
export const statusToStep = {
  "New": "Submitted",
  "Submitted": "Submitted",
  "Received": "Received",
  "Inspection": "Inspection",
  "In Repair": "In Repair",
  "Ready": "Ready",
  "Ready for Collection": "Ready",
  "Completed": "Completed"
};

// ===== API Simulation =====
export const api = {

  // POST /api/requests -> 201 with ID
  createRequest: (data) => {
    let reqs = JSON.parse(localStorage.getItem("requests")) || allRequests;
    const newId = "FX-" + (1000 + reqs.length + 1);
    const newReq = {
      id: newId,
      customerId: "C1",
      date: new Date().toISOString().slice(0, 10),
      status: "Submitted",
      ...data
    };
    reqs.push(newReq);
    localStorage.setItem("requests", JSON.stringify(reqs));
    return { status: 201, data: newReq };
  },

  // GET /api/requests/:id -> 404 if unknown
  getRequest: (id) => {
    let reqs = JSON.parse(localStorage.getItem("requests")) || allRequests;
    let found = reqs.find((r) => r.id === id);
    if (!found) return { status: 404, message: "Request Not Found" };
    return { status: 200, data: found };
  },

  // GET /api/requests?customerId=...
  getCustomerRequests: (customerId) => {
    let reqs = JSON.parse(localStorage.getItem("requests")) || allRequests;
    return reqs.filter((r) => r.customerId === customerId);
  },

  // Sab requests lene ke liye
  getAllRequests: () => {
    return JSON.parse(localStorage.getItem("requests")) || allRequests;
  }
};