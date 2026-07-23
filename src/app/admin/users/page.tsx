"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

  // Demo users for now (later we will load real ones from database)
  const users = [
    {
      id: 1,
      name: "Adam Essays",
      email: "adamsocialsapp@gmail.com",
      balance: 1000,
      status: "Active",
      joined: "Jul 23, 2026",
    },
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
          <Link href="/admin/users" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">
            Users
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Trades
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Deposits
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Payment Methods
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Users Management</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-6">
            <p className="text-slate-400 text-sm">
              Manage all registered users. (Currently showing demo data. We will connect real users from the database next.)
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium">Name</th>
                    <th className="text-left px-6 py-4 font-medium">Email</th>
                    <th className="text-left px-6 py-4 font-medium">Balance</th>
                    <th className="text-left px-6 py-4 font-medium">Status</th>
                    <th className="text-left px-6 py-4 font-medium">Joined</th>
                    <th className="text-right px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4 text-green-400">${u.balance.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2.5 py-1 rounded-full">
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{u.joined}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                          View
                        </button>
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