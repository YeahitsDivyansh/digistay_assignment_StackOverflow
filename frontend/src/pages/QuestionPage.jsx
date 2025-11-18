import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addAnswer,
  getQuestion,
  upvoteAnswer,
  upvoteQuestion,
} from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answerBody, setAnswerBody] = useState("");
  const [sendingAnswer, setSendingAnswer] = useState(false);

  const loadQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuestion(id);
      setQuestion(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!Number.isNaN(Number(id))) {
      loadQuestion();
    } else {
      navigate("/");
    }
  }, [id, loadQuestion, navigate]);

  const handleQuestionUpvote = async () => {
    if (!isAuthenticated) {
      setError("Please sign in to vote.");
      return;
    }

    try {
      await upvoteQuestion(id);
      setQuestion((prev) => (prev ? { ...prev, votes: prev.votes + 1 } : prev));
    } catch (err) {
      setError(err.message || "Unable to upvote question right now.");
    }
  };

  const handleAnswerSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setError("Please sign in to add an answer.");
      return;
    }

    if (!answerBody.trim()) {
      setError("Answer body cannot be empty.");
      return;
    }

    try {
      setSendingAnswer(true);
      setError("");
      await addAnswer(id, answerBody.trim());
      setAnswerBody("");
      await loadQuestion();
    } catch (err) {
      setError(err.message || "Unable to post answer right now.");
    } finally {
      setSendingAnswer(false);
    }
  };

  const handleAnswerUpvote = async (answerId) => {
    if (!isAuthenticated) {
      setError("Please sign in to vote on answers.");
      return;
    }

    try {
      await upvoteAnswer(answerId);
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              answers: prev.answers.map((answer) =>
                answer.id === answerId
                  ? { ...answer, votes: answer.votes + 1 }
                  : answer
              ),
            }
          : prev
      );
    } catch (err) {
      setError(err.message || "Unable to upvote answer right now.");
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500">Loading question details…</div>
    );
  }

  if (!question) {
    return (
      <div className="space-y-4 rounded border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
        <p>We couldn’t find that question.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-200 hover:text-sky-600"
        >
          Back to questions
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-start gap-4">
          <button
            type="button"
            onClick={handleQuestionUpvote}
            disabled={!isAuthenticated}
            className="flex flex-col items-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            title={isAuthenticated ? "Upvote question" : "Sign in to vote"}
          >
            <span className="text-2xl font-semibold">{question.votes}</span>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              votes
            </span>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              {question.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Asked on {new Date(question.createdAt).toLocaleString()}
              {question.author?.name ? ` · by ${question.author.name}` : ""}
            </p>
          </div>
        </header>
        <p className="whitespace-pre-line text-base text-slate-800">
          {question.body}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {question.answers.length} Answers
        </h2>

        {question.answers.length === 0 ? (
          <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No answers yet. Share what you know!
          </div>
        ) : (
          <ul className="space-y-4">
            {question.answers.map((answer) => (
              <li
                key={answer.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleAnswerUpvote(answer.id)}
                    disabled={!isAuthenticated}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                    title={
                      isAuthenticated ? "Upvote answer" : "Sign in to vote"
                    }
                  >
                    <span className="text-base font-semibold">
                      {answer.votes}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      votes
                    </span>
                  </button>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {new Date(answer.createdAt).toLocaleString()}
                    {answer.author?.name ? ` · by ${answer.author.name}` : ""}
                  </span>
                </div>
                <p className="whitespace-pre-line text-slate-800">
                  {answer.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Add your answer
        </h3>
        {isAuthenticated ? (
          <form className="space-y-4" onSubmit={handleAnswerSubmit}>
            <textarea
              value={answerBody}
              onChange={(event) => setAnswerBody(event.target.value)}
              rows={6}
              placeholder="Share your knowledge…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="submit"
              disabled={sendingAnswer}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendingAnswer ? "Posting…" : "Post Answer"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-600">
            <Link to="/login" className="text-sky-600 hover:underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link to="/register" className="text-sky-600 hover:underline">
              create an account
            </Link>{" "}
            to share an answer.
          </p>
        )}
      </section>
    </article>
  );
}

export default QuestionPage;
