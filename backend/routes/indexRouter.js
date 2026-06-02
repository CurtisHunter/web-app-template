const { Router } = require("express");
const {
  healthCheck,
  createCheckoutSession,
  getBillingStatus,
  useDemoExternalApi,
} = require("../controllers/indexController");
const requireAuth = require("../middleware/requireAuth");

const indexRouter = Router();

// Public health check for smoke testing the API server.
indexRouter.get("/api/health", healthCheck);

// Protected routes verify the Supabase bearer token in requireAuth middleware.
indexRouter.post(
  "/api/create-checkout-session",
  requireAuth,
  createCheckoutSession,
);
indexRouter.get("/api/billing/status", requireAuth, getBillingStatus);
indexRouter.post("/api/demo/usage", requireAuth, useDemoExternalApi);

module.exports = indexRouter;
