"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  BookOpen,
  Clock,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import useUser from "../utils/useUser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: user, loading: userLoading } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsRes = await fetch("/api/subjects");
        if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");
        const { subjects } = await subjectsRes.json();

        if (!subjects || subjects.length === 0) {
          window.location.href = "/onboarding";
          return;
        }

        const statsRes = await fetch(
          `/api/pomodoro/stats?timeRange=${timeRange}`
        );
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();

        const weeklyData = statsData.timeBreakdown.map((item) => ({
          day: item.period,
          minutes: parseInt(item.minutes || 0),
        }));

        const subjectData = statsData.subjectBreakdown.map((item) => ({
          subject: item.name,
          minutes: parseInt(item.minutes || 0),
          sessions: parseInt(item.sessions || 0),
        }));

        setStats({
          totalSessions: statsData.totalSessions,
          totalMinutes: statsData.totalMinutes,
          weeklyData,
          subjectData,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setStats({
          totalSessions: 0,
          totalMinutes: 0,
          weeklyData: [],
          subjectData: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) fetchData();
  }, [userLoading, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-text)] text-[var(--color-bg)] p-2 rounded-[10px] text-xs">
          <p className="font-medium">{label}</p>
          <p>{payload[0].value} minutes</p>
        </div>
      );
    }
    return null;
  };

  if (loading || userLoading || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-sm font-['Instrument_Sans'] bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <section className="flex-1 flex flex-col min-w-0">
        <header className="h-14 px-4 md:px-8 flex items-center justify-between border-b border-[var(--color-secondary)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Menu size={20} className="text-[var(--color-text)]" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-2 min-w-[300px]">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects, folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/subjects?search=${encodeURIComponent(
                      searchQuery
                    )}`;
                  }
                }}
                className="placeholder-gray-400 text-sm flex-1 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="w-6 h-6 rounded-full border-4 border-[var(--color-primary)]" />

          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Bell size={20} className="text-[var(--color-text)]" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "S"}
                </div>
                <span className="hidden sm:block font-medium text-[var(--color-text)]">
                  {user?.name || "Student"}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg)] rounded-lg shadow-lg border border-[var(--color-secondary)] py-1 z-20">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                    >
                      Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                    >
                      Settings
                    </a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <a
                      href="/account/logout"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Summary Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
            {/* Total Sessions */}
            <div className="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Sessions
                </h3>
                <Clock size={20} className="text-[var(--color-primary)]" />
              </div>
              <p className="text-3xl font-semibold text-[var(--color-text)]">
                {stats.totalSessions}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {timeRange === "week"
                  ? "This week"
                  : timeRange === "month"
                  ? "This month"
                  : "This year"}
              </p>
            </div>

            {/* Study Time */}
            <div className="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Study Time
                </h3>
                <TrendingUp size={20} className="text-[var(--color-accent)]" />
              </div>
              <p className="text-3xl font-semibold text-[var(--color-text)]">
                {stats.totalMinutes} min
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {timeRange === "week"
                  ? "This week"
                  : timeRange === "month"
                  ? "This month"
                  : "This year"}
              </p>
            </div>

            {/* Active Subjects */}
            <div className="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Active Subjects
                </h3>
                <BookOpen size={20} className="text-[var(--color-accent)]" />
              </div>
              <p className="text-3xl font-semibold text-[var(--color-text)]">
                {stats.subjectData.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">IB subjects</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">
                  {timeRange === "week"
                    ? "Weekly"
                    : timeRange === "month"
                    ? "Monthly"
                    : "Yearly"}{" "}
                  Progress
                </h3>
                <button className="hover:bg-gray-100 p-1 rounded transition-colors">
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.weeklyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--color-text)" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--color-text)" }}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="minutes"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time by Subject */}
            <div className="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-4">
              <div className="space-y-3">
                {stats.subjectData.map((subject, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {subject.subject}
                      </span>
                      <span className="text-xs text-gray-500">
                        {subject.minutes} min
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (subject.minutes / stats.totalMinutes) * 100
                          }%`,
                          backgroundColor: "var(--color-primary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}