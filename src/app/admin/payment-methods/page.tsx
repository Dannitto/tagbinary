"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [message, setMessage] = useState("");

  const ADMIN_EMAIL = "adamsocialsapp@gmail.com";

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

  const handleSave = (method: string) => {
    setMessage(`${method} settings saved successfully (Demo)`);
    setTimeout(() => setMessage(""), 3000);
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
            <span className="font-bold">Payment Methods</span>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs bg-slate-800 px-3 py-2 rounded-lg">
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Dashboard</Link>
          <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Users</Link>
          <Link href="/admin/trades" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Trades</Link>
          <Link href="/admin/deposits" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Deposits</Link>
          <Link href="/admin/withdrawals" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Withdrawals</Link>
          <Link href="/admin/payment-methods" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm bg-blue-600/20 text-blue-400">Payment Methods</Link>
          <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300">Settings</Link>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
          <span className="text-lg font-bold">TagBinary</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link href="/admin" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Dashboard</Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Users</Link>
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Trades</Link>
          <Link href="/admin/deposits" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Deposits</Link>
          <Link href="/admin/withdrawals" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Withdrawals</Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">Payment Methods</Link>
          <Link href="/admin/settings" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Settings</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="hidden md:flex border-b border-slate-800 px-6 py-4">
          <h1 className="text-xl font-bold">Payment Methods Configuration</h1>
        </header>

        <main className="p-4 md:p-6 max-w-4xl space-y-5">
          <h1 className="md:hidden text-xl font-bold mb-2">Payment Methods</h1>
          <p className="text-sm text-slate-400 mb-4">Configure API keys and settings for each deposit method</p>

          {message && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {/* M-Pesa */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-600/20 text-green-400 rounded-xl flex items-center justify-center font-bold text-sm">M</div>
                <div>
                  <div className="font-semibold text-sm">M-Pesa</div>
                  <div className="text-xs text-slate-400">Safaricom Daraja API</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Consumer Key</label>
                <input type="text" placeholder="Enter Daraja Consumer Key" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Consumer Secret</label>
                <input type="password" placeholder="Enter Daraja Consumer Secret" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Shortcode / Paybill</label>
                <input type="text" placeholder="e.g. 174379" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Passkey</label>
                <input type="password" placeholder="Lipa Na M-Pesa Passkey" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => handleSave("M-Pesa")} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
                Save M-Pesa Settings
              </button>
            </div>
          </div>

          {/* Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center font-bold text-sm">C</div>
                <div>
                  <div className="font-semibold text-sm">Credit / Debit Card</div>
                  <div className="text-xs text-slate-400">Flutterwave / Stripe / Paystack</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Public Key</label>
                <input type="text" placeholder="Public Key" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Secret Key</label>
                <input type="password" placeholder="Secret Key" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => handleSave("Card")} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
                Save Card Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}