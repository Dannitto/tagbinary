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
          <Link href="/admin/trades" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Trades</Link>
          <Link href="/admin/payment-methods" className="block px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">Payment Methods</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 px-6 py-4">
          <h1 className="text-xl font-bold">Payment Methods Configuration</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure API keys and settings for each deposit method</p>
        </header>

        <main className="p-6 max-w-4xl space-y-6">
          {message && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {/* M-Pesa */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 text-green-400 rounded-xl flex items-center justify-center font-bold">M</div>
                <div>
                  <div className="font-semibold">M-Pesa</div>
                  <div className="text-xs text-slate-400">Safaricom Daraja API</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
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
            <div className="px-6 pb-5">
              <button onClick={() => handleSave("M-Pesa")} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
                Save M-Pesa Settings
              </button>
            </div>
          </div>

          {/* Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">C</div>
                <div>
                  <div className="font-semibold">Credit / Debit Card</div>
                  <div className="text-xs text-slate-400">Flutterwave / Stripe / Paystack</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Public Key</label>
                <input type="text" placeholder="Public Key" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Secret Key</label>
                <input type="password" placeholder="Secret Key" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div className="px-6 pb-5">
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