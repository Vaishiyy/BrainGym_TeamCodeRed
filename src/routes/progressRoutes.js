const express = require("express");

function createProgressRouter(progressService) {
  const router = express.Router();

  router.post("/progress/game-complete", async (req, res) => {
    try {
      const completion = await progressService.recordCompletion(req.body || {});
      res.status(201).json({
        ok: true,
        completion
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to save game completion."
      });
    }
  });

  router.get("/progress/summary", async (req, res) => {
    try {
      const summary = await progressService.getSummary(req.query || {});
      res.json({
        ok: true,
        summary
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to load progress summary."
      });
    }
  });

  return router;
}

module.exports = { createProgressRouter };
