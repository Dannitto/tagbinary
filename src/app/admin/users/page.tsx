"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editBalance, setEditBalance] = useState(0);

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
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

      // Load real users from profiles table
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading users:", error);
      } else {
        setUsers(profiles || []);
      }

      setLoading(false);
    };

    checkAdminAndLoadUsers();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const openEdit = (u: any) => {
    setEditingUser(u);
    setEditBalance(Number(u.balance) || 0);
  };

  const saveBalance = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from("profiles")
      .update({ balance: editBalance })
      .eq("id", editingUser.id);

    if (error) {
      setMessage("Error updating balance");
    } else {
      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, balance: editBalance } : u
      ));
      setMessage(`Balance updated for ${editingUser.full_name || editingUser.email}`);
    }

    setEditingUser(null);
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleBan = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !currentStatus })
      .eq("id", id);

    if (!error) {
      setUsers(users.map(u => 
        u.id === id ? { ...u, is_banned: !currentStatus } : u
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading users...
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
          <h1 className="text-xl font-bold">Users Management</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          {message && (
            <div className="mb-4 bg-green-900/30 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <div className="mb-4 text-sm text-slate-400">
            Total users: <span className="text-white font-medium">{users.length}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium">Name</th>
                    <th className="text-left px-6 py-4 font-medium">Email / ID</th>
                    <th className="text-left px-6 py-4 font-medium">Balance</th>
                    <th className="text-left px-6 py-4 font-medium">Type</th>
                    <th className="text-left px-6 py-4 font-medium">Status</th>
                    <th className="text-right px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                        No users found yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 font-medium">
                          {u.full_name || "No name"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {u.id}
                        </td>
                        <td className="px-6 py-4 text-green-400 font-medium">
                          ${Number(u.balance || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            u.account_type === "real" 
                              ? "bg-blue-500/10 text-blue-400" 
                              : "bg-purple-500/10 text-purple-400"
                          }`}>
                            {u.account_type || "demo"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            u.is_banned 
                              ? "bg-red-500/10 text-red-400" 
                              : "bg-green-500/10 text-green-400"
                          }`}>
                            {u.is_banned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button 
                            onClick={() => openEdit(u)} 
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Edit Balance
                          </button>
                          <button 
                            onClick={() => toggleBan(u.id, u.is_banned)} 
                            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                          >
                            {u.is_banned ? "Unban" : "Ban"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit Balance – {editingUser.full_name || "User"}
            </h3>
            <div className="mb-5">
              <label className="block text-sm text-slate-400 mb-1.5">New Balance ($)</label>
              <input
                type="number"
                value={editBalance}
                onChange={(e) => setEditBalance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveBalance}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl"
              >
                Save
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}