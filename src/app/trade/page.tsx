"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [price, setPrice] = useState(9386.34);
  const [lastPrice, setLastPrice] = useState(9386.34);
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [stake, setStake] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [isTrading, setIsTrading] = useState(false);
  const [result, setResult] = useState("");
  const [prices, setPrices] = useState<number[]>([9386.34]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load user + real balance
  useEffect(() => {
    const loadUserAndBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Load real balance from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBalance(Number(profile.balance));
      }

      setLoading(false);
    };

    loadUserAndBalance();
  }, [router]);

  // Simulated live price
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = (Math.random() - 0.5) * 1.4;
        const newPrice = Math.round((prev + change) * 100) / 100;
        setLastPrice(prev);
        setPrices((old) => {
          const updated = [...old, newPrice];
          if (updated.length > 100) updated.shift();
          return updated;
        });
        return newPrice;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Chart drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prices.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const y = (height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const min = Math.min(...prices) - 0.8;
    const max = Math.max(...prices) + 0.8;
    const range = max - min;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.22)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 40) - 20;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 40) - 20;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [prices]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const placeTrade = async (type: "match" | "differ") => {
    if (isTrading || !user) return;
    if (stake > balance) {
      setResult("Insufficient balance");
      return;
    }

    setIsTrading(true);
    setResult("Trade placed... waiting...");

    // Deduct stake immediately
    const newBalance = balance - stake;
    setBalance(newBalance);

    // Update balance in database
    await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    setTimeout(async () => {
      const finalDigit = Math.floor(price) % 10;
      const won = type === "match" ? finalDigit === selectedDigit : finalDigit !== selectedDigit;
      const payout = type === "match" ? stake * 9.5 : stake * 1.05;
      const profit = won ? payout - stake : -stake;

      let finalBalance = newBalance;

      if (won) {
        finalBalance = newBalance + payout;
        setBalance(finalBalance);
        setResult(`WIN +$${payout.toFixed(2)}`);
      } else {
        setResult(`LOSS -$${stake.toFixed(2)}`);
      }

      // Update final balance
      await supabase
        .from("profiles")
        .update({ balance: finalBalance })
        .eq("id", user.id);

      // Save trade to database
      await supabase.from("trades").insert({
        user_id: user.id,
        type: type,
        digit: selectedDigit,
        stake: stake,
        payout: won ? payout : 0,
        result: won ? "WIN" : "LOSS",
        profit: profit,
      });

      setIsTrading(false);
    }, 2800);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">Loading...</div>;
  }

  const lastDigit = Math.floor(price) % 10;
  const isUp = price >= lastPrice;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100">
      <header className="border-b border-slate-800/80 bg-[#0B1120]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white">T</div>
              <span className="font-bold text-lg tracking-tight">TagBinary</span>
            </Link>

            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
              <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
              <Link href="/trade" className="text-white">Trade</Link>
              <Link href="/history" className="hover:text-white transition">History</Link>
              <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
              <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
              <Link href="/profile" className="hover:text-white transition">Profile</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right mr-2">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">Balance</div>
              <div className="font-semibold text-emerald-400">${balance.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              LIVE
            </div>
            <button onClick={handleLogout} className="bg-slate-800/80 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg transition border border-slate-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1 font-medium">Volatility 10 (1s) Index</div>
                <div className={`text-4xl font-bold tracking-tight ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {price.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400 mb-1">Last Digit</div>
                <div className="text-3xl font-bold">{lastDigit}</div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <canvas ref={canvasRef} className="w-full h-[400px]" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
            <h2 className="font-semibold text-lg mb-6">Place Trade</h2>

            <div className="mb-6">
              <label className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2.5 block">Stake</label>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setStake(Math.max(1, stake - 5))} className="w-11 h-11 bg-slate-800 hover:bg-slate-700 rounded-xl text-lg font-medium transition border border-slate-700">−</button>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value) || 1)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl text-center py-3 text-lg font-semibold focus:outline-none focus:border-blue-500 transition"
                />
                <button onClick={() => setStake(stake + 5)} className="w-11 h-11 bg-slate-800 hover:bg-slate-700 rounded-xl text-lg font-medium transition border border-slate-700">+</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 5, 10, 25, 50].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className={`py-2 text-sm rounded-lg font-medium transition ${
                      stake === v ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    }`}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2.5 block">Select Digit</label>
              <div className="grid grid-cols-5 gap-2">
                {[0,1,2,3,4,5,6,7,8,9].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDigit(d)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                      selectedDigit === d
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => placeTrade("match")}
                disabled={isTrading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition shadow-lg shadow-emerald-600/15"
              >
                <span>Match</span>
                <span className="text-emerald-100 text-sm font-medium">850%</span>
              </button>
              <button
                onClick={() => placeTrade("differ")}
                disabled={isTrading}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition shadow-lg shadow-rose-600/15"
              >
                <span>Differ</span>
                <span className="text-rose-100 text-sm font-medium">5%</span>
              </button>
            </div>

            {result && (
              <div className={`mt-5 text-center text-sm font-medium py-3.5 rounded-xl ${
                result.includes("WIN") 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : result.includes("LOSS") 
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                    : "bg-slate-800 text-slate-400"
              }`}>
                {result}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}