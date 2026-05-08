require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const indexRouter = require("./routes/indexRouter");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use("/", indexRouter);

const PORT = 3000;

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
