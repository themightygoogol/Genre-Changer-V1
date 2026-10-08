import "./styles/HardwareScrews.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DrillPage from "./pages/DrillPage";
import ComingSoonPage from "./pages/ComingSoonPage";

import "./App.css";
import HomeLink from "./components/HomeLink";

function App() {
  return (
    <BrowserRouter>
      <HomeLink />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/transform/drill" element={<DrillPage />} />

        <Route
          path="/transform/house"
          element={<ComingSoonPage genre="House" />}
        />

        <Route
          path="/transform/lofi"
          element={<ComingSoonPage genre="Lo-Fi" />}
        />
        <Route
          path="/transform/metal"
          element={<ComingSoonPage genre="Metal" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
