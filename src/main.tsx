import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./spectrl-overrides.css";
import "./spectrl-v13-safe.css";
import "./sls-resonance.css";
import "./sls-bulbs.css";
import "./slsAuto";

createRoot(document.getElementById("root")!).render(<App />);
