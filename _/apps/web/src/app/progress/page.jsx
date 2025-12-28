"use client";

import { useState, useEffect } from "react";
import { Menu, Bell, Search, ChevronDown, MoreHorizontal } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Progress() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `/api/pomodoro/stats?timeRange=${timeRange}`
      );
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();

      const chartData = data.timeBreakdown.map((item) => ({
        label: item.period,
        sessions: parseInt(item.sessions || 0),
        minutes: parseInt(item.minutes || 0),
      }));

      setStats({
        totalSessions: data.totalSessions,
        totalMinutes: data.totalMinutes,
        chartData,
        subjectBreakdown: data.subjectBreakdown.map((item) => ({
          subject: item.name,
          sessions: parseInt(item.sessions || 0),
          minutes: parseInt(item.minutes || 0),
          color: item.color,
        })),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalSessions: 0,
        totalMinutes: 0,
        chartData: [],
        subjectBreakdown: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#4B5563] text-white p-2 rounded-[10px] text-xs">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading || !stats) {
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
                S
              </div>
              <span className="hidden sm:block font-medium text-gray-900">
                Student
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
              Progress Tracking
            </h1>

            <div
              className="flex rounded-full border overflow-hidden divide-x"
              style={{ borderColor: "var(--color-secondary)" }}
            >
              <button
                onClick={() => setTimeRange("week")}
                className={`px-4 py-1.5 font-medium transition-colors ${
                  timeRange === "week"
                    ? "text-gray-900 bg-gray-50"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-4 py-1.5 font-medium transition-colors ${
                  timeRange === "month"
                    ? "text-gray-900 bg-gray-50"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-6">
            <div
              className="rounded-lg border p-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Sessions
              </h3>
              <p className="text-4xl font-semibold text-gray-900">
                {stats.totalSessions}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {timeRange === "week" ? "This week" : "This month"}
              </p>
            </div>

            <div
              className="rounded-lg border p-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Study Time
              </h3>
              <p className="text-4xl font-semibold text-gray-900">
                {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}
                m
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {timeRange === "week" ? "This week" : "This month"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
            <div
              className="rounded-lg border p-4"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Study Sessions
                </h3>
                <button className="hover:bg-gray-100 p-1 rounded transition-colors">
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="h-64">
                {stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#9CA3AF" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#9CA3AF" }}
                        width={40}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="sessions"
                        fill="var(--color-primary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            <div
              className="rounded-lg border p-4"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Study Time (minutes)
                </h3>
                <button className="hover:bg-gray-100 p-1 rounded transition-colors">
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="h-64">
                {stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#9CA3AF" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#9CA3AF" }}
                        width={40}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#22C55E"
                        strokeWidth={3}
                        dot={{ fill: "#22C55E", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{
              borderColor: "var(--color-secondary)",
              backgroundColor: "var(--color-background)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">
                Subject Breakdown
              </h3>
              <button className="hover:bg-gray-100 p-1 rounded transition-colors">
                <MoreHorizontal size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              {stats.subjectBreakdown.length > 0 ? (
                stats.subjectBreakdown.map((subject, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {subject.subject}
                        </span>
                        <span className="text-sm text-gray-500">
                          {subject.sessions} sessions · {subject.minutes} min
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              stats.totalMinutes > 0
                                ? (subject.minutes / stats.totalMinutes) * 100
                                : 0
                            }%`,
                            backgroundColor: subject.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No study sessions yet
                </div>
              )}
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}