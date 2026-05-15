require("dotenv").config();
const express = require("express");
const cors = require("cors");
const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");
const session = require("express-session");
const passport = require("passport");
require("./config/passport")(passport);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/api/auth", authRouter);

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
