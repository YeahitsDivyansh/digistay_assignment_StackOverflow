const express = require("express");
const cors = require("cors");
const rateLimiter = require("./middlewares/rateLimiter");

const authRoutes = require("./routes/api/auth");
const questionRoutes = require("./routes/api/questions");
const answerRoutes = require("./routes/api/answers");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter(100, 60 * 1000));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = app;
