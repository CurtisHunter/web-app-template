require("dotenv").config();
const express = require("express");
const cors = require("cors");
const indexRouter = require("./routes/indexRouter");
const indexController = require("./controllers/indexController");
const apiRateLimiter = require("./middleware/rateLimit");

const app = express();

// The frontend runs on a separate Vite origin during local development.
// Keep the allowed origin in env so production can use the deployed URL.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));

// Stripe signature verification needs the raw request body. This route must
// stay before express.json(), otherwise Stripe webhook verification will fail.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  indexController.handleStripeWebhook,
);
app.use(express.json());

app.use("/api", apiRateLimiter);
app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;

async function startServer() {
  app.listen(PORT, (error) => {
    if (error) {
      throw error;
    }
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
