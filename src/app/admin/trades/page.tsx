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

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

  const trades = [
    { id: 1, user: "Adam Essays", time: "Jul 23, 10:42 AM", type: "Match", digit: 5, stake: 25, result: "WIN", profit: 212.5 },
    { id: 2, user: "Adam Essays", time: "Jul 23, 10:38 AM", type: "Differ", digit: 3, stake: 10, result: "LOSS", profit: -10 },
    { id: 3, user: "Adam Essays", time: "Jul 23, 10:31 AM", type: "Match", digit: 7, stake: 50, result: "WIN", profit: 425 },
  ];

  useEffect(() => {
    const checkAdmin = async () => {
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
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Checking admin access...</div>;
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
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">Trades</Link>
          <Link href="/admin/deposits" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Deposits</Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Payment Methods</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">All Trades</h1>
          <div className="text-sm text-slate-400">Logged in as <span className="text-white">{user?.email}</span></div>
        </header>
        <main className="p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="text-left px-6 py-4">User</th>
                  <th className="text-left px-6 py-4">Time</th>
                  <th className="text-left px-6 py-4">Type</th>
                  <th className="text-left px-6 py-4">Digit</th>
                  <th className="text-left px-6 py-4">Stake</th>
                  <th className="text-left px-6 py-4">Result</th>
                  <th className="text-right px-6 py-4">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4">{trade.user}</td>
                    <td className="px-6 py-4 text-slate-400">{trade.time}</td>
                    <td className="px-6 py-4">{trade.type}</td>
                    <td className="px-6 py-4">{trade.digit}</td>
                    <td className="px-6 py-4">${trade.stake}</td>
                    <td className={`px-6 py-4 ${trade.result === "WIN" ? "text-green-400" : "text-red-400"}`}>{trade.result}</td>
                    <td className={`px-6 py-4 text-right ${trade.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {trade.profit >= 0 ? "+" : ""}{trade.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}