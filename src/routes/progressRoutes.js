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

  router.get("/progress/goals", async (req, res) => {
    try {
      const goals = await progressService.getGoalSettings(req.query || {});
      res.json({
        ok: true,
        goals
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to load goals."
      });
    }
  });

  router.post("/progress/goals", async (req, res) => {
    try {
      const goals = await progressService.saveGoalSetting(req.body || {});
      res.status(201).json({
        ok: true,
        goals
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to save goal."
      });
    }
  });

  router.get("/progress/goal-progress", async (req, res) => {
    try {
      const goalProgress = await progressService.getGoalProgress(req.query || {});
      res.json({
        ok: true,
        goalProgress
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to load goal progress."
      });
    }
  });

  router.get("/progress/calendar", async (req, res) => {
    try {
      const calendar = await progressService.getWorkoutCalendar(req.query || {});
      res.json({
        ok: true,
        calendar
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to load workout calendar."
      });
    }
  });

  return router;
}

module.exports = { createProgressRouter };
