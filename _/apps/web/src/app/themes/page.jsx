"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Crown,
  Check,
  Lock,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import useUser from "../../utils/useUser";

export default function Themes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user, loading: userLoading } = useUser();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const themes = [
    {
      id: "default",
      name: "Default",
      description: "Clean and simple",
      image: null,
      colors: {
        primary: "#2962FF",
        secondary: "#E8E9EC",
        background: "#FFFFFF",
      },
      premium: false,
    },
    {
      id: "minimal",
      name: "Minimal White",
      description: "Pure and focused",
      image: null,
      colors: {
        primary: "#000000",
        secondary: "#F5F5F5",
        background: "#FFFFFF",
      },
      premium: false,
    },
    {
      id: "forest",
      name: "Forest Calm",
      description: "Nature-inspired serenity",
      image:
        "https://raw.createusercontent.com/6f4dc8ad-dde1-49b9-b384-9b662b4f6093/",
      colors: {
        primary: "#2D5016",
        secondary: "#E8F5E9",
        background: "#F1F8E9",
      },
      premium: true,
    },
    {
      id: "ocean",
      name: "Ocean Breeze",
      description: "Calm and refreshing",
      image: null,
      colors: {
        primary: "#0277BD",
        secondary: "#E1F5FE",
        background: "#E0F7FA",
      },
      premium: false,
    },
    {
      id: "sunset",
      name: "Sunset Warmth",
      description: "Warm and cozy",
      image:
        "https://raw.createusercontent.com/8f0d8ff6-b2e9-4f1b-a20d-559892682650/",
      colors: {
        primary: "#E65100",
        secondary: "#FFF3E0",
        background: "#FFF8E1",
      },
      premium: true,
    },
    {
      id: "midnight",
      name: "Midnight Study",
      description: "Focus in the dark",
      image: null,
      colors: {
        primary: "#5E35B1",
        secondary: "#311B92",
        background: "#1A1A2E",
      },
      premium: true,
    },
    {
      id: "cherry",
      name: "Cherry Blossom",
      description: "Soft and delicate",
      image: null,
      colors: {
        primary: "#C2185B",
        secondary: "#FCE4EC",
        background: "#FFF0F5",
      },
      premium: true,
    },
  ];

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      if (!response.ok) throw new Error("Failed to fetch preferences");

      const { preferences: prefs } = await response.json();
      setPreferences(prefs);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setPreferences({
        theme: "default",
        accent_color: "#2962FF",
        layout: "default",
        timer_sound: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = async (themeId, isPremium) => {
    if (isPremium && !user?.is_premium) {
      window.location.href = "/premium";
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update theme");
      }

      const { preferences: updated } = await response.json();
      setPreferences(updated);
      alert("Theme updated!");
    } catch (error) {
      console.error("Error updating theme:", error);
      alert(error.message || "Failed to update theme");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-sm text-gray-700 font-['Instrument_Sans']">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <section className="flex-1 flex flex-col min-w-0">
        <header className="h-14 px-4 md:px-8 flex items-center justify-between border-b border-[#E8E9EC]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-2 min-w-[300px]">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search themes..."
                className="placeholder-gray-400 text-sm flex-1 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="w-6 h-6 rounded-full border-4 border-[#2962FF]"></div>

          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#2962FF] flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.[0] || "U"}
              </div>
              <span className="hidden sm:block font-medium text-gray-900">
                {user?.name || "User"}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">
                  Themes
                </h1>
                <p className="text-gray-600">
                  Choose a theme to customize your study experience
                </p>
              </div>

              {!user?.is_premium && (
                <a
                  href="/premium"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                >
                  <Crown size={16} />
                  Upgrade for More
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                    preferences?.theme === theme.id
                      ? "border-[#2962FF] shadow-lg"
                      : "border-[#E8E9EC] hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectTheme(theme.id, theme.premium)}
                >
                  {theme.premium && (
                    <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      {user?.is_premium ? (
                        <>
                          <Crown size={12} />
                          Premium
                        </>
                      ) : (
                        <>
                          <Lock size={12} />
                          Premium
                        </>
                      )}
                    </div>
                  )}

                  {preferences?.theme === theme.id && (
                    <div className="absolute top-3 left-3 z-10 bg-[#2962FF] text-white p-1.5 rounded-full">
                      <Check size={16} />
                    </div>
                  )}

                  <div
                    className="h-40 relative"
                    style={{
                      background: theme.image
                        ? `url(${theme.image})`
                        : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!theme.image && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-4xl font-bold opacity-20">
                          Aa
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-gray-500">{theme.description}</p>

                    <div className="flex gap-2 mt-3">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: theme.colors.primary }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: theme.colors.secondary }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: theme.colors.background }}
                      ></div>
                    </div>
                  </div>

                  {theme.premium && !user?.is_premium && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center">
                      <Lock size={32} className="text-white opacity-80" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {saving && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-gray-700">Updating theme...</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </section>
    </div>
  );
}