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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-slate-950 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-bold">Withdrawals</span>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs bg-slate-800 px-3 py-2 rounded-lg">
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Dashboard</Link>
          <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Users</Link>
          <Link href="/admin/trades" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Trades</Link>
          <Link href="/admin/deposits" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Deposits</Link>
          <Link href="/admin/withdrawals" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm bg-blue-600/20 text-blue-400">Withdrawals</Link>
          <Link href="/admin/payment-methods" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Payment Methods</Link>
          <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Settings</Link>
        </div>
      )}

      {/* Desktop Sidebar */}
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
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="hidden md:flex border-b border-slate-800 px-6 py-4 items-center justify-between">
          <h1 className="text-xl font-bold">Withdrawals Management</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <h1 className="md:hidden text-xl font-bold mb-4">Withdrawals Management</h1>

          {message && (
            <div className="mb-4 bg-green-900/30 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {withdrawals.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">User</th>
                      <th className="text-left px-4 py-3 font-medium">Amount</th>
                      <th className="text-left px-4 py-3 font-medium">Method</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-right px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {w.user_id?.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 font-medium text-red-400">
                          ${Number(w.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 capitalize">{w.method}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            w.status === "approved" 
                              ? "bg-green-500/10 text-green-400" 
                              : w.status === "rejected"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {w.status === "pending" ? (
                            <>
                              <button
                                onClick={() => updateStatus(w.id, "approved", w.user_id, w.amount)}
                                className="text-green-400 hover:text-green-300 text-xs font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(w.id, "rejected", w.user_id, w.amount)}
                                className="text-red-400 hover:text-red-300 text-xs font-medium"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
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