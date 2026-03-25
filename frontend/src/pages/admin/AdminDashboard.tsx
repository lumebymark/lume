// frontend/src/pages/admin/AdminDashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getStats, getListings } from "@/lib/admin-api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getStats,
  });

  const { data: recentData } = useQuery({
    queryKey: ["admin-listings-recent"],
    queryFn: () => getListings({ limit: 5 }),
  });

  const recentListings = recentData?.listings || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of your content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Listings"
          value={stats?.total_listings ?? "—"}
          loading={statsLoading}
        />
        <StatCard
          label="Available"
          value={stats?.available_listings ?? "—"}
          loading={statsLoading}
          accent
        />
        <StatCard
          label="Contacts"
          value={stats?.total_contacts ?? "—"}
          loading={statsLoading}
        />
      </div>

      {/* Recent Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-300">Recent Listings</h2>
          <button
            onClick={() => navigate("/admin/listings")}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            View all →
          </button>
        </div>

        {recentListings.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <p className="text-sm text-zinc-500 mb-3">No listings yet</p>
            <button
              onClick={() => navigate("/admin/listings/new")}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              Create your first listing
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentListings.map((listing: any) => (
                  <tr
                    key={listing.id}
                    onClick={() => navigate(`/admin/listings/${listing.id}`)}
                    className="border-b border-zinc-800/50 cursor-pointer transition hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-200">{listing.title}</div>
                      <div className="text-xs text-zinc-500">{listing.reference}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {listing.city}{listing.area ? `, ${listing.area}` : ""}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {listing.price
                        ? `€${Number(listing.price).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={listing.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: string | number;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-3xl font-light ${accent ? "text-emerald-400" : "text-white"}`}>
        {loading ? "..." : value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    reserved: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    sold: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rented: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    off_market: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
        colors[status] || colors.draft
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
