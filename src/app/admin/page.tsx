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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrades: 0,
    totalDeposits: 0,
  });

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

      setUser(session.user);
      setAuthorized(true);

      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: tradesCount } = await supabase
        .from("trades")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalTrades: tradesCount || 0,
        totalDeposits: 0,
      });

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
        Checking admin access...
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-slate-950 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-bold">tagforex Admin</span>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs bg-slate-800 px-3 py-2 rounded-lg">
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm bg-blue-600/20 text-blue-400">Dashboard</Link>
          <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Users</Link>
          <Link href="/admin/trades" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Trades</Link>
          <Link href="/admin/deposits" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Deposits</Link>
          <Link href="/admin/withdrawals" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Withdrawals</Link>
          <Link href="/admin/payment-methods" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Payment Methods</Link>
          <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Settings</Link>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
          <span className="text-lg font-bold">tagforex</span>
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
          <Link href="/admin/deposits" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Deposits
          </Link>
          <Link href="/admin/withdrawals" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Withdrawals
          </Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Payment Methods
          </Link>
          <Link href="/admin/settings" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="hidden md:flex border-b border-slate-800 px-6 py-4 items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="text-sm text-slate-400">
            Logged in as <span className="text-white">{user?.email}</span>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <h1 className="md:hidden text-xl font-bold mb-4">Admin Dashboard</h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
              <div className="text-xs md:text-sm text-slate-400">Total Users</div>
              <div className="text-2xl md:text-3xl font-bold mt-1">{stats.totalUsers}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
              <div className="text-xs md:text-sm text-slate-400">Total Trades</div>
              <div className="text-2xl md:text-3xl font-bold mt-1 text-green-400">{stats.totalTrades}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
              <div className="text-xs md:text-sm text-slate-400">Total Deposits</div>
              <div className="text-2xl md:text-3xl font-bold mt-1">${stats.totalDeposits}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
              <div className="text-xs md:text-sm text-slate-400">Platform Profit</div>
              <div className="text-2xl md:text-3xl font-bold mt-1 text-green-400">$0</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-semibold text-lg mb-2">Welcome to the Admin Panel</h2>
            <p className="text-slate-400 text-sm">
              This is the control center of tagforex. Use the menu to manage users, trades, deposits, and settings.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}