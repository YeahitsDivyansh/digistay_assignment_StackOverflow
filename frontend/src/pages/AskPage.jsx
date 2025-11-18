import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createQuestion } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

function AskPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Please provide both a title and a body.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const question = await createQuestion({
        title: form.title.trim(),
        body: form.body.trim(),
      });
      navigate(`/questions/${question.id}`);
    } catch (err) {
      setError(err.message || "Unable to create question right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Sign in to ask a question
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You need an account to post questions. Create one in a few seconds.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-600"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Ask a public question
        </h1>
        <p className="text-sm text-slate-600">
          Keep it concise and clear. Everyone can see and answer your question.
        </p>
      </div>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. How do I center a div?"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Body</span>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            rows={8}
            placeholder="Include all the details someone would need to help you."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post Question"}
        </button>
      </form>
    </section>
  );
}

export default AskPage;
