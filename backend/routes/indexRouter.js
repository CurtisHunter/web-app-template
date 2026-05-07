const { Router } = require("express");
const { servePage } = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", servePage);

module.exports = indexRouter;
