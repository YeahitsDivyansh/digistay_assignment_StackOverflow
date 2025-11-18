import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestions, upvoteQuestion } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions();
      setQuestions(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleUpvote = async (id) => {
    if (!isAuthenticated) {
      setError("Please sign in to upvote.");
      return;
    }

    try {
      await upvoteQuestion(id);
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === id
            ? { ...question, votes: question.votes + 1 }
            : question
        )
      );
    } catch (err) {
      setError(err.message || "Unable to upvote right now.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Top Questions</h1>
        <p className="text-sm text-slate-600">
          Simple StackOverflow-style flow. Sign in to ask, answer, or upvote.
        </p>
      </div>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading questions…</div>
      ) : questions.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No questions yet. Be the first to{" "}
          <Link className="text-sky-600 hover:underline" to="/ask">
            ask something
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-4">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => handleUpvote(question.id)}
                  disabled={!isAuthenticated}
                  className="flex flex-col items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                  title={
                    isAuthenticated ? "Upvote question" : "Sign in to vote"
                  }
                >
                  <span className="text-lg font-semibold">
                    {question.votes}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    votes
                  </span>
                </button>
                <div className="flex-1 space-y-2">
                  <Link
                    to={`/questions/${question.id}`}
                    className="text-lg font-semibold text-slate-900 hover:text-sky-600"
                  >
                    {question.title}
                  </Link>
                  <p className="text-sm text-slate-600">{question.body}</p>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {question.answerCount} answer
                    {question.answerCount === 1 ? "" : "s"} ·{" "}
                    {new Date(question.createdAt).toLocaleString()}
                    {question.author?.name
                      ? ` · Asked by ${question.author.name}`
                      : ""}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default HomePage;
