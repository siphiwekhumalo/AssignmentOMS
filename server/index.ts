/**
 * Main server entry point for the Document Text Extractor application
 * 
 * Sets up:
 * - Express.js server with middleware
 * - Request logging for API endpoints
 * - API routes for file processing
 * - Development server with Vite integration
 * - Production static file serving
 * - Global error handling
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Create Express application instance
const app = express();

// Configure middleware for parsing request bodies
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded form data

/**
 * Request logging middleware for API endpoints
 * Captures timing, status codes, and response data for debugging
 */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Intercept JSON responses to capture response data
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log API requests when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Truncate long log lines for readability
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

/**
 * Initialize and start the server
 * Handles both development and production environments
 */
(async () => {
  // Register API routes and get HTTP server instance
  const server = await registerRoutes(app);

  /**
   * Global error handling middleware
   * Catches all unhandled errors and returns consistent error responses
   */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Configure development or production serving
  // Important: Setup Vite after API routes to prevent interference
  if (app.get("env") === "development") {
    // Development: Use Vite dev server with hot module replacement
    await setupVite(app, server);
  } else {
    // Production: Serve static built files
    serveStatic(app);
  }

  // Start the server on port 5000 (only non-firewalled port)
  // Serves both API and client on the same port
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0", // Bind to all interfaces
    reusePort: true, // Allow port reuse for restarts
  }, () => {
    log(`serving on port ${port}`);
  });
})();
