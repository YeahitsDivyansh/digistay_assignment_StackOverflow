const express = require("express");
const prisma = require("../../prisma");
const requireAuth = require("../../middlewares/auth");

const router = express.Router();

router.post("/:id/upvote", requireAuth, async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid answer id." });
  }

  try {
    const answer = await prisma.answer.update({
      where: { id },
      data: { votes: { increment: 1 } },
      select: { votes: true },
    });

    res.json(answer);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Answer not found." });
    }
    next(error);
  }
});

module.exports = router;
