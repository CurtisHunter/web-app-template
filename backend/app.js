require("dotenv").config();
const express = require("express");
const app = express();
const indexRouter = require("./routes/indexRouter");

const path = require("node:path");

app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

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
