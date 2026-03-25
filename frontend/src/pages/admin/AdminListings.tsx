// frontend/src/pages/admin/AdminListings.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getListings, deleteListing } from "@/lib/admin-api";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "off_market", label: "Off market" },
];

export default function AdminListings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-listings", status, search],
    queryFn: () =>
      getListings({
        status: status || undefined,
        search: search || undefined,
        limit: 100,
      }),
  });

  const deleteM = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      setDeleteId(null);
    },
  });

  const listings = data?.listings || [];
  const total = data?.total ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-white">Listings</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} total</p>
        </div>
        <button
          onClick={() => navigate("/admin/listings/new")}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
        >
          + New Listing
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search title, reference, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-600"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-zinc-600"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-zinc-500">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-500 mb-3">
            {search || status ? "No listings match your filters" : "No listings yet"}
          </p>
          {!search && !status && (
            <button
              onClick={() => navigate("/admin/listings/new")}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              Create your first listing
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Ref
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Beds
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l: any) => (
                <tr
                  key={l.id}
                  className="border-b border-zinc-800/50 transition hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-3 text-xs text-zinc-500 font-mono">
                    {l.reference}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/admin/listings/${l.id}`)}
                      className="font-medium text-zinc-200 hover:text-white text-left transition"
                    >
                      {l.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 capitalize text-xs">
                    {l.property_type?.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {l.city}
                    {l.area ? `, ${l.area}` : ""}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                    {l.price
                      ? `€${Number(l.price).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-400">
                    {l.bedrooms ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/listings/${l.id}`)}
                        className="rounded px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(l.id);
                        }}
                        className="rounded px-2 py-1 text-xs text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-medium text-white mb-2">Delete listing?</h3>
            <p className="text-sm text-zinc-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteM.mutate(deleteId)}
                disabled={deleteM.isPending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteM.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
      {status?.replace("_", " ")}
    </span>
  );
}
