"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [prechecking, setPrechecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // precheck server-side token via API
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/signin");
        if (!cancelled && res.status === 200 && res.data?.user) {
          router.push("/dashboard");
        }
      } catch (err) {
        // not authenticated or error -> show sign-in form
      } finally {
        if (!cancelled) setPrechecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);
  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/signin",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.status === 200) {
        setSuccess("Signed in — redirecting...");
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Sign in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in removed (UI simplified)

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl transform transition-all duration-700 ease-out hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-6">
            <div className="logo w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-pink-500 text-white shadow-md animate-float">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M12 2L15 8H9L12 2Z" fill="currentColor" />
                <path
                  d="M12 22L9 16H15L12 22Z"
                  fill="currentColor"
                  opacity="0.85"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Welcome back</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign in to continue to your dashboard
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {success && (
              <div className="text-sm text-green-700 dark:text-green-300">
                {success}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="relative flex items-center py-3">
              <div className="flex-grow h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 opacity-80" />

              <div className="flex-grow h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 opacity-80" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 bg-white dark:bg-gray-950 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Password
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 bg-white dark:bg-gray-950 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <a className="text-sm text-indigo-600 hover:underline" href="#">
                  Forgot?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              By continuing you agree to our terms of service.
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-indigo-600 hover:underline font-medium"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
