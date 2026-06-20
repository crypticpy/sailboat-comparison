import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ReportPage from "./components/ReportPage";
import BudgetPage from "./components/BudgetPage";
import "./styles/global.css";

// basename = the Vite base ("/sailboat-comparison/") so routes resolve under the
// GitHub Pages subpath. Direct hits on /boat/:id are restored by public/404.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/boat/:id" element={<ReportPage />} />
        <Route path="/budget" element={<BudgetPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
