"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [price, setPrice] = useState(9386.34);
  const [lastPrice, setLastPrice] = useState(9386.34);
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [stake, setStake] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [isTrading, setIsTrading] = useState(false);
  const [result, setResult] = useState("");
  const [prices, setPrices] = useState<number[]>([9386.34]);
  const [digitCounts, setDigitCounts] = useState<number[]>(Array(10).fill(0));
  const [tradeType, setTradeType] = useState<"match" | "differ" | "even" | "odd" | "over" | "under">("match");
  const [activeTab, setActiveTab] = useState<"match-differ" | "even-odd" | "over-under">("match-differ");
  const [houseEdge, setHouseEdge] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadUserAndBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, house_edge")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBalance(Number(profile.balance));
        setHouseEdge(profile.house_edge !== false);
      }
      setLoading(false);
    };
    loadUserAndBalance();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = (Math.random() - 0.5) * 1.4;
        const newPrice = Math.round((prev + change) * 100) / 100;
        setLastPrice(prev);

        const digit = Math.floor(newPrice) % 10;
        setDigitCounts((old) => {
          const updated = [...old];
          updated[digit] += 1;
          return updated;
        });

        setPrices((old) => {
          const updated = [...old, newPrice];
          if (updated.length > 80) updated.shift();
          return updated;
        });
        return newPrice;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

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
    for (let i = 1; i < 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const min = Math.min(...prices) - 0.8;
    const max = Math.max(...prices) + 0.8;
    const range = max - min || 1;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 30) - 15;
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
      const y = height - ((p - min) / range) * (height - 30) - 15;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [prices]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const placeTrade = async () => {
    if (isTrading || !user) return;
    if (stake > balance) {
      setResult("Insufficient balance");
      return;
    }

    setIsTrading(true);
    setResult("Trade placed...");

    const newBalance = balance - stake;
    setBalance(newBalance);
    await supabase.from("profiles").update({ balance: newBalance }).eq("id", user.id);

    setTimeout(async () => {
      const winChance = houseEdge ? 0.90 : 0.00;
      const userWins = Math.random() < winChance;

      let payoutMultiplier = 1;
      if (tradeType === "match") payoutMultiplier = 9.5;
      else if (tradeType === "differ") payoutMultiplier = 1.05;
      else payoutMultiplier = 1.9;

      const payout = stake * payoutMultiplier;
      const profit = userWins ? payout - stake : -stake;
      let finalBalance = newBalance;

      if (userWins) {
        finalBalance = newBalance + payout;
        setBalance(finalBalance);
        setResult(`WIN +$${payout.toFixed(2)}`);
      } else {
        setResult(`LOSS -$${stake.toFixed(2)}`);
      }

      await supabase.from("profiles").update({ balance: finalBalance }).eq("id", user.id);
      await supabase.from("trades").insert({
        user_id: user.id,
        type: tradeType,
        digit: selectedDigit,
        stake: stake,
        payout: userWins ? payout : 0,
        result: userWins ? "WIN" : "LOSS",
        profit: profit,
      });

      setIsTrading(false);
    }, 2500);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">Loading...</div>;
  }

  const lastDigit = Math.floor(price) % 10;
  const isUp = price >= lastPrice;
  const totalDigits = digitCounts.reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0B1120]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800"
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
              <span className="font-bold text-lg hidden sm:block">TagBinary</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/trade" className="text-white">Trade</Link>
            <Link href="/history" className="hover:text-white">History</Link>
            <Link href="/deposit" className="hover:text-white">Deposit</Link>
            <Link href="/withdraw" className="hover:text-white">Withdraw</Link>
            <Link href="/transactions" className="hover:text-white">Transactions</Link>
            <Link href="/profile" className="hover:text-white">Profile</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">Balance</div>
              <div className="font-semibold text-emerald-400 text-sm">${balance.toFixed(2)}</div>
            </div>
            <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg">
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
            <Link href="/dashboard" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link href="/trade" className="block py-2 text-sm text-blue-400" onClick={() => setMobileMenuOpen(false)}>Trade</Link>
            <Link href="/history" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>History</Link>
            <Link href="/deposit" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Deposit</Link>
            <Link href="/withdraw" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Withdraw</Link>
            <Link href="/transactions" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Transactions</Link>
            <Link href="/profile" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Volatility 10 (1s) Index</div>
                <div className={`text-3xl sm:text-4xl font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {price.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-0.5">Last Digit</div>
                <div className="text-2xl sm:text-3xl font-bold">{lastDigit}</div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-[260px] sm:h-[360px]" />
            </div>

            {/* Digit Bars - Mobile friendly */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3">
              <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Digit Frequency</div>
              <div className="grid grid-cols-10 gap-1">
                {digitCounts.map((count, d) => {
                  const percent = ((count / totalDigits) * 100).toFixed(0);
                  const isCurrent = d === lastDigit;
                  return (
                    <div key={d} className="flex flex-col items-center">
                      <div className={`w-full h-10 sm:h-14 bg-slate-800 rounded-md relative overflow-hidden ${isCurrent ? "ring-1 ring-blue-500" : ""}`}>
                        <div
                          className={`absolute bottom-0 left-0 right-0 transition-all ${isCurrent ? "bg-blue-500" : "bg-blue-600/50"}`}
                          style={{ height: `${Math.min(100, Number(percent) * 2.5)}%` }}
                        />
                      </div>
                      <div className={`text-xs font-bold mt-1 ${isCurrent ? "text-blue-400" : "text-slate-400"}`}>{d}</div>
                      <div className="text-[9px] text-slate-500">{percent}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-slate-950 rounded-xl p-1">
              <button
                onClick={() => { setActiveTab("match-differ"); setTradeType("match"); }}
                className={`flex-1 py-2.5 text-[11px] sm:text-xs font-semibold rounded-lg transition ${activeTab === "match-differ" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                MATCH/DIFFER
              </button>
              <button
                onClick={() => { setActiveTab("even-odd"); setTradeType("even"); }}
                className={`flex-1 py-2.5 text-[11px] sm:text-xs font-semibold rounded-lg transition ${activeTab === "even-odd" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                EVEN/ODD
              </button>
              <button
                onClick={() => { setActiveTab("over-under"); setTradeType("over"); }}
                className={`flex-1 py-2.5 text-[11px] sm:text-xs font-semibold rounded-lg transition ${activeTab === "over-under" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                OVER/UNDER
              </button>
            </div>

            {/* Stake */}
            <div className="mb-4">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 block">Stake</label>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStake(Math.max(1, stake - 5))} className="w-11 h-11 bg-slate-800 rounded-xl text-lg font-medium border border-slate-700 active:scale-95">−</button>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value) || 1)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl text-center py-2.5 text-lg font-semibold focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => setStake(stake + 5)} className="w-11 h-11 bg-slate-800 rounded-xl text-lg font-medium border border-slate-700 active:scale-95">+</button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 5, 10, 25, 50].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className={`py-2 text-xs rounded-lg font-medium active:scale-95 ${stake === v ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 border border-slate-700"}`}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Digit Selector */}
            {(activeTab === "match-differ" || activeTab === "over-under") && (
              <div className="mb-4">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 block">Select Digit</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0,1,2,3,4,5,6,7,8,9].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDigit(d)}
                      className={`py-2.5 rounded-xl text-sm font-semibold active:scale-95 ${
                        selectedDigit === d ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 mt-auto">
              {activeTab === "match-differ" && (
                <>
                  <button
                    onClick={() => { setTradeType("match"); placeTrade(); }}
                    disabled={isTrading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition"
                  >
                    <span>Match</span>
                    <span className="text-emerald-100 text-sm">850%</span>
                  </button>
                  <button
                    onClick={() => { setTradeType("differ"); placeTrade(); }}
                    disabled={isTrading}
                    className="w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition"
                  >
                    <span>Differ</span>
                    <span className="text-rose-100 text-sm">5%</span>
                  </button>
                </>
              )}

              {activeTab === "even-odd" && (
                <>
                  <button
                    onClick={() => { setTradeType("even"); placeTrade(); }}
                    disabled={isTrading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition"
                  >
                    <span>Even</span>
                    <span className="text-emerald-100 text-sm">90%</span>
                  </button>
                  <button
                    onClick={() => { setTradeType("odd"); placeTrade(); }}
                    disabled={isTrading}
                    className="w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition"
                  >
                    <span>Odd</span>
                    <span className="text-rose-100 text-sm">90%</span>
                  </button>
                </>
              )}

              {activeTab === "over-under" && (
                <>
                  <button
                    onClick={() => { setTradeType("over"); placeTrade(); }}
                    disabled={isTrading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition"
                  >
                    <span>Over {selectedDigit}</span>
                    <span className="text-emerald-100 text-sm">90%</span>
                  </button>
                  <button
                    onClick={() => { setTradeType("under"); placeTrade(); }}
                    disabled={isTrading}
                    className="w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition"
                  >
                    <span>Under {selectedDigit}</span>
                    <span className="text-rose-100 text-sm">90%</span>
                  </button>
                </>
              )}
            </div>

            {result && (
              <div className={`mt-3 text-center text-sm font-medium py-3 rounded-xl ${
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