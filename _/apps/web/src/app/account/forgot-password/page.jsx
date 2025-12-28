"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      // Show success even if user doesn't exist (for security)
      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white font-['Instrument_Sans']">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        `}</style>

        <div className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to{" "}
            <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The link will expire in 1 hour.
          </p>
          <a
            href="/account/signin"
            className="inline-flex items-center gap-2 text-[#2962FF] hover:text-[#1E4FCC] font-medium"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white font-['Instrument_Sans']">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
      `}</style>

      <form onSubmit={onSubmit} className="w-full max-w-md p-8">
        <div className="mb-6">
          <a
            href="/account/signin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </a>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-4 border-[#2962FF] mx-auto mb-4"></div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-500">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-[#E8E9EC] rounded-lg focus:outline-none focus:border-[#2962FF] transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#2962FF] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#1E4FCC] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>
    </div>
  );
}
