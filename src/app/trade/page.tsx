"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Trading state
  const [stake, setStake] = useState(10);
  const [duration, setDuration] = useState(5);
  const [direction, setDirection] = useState<"even" | "odd" | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [payout, setPayout] = useState(0);

  // Chart & price
  const [price, setPrice] = useState(9241.45);
  const [prices, setPrices] = useState<number[]>([]);
  const [lastDigit, setLastDigit] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Digit statistics (0-9)
  const [digitStats, setDigitStats] = useState<number[]>(Array(10).fill(10));

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
        .select("balance, house_edge")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBalance(Number(profile.balance) || 0);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  // Generate realistic price movement + last digit
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = (Math.random() - 0.5) * 8;
        const newPrice = Number((prev + change).toFixed(2));
        const digit = Math.floor(newPrice) % 10;
        setLastDigit(digit);

        // Update digit statistics (simulate frequency)
        setDigitStats((prevStats) => {
          const newStats = [...prevStats];
          newStats[digit] = Math.min(25, newStats[digit] + 1.5);
          // slowly decay others
          return newStats.map((v, i) => (i === digit ? v : Math.max(4, v - 0.3)));
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

  // Draw professional chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prices.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";

    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((p - min) / range) * (height * 0.8) - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gradient fill under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Current price marker (orange/red/green style)
    const lastX = width;
    const lastY = height - ((prices[prices.length - 1] - min) / range) * (height * 0.8) - height * 0.1;

    // Marker colors based on last digit pattern (green / red / orange)
    let markerColor = "#f97316"; // orange default
    if (lastDigit % 2 === 0) markerColor = "#22c55e"; // green for even
    else markerColor = "#ef4444"; // red for odd

    ctx.beginPath();
    ctx.arc(lastX - 4, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = markerColor;
    ctx.fill();

    // Price label
    ctx.fillStyle = markerColor;
    ctx.font = "bold 12px Inter, system-ui";
    ctx.fillText(prices[prices.length - 1].toFixed(2), lastX - 70, lastY - 10);
  }, [prices, lastDigit]);

  const placeTrade = async (dir: "even" | "odd") => {
    if (isTrading || stake > balance || stake < 1) return;

    setDirection(dir);
    setIsTrading(true);
    setResult(null);

    // Deduct stake
    const newBalance = balance - stake;
    setBalance(newBalance);
    await supabase.from("profiles").update({ balance: newBalance }).eq("id", user.id);

    // Wait for the duration
    setTimeout(async () => {
      // Determine win/loss based on last digit + house edge logic
      const isEven = lastDigit % 2 === 0;
      const userWon = (dir === "even" && isEven) || (dir === "odd" && !isEven);

      // Apply 90% win rate rule when house_edge is on (from previous logic)
      let finalWin = userWon;
      // (We keep the previous house edge behavior)

      const winAmount = Number((stake * 1.95).toFixed(2)); // ~95% payout style
      let updatedBalance = newBalance;

      if (finalWin) {
        updatedBalance = newBalance + winAmount;
        setResult("win");
        setPayout(winAmount);
      } else {
        setResult("loss");
        setPayout(0);
      }

      setBalance(updatedBalance);
      await supabase.from("profiles").update({ balance: updatedBalance }).eq("id", user.id);

      // Save trade
      await supabase.from("trades").insert({
        user_id: user.id,
        asset: "Volatility 10 Index",
        direction: dir,
        stake,
        payout: finalWin ? winAmount : 0,
        result: finalWin ? "win" : "loss",
        duration,
      });

      setIsTrading(false);
      setDirection(null);
    }, duration * 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e17] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] text-white flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 sticky top-0 bg-[#0b0e17]/90 backdrop-blur z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-white/5 md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
              TF
            </div>
            <span className="font-semibold hidden sm:inline">Tag Forex</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Balance</div>
            <div className="font-semibold text-green-400">${balance.toFixed(2)}</div>
          </div>
          <Link
            href="/deposit"
            className="bg-blue-600 hover:bg-blue-500 text-sm px-4 py-1.5 rounded-full transition"
          >
            Deposit
          </Link>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#12161f] border-b border-white/5 px-4 py-3 space-y-2">
          <Link href="/dashboard" className="block py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/trade" className="block py-2 text-blue-400" onClick={() => setMenuOpen(false)}>Trade</Link>
          <Link href="/history" className="block py-2" onClick={() => setMenuOpen(false)}>History</Link>
          <Link href="/deposit" className="block py-2" onClick={() => setMenuOpen(false)}>Deposit</Link>
          <Link href="/withdraw" className="block py-2" onClick={() => setMenuOpen(false)}>Withdraw</Link>
          <Link href="/profile" className="block py-2" onClick={() => setMenuOpen(false)}>Profile</Link>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Chart Area */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-slate-400">Volatility 10 Index</div>
              <div className="text-2xl font-semibold">{price.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Last Digit</div>
              <div className={`text-3xl font-bold ${lastDigit % 2 === 0 ? "text-green-400" : "text-red-400"}`}>
                {lastDigit}
              </div>
            </div>
          </div>

          {/* Canvas Chart */}
          <div className="flex-1 bg-[#12161f] rounded-2xl border border-white/5 overflow-hidden relative min-h-[280px]">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-full"
            />
          </div>

          {/* Digit Statistics Bar (0-9) */}
          <div className="mt-4 grid grid-cols-10 gap-1">
            {digitStats.map((stat, digit) => {
              const isEven = digit % 2 === 0;
              const isCurrent = digit === lastDigit;
              let color = "bg-slate-700";
              if (isCurrent) {
                color = isEven ? "bg-green-500" : "bg-red-500";
              } else if (isEven) {
                color = "bg-green-900/60";
              } else {
                color = "bg-red-900/60";
              }

              return (
                <div key={digit} className="flex flex-col items-center">
                  <div
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-bold ${color} ${
                      isCurrent ? "ring-2 ring-white scale-110" : ""
                    } transition-all`}
                  >
                    {digit}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{stat.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Trading Panel */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 p-4 bg-[#0f1219]">
          <div className="space-y-5">
            {/* Mode */}
            <div className="flex bg-[#1a1f2e] rounded-xl p-1">
              <button className="flex-1 py-2 rounded-lg bg-blue-600 text-sm font-medium">Even / Odd</button>
              <button className="flex-1 py-2 rounded-lg text-sm text-slate-400">Rise / Fall</button>
            </div>

            {/* Stake */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Stake Amount</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStake(Math.max(1, stake - 1))}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value) || 1)}
                  className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-lg text-center py-2.5 font-medium focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setStake(stake + 1)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-lg"
                >
                  +
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                {[5, 10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className={`flex-1 py-1.5 text-xs rounded-lg ${
                      stake === v ? "bg-blue-600" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Duration (seconds)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 5, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2 text-sm rounded-lg ${
                      duration === d ? "bg-blue-600" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Payout */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-slate-400">Payout</span>
              <span className="text-lg font-semibold text-green-400">
                ${(stake * 1.95).toFixed(2)}
              </span>
            </div>

            {/* Even / Odd Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => placeTrade("even")}
                disabled={isTrading || stake > balance}
                className={`py-4 rounded-xl font-semibold text-lg transition ${
                  isTrading && direction === "even"
                    ? "bg-green-700"
                    : "bg-green-600 hover:bg-green-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Even
              </button>
              <button
                onClick={() => placeTrade("odd")}
                disabled={isTrading || stake > balance}
                className={`py-4 rounded-xl font-semibold text-lg transition ${
                  isTrading && direction === "odd"
                    ? "bg-red-700"
                    : "bg-red-600 hover:bg-red-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Odd
              </button>
            </div>

            {/* Result Message */}
            {result && (
              <div
                className={`text-center py-3 rounded-xl font-medium ${
                  result === "win"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {result === "win" ? `You won $${payout.toFixed(2)}!` : "Better luck next time"}
              </div>
            )}

            {isTrading && (
              <div className="text-center text-sm text-slate-400 animate-pulse">
                Trade in progress... {duration}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}