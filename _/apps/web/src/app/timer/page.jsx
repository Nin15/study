"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Check,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";

export default function PomodoroTimer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("work");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const intervalRef = useRef(null);

  const sessionTypes = [
    { type: "work", label: "Study", duration: 25 },
    { type: "shortBreak", label: "Short Break", duration: 5 },
    { type: "longBreak", label: "Long Break", duration: 15 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, settingsRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/settings"),
      ]);

      if (!subjectsRes.ok || !settingsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const { subjects: subjectsData } = await subjectsRes.json();
      const { settings: settingsData } = await settingsRes.json();

      setSubjects(subjectsData);
      setSettings(settingsData);
      setTimeLeft(settingsData.study_duration * 60);

      sessionTypes[0].duration = settingsData.study_duration;
      sessionTypes[1].duration = settingsData.short_break;
      sessionTypes[2].duration = settingsData.long_break;
    } catch (error) {
      console.error("Error fetching data:", error);
      setSettings({
        study_duration: 25,
        short_break: 5,
        long_break: 15,
        auto_start_breaks: false,
        auto_start_pomodoros: false,
      });
      setTimeLeft(25 * 60);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    if (sessionType === "work" && settings) {
      try {
        await fetch("/api/pomodoro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: selectedSubject?.id || null,
            durationMinutes: settings.study_duration,
            sessionType: "work",
          }),
        });
      } catch (error) {
        console.error("Error saving session:", error);
      }
    }

    if (sessionType === "work" && settings?.auto_start_breaks) {
      setSessionType("shortBreak");
      setTimeLeft(settings.short_break * 60);
      setIsRunning(true);
    } else if (sessionType !== "work" && settings?.auto_start_pomodoros) {
      setSessionType("work");
      setTimeLeft(settings.study_duration * 60);
      setIsRunning(true);
    }
  };

  const toggleTimer = () => {
    if (!isRunning && sessionType === "work" && !selectedSubject) {
      setShowSubjectSelect(true);
      return;
    }

    if (!isRunning) {
      setSessionStartTime(Date.now());
    }

    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSessionStartTime(null);
    const duration = getDurationForSessionType(sessionType);
    setTimeLeft(duration * 60);
  };

  const getDurationForSessionType = (type) => {
    if (!settings) return 25;
    if (type === "work") return settings.study_duration;
    if (type === "shortBreak") return settings.short_break;
    return settings.long_break;
  };

  const changeSessionType = (type) => {
    setIsRunning(false);
    setSessionType(type);
    setSessionStartTime(null);
    const duration = getDurationForSessionType(type);
    setTimeLeft(duration * 60);
  };

  const selectSubject = (subject) => {
    setSelectedSubject(subject);
    setShowSubjectSelect(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = settings
    ? (1 - timeLeft / (getDurationForSessionType(sessionType) * 60)) * 100
    : 0;

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
          <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-8">
            Pomodoro Timer
          </h1>

          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center gap-2 mb-8">
              {sessionTypes.map((session) => (
                <button
                  key={session.type}
                  onClick={() => changeSessionType(session.type)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    sessionType === session.type
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    sessionType === session.type
                      ? { backgroundColor: "var(--color-primary)" }
                      : {}
                  }
                >
                  {session.label}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <div className="w-80 h-80 mx-auto relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    strokeWidth="12"
                    fill="none"
                    style={{ stroke: "var(--color-secondary)" }}
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 140}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 140 * (1 - progress / 100)
                    }`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                    style={{ stroke: "var(--color-primary)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-semibold text-gray-900 mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    {selectedSubject && (
                      <div className="text-sm text-gray-500">
                        {selectedSubject.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {showSubjectSelect && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select a subject for this session
                  </h3>
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => selectSubject(subject)}
                        className="w-full p-3 rounded-lg border hover:bg-blue-50 transition-colors text-left flex items-center gap-3"
                        style={{ borderColor: "var(--color-secondary)" }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {subject.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowSubjectSelect(false)}
                    className="mt-4 w-full py-2 border rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "var(--color-secondary)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={toggleTimer}
                className="w-16 h-16 rounded-full text-white flex items-center justify-center transition-colors shadow-lg"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {isRunning ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} className="ml-1" />
                )}
              </button>
              <button
                onClick={resetTimer}
                className="w-16 h-16 rounded-full border-2 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--color-secondary)" }}
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {sessionType === "work" && !showSubjectSelect && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Study Subject
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                        selectedSubject?.id === subject.id
                          ? "text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      style={
                        selectedSubject?.id === subject.id
                          ? { backgroundColor: "var(--color-primary)" }
                          : {}
                      }
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      {subject.name}
                      {selectedSubject?.id === subject.id && (
                        <Check size={14} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </section>
    </div>
  );
}