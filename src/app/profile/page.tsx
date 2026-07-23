"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        setFullName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSave = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      setMessage("Error updating profile");
    } else {
      setMessage("Profile updated successfully");
    }
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
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
            <span className="text-xl font-bold">TagBinary</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/trade" className="hover:text-white transition">Trade</Link>
            <Link href="/history" className="hover:text-white transition">History</Link>
            <Link href="/deposit" className="hover:text-white transition">Deposit</Link>
            <Link href="/profile" className="text-white">Profile</Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account information</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {fullName ? fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="text-xl font-semibold">{fullName || "User"}</div>
              <div className="text-slate-400 text-sm">{email}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950 rounded-xl p-4">
              <div className="text-slate-400 mb-1">Member since</div>
              <div className="font-medium">July 2026</div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4">
              <div className="text-slate-400 mb-1">Account Status</div>
              <div className="font-medium text-green-400">Active</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-5">Personal Information</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 opacity-60 cursor-not-allowed"
              />
            </div>

            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Save Changes
            </button>

            {message && (
              <div className="text-green-400 text-sm mt-2">{message}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}