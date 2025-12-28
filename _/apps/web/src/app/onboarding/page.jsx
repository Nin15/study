"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

const IB_SUBJECTS = {
  "Group 1: Studies in Language and Literature": [
    "English A: Language and Literature",
    "English A: Literature",
    "Other Language A",
  ],
  "Group 2: Language Acquisition": [
    "Spanish B",
    "French B",
    "Mandarin B",
    "German B",
    "Other Language B",
  ],
  "Group 3: Individuals and Societies": [
    "History",
    "Geography",
    "Economics",
    "Psychology",
    "Business Management",
    "Global Politics",
  ],
  "Group 4: Sciences": [
    "Biology",
    "Chemistry",
    "Physics",
    "Environmental Systems and Societies",
    "Sports, Exercise and Health Science",
  ],
  "Group 5: Mathematics": [
    "Mathematics: Analysis and Approaches",
    "Mathematics: Applications and Interpretation",
  ],
  "Group 6: The Arts": ["Visual Arts", "Music", "Theatre", "Film"],
};

const COLORS = [
  "#2962FF",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export default function Onboarding() {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSubject = (subject) => {
    if (selectedSubjects.find((s) => s.name === subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.name !== subject));
    } else {
      if (selectedSubjects.length < 6) {
        const colorIndex = selectedSubjects.length % COLORS.length;
        setSelectedSubjects([
          ...selectedSubjects,
          {
            name: subject,
            color: COLORS[colorIndex],
            level: "HL",
          },
        ]);
      }
    }
  };

  const updateLevel = (subjectName, level) => {
    setSelectedSubjects(
      selectedSubjects.map((s) =>
        s.name === subjectName ? { ...s, level } : s,
      ),
    );
  };

  const handleContinue = async () => {
    if (step === 1 && selectedSubjects.length === 6) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjects: selectedSubjects }),
        });

        if (!response.ok) {
          throw new Error("Failed to save subjects");
        }

        window.location.href = "/";
      } catch (err) {
        console.error("Error saving subjects:", err);
        setError("Failed to save subjects. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-['Instrument_Sans']">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
      `}</style>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full border-4 border-[#2962FF] mx-auto mb-4"></div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome to IB Study Hub
          </h1>
          <p className="text-gray-500">
            {step === 1
              ? "Select your 6 IB Diploma subjects to get started"
              : "Choose the level for each subject"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-[#2962FF]" : "bg-gray-200"}`}
          ></div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div
            className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-[#2962FF]" : "bg-gray-200"}`}
          ></div>
        </div>

        {step === 1 && (
          <>
            <div className="space-y-6">
              {Object.entries(IB_SUBJECTS).map(([group, subjects]) => (
                <div
                  key={group}
                  className="rounded-lg border border-[#E8E9EC] p-4"
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {group}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {subjects.map((subject) => {
                      const isSelected = selectedSubjects.find(
                        (s) => s.name === subject,
                      );
                      return (
                        <button
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          disabled={!isSelected && selectedSubjects.length >= 6}
                          className={`p-3 rounded-md border text-left text-sm transition-all ${
                            isSelected
                              ? "border-[#2962FF] bg-blue-50 text-[#2962FF] font-medium"
                              : selectedSubjects.length >= 6
                                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{subject}</span>
                            {isSelected && (
                              <Check size={16} className="text-[#2962FF]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Selected:{" "}
                <span className="font-semibold text-[#2962FF]">
                  {selectedSubjects.length}
                </span>{" "}
                / 6 subjects
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-3">
              {selectedSubjects.map((subject, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#E8E9EC] p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="font-medium text-gray-900">
                      {subject.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateLevel(subject.name, "HL")}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        subject.level === "HL"
                          ? "bg-[#2962FF] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      HL
                    </button>
                    <button
                      onClick={() => updateLevel(subject.name, "SL")}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        subject.level === "SL"
                          ? "bg-[#2962FF] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      SL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-5xl mx-auto px-4 mb-4">
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-8">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-full border border-[#E8E9EC] text-gray-700 font-medium hover:border-gray-400 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={selectedSubjects.length !== 6 || loading}
            className={`px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors ${
              selectedSubjects.length === 6 && !loading
                ? "bg-[#2962FF] text-white hover:bg-[#1E4FCC]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving..." : step === 2 ? "Complete Setup" : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
