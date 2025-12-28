"use client";

import { useState, useEffect } from "react";
import useAuth from "../../../utils/useAuth";
import useUser from "../../../utils/useUser";

export default function SignIn() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();
  const { data: user, loading: userLoading } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (!userLoading && user) {
      window.location.href = "/";
    }
  }, [user, userLoading]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (userLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Don't render signin form if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white font-['Instrument_Sans']">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap");
      `}</style>

      <form noValidate onSubmit={onSubmit} className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-4 border-[#2962FF] mx-auto mb-4"></div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">Sign in to your IB Study Hub account</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-[#E8E9EC] rounded-lg focus:outline-none focus:border-[#2962FF] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E9EC] rounded-lg focus:outline-none focus:border-[#2962FF] transition-colors"
              placeholder="Enter your password"
            />
            <div className="text-right">
              <a
                href="/account/forgot-password"
                className="text-sm text-[#2962FF] hover:text-[#1E4FCC] font-medium"
              >
                Forgot password?
              </a>
            </div>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="text-[#2962FF] hover:text-[#1E4FCC] font-medium"
            >
              Sign up
            </a>
          </p>

          <div className="flex justify-center gap-3 text-xs text-gray-500 mt-4">
            <a href="/terms" className="hover:text-gray-700 transition-colors">
              Terms
            </a>
            <span>•</span>
            <a
              href="/privacy"
              className="hover:text-gray-700 transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
