import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RankedList from "./components/RankedList";
import PersonDetail from "./components/PersonDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="topbar">
          <Link to="/" className="topbar__link">Nexus</Link>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/" element={<RankedList />} />
            <Route path="/person/:personId" element={<PersonDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
