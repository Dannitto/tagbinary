"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [wins, setWins] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Load real balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBalance(Number(profile.balance) || 0);
      }

      // Load real trades stats
      const { data: trades } = await supabase
        .from("trades")
        .select("result, profit")
        .eq("user_id", user.id);

      if (trades) {
        setTotalTrades(trades.length);
        setWins(trades.filter(t => t.result === "WIN").length);
        setNetProfit(trades.reduce((sum, t) => sum + Number(t.profit || 0), 0));
      }

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

  const fullName = user?.user_metadata?.full_name || "Trader";
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
            <span className="text-xl font-bold">TagBinary</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <Link href="/trade" className="hover:text-white transition">Trade</Link>
            <Link href="/history" className="hover:text-white transition">History</Link>
            <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
            <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
            <Link href="/profile" className="hover:text-white transition">Profile</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Balance</div>
              <div className="font-semibold text-green-400">${balance.toFixed(2)}</div>
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {fullName} 👋</h1>
          <p className="text-slate-400 mt-1">Here’s an overview of your trading account</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-sm text-slate-400 mb-1">Account Balance</div>
            <div className="text-3xl font-bold text-green-400">${balance.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-2">Available to trade</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-sm text-slate-400 mb-1">Total Profit/Loss</div>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-2">All time</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-sm text-slate-400 mb-1">Win Rate</div>
            <div className="text-3xl font-bold">{winRate}%</div>
            <div className="text-xs text-slate-500 mt-2">Last {totalTrades} trades</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-sm text-slate-400 mb-1">Total Trades</div>
            <div className="text-3xl font-bold">{totalTrades}</div>
            <div className="text-xs text-slate-500 mt-2">Completed</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          <Link href="/trade" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition">
            Start Trading
          </Link>
          <Link href="/deposit" className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl transition border border-slate-700">
            Deposit Funds
          </Link>
          <Link href="/withdraw" className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl transition border border-slate-700">
            Withdraw
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Recent Activity</h2>
            <Link href="/history" className="text-sm text-blue-500 hover:text-blue-400">View all</Link>
          </div>
          <div className="p-10 text-center text-slate-500">
            {totalTrades === 0 
              ? "Your trade history will appear here once you start trading."
              : `You have completed ${totalTrades} trades. Go to History for full details.`
            }
          </div>
        </div>
      </main>
    </div>
  );
}