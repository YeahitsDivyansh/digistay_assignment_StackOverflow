import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AskPage from "./pages/AskPage";
import HomePage from "./pages/HomePage";
import QuestionPage from "./pages/QuestionPage";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { isAuthenticated, user, logout, authLoading } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 text-sm font-medium text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="text-2xl font-semibold text-sky-600">
              StackLite
            </Link>
            <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100"
                >
                  Questions
                </Link>
                <Link
                  to="/ask"
                  className="rounded-lg bg-sky-600 px-3 py-1.5 text-white shadow-sm transition hover:bg-sky-700"
                >
                  Ask Question
                </Link>
                <Link
                  to="/admin/login"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  Admin
                </Link>
              </div>

              {authLoading ? (
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Checking session…
                </span>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {user?.name || "User"}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:border-sky-200 hover:text-sky-600"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/questions/:id" element={<QuestionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
