import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import App from "./App";
import ReportPage from "./components/ReportPage";
import BudgetPage from "./components/BudgetPage";
import ScenariosPage from "./components/ScenariosPage";
import "./styles/global.css";

// Every route change starts at the top — a fresh boat/budget page should not
// inherit the previous page's scroll position.
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// basename = the Vite base ("/sailboat-comparison/") so routes resolve under the
// GitHub Pages subpath. Direct hits on /boat/:id are restored by public/404.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollReset />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/boat/:id" element={<ReportPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/scenarios" element={<ScenariosPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
