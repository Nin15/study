"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  Crown,
  Palette,
  Layout,
  Volume2,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import useUser from "../../utils/useUser";

export default function Premium() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user, loading } = useUser();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await fetch("/api/stripe-checkout-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ redirectURL: window.location.href }),
      });

      if (!response.ok) {
        throw new Error("Failed to get checkout link");
      }

      const { url } = await response.json();
      if (url) {
        if (window.self !== window.top) {
          window.open(url, "_blank", "popup");
        } else {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Could not start the upgrade process. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const features = [
    {
      icon: Palette,
      title: "Custom Themes",
      description: "Choose from beautiful pre-made themes or create your own",
    },
    {
      icon: Palette,
      title: "Accent Colors",
      description: "Personalize your app with custom accent colors",
    },
    {
      icon: Layout,
      title: "Custom Layouts",
      description: "Switch between compact and spacious layouts",
    },
    {
      icon: Volume2,
      title: "Timer Sounds",
      description: "Choose from relaxing sounds for your study sessions",
    },
    {
      icon: ImageIcon,
      title: "Premium Templates",
      description: "Access exclusive background templates and themes",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden text-sm font-['Instrument_Sans']"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <section className="flex-1 flex flex-col min-w-0">
        <header
          className="h-14 px-4 md:px-8 flex items-center justify-between border-b"
          style={{ borderColor: "var(--color-secondary)" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>

          <div
            className="w-6 h-6 rounded-full border-4"
            style={{ borderColor: "var(--color-primary)" }}
          ></div>

          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {user?.name?.[0] || "U"}
              </div>
              <span className="hidden sm:block font-medium text-gray-900">
                {user?.name || "User"}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4">
                <Crown size={40} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Upgrade to Premium
              </h1>
              <p className="text-lg text-gray-600">
                Unlock all features and customize your study experience
              </p>
            </div>

            {user?.is_premium ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You're a Premium Member!
                </h2>
                <p className="text-gray-600">
                  Enjoy all premium features. Go to Settings to customize your
                  experience.
                </p>
                <a
                  href="/themes"
                  className="inline-block mt-6 px-6 py-3 text-white rounded-full font-semibold transition-colors"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Customize Themes
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    $4.99
                    <span className="text-lg font-normal text-gray-600">
                      /month
                    </span>
                  </div>
                  <p className="text-gray-600">Cancel anytime</p>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full py-4 bg-gradient-to-r text-white rounded-full font-semibold text-lg transition-all shadow-lg mb-6 disabled:opacity-50"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-primary))`,
                  }}
                >
                  {upgrading ? "Processing..." : "Upgrade Now"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By upgrading, you agree to our{" "}
                  <a
                    href="/terms"
                    className="hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon
                          size={24}
                          style={{ color: "var(--color-primary)" }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}