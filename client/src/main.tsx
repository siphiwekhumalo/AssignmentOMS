/**
 * Application entry point
 * 
 * Renders the React application into the DOM
 * Includes global CSS styles and initializes the root component
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create React root and render the application
createRoot(document.getElementById("root")!).render(<App />);
