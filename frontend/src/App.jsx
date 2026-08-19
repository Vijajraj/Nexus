import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import Overview from "./pages/Overview";
import Rankings from "./pages/Rankings";
import PersonDetail from "./pages/PersonDetail";

/**
 * Main Application Routing
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="rankings" element={<Rankings />} />
          <Route path="person/:personId" element={<PersonDetail />} />
          {/* Fallback route */}
          <Route path="*" element={<Overview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
