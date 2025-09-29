import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// LOAD CSS (this fixes the “all in one line” look)
import "./index.css";

// Keep the datepicker CSS too
import "react-datepicker/dist/react-datepicker.css";

createRoot(document.getElementById("root")).render(<App />);
