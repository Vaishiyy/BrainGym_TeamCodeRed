const express = require("express");
const path = require("path");
const { createAuthRouter } = require("./routes/authRoutes");
const { createProgressRouter } = require("./routes/progressRoutes");

function createApp({ authService, progressService }) {
  const app = express();
  const rootDir = path.resolve(__dirname, "..");

  app.use(express.json({ limit: "1mb" }));
  app.use("/api", createAuthRouter(authService));
  app.use("/api", createProgressRouter(progressService));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(express.static(rootDir));

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  return app;
}

module.exports = { createApp };
