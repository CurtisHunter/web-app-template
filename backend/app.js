require("dotenv").config();
const express = require("express");
const cors = require("cors");
const indexRouter = require("./routes/indexRouter");
const indexController = require("./controllers/indexController");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));

// adding this route before .json in order to use express.raw
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  indexController.handleStripeWebhook,
);
app.use(express.json());

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
