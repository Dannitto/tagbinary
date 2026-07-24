"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      if (session.user.email !== ADMIN_EMAIL) {
        router.replace("/dashboard");
        return;
      }

      setUser(session.user);
      setAuthorized(true);

      const { data } = await supabase
        .from("withdrawals")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order("created_at", { ascending: false });

      setWithdrawals(data || []);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateStatus = async (id: string, newStatus: string, userId: string, amount: number) => {
    const { error } = await supabase
      .from("withdrawals")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      setMessage("Error updating status");
      return;
    }

    // If approved, deduct from user's balance
    if (newStatus === "approved") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", userId)
        .single();

      if (profile) {
        const newBalance = Math.max(0, Number(profile.balance) - Number(amount));
        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", userId);
      }
    }

    setWithdrawals(withdrawals.map(w => 
      w.id === id ? { ...w, status: newStatus } : w
    ));

    setMessage(`Withdrawal ${newStatus}`);
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading withdrawals...
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
          <span className="text-lg font-bold">TagBinary</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link href="/admin" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Dashboard</Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Users</Link>
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Trades</Link>
          <Link href="/admin/deposits" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Deposits</Link>
          <Link href="/admin/withdrawals" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">Withdrawals</Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Payment Methods</Link>
          <Link href="/admin/settings" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Settings</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Withdrawals Management</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          {message && (
            <div className="mb-4 bg-green-900/30 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {withdrawals.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="text-left px-6 py-4 font-medium">User</th>
                      <th className="text-left px-6 py-4 font-medium">Amount</th>
                      <th className="text-left px-6 py-4 font-medium">Method</th>
                      <th className="text-left px-6 py-4 font-medium">Details</th>
                      <th className="text-left px-6 py-4 font-medium">Status</th>
                      <th className="text-left px-6 py-4 font-medium">Date</th>
                      <th className="text-right px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium">{w.profiles?.full_name || "User"}</div>
                          <div className="text-xs text-slate-400">{w.user_id?.slice(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-red-400">
                          ${Number(w.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 capitalize">{w.method}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs max-w-[150px] truncate">
                          {w.account_details || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            w.status === "approved" 
                              ? "bg-green-500/10 text-green-400" 
                              : w.status === "rejected"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(w.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          {w.status === "pending" ? (
                            <>
                              <button
                                onClick={() => updateStatus(w.id, "approved", w.user_id, w.amount)}
                                className="text-green-400 hover:text-green-300 text-sm font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(w.id, "rejected", w.user_id, w.amount)}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-500 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}