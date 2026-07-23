"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDepositsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

  // Demo deposits
  const deposits = [
    { id: 1, user: "Adam Essays", email: "adamsocialsapp@gmail.com", amount: 100, method: "M-Pesa", status: "Pending", date: "Jul 23, 2026 14:20" },
    { id: 2, user: "Adam Essays", email: "adamsocialsapp@gmail.com", amount: 50, method: "Card", status: "Approved", date: "Jul 23, 2026 12:05" },
    { id: 3, user: "Adam Essays", email: "adamsocialsapp@gmail.com", amount: 200, method: "USDT", status: "Pending", date: "Jul 23, 2026 11:40" },
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
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Checking admin access...
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
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Trades
          </Link>
          <Link href="/admin/deposits" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">
            Deposits
          </Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Payment Methods
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
          <h1 className="text-xl font-bold">Deposits Management</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium">User</th>
                    <th className="text-left px-6 py-4 font-medium">Amount</th>
                    <th className="text-left px-6 py-4 font-medium">Method</th>
                    <th className="text-left px-6 py-4 font-medium">Status</th>
                    <th className="text-left px-6 py-4 font-medium">Date</th>
                    <th className="text-right px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium">{deposit.user}</div>
                        <div className="text-xs text-slate-400">{deposit.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-green-400">${deposit.amount}</td>
                      <td className="px-6 py-4">{deposit.method}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          deposit.status === "Approved" 
                            ? "bg-green-500/10 text-green-400" 
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{deposit.date}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {deposit.status === "Pending" && (
                          <>
                            <button className="text-green-400 hover:text-green-300 text-sm font-medium">Approve</button>
                            <button className="text-red-400 hover:text-red-300 text-sm font-medium">Reject</button>
                          </>
                        )}
                        {deposit.status === "Approved" && (
                          <span className="text-slate-500 text-sm">—</span>
                        )}
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