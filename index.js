// index.js
// Simple Express.js application — health check, mock users, request logging, error handling.

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────

// Parse JSON request bodies
app.use(express.json());

// Basic request logging: method, URL, status code, duration
app.use((req, res, next) => {
  const start = Date.now();

  // "finish" fires when the response has been sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

// ── Routes ───────────────────────────────────────────────────

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // seconds since the process started
  });
});

// Mock users endpoint
app.get("/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
  ];

  res.json(users);
});

// 404 handler — runs when no route matched
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware — must have exactly 4 parameters
// Express automatically forwards any thrown error here
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} Error: ${err.message}`);

  res.status(err.status || 500).json({
    error: "Internal Server Error",
  });
});

// ── Start server ─────────────────────────────────────────────

// Only start the server when this file is run directly
// (skipped when imported by tests or other modules)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;