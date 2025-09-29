import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// LOAD YOUR PLAIN CSS (this is the bit that was missing)
import "./index.css";

// Keep datepicker CSS
import "react-datepicker/dist/react-datepicker.css";

createRoot(document.getElementById("root")).render(<App />);
