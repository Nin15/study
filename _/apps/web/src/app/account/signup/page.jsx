"use client";

import { useState, useEffect } from "react";
import useAuth from "../../../utils/useAuth";
import useUser from "../../../utils/useUser";

export default function SignUp() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signUpWithCredentials } = useAuth();
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Check if email already exists
    try {
      const checkResponse = await fetch(
        `/api/profile?email=${encodeURIComponent(email)}`,
      );
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        if (data.exists) {
          setError(
            "This email is already registered. Please sign in instead or use a different email.",
          );
          setLoading(false);
          return;
        }
      }
    } catch (checkError) {
      console.error("Error checking email:", checkError);
      // Continue with signup even if check fails
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        "Unable to create account. This email may already be registered.",
      );
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

  // Don't render signup form if user is already logged in
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
            Join IB Study Hub
          </h1>
          <p className="text-gray-500">Create your account to get started</p>
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
              placeholder="Create a password (min. 6 characters)"
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-[#2962FF] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-[#2962FF] hover:underline">
              Privacy Policy
            </a>
          </p>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-[#2962FF] hover:text-[#1E4FCC] font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
