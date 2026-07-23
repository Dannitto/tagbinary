"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminTradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

  // Demo trades (later we will load real ones from database)
  const trades = [
    { id: 1, user: "Adam Essays", time: "Jul 23, 10:42 AM", type: "Match", digit: 5, stake: 25, result: "WIN", profit: 212.5 },
    { id: 2, user: "Adam Essays", time: "Jul 23, 10:38 AM", type: "Differ", digit: 3, stake: 10, result: "LOSS", profit: -10 },
    { id: 3, user: "Adam Essays", time: "Jul 23, 10:31 AM", type: "Match", digit: 7, stake: 50, result: "WIN", profit: 425 },
    { id: 4, user: "Adam Essays", time: "Jul 23, 10:22 AM", type: "Differ", digit: 0, stake: 15, result: "LOSS", profit: -15 },
    { id: 5, user: "Adam Essays", time: "Jul 23, 10:15 AM", type: "Match", digit: 2, stake: 20, result: "WIN", profit: 170 },
  ];

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push("/dashboard");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Checking admin access...
      </div>
    );
  }

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === "WIN").length;
  const losses = trades.filter(t => t.result === "LOSS").length;
  const netProfit = trades.reduce((sum, t) => sum + t.profit, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
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
          <Link href="#" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Deposits
          </Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Payment Methods
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">All Trades</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Total Trades</div>
              <div className="text-2xl font-bold mt-1">{totalTrades}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Wins</div>
              <div className="text-2xl font-bold mt-1 text-green-400">{wins}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Losses</div>
              <div className="text-2xl font-bold mt-1 text-red-400">{losses}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Net P/L</div>
              <div className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
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
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-medium">{trade.user}</td>
                      <td className="px-6 py-4 text-slate-400">{trade.time}</td>
                      <td className="px-6 py-4">{trade.type}</td>
                      <td className="px-6 py-4">{trade.digit}</td>
                      <td className="px-6 py-4">${trade.stake.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={trade.result === "WIN" ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                          {trade.result}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${trade.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}