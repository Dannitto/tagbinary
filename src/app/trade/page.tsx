"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function TradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [realBalance, setRealBalance] = useState(0);
  const [demoBalance, setDemoBalance] = useState(10000);
  const [accountMode, setAccountMode] = useState<"demo" | "real">("demo");
  const [loading, setLoading] = useState(true);

  const [stake, setStake] = useState(10);
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [isTrading, setIsTrading] = useState(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [payout, setPayout] = useState(0);
  const [activeTab, setActiveTab] = useState<"open" | "closed" | "transactions">("open");

  const [price, setPrice] = useState(9424.48);
  const [prices, setPrices] = useState<number[]>([]);
  const [lastDigit, setLastDigit] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [digitStats, setDigitStats] = useState([0.1, 14.3, 14.5, 12.8, 9.2, 8.6, 10.0, 10.0, 10.5, 10.0]);

  const currentBalance = accountMode === "demo" ? demoBalance : realBalance;

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
        .select("balance, demo_balance, account_mode")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRealBalance(Number(profile.balance) || 0);
        setDemoBalance(Number(profile.demo_balance) || 10000);
        setAccountMode((profile.account_mode as "demo" | "real") || "demo");
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const switchAccount = async (mode: "demo" | "real") => {
    if (!user) return;
    setAccountMode(mode);
    await supabase.from("profiles").update({ account_mode: mode }).eq("id", user.id);
  };

  // Smooth price movement
  useEffect(() => {
    if (loading) return;

    let lastChange = 0;

    const interval = setInterval(() => {
      setPrice((prev) => {
        const random = (Math.random() - 0.5) * 0.55;
        lastChange = lastChange * 0.88 + random;
        const newPrice = Number((prev + lastChange).toFixed(2));
        const digit = Math.floor(newPrice) % 10;
        setLastDigit(digit);

        setDigitStats((prevStats) => {
          const next = [...prevStats];
          next[digit] = Math.min(15, next[digit] + 0.18);
          return next.map((v, i) => (i === digit ? v : Math.max(6.5, v - 0.035)));
        });

        setPrices((prevPrices) => {
          const updated = [...prevPrices, newPrice];
          if (updated.length > 120) updated.shift();
          return updated;
        });

        return newPrice;
      });
    }, 550);

    return () => clearInterval(interval);
  }, [loading]);

  // Chart
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
    const rightPadding = 62;
    const chartWidth = width - rightPadding;

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...prices) - 0.7;
    const max = Math.max(...prices) + 0.7;
    const range = max - min || 1;

    ctx.strokeStyle = "rgba(148, 163, 184, 0.07)";
    ctx.fillStyle = "#64748b";
    ctx.font = "10.5px Inter, system-ui";
    ctx.textAlign = "left";

    const steps = 9;
    for (let i = 0; i <= steps; i++) {
      const y = (height / steps) * i;
      const priceLevel = max - (range / steps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
      ctx.fillText(priceLevel.toFixed(2), chartWidth + 7, y + 3.5);
    }

    const getPoint = (i: number) => {
      const x = (i / (prices.length - 1)) * chartWidth;
      const y = height - ((prices[i] - min) / range) * (height - 16) - 8;
      return { x, y };
    };

    ctx.beginPath();
    const first = getPoint(0);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < prices.length - 1; i++) {
      const curr = getPoint(i);
      const next = getPoint(i + 1);
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }
    const last = getPoint(prices.length - 1);
    ctx.lineTo(last.x, last.y);

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.lineTo(last.x, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.18)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
    ctx.lineWidth = 1;
    ctx.moveTo(0, last.y);
    ctx.lineTo(chartWidth, last.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(chartWidth, last.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = "#0b1220";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const badge = prices[prices.length - 1].toFixed(2);
    ctx.font = "bold 11.5px Inter, system-ui";
    const tw = ctx.measureText(badge).width;

    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(chartWidth + 7, last.y - 10, tw + 12, 20, 4);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.fillText(badge, chartWidth + 13, last.y + 3.5);
  }, [prices]);

  const placeTrade = async (type: "match" | "differ") => {
    if (isTrading || stake > currentBalance || stake < 1) return;

    setIsTrading(true);
    setResult(null);

    const newBalance = currentBalance - stake;

    if (accountMode === "demo") {
      setDemoBalance(newBalance);
      await supabase.from("profiles").update({ demo_balance: newBalance }).eq("id", user.id);
    } else {
      setRealBalance(newBalance);
      await supabase.from("profiles").update({ balance: newBalance }).eq("id", user.id);
    }

    setTimeout(async () => {
      const matched = lastDigit === selectedDigit;
      const won = (type === "match" && matched) || (type === "differ" && !matched);
      const multiplier = type === "match" ? 8.5 : 0.95;
      const winAmount = Number((stake * multiplier).toFixed(2));

      let finalBalance = newBalance;
      if (won) {
        finalBalance = newBalance + winAmount;
        setResult("win");
        setPayout(winAmount);
      } else {
        setResult("loss");
        setPayout(0);
      }

      if (accountMode === "demo") {
        setDemoBalance(finalBalance);
        await supabase.from("profiles").update({ demo_balance: finalBalance }).eq("id", user.id);
      } else {
        setRealBalance(finalBalance);
        await supabase.from("profiles").update({ balance: finalBalance }).eq("id", user.id);
      }

      await supabase.from("trades").insert({
        user_id: user.id,
        asset: "Volatility 10 Index",
        direction: type,
        stake,
        payout: won ? winAmount : 0,
        result: won ? "win" : "loss",
        duration: 5,
        account_mode: accountMode,
      });

      setIsTrading(false);
    }, 5000);
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
      <header className="h-12 border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="font-bold text-lg tracking-wide">TAG BINARY</Link>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
            <button className="hover:text-white transition">Copy Trading</button>
            <Link href="/withdraw" className="hover:text-white transition">Withdraw</Link>
            <button className="hover:text-white transition">Chat</button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Demo / Real Switcher */}
          <div className="flex items-center bg-white/5 rounded-full p-0.5 text-xs">
            <button
              onClick={() => switchAccount("demo")}
              className={`px-3 py-1.5 rounded-full transition ${
                accountMode === "demo" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => switchAccount("real")}
              className={`px-3 py-1.5 rounded-full transition ${
                accountMode === "real" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Real
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 text-xs">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">T</div>
            <span>{accountMode === "demo" ? "Demo Account" : "Real Account"}</span>
          </div>

          <ThemeToggle />
          <div className="text-sm font-medium">${currentBalance.toFixed(2)}</div>
          <Link href="/deposit" className="bg-blue-600 hover:bg-blue-500 text-sm px-4 py-1.5 rounded-full font-medium">
            Deposit
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT - Chart */}
        <div className="flex-1 flex flex-col p-3 min-w-0">
          <div className="flex items-center gap-5 mb-2 text-sm">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Balance</div>
              <div className="font-semibold">${currentBalance.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Mode</div>
              <div className={`font-semibold ${accountMode === "demo" ? "text-yellow-400" : "text-green-400"}`}>
                {accountMode === "demo" ? "DEMO" : "REAL"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Price</div>
              <div className="font-semibold">{price.toFixed(2)}</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              LIVE
            </div>
          </div>

          <div className="mb-2">
            <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-sm">
              <span className="font-medium">Volatility 10 (1s) Index</span>
              <span className="text-green-400 text-xs">+0.01%</span>
            </div>
          </div>

          <div ref={containerRef} className="flex-1 bg-[#0b1220] rounded-xl border border-white/5 relative min-h-[260px]">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="mt-3 flex justify-between items-end">
            {digitStats.map((stat, digit) => {
              const isCurrent = digit === lastDigit;
              return (
                <div key={digit} className="flex flex-col items-center flex-1 relative">
                  {isCurrent && <div className="absolute -top-2 text-blue-400 text-[10px]">▲</div>}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-all
                    ${isCurrent ? "bg-blue-600 border-blue-400 text-white scale-110" : "bg-white/5 border-white/10 text-slate-300"}`}>
                    {digit}
                  </div>
                  <div className={`text-[10px] mt-1 ${isCurrent ? "text-blue-400" : "text-slate-500"}`}>
                    {stat.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE - Trading Panel */}
        <div className="w-[300px] border-l border-white/5 flex flex-col bg-[#0c1018]">
          <div className="flex border-b border-white/5 text-xs">
            <button className="flex-1 py-3 font-medium bg-blue-600/20 text-blue-400 border-b-2 border-blue-500">MATCH/DIFFER</button>
            <button className="flex-1 py-3 text-slate-500">EVEN/ODD</button>
            <button className="flex-1 py-3 text-slate-500">OVER/UNDER</button>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button className="flex-1 py-1.5 rounded-md bg-blue-600 text-sm font-medium">AUTO</button>
              <button className="flex-1 py-1.5 rounded-md text-sm text-slate-400">MANUAL</button>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5">STAKE</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setStake(Math.max(1, stake - 1))} className="w-9 h-9 rounded-lg bg-white/5 text-lg">−</button>
                <div className="flex-1 bg-white/5 rounded-lg py-2 text-center font-semibold text-lg">$ {stake}</div>
                <button onClick={() => setStake(stake + 1)} className="w-9 h-9 rounded-lg bg-white/5 text-lg">+</button>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[1, 5, 10, 25, 50, 100].map((v) => (
                  <button key={v} onClick={() => setStake(v)} className={`flex-1 py-1 text-xs rounded-md ${stake === v ? "bg-blue-600" : "bg-white/5"}`}>
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-slate-500 mb-1">TARGET PROFIT</div>
                <div className="font-medium">$200</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-slate-500 mb-1">STOP LOSS</div>
                <div className="font-medium">$999</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-slate-500 mb-1">MULTIPLIER</div>
                <div className="font-medium">x2</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5">SELECT DIGIT</div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0,1,2,3,4,5,6,7,8,9].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDigit(d)}
                    className={`py-2 rounded-lg text-sm font-medium transition ${
                      selectedDigit === d ? "bg-blue-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => placeTrade("match")}
                disabled={isTrading || stake > currentBalance}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold flex items-center justify-between px-4 disabled:opacity-50 transition"
              >
                <span>Match</span>
                <span className="text-sm opacity-90">${(stake * 8.5).toFixed(2)} • 850%</span>
              </button>
              <button
                onClick={() => placeTrade("differ")}
                disabled={isTrading || stake > currentBalance}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold flex items-center justify-between px-4 disabled:opacity-50 transition"
              >
                <span>Differ</span>
                <span className="text-sm opacity-90">${(stake * 0.95).toFixed(2)} • 5%</span>
              </button>
            </div>

            {result && (
              <div className={`text-center py-2.5 rounded-xl text-sm font-medium ${
                result === "win" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
              }`}>
                {result === "win" ? `You won $${payout.toFixed(2)}!` : "Trade lost"}
              </div>
            )}

            {isTrading && (
              <div className="text-center text-xs text-slate-400 animate-pulse">Trade running... 5s</div>
            )}
          </div>
        </div>

        {/* RIGHT - Open / Closed / Transactions */}
        <div className="hidden lg:flex w-[260px] border-l border-white/5 flex-col bg-[#0c1018]">
          <div className="flex border-b border-white/5 text-xs">
            <button onClick={() => setActiveTab("open")} className={`flex-1 py-3 ${activeTab === "open" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-500"}`}>
              Open (0)
            </button>
            <button onClick={() => setActiveTab("closed")} className={`flex-1 py-3 ${activeTab === "closed" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-500"}`}>
              Closed
            </button>
            <button onClick={() => setActiveTab("transactions")} className={`flex-1 py-3 ${activeTab === "transactions" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-500"}`}>
              Transactions
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500 text-sm">
            <div>
              <div className="text-4xl mb-3 opacity-25">📦</div>
              <div className="font-medium text-slate-400">No open positions</div>
              <div className="text-xs mt-1">Your active trades will appear here</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}