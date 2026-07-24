"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [editBalance, setEditBalance] = useState(0);
  const [isEditingBalance, setIsEditingBalance] = useState(false);

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

      setAdmin(session.user);
      setAuthorized(true);

      // Load user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditBalance(Number(profileData.balance) || 0);
      }

      // Load user trades
      const { data: tradesData } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setTrades(tradesData || []);
      setLoading(false);
    };

    loadData();
  }, [router, userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const saveBalance = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ balance: editBalance })
      .eq("id", userId);

    if (error) {
      setMessage("Error updating balance");
    } else {
      setProfile({ ...profile, balance: editBalance });
      setMessage("Balance updated successfully");
      setIsEditingBalance(false);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleBan = async () => {
    const newStatus = !profile.is_banned;
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: newStatus })
      .eq("id", userId);

    if (!error) {
      setProfile({ ...profile, is_banned: newStatus });
      setMessage(newStatus ? "User banned" : "User unbanned");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading user details...
      </div>
    );
  }

  if (!authorized || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        User not found
      </div>
    );
  }

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === "WIN").length;
  const netProfit = trades.reduce((sum, t) => sum + Number(t.profit || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
          <span className="text-lg font-bold">TagBinary</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link href="/admin" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Dashboard</Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">Users</Link>
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Trades</Link>
          <Link href="/admin/deposits" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Deposits</Link>
          <Link href="/admin/withdrawals" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Withdrawals</Link>
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
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/users" className="text-slate-400 hover:text-white text-sm">
              ← Back to Users
            </Link>
            <h1 className="text-xl font-bold">User Details</h1>
          </div>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{admin?.email}</span>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {message && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {(profile.full_name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile.full_name || "No name"}</h2>
                  <p className="text-slate-400 text-sm">{profile.id}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={toggleBan}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    profile.is_banned 
                      ? "bg-green-600 hover:bg-green-500 text-white" 
                      : "bg-red-600 hover:bg-red-500 text-white"
                  }`}
                >
                  {profile.is_banned ? "Unban User" : "Ban User"}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Balance</div>
                {isEditingBalance ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <button onClick={saveBalance} className="bg-blue-600 text-white px-3 rounded-lg text-sm">Save</button>
                    <button onClick={() => setIsEditingBalance(false)} className="bg-slate-700 text-white px-3 rounded-lg text-sm">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-green-400">${Number(profile.balance || 0).toFixed(2)}</div>
                    <button onClick={() => setIsEditingBalance(true)} className="text-blue-400 text-sm hover:underline">Edit</button>
                  </div>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Account Type</div>
                <div className="text-lg font-semibold capitalize">{profile.account_type || "demo"}</div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Status</div>
                <div className={`text-lg font-semibold ${profile.is_banned ? "text-red-400" : "text-green-400"}`}>
                  {profile.is_banned ? "Banned" : "Active"}
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Joined</div>
                <div className="text-lg font-semibold">
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Total Trades</div>
              <div className="text-2xl font-bold mt-1">{totalTrades}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Wins</div>
              <div className="text-2xl font-bold mt-1 text-green-400">{wins}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Net Profit</div>
              <div className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {netProfit >= 0 ? "+" : ""}{netProfit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Trade History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="font-semibold">Trade History</h3>
            </div>
            {trades.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No trades yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="text-left px-6 py-3">Date</th>
                      <th className="text-left px-6 py-3">Type</th>
                      <th className="text-left px-6 py-3">Digit</th>
                      <th className="text-left px-6 py-3">Stake</th>
                      <th className="text-left px-6 py-3">Result</th>
                      <th className="text-right px-6 py-3">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {trades.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="px-6 py-3 text-slate-400">
                          {new Date(t.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 capitalize">{t.type}</td>
                        <td className="px-6 py-3">{t.digit}</td>
                        <td className="px-6 py-3">${Number(t.stake).toFixed(2)}</td>
                        <td className={`px-6 py-3 font-medium ${t.result === "WIN" ? "text-green-400" : "text-red-400"}`}>
                          {t.result}
                        </td>
                        <td className={`px-6 py-3 text-right font-medium ${Number(t.profit) >= 0 ? "text-green-400" : "text-red-400"}`}>
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