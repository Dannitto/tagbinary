"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function WithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [amount, setAmount] = useState(50);
  const [method, setMethod] = useState("mpesa");
  const [accountDetails, setAccountDetails] = useState("");
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

  const handleWithdraw = async () => {
    if (!user) return;
    if (amount < 10) {
      setMessage("Minimum withdrawal is $10");
      return;
    }
    if (amount > balance) {
      setMessage("Insufficient balance");
      return;
    }
    if (!accountDetails.trim()) {
      setMessage("Please enter your account details");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.from("withdrawals").insert({
      user_id: user.id,
      amount: amount,
      method: method,
      account_details: accountDetails,
      status: "pending",
    });

    if (error) {
      setMessage("Error submitting withdrawal. Please try again.");
      console.error(error);
    } else {
      setMessage(`Withdrawal request of $${amount} via ${method.toUpperCase()} has been submitted. Waiting for admin approval.`);
      setAccountDetails("");
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
            <Link href="/withdraw" className="text-white">Withdraw</Link>
            <Link href="/transactions" className="hover:text-white transition">Transactions</Link>
            <Link href="/profile" className="hover:text-white transition">Profile</Link>
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
            <Link href="/withdraw" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm bg-blue-600/20 text-blue-400">Withdraw</Link>
            <Link href="/transactions" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Transactions</Link>
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Profile</Link>
          </div>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Withdraw Funds</h1>
          <p className="text-slate-400 text-sm mt-1">Request a withdrawal to your preferred method</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount to Withdraw (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={10}
            max={balance}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-2">
            Minimum: $10 • Available: ${balance.toFixed(2)}
          </p>
        </div>

        <div className="space-y-3 mb-5">
          <h2 className="text-base font-semibold mb-2">Select Withdrawal Method</h2>

          <label className={`flex items-center gap-4 bg-slate-900 border rounded-2xl p-4 cursor-pointer transition ${method === "mpesa" ? "border-blue-600" : "border-slate-800"}`}>
            <input type="radio" name="method" value="mpesa" checked={method === "mpesa"} onChange={() => setMethod("mpesa")} className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold text-sm">M-Pesa</div>
              <div className="text-xs text-slate-400">Instant • Mobile Money</div>
            </div>
          </label>

          <label className={`flex items-center gap-4 bg-slate-900 border rounded-2xl p-4 cursor-pointer transition ${method === "bank" ? "border-blue-600" : "border-slate-800"}`}>
            <input type="radio" name="method" value="bank" checked={method === "bank"} onChange={() => setMethod("bank")} className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Bank Transfer</div>
              <div className="text-xs text-slate-400">1–24 hours</div>
            </div>
          </label>

          <label className={`flex items-center gap-4 bg-slate-900 border rounded-2xl p-4 cursor-pointer transition ${method === "crypto" ? "border-blue-600" : "border-slate-800"}`}>
            <input type="radio" name="method" value="crypto" checked={method === "crypto"} onChange={() => setMethod("crypto")} className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold text-sm">USDT (Crypto)</div>
              <div className="text-xs text-slate-400">TRC20 / ERC20</div>
            </div>
          </label>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {method === "mpesa" && "M-Pesa Phone Number"}
            {method === "bank" && "Bank Account Details"}
            {method === "crypto" && "USDT Wallet Address"}
          </label>
          <input
            type="text"
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            placeholder={
              method === "mpesa" ? "e.g. 0712345678" :
              method === "bank" ? "Bank name, Account number, Account name" :
              "Your USDT wallet address"
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleWithdraw}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl text-base transition"
        >
          {submitting ? "Submitting..." : "Submit Withdrawal Request"}
        </button>

        {message && (
          <div className={`mt-5 rounded-xl p-4 text-center text-sm ${
            message.includes("submitted") 
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