const { Router } = require("express");
const { healthCheck } = require("../controllers/indexController");
const {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
} = require("../controllers/authController");

const authRouter = Router();

authRouter.post("/sign-in", signIn);
authRouter.post("/sign-up", signUp);
authRouter.post("/sign-out", signOut);
authRouter.get("/me", getCurrentUser);

module.exports = authRouter;
