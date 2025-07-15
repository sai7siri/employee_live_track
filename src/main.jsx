import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import ContextStore from "./store/ContextStore.jsx";

import 'leaflet/dist/leaflet.css';


createRoot(document.getElementById("root")).render(
  <StrictMode>
      <ContextStore>
    <BrowserRouter>
        <App />
    </BrowserRouter>
      </ContextStore>
  </StrictMode>
);
