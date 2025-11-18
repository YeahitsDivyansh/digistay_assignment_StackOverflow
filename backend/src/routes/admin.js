const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const ADMIN_TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY || "1d";

router.post("/login", (req, res) => {
  const username = (req.body.username || "").trim();
  const password = req.body.password || "";

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  const token = jwt.sign(
    {
      kind: "ADMIN",
      username: ADMIN_USERNAME,
    },
    JWT_SECRET,
    { expiresIn: ADMIN_TOKEN_EXPIRY }
  );

  return res.json({ token, expiresIn: ADMIN_TOKEN_EXPIRY });
});

router.use(adminAuth);

router.get("/stats", async (req, res, next) => {
  try {
    const [userCount, questionCount, answerCount] = await prisma.$transaction([
      prisma.user.count(),
      prisma.question.count(),
      prisma.answer.count(),
    ]);

    res.json({
      users: userCount,
      questions: questionCount,
      answers: answerCount,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/questions/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid question id." });
  }

  try {
    await prisma.question.delete({ where: { id } });
    res.json({ message: "Question deleted." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Question not found." });
    }
    next(error);
  }
});

router.delete("/answers/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid answer id." });
  }

  try {
    await prisma.answer.delete({ where: { id } });
    res.json({ message: "Answer deleted." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Answer not found." });
    }
    next(error);
  }
});

router.patch("/users/:id/role", async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const role = (req.body.role || "").toUpperCase();
  const allowedRoles = ["USER", "ADMIN"];
  if (!allowedRoles.includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be one of: USER, ADMIN." });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found." });
    }
    next(error);
  }
});

module.exports = router;




