"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const currentUser = session.user;

      if (currentUser.email !== ADMIN_EMAIL) {
        router.replace("/dashboard");
        return;
      }

      setUser(currentUser);
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

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
          <span className="text-lg font-bold">TagBinary</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link href="/admin" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Users
          </Link>
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Trades
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
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Total Users</div>
              <div className="text-3xl font-bold mt-1">1</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Active Today</div>
              <div className="text-3xl font-bold mt-1 text-green-400">1</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Total Deposits</div>
              <div className="text-3xl font-bold mt-1">$0</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm text-slate-400">Platform Profit</div>
              <div className="text-3xl font-bold mt-1 text-green-400">$0</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-2">Welcome to the Admin Panel</h2>
            <p className="text-slate-400 text-sm">
              This is the control center of TagBinary.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}