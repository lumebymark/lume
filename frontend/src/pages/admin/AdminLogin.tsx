// frontend/src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/admin-api";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-[0.2em] text-admin-text">LUME</h1>
          <p className="mt-1 text-xs tracking-[0.15em] uppercase text-admin-text-muted">
            Content Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="w-full rounded-md border border-admin-border bg-admin-surface px-4 py-3 text-sm text-admin-text placeholder-admin-text-muted outline-none transition focus:border-admin-text-muted focus:ring-1 focus:ring-admin-border"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-md bg-admin-btn px-4 py-3 text-sm font-medium text-white transition hover:bg-admin-btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center">
          <a href="/" className="text-xs text-admin-text-muted transition hover:text-admin-text-secondary">
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
