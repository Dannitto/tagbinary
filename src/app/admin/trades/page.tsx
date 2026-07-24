"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminTradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [trades, setTrades] = useState<any[]>([]);

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

      // Load all trades
      const { data } = await supabase
        .from("trades")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      setTrades(data || []);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading trades...
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
          <Link href="/admin" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Users
          </Link>
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">
            Trades
          </Link>
          <Link href="/admin/deposits" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Deposits
          </Link>
          <Link href="/admin/withdrawals" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Withdrawals
          </Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Payment Methods
          </Link>
          <Link href="/admin/settings" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">All Trades</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {trades.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No trades yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="text-left px-6 py-4 font-medium">User</th>
                      <th className="text-left px-6 py-4 font-medium">Time</th>
                      <th className="text-left px-6 py-4 font-medium">Type</th>
                      <th className="text-left px-6 py-4 font-medium">Digit</th>
                      <th className="text-left px-6 py-4 font-medium">Stake</th>
                      <th className="text-left px-6 py-4 font-medium">Result</th>
                      <th className="text-right px-6 py-4 font-medium">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {trades.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4">
                          {t.profiles?.full_name || "User"}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(t.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 capitalize">{t.type}</td>
                        <td className="px-6 py-4">{t.digit}</td>
                        <td className="px-6 py-4">${Number(t.stake).toFixed(2)}</td>
                        <td className={`px-6 py-4 font-medium ${t.result === "WIN" ? "text-green-400" : "text-red-400"}`}>
                          {t.result}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${Number(t.profit) >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {Number(t.profit) >= 0 ? "+" : ""}{Number(t.profit).toFixed(2)}
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