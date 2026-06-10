import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./spectrl-overrides.css";
import "./spectrl-v13-safe.css";

createRoot(document.getElementById("root")!).render(<App />);
