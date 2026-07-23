"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const trades = [
    { id: 1, time: "Jul 23, 10:42 AM", type: "Match", digit: 5, stake: 25, result: "WIN", profit: 212.5 },
    { id: 2, time: "Jul 23, 10:38 AM", type: "Differ", digit: 3, stake: 10, result: "LOSS", profit: -10 },
    { id: 3, time: "Jul 23, 10:31 AM", type: "Match", digit: 7, stake: 50, result: "WIN", profit: 425 },
    { id: 4, time: "Jul 23, 10:22 AM", type: "Differ", digit: 0, stake: 15, result: "LOSS", profit: -15 },
    { id: 5, time: "Jul 23, 10:15 AM", type: "Match", digit: 2, stake: 20, result: "WIN", profit: 170 },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === "WIN").length;
  const losses = trades.filter(t => t.result === "LOSS").length;
  const netProfit = trades.reduce((sum, t) => sum + t.profit, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
            <span className="text-xl font-bold">TagBinary</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/trade" className="hover:text-white transition">Trade</Link>
            <Link href="/history" className="text-white">History</Link>
            <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
            <Link href="/profile" className="hover:text-white transition">Profile</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Balance</div>
              <div className="font-semibold text-green-400">$1,000.00</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Trade History</h1>
            <p className="text-slate-400 mt-1">All your past trades in one place</p>
          </div>
        </div>

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
            <div className="text-sm text-slate-400">Net Profit</div>
            <div className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">Date & Time</th>
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
                    <td className="px-6 py-4">{trade.time}</td>
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
  );
}