"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trades, setTrades] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBalance(Number(profile.balance) || 0);
      }

      const { data: tradesData } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTrades(tradesData || []);
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
        Loading...
      </div>
    );
  }

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === "WIN").length;
  const losses = trades.filter(t => t.result === "LOSS").length;
  const netProfit = trades.reduce((sum, t) => sum + Number(t.profit || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">T</div>
              <span className="text-lg font-bold">tagforex</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/trade" className="hover:text-white transition">Trade</Link>
            <Link href="/history" className="text-white">History</Link>
            <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
            <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
            <Link href="/transactions" className="hover:text-white transition">Transactions</Link>
            <Link href="/profile" className="hover:text-white transition">Profile</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400">Balance</div>
              <div className="font-semibold text-green-400 text-sm">${balance.toFixed(2)}</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Dashboard</Link>
            <Link href="/trade" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Trade</Link>
            <Link href="/history" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm bg-blue-600/20 text-blue-400">History</Link>
            <Link href="/deposit" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Deposit</Link>
            <Link href="/withdraw" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Withdraw</Link>
            <Link href="/transactions" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Transactions</Link>
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Profile</Link>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Trade History</h1>
          <p className="text-slate-400 text-sm mt-1">All your past trades in one place</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Total Trades</div>
            <div className="text-xl font-bold mt-1">{totalTrades}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Wins</div>
            <div className="text-xl font-bold mt-1 text-green-400">{wins}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Losses</div>
            <div className="text-xl font-bold mt-1 text-red-400">{losses}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Net Profit</div>
            <div className={`text-xl font-bold mt-1 ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {trades.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              No trades yet. Go to the Trade page to place your first trade.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Digit</th>
                    <th className="text-left px-4 py-3 font-medium">Stake</th>
                    <th className="text-left px-4 py-3 font-medium">Result</th>
                    <th className="text-right px-4 py-3 font-medium">P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(trade.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize">{trade.type}</td>
                      <td className="px-4 py-3">{trade.digit}</td>
                      <td className="px-4 py-3">${Number(trade.stake).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={trade.result === "WIN" ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                          {trade.result}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${Number(trade.profit) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {Number(trade.profit) >= 0 ? "+" : ""}${Number(trade.profit).toFixed(2)}
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
  );
}