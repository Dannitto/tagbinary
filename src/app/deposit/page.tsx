"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DepositPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(50);
  const [method, setMethod] = useState("mpesa");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBalance(Number(profile.balance) || 0);
      }

      setLoading(false);
    };
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeposit = async () => {
    if (!user) return;
    if (amount < 10) {
      setMessage("Minimum deposit is $10");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.from("deposits").insert({
      user_id: user.id,
      amount: amount,
      method: method,
      status: "pending",
    });

    if (error) {
      setMessage("Error submitting deposit. Please try again.");
      console.error(error);
    } else {
      setMessage(`Deposit request of $${amount} via ${method.toUpperCase()} has been submitted successfully. Waiting for admin approval.`);
    }

    setSubmitting(false);
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
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
            <span className="text-xl font-bold">TagBinary</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/trade" className="hover:text-white transition">Trade</Link>
            <Link href="/history" className="hover:text-white transition">History</Link>
            <Link href="/deposit" className="text-white">Deposit</Link>
            <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
            <Link href="/profile" className="hover:text-white transition">Profile</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Balance</div>
              <div className="font-semibold text-green-400">${balance.toFixed(2)}</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Deposit Funds</h1>
          <p className="text-slate-400 mt-1">Choose a payment method and enter the amount</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount to Deposit (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={10}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-2">Minimum deposit: $10</p>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold mb-3">Select Payment Method</h2>

          <label className={`flex items-center gap-4 bg-slate-900 border rounded-2xl p-5 cursor-pointer transition ${method === "mpesa" ? "border-blue-600" : "border-slate-800 hover:border-slate-600"}`}>
            <input type="radio" name="method" value="mpesa" checked={method === "mpesa"} onChange={() => setMethod("mpesa")} className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold">M-Pesa</div>
              <div className="text-sm text-slate-400">Instant • Mobile Money</div>
            </div>
            <div className="text-green-400 text-sm font-medium">Recommended</div>
          </label>

          <label className={`flex items-center gap-4 bg-slate-900 border rounded-2xl p-5 cursor-pointer transition ${method === "card" ? "border-blue-600" : "border-slate-800 hover:border-slate-600"}`}>
            <input type="radio" name="method" value="card" checked={method === "card"} onChange={() => setMethod("card")} className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold">Credit / Debit Card</div>
              <div className="text-sm text-slate-400">Visa, Mastercard • Instant</div>
            </div>
          </label>

          <label className={`flex items-center gap-4 bg-slate-900 border rounded-2xl p-5 cursor-pointer transition ${method === "bank" ? "border-blue-600" : "border-slate-800 hover:border-slate-600"}`}>
            <input type="radio" name="method" value="bank" checked={method === "bank"} onChange={() => setMethod("bank")} className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold">Bank Transfer</div>
              <div className="text-sm text-slate-400">1–24 hours processing</div>
            </div>
          </label>

          <label className={`flex items-center gap-4 bg-slate-900 border rounded-2xl p-5 cursor-pointer transition ${method === "crypto" ? "border-blue-600" : "border-slate-800 hover:border-slate-600"}`}>
            <input type="radio" name="method" value="crypto" checked={method === "crypto"} onChange={() => setMethod("crypto")} className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold">USDT (Crypto)</div>
              <div className="text-sm text-slate-400">TRC20 / ERC20 • Fast confirmation</div>
            </div>
          </label>
        </div>

        <button
          onClick={handleDeposit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl text-lg transition"
        >
          {submitting ? "Submitting..." : "Submit Deposit Request"}
        </button>

        {message && (
          <div className={`mt-6 rounded-xl p-4 text-center text-sm ${
            message.includes("successfully") 
              ? "bg-green-900/30 border border-green-700 text-green-400" 
              : "bg-red-900/30 border border-red-700 text-red-400"
          }`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
}