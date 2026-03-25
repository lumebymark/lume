// frontend/src/pages/admin/AdminLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, clearToken, verifyAuth } from "@/lib/admin-api";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "◻" },
  { to: "/admin/listings", label: "Listings", icon: "⌂" },
  { to: "/admin/contacts", label: "Contacts", icon: "✉" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
      return;
    }
    verifyAuth()
      .then(() => setVerified(true))
      .catch(() => {
        clearToken();
        navigate("/admin/login");
      });
  }, [navigate]);

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-950">
        {/* Logo */}
        <div className="flex h-14 items-center px-5 border-b border-zinc-800">
          <span className="text-sm font-light tracking-[0.2em] text-white">
            LUME
          </span>
          <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            CMS
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-300"
          >
            <span className="text-base">↗</span>
            View Site
          </a>
          <button
            onClick={() => {
              clearToken();
              navigate("/admin/login");
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-red-400"
          >
            <span className="text-base">⏻</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
