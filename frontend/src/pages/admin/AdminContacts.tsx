// frontend/src/pages/admin/AdminContacts.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, deleteContact } from "@/lib/admin-api";

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts", source, search],
    queryFn: () =>
      getContacts({
        source: source || undefined,
        search: search || undefined,
        limit: 100,
      }),
  });

  const deleteM = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      setDeleteId(null);
    },
  });

  const contacts = data?.contacts || [];
  const total = data?.total ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-light text-white">Contacts</h1>
        <p className="text-sm text-zinc-500 mt-1">{total} total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-600"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-zinc-600"
        >
          <option value="">All sources</option>
          <option value="questionnaire">Questionnaire</option>
          <option value="private_access">Private Access</option>
          <option value="newsletter">Newsletter</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-zinc-500">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-500">No contacts yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c: any) => (
                <>
                  <tr
                    key={c.id}
                    className="border-b border-zinc-800/50 transition hover:bg-zinc-900/50 cursor-pointer"
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  >
                    <td className="px-4 py-3 text-zinc-200">{c.email}</td>
                    <td className="px-4 py-3 text-zinc-400">{c.name || "—"}</td>
                    <td className="px-4 py-3">
                      <SourceBadge source={c.source} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(c.id);
                        }}
                        className="rounded px-2 py-1 text-xs text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expanded === c.id && (
                    <tr key={`${c.id}-detail`} className="border-b border-zinc-800/50">
                      <td colSpan={5} className="px-4 py-4 bg-zinc-900/30">
                        <div className="space-y-2 text-xs">
                          {c.phone && (
                            <div>
                              <span className="text-zinc-500">Phone:</span>{" "}
                              <span className="text-zinc-300">{c.phone}</span>
                            </div>
                          )}
                          {c.message && (
                            <div>
                              <span className="text-zinc-500">Message:</span>{" "}
                              <span className="text-zinc-300">{c.message}</span>
                            </div>
                          )}
                          {c.questionnaire_answers && (
                            <div>
                              <span className="text-zinc-500">Questionnaire:</span>
                              <pre className="mt-1 text-zinc-400 bg-zinc-900 rounded p-2 overflow-x-auto">
                                {JSON.stringify(c.questionnaire_answers, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-medium text-white mb-2">Delete contact?</h3>
            <p className="text-sm text-zinc-400 mb-6">This action cannot be undone.</p>
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

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    questionnaire: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    private_access: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    newsletter: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
        colors[source] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
      }`}
    >
      {source?.replace("_", " ") || "unknown"}
    </span>
  );
}
