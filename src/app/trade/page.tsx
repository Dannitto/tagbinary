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

  const [price, setPrice] = useState(9423.77);
  const [prices, setPrices] = useState<number[]>([]);
  const [lastDigit, setLastDigit] = useState(7);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [digitStats, setDigitStats] = useState<number[]>([0, 11.7, 9.3, 10.8, 10.2, 13.1, 10.8, 12.3, 10.9, 10.9]);

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

  // Smoother price simulation
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setPrice((prev) => {
        // Smaller, smoother changes
        const change = (Math.random() - 0.48) * 2.8;
        const newPrice = Number((prev + change).toFixed(2));
        const digit = Math.floor(newPrice) % 10;
        setLastDigit(digit);

        setDigitStats((prev) => {
          const next = [...prev];
          next[digit] = Math.min(16, next[digit] + 0.4);
          return next.map((v, i) => (i === digit ? v : Math.max(7, v - 0.08)));
        });

        setPrices((prev) => {
          const updated = [...prev, newPrice];
          if (updated.length > 90) updated.shift();
          return updated;
        });

        return newPrice;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [loading]);

  // Smooth professional chart
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || prices.length < 3) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const rightPadding = 72;
    const chartWidth = width - rightPadding;

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...prices) - 1.5;
    const max = Math.max(...prices) + 1.5;
    const range = max - min || 1;

    // === Grid + Price Scale ===
    ctx.strokeStyle = "rgba(148, 163, 184, 0.07)";
    ctx.fillStyle = "#64748b";
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";

    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const y = (height / steps) * i;
      const priceLevel = max - (range / steps) * i;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillText(priceLevel.toFixed(2), chartWidth + 10, y + 4);
    }

    // === Helper: get point coordinates ===
    const getPoint = (i: number) => {
      const x = (i / (prices.length - 1)) * chartWidth;
      const y = height - ((prices[i] - min) / range) * (height - 24) - 12;
      return { x, y };
    };

    // === Smooth curved line using quadratic curves ===
    ctx.beginPath();
    const first = getPoint(0);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < prices.length - 1; i++) {
      const current = getPoint(i);
      const next = getPoint(i + 1);
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }

    // last segment
    const last = getPoint(prices.length - 1);
    ctx.lineTo(last.x, last.y);

    // Stroke the smooth line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // === Gradient fill under the curve ===
    ctx.lineTo(last.x, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.22)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // === Current price marker + badge ===
    const lastY = last.y;

    // horizontal dashed line
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
    ctx.lineWidth = 1;
    ctx.moveTo(0, lastY);
    ctx.lineTo(chartWidth, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // circle marker
    ctx.beginPath();
    ctx.arc(chartWidth, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.stroke();

    // price badge
    const badgeText = prices[prices.length - 1].toFixed(2);
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    const textWidth = ctx.measureText(badgeText).width;

    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(chartWidth + 8, lastY - 12, textWidth + 16, 24, 5);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(badgeText, chartWidth + 16, lastY + 5);
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
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Volatility 10 Index</span>
                <span className="flex items-center gap-1 text-[10px] bg-blue-500/15 text-blue-500 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <div className="text-xl font-semibold mt-0.5">{price.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">Last Digit</div>
              <div className={`text-2xl font-bold ${lastDigit % 2 === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {lastDigit}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div ref={containerRef} className="flex-1 bg-white dark:bg-[#0b1220] rounded-xl border border-slate-200 dark:border-white/5 relative min-h-[260px] overflow-hidden">
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
                    <div className="absolute -top-2.5 text-blue-400 text-[10px] leading-none">▲</div>
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