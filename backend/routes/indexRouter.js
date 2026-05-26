const { Router } = require("express");
const {
  healthCheck,
  createCheckoutSession,
} = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/api/health", healthCheck);
indexRouter.post("/api/create-checkout-session", createCheckoutSession);

module.exports = indexRouter;
