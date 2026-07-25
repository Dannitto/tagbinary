"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");

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
      if (profile) setBalance(Number(profile.balance) || 0);

      const { data: dep } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDeposits(dep || []);

      const { data: wit } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setWithdrawals(wit || []);

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
            <Link href="/history" className="hover:text-white transition">History</Link>
            <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
            <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
            <Link href="/transactions" className="text-white">Transactions</Link>
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
            <Link href="/history" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">History</Link>
            <Link href="/deposit" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Deposit</Link>
            <Link href="/withdraw" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Withdraw</Link>
            <Link href="/transactions" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm bg-blue-600/20 text-blue-400">Transactions</Link>
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Profile</Link>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">Your deposit and withdrawal history</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === "deposits" 
                ? "bg-blue-600 text-white" 
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === "withdrawals" 
                ? "bg-blue-600 text-white" 
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Withdrawals ({withdrawals.length})
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {activeTab === "deposits" && (
            deposits.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">No deposits yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">Method</th>
                      <th className="text-left px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {deposits.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-slate-400 text-xs">{new Date(d.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-green-400 font-medium">${Number(d.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 capitalize">{d.method}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            d.status === "approved" ? "bg-green-500/10 text-green-400" :
                            d.status === "rejected" ? "bg-red-500/10 text-red-400" :
                            "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === "withdrawals" && (
            withdrawals.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">No withdrawals yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">Method</th>
                      <th className="text-left px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-slate-400 text-xs">{new Date(w.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-red-400 font-medium">${Number(w.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 capitalize">{w.method}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            w.status === "approved" ? "bg-green-500/10 text-green-400" :
                            w.status === "rejected" ? "bg-red-500/10 text-red-400" :
                            "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}