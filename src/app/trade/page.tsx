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

  const [digitStats, setDigitStats] = useState<number[]>(Array(10).fill(9));

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
        const change = (Math.random() - 0.5) * 5.5;
        const newPrice = Number((prev + change).toFixed(2));
        const digit = Math.floor(newPrice) % 10;
        setLastDigit(digit);

        setDigitStats((prev) => {
          const next = [...prev];
          next[digit] = Math.min(18, next[digit] + 0.9);
          return next.map((v, i) => (i === digit ? v : Math.max(4, v - 0.2)));
        });

        setPrices((prev) => {
          const updated = [...prev, newPrice];
          if (updated.length > 70) updated.shift();
          return updated;
        });

        return newPrice;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [loading]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || prices.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // line
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((p - min) / range) * (h * 0.72) - h * 0.14;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(59,130,246,0.18)");
    grad.addColorStop(1, "rgba(59,130,246,0)");
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // current price marker
    const lastY = h - ((prices[prices.length - 1] - min) / range) * (h * 0.72) - h * 0.14;
    const color = lastDigit % 2 === 0 ? "#22c55e" : "#ef4444";

    ctx.beginPath();
    ctx.arc(w - 5, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = "bold 11px system-ui";
    ctx.fillText(price.toFixed(2), w - 62, lastY - 7);
  }, [prices, lastDigit, price]);

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
      <div className="min-h-screen bg-[#0b0e17] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] text-white flex flex-col">
      {/* Header */}
      <header className="h-11 border-b border-white/5 flex items-center justify-between px-3 sticky top-0 bg-[#0b0e17]/95 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-white/5 md:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold">TF</div>
            <span className="font-semibold text-sm">Tag Forex</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 leading-none">Balance</div>
            <div className="font-semibold text-green-400 text-sm">${balance.toFixed(2)}</div>
          </div>
          <Link href="/deposit" className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1.5 rounded-full">
            Deposit
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden bg-[#12161f] border-b border-white/5 px-4 py-2 text-sm space-y-1">
          <Link href="/dashboard" className="block py-1.5" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/trade" className="block py-1.5 text-blue-400" onClick={() => setMenuOpen(false)}>Trade</Link>
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
              <div className="text-xs text-slate-400">Volatility 10 Index</div>
              <div className="text-xl font-semibold">{price.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Last Digit</div>
              <div className={`text-2xl font-bold ${lastDigit % 2 === 0 ? "text-green-400" : "text-red-400"}`}>
                {lastDigit}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div ref={containerRef} className="flex-1 bg-[#12161f] rounded-xl border border-white/5 relative min-h-[200px]">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* SMALL Digit circles - matching the video */}
          <div className="mt-3 flex justify-between gap-1 px-1">
            {digitStats.map((stat, digit) => {
              const isEven = digit % 2 === 0;
              const isCurrent = digit === lastDigit;

              let bg = isEven ? "bg-emerald-900/70" : "bg-rose-900/70";
              if (isCurrent) bg = isEven ? "bg-emerald-500" : "bg-rose-500";

              return (
                <div key={digit} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${bg} ${
                      isCurrent ? "ring-2 ring-white scale-110" : ""
                    } transition-all`}
                  >
                    {digit}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">{Math.round(stat)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT - Trading Panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-white/5 p-3 bg-[#0f1219]">
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex bg-[#1a1f2e] rounded-lg p-0.5 text-sm">
              <button className="flex-1 py-1.5 rounded-md bg-blue-600 font-medium">Even / Odd</button>
              <button className="flex-1 py-1.5 rounded-md text-slate-400">Rise / Fall</button>
            </div>

            {/* Stake */}
            <div>
              <div className="text-xs text-slate-400 mb-1">Stake Amount</div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setStake(Math.max(1, stake - 1))} className="w-9 h-9 rounded-lg bg-white/5 text-lg">−</button>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value) || 1)}
                  className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-lg text-center py-2 text-sm font-medium focus:outline-none"
                />
                <button onClick={() => setStake(stake + 1)} className="w-9 h-9 rounded-lg bg-white/5 text-lg">+</button>
              </div>
              <div className="flex gap-1 mt-1.5">
                {[5, 10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className={`flex-1 py-1 text-[11px] rounded-md ${stake === v ? "bg-blue-600" : "bg-white/5"}`}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="text-xs text-slate-400 mb-1">Duration</div>
              <div className="flex gap-1">
                {[1, 2, 3, 5, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-1.5 text-xs rounded-md ${duration === d ? "bg-blue-600" : "bg-white/5"}`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Payout */}
            <div className="bg-[#1a1f2e] rounded-xl p-3 flex justify-between items-center">
              <span className="text-xs text-slate-400">Payout</span>
              <span className="font-semibold text-green-400">${(stake * 1.95).toFixed(2)}</span>
            </div>

            {/* Big Even / Odd buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => placeTrade("even")}
                disabled={isTrading || stake > balance}
                className={`py-3.5 rounded-xl font-semibold text-base transition ${
                  isTrading && direction === "even" ? "bg-green-700" : "bg-green-600 hover:bg-green-500"
                } disabled:opacity-50`}
              >
                Even
              </button>
              <button
                onClick={() => placeTrade("odd")}
                disabled={isTrading || stake > balance}
                className={`py-3.5 rounded-xl font-semibold text-base transition ${
                  isTrading && direction === "odd" ? "bg-red-700" : "bg-red-600 hover:bg-red-500"
                } disabled:opacity-50`}
              >
                Odd
              </button>
            </div>

            {result && (
              <div className={`text-center py-2.5 rounded-xl text-sm font-medium ${
                result === "win" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
              }`}>
                {result === "win" ? `You won $${payout.toFixed(2)}!` : "Better luck next time"}
              </div>
            )}

            {isTrading && (
              <div className="text-center text-xs text-slate-400 animate-pulse">
                Trade in progress... {duration}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}