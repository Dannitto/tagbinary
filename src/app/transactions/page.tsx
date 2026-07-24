"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

      // Balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();
      if (profile) setBalance(Number(profile.balance) || 0);

      // Deposits
      const { data: dep } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDeposits(dep || []);

      // Withdrawals
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
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
            <span className="text-xl font-bold">TagBinary</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/trade" className="hover:text-white transition">Trade</Link>
            <Link href="/history" className="hover:text-white transition">History</Link>
            <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
            <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
            <Link href="/transactions" className="text-white">Transactions</Link>
            <Link href="/profile" className="hover:text-white transition">Profile</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Balance</div>
              <div className="font-semibold text-green-400">${balance.toFixed(2)}</div>
            </div>
            <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-slate-400 mt-1">Your deposit and withdrawal history</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === "deposits" 
                ? "bg-blue-600 text-white" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === "withdrawals" 
                ? "bg-blue-600 text-white" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Withdrawals ({withdrawals.length})
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {activeTab === "deposits" && (
            deposits.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No deposits yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="text-left px-6 py-4">Date</th>
                    <th className="text-left px-6 py-4">Amount</th>
                    <th className="text-left px-6 py-4">Method</th>
                    <th className="text-left px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 text-slate-400">{new Date(d.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">${Number(d.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 capitalize">{d.method}</td>
                      <td className="px-6 py-4">
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
            )
          )}

          {activeTab === "withdrawals" && (
            withdrawals.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No withdrawals yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="text-left px-6 py-4">Date</th>
                    <th className="text-left px-6 py-4">Amount</th>
                    <th className="text-left px-6 py-4">Method</th>
                    <th className="text-left px-6 py-4">Details</th>
                    <th className="text-left px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 text-slate-400">{new Date(w.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-red-400 font-medium">${Number(w.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 capitalize">{w.method}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{w.account_details || "—"}</td>
                      <td className="px-6 py-4">
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
            )
          )}
        </div>
      </main>
    </div>
  );
}