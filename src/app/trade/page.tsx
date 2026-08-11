"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function TradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [stake, setStake] = useState(10);
  const [duration, setDuration] = useState(5);
  const [direction, setDirection] = useState<"even" | "odd" | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [payout, setPayout] = useState(0);

  const [price, setPrice] = useState(9241.45);
  const [prices, setPrices] = useState<number[]>([]);
  const [lastDigit, setLastDigit] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [digitStats, setDigitStats] = useState<number[]>(Array(10).fill(9.5));

  useEffect(() => {
    const checkUser = async () => {
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

      if (profile) setBalance(Number(profile.balance) || 0);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  // Price simulation
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = (Math.random() - 0.5) * 4.8;
        const newPrice = Number((prev + change).toFixed(2));
        const digit = Math.floor(newPrice) % 10;
        setLastDigit(digit);

        setDigitStats((prev) => {
          const next = [...prev];
          next[digit] = Math.min(14, next[digit] + 0.6);
          return next.map((v, i) => (i === digit ? v : Math.max(6, v - 0.12)));
        });

        setPrices((prev) => {
          const updated = [...prev, newPrice];
          if (updated.length > 80) updated.shift();
          return updated;
        });

        return newPrice;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [loading]);

  // Professional chart
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || prices.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const rightPadding = 70;
    const chartWidth = width - rightPadding;

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...prices) - 3;
    const max = Math.max(...prices) + 3;
    const range = max - min || 1;

    // === Grid + Price Scale (right side) ===
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = (height / steps) * i;
      const priceLevel = max - (range / steps) * i;

      // horizontal grid line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // price label
      ctx.fillText(priceLevel.toFixed(2), chartWidth + 10, y + 4);
    }

    // === Gradient Fill ===
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(34, 197, 94, 0.25)");
    gradient.addColorStop(1, "rgba(34, 197, 94, 0)");

    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * chartWidth;
      const y = height - ((p - min) / range) * (height - 20) - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(chartWidth, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // === Price Line ===
    ctx.beginPath();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * chartWidth;
      const y = height - ((p - min) / range) * (height - 20) - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // === Current Price Marker + Badge ===
    const lastY = height - ((prices[prices.length - 1] - min) / range) * (height - 20) - 10;

    // small circle
    ctx.beginPath();
    ctx.arc(chartWidth, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.strokeStyle = "#0b0e17";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // price badge background
    const badgeText = prices[prices.length - 1].toFixed(2);
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    const textWidth = ctx.measureText(badgeText).width;

    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.roundRect(chartWidth + 8, lastY - 11, textWidth + 14, 22, 4);
    ctx.fill();

    // price text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(badgeText, chartWidth + 15, lastY + 4);
  }, [prices]);

  const placeTrade = async (dir: "even" | "odd") => {
    if (isTrading || stake > balance || stake < 1) return;

    setDirection(dir);
    setIsTrading(true);
    setResult(null);

    const newBal = balance - stake;
    setBalance(newBal);
    await supabase.from("profiles").update({ balance: newBal }).eq("id", user.id);

    setTimeout(async () => {
      const isEven = lastDigit % 2 === 0;
      const won = (dir === "even" && isEven) || (dir === "odd" && !isEven);
      const winAmount = Number((stake * 1.95).toFixed(2));

      let finalBal = newBal;
      if (won) {
        finalBal = newBal + winAmount;
        setResult("win");
        setPayout(winAmount);
      } else {
        setResult("loss");
        setPayout(0);
      }

      setBalance(finalBal);
      await supabase.from("profiles").update({ balance: finalBal }).eq("id", user.id);

      await supabase.from("trades").insert({
        user_id: user.id,
        asset: "Volatility 10 Index",
        direction: dir,
        stake,
        payout: won ? winAmount : 0,
        result: won ? "win" : "loss",
        duration,
      });

      setIsTrading(false);
      setDirection(null);
    }, duration * 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e17] flex items-center justify-center text-slate-900 dark:text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e17] text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="h-11 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-3 sticky top-0 bg-white/95 dark:bg-[#0b0e17]/95 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 md:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white">TF</div>
            <span className="font-semibold text-sm">Tag Forex</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">Balance</div>
            <div className="font-semibold text-green-600 dark:text-green-400 text-sm">${balance.toFixed(2)}</div>
          </div>
          <Link href="/deposit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full">
            Deposit
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#12161f] border-b border-slate-200 dark:border-white/5 px-4 py-2 text-sm space-y-1">
          <Link href="/dashboard" className="block py-1.5" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/trade" className="block py-1.5 text-blue-600 dark:text-blue-400" onClick={() => setMenuOpen(false)}>Trade</Link>
          <Link href="/history" className="block py-1.5" onClick={() => setMenuOpen(false)}>History</Link>
          <Link href="/deposit" className="block py-1.5" onClick={() => setMenuOpen(false)}>Deposit</Link>
          <Link href="/withdraw" className="block py-1.5" onClick={() => setMenuOpen(false)}>Withdraw</Link>
          <Link href="/profile" className="block py-1.5" onClick={() => setMenuOpen(false)}>Profile</Link>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT - Chart */}
        <div className="flex-1 p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Volatility 10 Index</span>
                  <span className="flex items-center gap-1 text-[10px] bg-green-500/15 text-green-500 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <div className="text-xl font-semibold mt-0.5">{price.toFixed(2)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">Last Digit</div>
              <div className={`text-2xl font-bold ${lastDigit % 2 === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {lastDigit}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div ref={containerRef} className="flex-1 bg-white dark:bg-[#0f1623] rounded-xl border border-slate-200 dark:border-white/5 relative min-h-[240px] overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* Digit circles */}
          <div className="mt-3 flex justify-between items-end px-1">
            {digitStats.map((stat, digit) => {
              const isCurrent = digit === lastDigit;
              const isEven = digit % 2 === 0;

              return (
                <div key={digit} className="flex flex-col items-center flex-1 relative">
                  {isCurrent && (
                    <div className="absolute -top-2.5 text-orange-500 text-[10px] leading-none">▼</div>
                  )}

                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] font-medium border transition-all
                      ${isCurrent
                        ? isEven
                          ? "bg-green-600 border-green-400 text-white ring-2 ring-green-400/40 scale-110"
                          : "bg-red-600 border-red-400 text-white ring-2 ring-red-400/40 scale-110"
                        : "bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    {digit}
                  </div>
                  <div className={`text-[9px] mt-1 ${
                    isCurrent
                      ? isEven ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      : "text-slate-500"
                  }`}>
                    {stat.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT - Trading Panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/5 p-3 bg-white dark:bg-[#0f1219]">
          <div className="space-y-4">
            <div className="flex bg-slate-100 dark:bg-[#1a1f2e] rounded-lg p-0.5 text-sm">
              <button className="flex-1 py-1.5 rounded-md bg-blue-600 text-white font-medium">Even / Odd</button>
              <button className="flex-1 py-1.5 rounded-md text-slate-500 dark:text-slate-400">Rise / Fall</button>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Stake Amount</div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setStake(Math.max(1, stake - 1))} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 text-lg">−</button>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value) || 1)}
                  className="flex-1 bg-slate-100 dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/10 rounded-lg text-center py-2 text-sm font-medium focus:outline-none"
                />
                <button onClick={() => setStake(stake + 1)} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 text-lg">+</button>
              </div>
              <div className="flex gap-1 mt-1.5">
                {[5, 10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className={`flex-1 py-1 text-[11px] rounded-md ${stake === v ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5"}`}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</div>
              <div className="flex gap-1">
                {[1, 2, 3, 5, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-1.5 text-xs rounded-md ${duration === d ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5"}`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-[#1a1f2e] rounded-xl p-3 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Payout</span>
              <span className="font-semibold text-green-600 dark:text-green-400">${(stake * 1.95).toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => placeTrade("even")}
                disabled={isTrading || stake > balance}
                className={`py-4 rounded-xl font-bold text-base transition-all shadow-lg text-white ${
                  isTrading && direction === "even"
                    ? "bg-green-700 shadow-green-900/40"
                    : "bg-green-600 hover:bg-green-500 shadow-green-900/30"
                } disabled:opacity-50 disabled:shadow-none`}
              >
                Even
              </button>
              <button
                onClick={() => placeTrade("odd")}
                disabled={isTrading || stake > balance}
                className={`py-4 rounded-xl font-bold text-base transition-all shadow-lg text-white ${
                  isTrading && direction === "odd"
                    ? "bg-red-700 shadow-red-900/40"
                    : "bg-red-600 hover:bg-red-500 shadow-red-900/30"
                } disabled:opacity-50 disabled:shadow-none`}
              >
                Odd
              </button>
            </div>

            {result && (
              <div className={`text-center py-2.5 rounded-xl text-sm font-medium ${
                result === "win" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
              }`}>
                {result === "win" ? `You won $${payout.toFixed(2)}!` : "Better luck next time"}
              </div>
            )}

            {isTrading && (
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                Trade in progress... {duration}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}