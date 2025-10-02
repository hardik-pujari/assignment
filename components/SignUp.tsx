"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prechecking, setPrechecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/signin");
        if (!cancelled && res.status === 200 && res.data?.user) {
          router.push("/dashboard");
        }
      } catch (err) {
        // not signed in — show signup form
      } finally {
        if (!cancelled) setPrechecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/signup",
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.status === 201 || res.status === 200) {
        setSuccess("Account created — redirecting...");
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Sign up failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl transform transition-all duration-700 ease-out hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-6">
            <div className="logo w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-green-400 to-teal-500 text-white shadow-md animate-float">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M12 2C7 2 3 6 3 11c0 7 9 11 9 11s9-4 9-11c0-5-4-9-9-9z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Create account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start your free trial — no credit card required
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

            {/* Google sign-up removed: leaving divider into form */}

            <div className="relative flex items-center py-3">
              <div className="flex-grow h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 opacity-80" />

              <div className="flex-grow h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 opacity-80" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 bg-white dark:bg-gray-950 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>

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
                  placeholder="Create a password"
                  className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 bg-white dark:bg-gray-950 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Confirm password
                </span>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type="password"
                  placeholder="Repeat password"
                  className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 bg-white dark:bg-gray-950 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              By creating an account you agree to our terms.
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <a
                href="/signin"
                className="text-indigo-600 hover:underline font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
