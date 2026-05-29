const { Router } = require("express");
const {
  healthCheck,
  createCheckoutSession,
  getBillingStatus,
} = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/api/health", healthCheck);
indexRouter.post("/api/create-checkout-session", createCheckoutSession);
indexRouter.get("/api/billing/status", getBillingStatus);

module.exports = indexRouter;
