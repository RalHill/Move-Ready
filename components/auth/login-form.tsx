"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        let userFriendlyError = signInError.message;
        
        // Provide more helpful error messages
        if (signInError.message.includes("Invalid login credentials")) {
          userFriendlyError = "Invalid email or password. Please check and try again.";
        } else if (signInError.message.includes("fetch") || signInError.message.includes("Network")) {
          userFriendlyError = "Network error. Check your connection and try again.";
        } else if (signInError.message.includes("not confirmed")) {
          userFriendlyError = "Please confirm your email address before signing in.";
        }
        
        setError(userFriendlyError);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage.includes("fetch") ? "Failed to connect to server. Please check your connection." : errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            placeholder="dispatcher@moveready.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-danger-600 text-sm bg-danger-50 p-3 rounded-md border border-danger-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-800 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600 text-center space-y-2">
        <p className="font-semibold">Demo Credentials (Create in Supabase First):</p>
        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs font-mono">
          <p>dispatcher@test.com</p>
          <p>manager@test.com</p>
          <p>driver@test.com</p>
          <p className="mt-2 text-gray-500">Password: TestPass123!</p>
        </div>
        <p className="text-xs text-gray-500 pt-2">
          👉 <a href="/SUPABASE_SETUP.md" className="underline hover:text-gray-700">Setup Guide</a> to create test users
        </p>
      </div>
    </div>
  );
}
