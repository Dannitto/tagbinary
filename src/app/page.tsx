"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [price, setPrice] = useState(9241.45);

  // Simple live price animation for the demo chart
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = (Math.random() - 0.5) * 12;
        return Number((prev + change).toFixed(2));
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const assets = [
    { name: "Volatility 10", change: "+0.42%", color: "text-green-400" },
    { name: "Volatility 25", change: "-0.18%", color: "text-red-400" },
    { name: "Volatility 50", change: "+0.31%", color: "text-green-400" },
    { name: "Volatility 75", change: "+0.09%", color: "text-green-400" },
    { name: "Volatility 100", change: "-0.27%", color: "text-red-400" },
    { name: "Boom 1000", change: "+1.12%", color: "text-green-400" },
    { name: "Crash 1000", change: "-0.84%", color: "text-red-400" },
    { name: "EUR/USD", change: "+0.06%", color: "text-green-400" },
    { name: "GBP/USD", change: "-0.11%", color: "text-red-400" },
    { name: "XAU/USD", change: "+0.23%", color: "text-green-400" },
  ];

  const testimonials = [
    {
      name: "Alex M.",
      country: "USA",
      initials: "AM",
      text: "Switched from three other platforms. Tag Forex is the fastest and most reliable by far.",
    },
    {
      name: "Sarah K.",
      country: "UK",
      initials: "SK",
      text: "From crypto to forex, everything in one place. The interface is buttery smooth.",
    },
    {
      name: "James W.",
      country: "Germany",
      initials: "JW",
      text: "10 years of trading experience and this is the best platform I've ever used.",
    },
    {
      name: "Maria G.",
      country: "Brazil",
      initials: "MG",
      text: "Started with demo and now trade real money. Withdrawals are super fast!",
    },
    {
      name: "David H.",
      country: "Japan",
      initials: "DH",
      text: "Sub-second execution. Perfect for my scalping strategy. Highly recommended.",
    },
    {
      name: "Lisa T.",
      country: "France",
      initials: "LT",
      text: "I trade part-time and the mobile experience is flawless. Love the simplicity.",
    },
  ];

  const liveTraders = [
    { name: "James K.", action: "Won $48.50", asset: "Volatility 10", time: "2s ago", type: "win" },
    { name: "Amina O.", action: "Won $22.00", asset: "EUR/USD", time: "5s ago", type: "win" },
    { name: "Carlos R.", action: "Lost $10.00", asset: "Volatility 25", time: "8s ago", type: "loss" },
    { name: "Priya S.", action: "Won $95.00", asset: "XAU/USD", time: "12s ago", type: "win" },
    { name: "David M.", action: "Won $31.20", asset: "Boom 1000", time: "15s ago", type: "win" },
    { name: "Fatima L.", action: "Lost $15.00", asset: "Volatility 75", time: "18s ago", type: "loss" },
    { name: "Kevin T.", action: "Won $67.80", asset: "Volatility 10", time: "22s ago", type: "win" },
    { name: "Sofia P.", action: "Won $18.50", asset: "GBP/USD", time: "25s ago", type: "win" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e17] text-white overflow-x-hidden">
      {/* ===== Top Navigation ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b0e17]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
              TF
            </div>
            <span className="font-semibold text-lg tracking-tight">Tag Forex</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#live" className="hover:text-white transition">Live Traders</a>
            <a href="#testimonials" className="hover:text-white transition">Reviews</a>
            <Link href="/login" className="hover:text-white transition">Login</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm text-slate-300 hover:text-white px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Trading Made Easy,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Trade Smart
            </span>
          </h1>
          <p className="mt-5 text-slate-400 text-lg max-w-2xl mx-auto">
            Trade 1000+ assets worldwide with lightning execution and up to 95% return.
            Start with as little as $1.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-full transition shadow-lg shadow-blue-600/25"
            >
              Get Started
            </Link>
            <Link
              href="/trade"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-3.5 rounded-full transition"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Live Ticker ===== */}
      <div className="border-y border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-3">
          {[...assets, ...assets].map((asset, i) => (
            <div key={i} className="inline-flex items-center gap-2 mx-6 text-sm">
              <span className="text-slate-300">{asset.name}</span>
              <span className={asset.color}>{asset.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Floating Chart Card ===== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-[#12161f] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-slate-400">Volatility 10 Index</div>
                <div className="text-2xl font-semibold mt-0.5">${price.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 text-sm font-medium">+0.45%</div>
                <div className="text-xs text-slate-500">24h</div>
              </div>
            </div>

            {/* Fake chart line */}
            <div className="h-40 relative overflow-hidden rounded-xl bg-[#0b0e17]">
              <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M0,80 C40,70 80,90 120,60 C160,30 200,50 240,40 C280,30 320,70 360,50 L400,45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                <path
                  d="M0,80 C40,70 80,90 120,60 C160,30 200,50 240,40 C280,30 320,70 360,50 L400,45 L400,120 L0,120 Z"
                  fill="url(#grad)"
                  opacity="0.15"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">Even</span>
                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400">Odd</span>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400">Rise</span>
              </div>
              <Link
                href="/trade"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-full transition"
              >
                Start Trading
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Live Traders Section ===== */}
      <section id="live" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              LIVE
            </div>
            <h2 className="text-3xl font-bold">Live Traders Activity</h2>
            <p className="text-slate-400 mt-2">See what other traders are doing right now</p>
          </div>

          <div className="bg-[#12161f] border border-white/10 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {liveTraders.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.asset}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        t.type === "win" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {t.action}
                    </div>
                    <div className="text-xs text-slate-500">{t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Built for serious traders</h2>
          <p className="text-slate-400 mb-12">Everything you need to trade with confidence</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Blazing Fast", desc: "Orders executed in under 100ms with institutional-grade infrastructure." },
              { title: "Fully Secured", desc: "Bank-level encryption and segregated client funds." },
              { title: "24/7 Markets", desc: "Trade synthetic indices, forex and commodities around the clock." },
              { title: "Low Minimums", desc: "Start trading with as little as $1 — perfect for beginners." },
              { title: "Trade Anywhere", desc: "Seamless experience on desktop, tablet and mobile." },
              { title: "24/7 Support", desc: "Dedicated support team ready whenever you need help." },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-left hover:border-white/10 transition"
              >
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials / Wall of Love ===== */}
      <section id="testimonials" className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-blue-400 text-sm font-medium tracking-wider mb-2">
              WALL OF LOVE
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">What traders say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-[#12161f] border border-white/5 rounded-2xl p-6 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, star) => (
                    <svg
                      key={star}
                      className="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">
                  "{t.text}"
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Three steps to your first trade</h2>
          <p className="text-slate-400 mb-12">Get started in less than 2 minutes</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up in seconds with just your email." },
              { step: "02", title: "Make a Deposit", desc: "Fund your account via M-Pesa, cards or crypto." },
              { step: "03", title: "Start Trading", desc: "Choose an asset and place your first trade." },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-bold text-white/5 absolute -top-4 left-1/2 -translate-x-1/2">
                  {s.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link
              href="/signup"
              className="inline-flex bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-full transition shadow-lg shadow-blue-600/25"
            >
              Open Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
              TF
            </div>
            <span>Tag Forex</span>
          </div>
          <p>© 2026 Tag Forex. All rights reserved.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}