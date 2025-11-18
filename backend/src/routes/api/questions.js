const express = require("express");
const prisma = require("../../prisma");
const requireAuth = require("../../middlewares/auth");

const router = express.Router();

const authorSelect = {
  id: true,
  name: true,
};

router.get("/", async (req, res, next) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: authorSelect },
        _count: {
          select: { answers: true },
        },
      },
    });

    res.json(
      questions.map((question) => ({
        id: question.id,
        title: question.title,
        body: question.body,
        votes: question.votes,
        createdAt: question.createdAt,
        answerCount: question._count.answers,
        author: question.author,
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res
      .status(400)
      .json({ message: "Both title and body are required." });
  }

  try {
    const question = await prisma.question.create({
      data: { title, body, authorId: req.user.id },
      include: { author: { select: authorSelect } },
    });
    res.status(201).json({ ...question, answerCount: 0 });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid question id." });
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: authorSelect },
        answers: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: authorSelect } },
        },
      },
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.json(question);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/upvote", requireAuth, async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid question id." });
  }

  try {
    const question = await prisma.question.update({
      where: { id },
      data: { votes: { increment: 1 } },
      select: { votes: true },
    });

    res.json(question);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Question not found." });
    }
    next(error);
  }
});

router.post("/:id/answers", requireAuth, async (req, res, next) => {
  const questionId = Number(req.params.id);
  if (Number.isNaN(questionId)) {
    return res.status(400).json({ message: "Invalid question id." });
  }

  const body = (req.body.body || "").trim();
  if (!body) {
    return res.status(400).json({ message: "Answer body is required." });
  }

  try {
    // ensure question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    const answer = await prisma.answer.create({
      data: { questionId, body, authorId: req.user.id },
      include: { author: { select: authorSelect } },
    });

    res.status(201).json(answer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
