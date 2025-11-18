import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ADMIN_TOKEN_STORAGE_KEY,
  adminLogin,
} from "../lib/api";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await adminLogin({ username, password });
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, data.token);
      }
      setSuccess("Admin login successful. Redirecting…");
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || "Unable to log in as admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin Console
        </h1>
        <p className="text-sm text-slate-600">
          Enter the shared admin credentials to access moderation tools.
        </p>
      </div>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring focus:ring-sky-100"
              placeholder="admin"
              required
            />
          </label>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring focus:ring-sky-100"
              placeholder="admin@123"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in as Admin"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Need to go back?{" "}
        <Link to="/" className="font-semibold text-sky-600 hover:underline">
          Return to home
        </Link>
        .
      </p>
    </section>
  );
}

export default AdminLoginPage;



