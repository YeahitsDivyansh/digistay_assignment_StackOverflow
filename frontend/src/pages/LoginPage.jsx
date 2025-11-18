import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const authResponse = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });
      setSession(authResponse);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">
          Sign in to ask questions, share answers, and upvote.
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
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Don’t have an account?{" "}
        <Link to="/register" className="font-medium text-sky-600 hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;




