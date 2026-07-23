import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-[#0B1120]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">T</div>
            <span className="text-xl font-bold tracking-tight">TagBinary</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition">
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/15 via-transparent to-transparent"></div>
        
        <div className="max-w-6xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-700 text-sm px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live markets open 24/7
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Trade Binary Options<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              with Confidence
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Fast execution, high payouts up to 95%, and a professional platform designed for both beginners and experienced traders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition shadow-xl shadow-blue-600/25"
            >
              Start Trading Free
            </Link>
            <Link
              href="/login"
              className="bg-slate-800/80 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition border border-slate-700"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why traders choose us</h2>
          <p className="text-slate-400 text-lg">Everything you need in one powerful platform</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-blue-600/40 transition duration-300">
            <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-slate-400 leading-relaxed">
              Execute trades in milliseconds with our optimized engine and real-time price feeds.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-blue-600/40 transition duration-300">
            <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
              📈
            </div>
            <h3 className="text-xl font-semibold mb-3">High Payouts</h3>
            <p className="text-slate-400 leading-relaxed">
              Enjoy competitive returns up to 95% on successful trades across multiple assets.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-blue-600/40 transition duration-300">
            <div className="w-14 h-14 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
              🔒
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
            <p className="text-slate-400 leading-relaxed">
              Bank-level security, encrypted connections, and full control over your funds.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 md:p-16 text-center shadow-2xl shadow-blue-600/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start trading?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Create your free account in less than 60 seconds and get access to the full platform.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-xl text-lg hover:bg-slate-100 transition shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>© 2026 TagBinary. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition">Terms</a>
            <a href="#" className="hover:text-slate-300 transition">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}