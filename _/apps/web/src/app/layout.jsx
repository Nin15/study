"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import useUser from "../utils/useUser";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Theme definitions
const THEMES = {
  default: {
    colors: { primary: "#2962FF", secondary: "#E8E9EC", background: "#FFFFFF" },
  },
  minimal: {
    colors: { primary: "#000000", secondary: "#F5F5F5", background: "#FFFFFF" },
  },
  forest: {
    colors: { primary: "#2D5016", secondary: "#E8F5E9", background: "#F1F8E9" },
  },
  ocean: {
    colors: { primary: "#0277BD", secondary: "#E1F5FE", background: "#E0F7FA" },
  },
  sunset: {
    colors: { primary: "#E65100", secondary: "#FFF3E0", background: "#FFF8E1" },
  },
  midnight: {
    colors: { primary: "#5E35B1", secondary: "#311B92", background: "#1A1A2E" },
  },
  cherry: {
    colors: { primary: "#C2185B", secondary: "#FCE4EC", background: "#FFF0F5" },
  },
};

function AuthProtection({ children }) {
  const { data: user, loading } = useUser();

  // Apply theme when preferences change
  useEffect(() => {
    if (!user?.preferences?.theme) return;

    const themeId = user.preferences.theme;
    const theme = THEMES[themeId];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty("--color-secondary", theme.colors.secondary);
    root.style.setProperty("--color-bg", theme.colors.background);
    root.style.setProperty("--color-text", "#1F2937"); // gray-800
    root.style.setProperty("--color-accent", theme.colors.primary); // use primary as accent
  }, [user?.preferences?.theme]);

  useEffect(() => {
    if (loading) return;
    const pathname = window.location.pathname;
    const isAuthPage = pathname.startsWith("/account/");
    if (!isAuthPage && !user) window.location.href = "/account/signup";
  }, [user, loading]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  const isAuthPage =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/account/");
  if (isAuthPage || user) return children;
  return null;
}

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProtection>{children}</AuthProtection>
    </QueryClientProvider>
  );
}