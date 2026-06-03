const { Router } = require("express");
const {
  healthCheck,
  createCheckoutSession,
  getBillingStatus,
  useDemoExternalApi,
} = require("../controllers/indexController");
const requireAuth = require("../middleware/requireAuth");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

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
indexRouter.post(
  "/api/demo/usage",
  requireAuth,
  body("prompt")
    .trim()
    .notEmpty()
    .withMessage("Prompt is required")
    .isLength({ max: 1000 })
    .withMessage("Prompt must be 1000 characters or less"),
  validateRequest,
  useDemoExternalApi,
);

module.exports = indexRouter;
