"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Save,
  Trash2,
  Crown,
  Palette,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import useUser from "../../utils/useUser";

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user, loading: userLoading } = useUser();
  const [settings, setSettings] = useState({
    studyDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notificationsEnabled: true,
  });
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchPreferences();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");

      const { settings: data } = await response.json();
      setSettings({
        studyDuration: data.study_duration,
        shortBreak: data.short_break,
        longBreak: data.long_break,
        autoStartBreaks: data.auto_start_breaks,
        autoStartPomodoros: data.auto_start_pomodoros,
        notificationsEnabled: data.notifications_enabled,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyDuration: settings.studyDuration,
          shortBreak: settings.shortBreak,
          longBreak: settings.longBreak,
          autoStartBreaks: settings.autoStartBreaks,
          autoStartPomodoros: settings.autoStartPomodoros,
          notificationsEnabled: settings.notificationsEnabled,
        }),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.is_premium && preferences.accent_color !== "#2962FF") {
      alert("Custom accent colors require premium");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accentColor: preferences.accent_color,
          layout: preferences.layout,
          timerSound: preferences.timer_sound,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to save preferences");
      }

      alert("Preferences saved!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert(error.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete account");

      window.location.href = "/account/signup";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || userLoading) {
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

            <div className="hidden md:flex items-center gap-2 px-3 py-2 min-w-[300px]">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects, folders..."
                className="placeholder-gray-400 text-sm flex-1 bg-transparent focus:outline-none"
              />
            </div>
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

        <main
          className="flex-1 overflow-y-auto p-4 md:p-8"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-medium text-gray-900">
              Settings
            </h1>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-medium text-white ${
                saving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""
              }`}
              style={!saving ? { backgroundColor: "var(--color-primary)" } : {}}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="max-w-3xl">
            <div
              className="rounded-lg border p-6 mb-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pomodoro Timer Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.studyDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        studyDuration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: "var(--color-secondary)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreak}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shortBreak: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: "var(--color-secondary)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreak}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        longBreak: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: "var(--color-secondary)" }}
                  />
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div
              className="rounded-lg border p-6 mb-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Appearance
                </h2>
                {!user?.is_premium && (
                  <a
                    href="/premium"
                    className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    <Crown size={14} />
                    Upgrade for more
                  </a>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <a
                    href="/themes"
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "var(--color-secondary)" }}
                  >
                    <Palette size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Current: {preferences?.theme || "default"}
                    </span>
                    <span
                      className="ml-auto text-xs"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Browse themes →
                    </span>
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                    {!user?.is_premium && (
                      <span className="ml-2 text-xs text-yellow-600">
                        (Premium)
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={preferences?.accent_color || "#2962FF"}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          accent_color: e.target.value,
                        })
                      }
                      disabled={!user?.is_premium}
                      className="w-12 h-12 rounded border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ borderColor: "var(--color-secondary)" }}
                    />
                    <span className="text-sm text-gray-600">
                      {preferences?.accent_color || "#2962FF"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout Style
                    {!user?.is_premium && (
                      <span className="ml-2 text-xs text-yellow-600">
                        (Premium)
                      </span>
                    )}
                  </label>
                  <select
                    value={preferences?.layout || "default"}
                    onChange={(e) =>
                      setPreferences({ ...preferences, layout: e.target.value })
                    }
                    disabled={!user?.is_premium}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: "var(--color-secondary)" }}
                  >
                    <option value="default">Default</option>
                    <option value="compact">Compact</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timer Sound
                    {!user?.is_premium && (
                      <span className="ml-2 text-xs text-yellow-600">
                        (Premium)
                      </span>
                    )}
                  </label>
                  <select
                    value={preferences?.timer_sound || "default"}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        timer_sound: e.target.value,
                      })
                    }
                    disabled={!user?.is_premium}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: "var(--color-secondary)" }}
                  >
                    <option value="default">Default Bell</option>
                    <option value="chime">Soft Chime</option>
                    <option value="gong">Meditation Gong</option>
                    <option value="birds">Nature Birds</option>
                    <option value="none">Silent</option>
                  </select>
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-full font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Appearance"}
                </button>
              </div>
            </div>

            <div
              className="rounded-lg border p-6 mb-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Automation
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Auto-start Breaks
                    </p>
                    <p className="text-xs text-gray-500">
                      Automatically start break timer after study session
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoStartBreaks: !settings.autoStartBreaks,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoStartBreaks ? "" : "bg-gray-200"
                    }`}
                    style={
                      settings.autoStartBreaks
                        ? { backgroundColor: "var(--color-primary)" }
                        : {}
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoStartBreaks
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Auto-start Pomodoros
                    </p>
                    <p className="text-xs text-gray-500">
                      Automatically start next study session after break
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoStartPomodoros: !settings.autoStartPomodoros,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoStartPomodoros ? "" : "bg-gray-200"
                    }`}
                    style={
                      settings.autoStartPomodoros
                        ? { backgroundColor: "var(--color-primary)" }
                        : {}
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoStartPomodoros
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div
              className="rounded-lg border p-6 mb-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Notifications
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Enable Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive notifications when timer ends
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notificationsEnabled: !settings.notificationsEnabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notificationsEnabled ? "" : "bg-gray-200"
                  }`}
                  style={
                    settings.notificationsEnabled
                      ? { backgroundColor: "var(--color-primary)" }
                      : {}
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notificationsEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 rounded-lg border border-red-200 bg-red-50 p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Danger Zone
              </h2>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. This will
                permanently delete your account, all your subjects, folders,
                documents, and study data.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-red-300 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 mb-2">
                      Are you absolutely sure?
                    </p>
                    <p className="text-sm text-red-700 mb-4">
                      This action cannot be undone. All your data will be
                      permanently deleted.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deleteLoading
                          ? "Deleting..."
                          : "Yes, delete my account"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteLoading}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}