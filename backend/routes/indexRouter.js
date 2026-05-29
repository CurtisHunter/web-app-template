const { Router } = require("express");
const {
  healthCheck,
  createCheckoutSession,
  getBillingStatus,
  useDemoExternalApi,
} = require("../controllers/indexController");

const indexRouter = Router();

// Public health check for smoke testing the API server.
indexRouter.get("/api/health", healthCheck);

// Protected routes verify the Supabase bearer token inside the controller.
indexRouter.post("/api/create-checkout-session", createCheckoutSession);
indexRouter.get("/api/billing/status", getBillingStatus);
indexRouter.post("/api/demo/usage", useDemoExternalApi);

module.exports = indexRouter;
