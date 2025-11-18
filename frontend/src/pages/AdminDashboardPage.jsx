import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ADMIN_TOKEN_STORAGE_KEY,
  deleteAnswerAsAdmin,
  deleteQuestionAsAdmin,
  fetchAdminStats,
  updateUserRoleAsAdmin,
} from "../lib/api";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [questionId, setQuestionId] = useState("");
  const [answerId, setAnswerId] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("USER");

  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionPending, setActionPending] = useState(false);

  const resetAdminSession = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    setGlobalError("");
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      if (err.status === 401) {
        resetAdminSession();
      } else {
        setGlobalError(err.message || "Unable to load admin statistics.");
      }
    } finally {
      setLoadingStats(false);
    }
  }, [resetAdminSession]);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
        : null;
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadStats();
  }, [navigate, loadStats]);

  const handleLogout = () => {
    resetAdminSession();
  };

  const runAction = useCallback(
    async (fn, successMessage) => {
    setActionPending(true);
    setActionMessage("");
    setActionError("");
    try {
      await fn();
      setActionMessage(successMessage);
      loadStats();
    } catch (err) {
      if (err.status === 401) {
        resetAdminSession();
      } else {
        setActionError(err.message || "Action failed.");
      }
    } finally {
      setActionPending(false);
    }
    },
    [loadStats, resetAdminSession]
  );

  const handleDeleteQuestion = (event) => {
    event.preventDefault();
    const id = Number(questionId);
    if (!Number.isInteger(id) || id <= 0) {
      setActionError("Enter a valid numeric question ID.");
      return;
    }
    runAction(
      () => deleteQuestionAsAdmin(id),
      `Question #${id} deleted successfully.`
    );
  };

  const handleDeleteAnswer = (event) => {
    event.preventDefault();
    const id = Number(answerId);
    if (!Number.isInteger(id) || id <= 0) {
      setActionError("Enter a valid numeric answer ID.");
      return;
    }
    runAction(
      () => deleteAnswerAsAdmin(id),
      `Answer #${id} deleted successfully.`
    );
  };

  const handleUpdateRole = (event) => {
    event.preventDefault();
    const id = Number(userId);
    if (!Number.isInteger(id) || id <= 0) {
      setActionError("Enter a valid numeric user ID.");
      return;
    }
    runAction(
      () => updateUserRoleAsAdmin(id, role),
      `Updated user #${id} role to ${role}.`
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Admin Console
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Moderation Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            View stats, remove problematic content, and promote trusted users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadStats}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-sky-200 hover:text-sky-600"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Sign out
          </button>
        </div>
      </div>

      {globalError && (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {globalError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {["users", "questions", "answers"].map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {key}
            </p>
            <p className="text-3xl font-semibold text-slate-900">
              {loadingStats ? "…" : stats?.[key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

        {actionError && (
          <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {actionError}
          </div>
        )}
        {actionMessage && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {actionMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={handleDeleteQuestion} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Delete Question
            </h3>
            <input
              type="number"
              min="1"
              value={questionId}
              onChange={(event) => setQuestionId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring focus:ring-rose-100"
              placeholder="Question ID"
              required
            />
            <button
              type="submit"
              disabled={actionPending}
              className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionPending ? "Working…" : "Delete question"}
            </button>
          </form>

          <form onSubmit={handleDeleteAnswer} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Delete Answer
            </h3>
            <input
              type="number"
              min="1"
              value={answerId}
              onChange={(event) => setAnswerId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring focus:ring-rose-100"
              placeholder="Answer ID"
              required
            />
            <button
              type="submit"
              disabled={actionPending}
              className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionPending ? "Working…" : "Delete answer"}
            </button>
          </form>

          <form onSubmit={handleUpdateRole} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Update User Role
            </h3>
            <input
              type="number"
              min="1"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-300 focus:outline-none focus:ring focus:ring-sky-100"
              placeholder="User ID"
              required
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-300 focus:outline-none focus:ring focus:ring-sky-100"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button
              type="submit"
              disabled={actionPending}
              className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionPending ? "Working…" : "Update role"}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Need the public experience instead?{" "}
        <Link to="/" className="font-semibold text-sky-600 hover:underline">
          Back to StackLite
        </Link>
        .
      </p>
    </section>
  );
}

export default AdminDashboardPage;


