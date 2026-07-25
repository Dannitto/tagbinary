"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setFullName(user.user_metadata?.full_name || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBalance(Number(profile.balance) || 0);
        if (profile.full_name) setFullName(profile.full_name);
      }

      setLoading(false);
    };
    loadUser();
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
              <span className="text-lg font-bold">TagBinary</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/trade" className="hover:text-white transition">Trade</Link>
            <Link href="/history" className="hover:text-white transition">History</Link>
            <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
            <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
            <Link href="/transactions" className="hover:text-white transition">Transactions</Link>
            <Link href="/profile" className="text-white">Profile</Link>
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
            <Link href="/transactions" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Transactions</Link>
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm bg-blue-600/20 text-blue-400">Profile</Link>
          </div>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Your account information</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {(fullName || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-bold">{fullName || "User"}</div>
              <div className="text-sm text-slate-400">{user?.email}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Full Name</span>
              <span className="font-medium">{fullName || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Email</span>
              <span className="font-medium text-sm">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Account Balance</span>
              <span className="font-medium text-green-400">${balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 text-sm">User ID</span>
              <span className="font-medium text-xs text-slate-500">{user?.id?.slice(0, 12)}...</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium py-3.5 rounded-xl border border-red-600/30 transition"
        >
          Logout
        </button>
      </main>
    </div>
  );
}