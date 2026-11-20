FIXFLOW BACKEND CODE - STUDENT 3 (DEVICE APIs)

WHERE TO COPY:
1. Extract this ZIP file.
2. Open the extracted FixFlow_Backend_Code folder.
3. Copy server.js and the src folder.
4. Paste both into your existing Fix Flow Project/server folder.
5. If Windows asks whether to replace existing files, choose Replace.
6. Do NOT replace or delete package.json, package-lock.json, or node_modules.

EXPECTED STRUCTURE:
server/
  node_modules/
  src/
    controllers/deviceController.js
    data/sampleData.js
    routes/deviceRoutes.js
    app.js
  package.json
  package-lock.json
  server.js

RUN:
Open a terminal in the server folder and run:
  npm run dev

Then open this address in your browser:
  http://localhost:5000/

Device API endpoints:
  GET    http://localhost:5000/api/devices
  POST   http://localhost:5000/api/devices
  PUT    http://localhost:5000/api/devices/:id

POST JSON example:
{
  "type": "Laptop",
  "brand": "Dell",
  "model": "Inspiron 15",
  "serial": "ABC123",
  "nickname": "My Laptop"
}

IMPORTANT:
This starter uses temporary in-memory sample data because the team database/API
contract has not yet been integrated. Added or edited devices reset when the
server restarts. Confirm the final device field names with the Manager before
team integration.
