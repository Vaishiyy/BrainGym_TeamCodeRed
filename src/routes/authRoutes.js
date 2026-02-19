const express = require("express");

function createAuthRouter(authService) {
  const router = express.Router();

  const handleSignup = async (req, res) => {
    try {
      const user = await authService.signup(req.body || {});
      res.status(201).json({
        ok: true,
        user
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to process signup."
      });
    }
  };

  const handleLogin = async (req, res) => {
    try {
      const user = await authService.login(req.body || {});
      res.status(201).json({
        ok: true,
        user
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Unable to process login."
      });
    }
  };

  router.post("/signup", handleSignup);
  router.post("/auth/signup", handleSignup);
  router.post("/login", handleLogin);
  router.post("/auth/login", handleLogin);

  return router;
}

module.exports = { createAuthRouter };
