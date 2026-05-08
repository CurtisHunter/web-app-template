const { Router } = require("express");
const { healthCheck } = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/api/health", healthCheck);

module.exports = indexRouter;
