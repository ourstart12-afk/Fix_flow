import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewRepair from "./pages/NewRepair";
import Track from "./pages/Track";
import RequestDetails from "./pages/RequestDetails";
import Help from "./pages/Help";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewRepair />} />
        <Route path="/track" element={<Track />} />
        <Route path="/request/:id" element={<RequestDetails />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;