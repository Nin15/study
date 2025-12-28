"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  ArrowLeft,
  Save,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
} from "lucide-react";
import Sidebar from "../../../../components/Sidebar";

export default function DocumentEditor({ params }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const editorRef = useRef(null);

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch document");

      const { document: docData } = await response.json();
      setDoc(docData);
      setContent(docData.content || "");

      // Set initial HTML content
      if (editorRef.current) {
        editorRef.current.innerHTML = docData.content || "";
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const htmlContent = editorRef.current?.innerHTML || "";

      const response = await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          content: htmlContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to save document");

      setSaved(true);
      setContent(htmlContent);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = () => {
    setSaved(false);
  };

  const formatText = (command, value = null) => {
    // Focus editor first
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Execute the command
    document.execCommand(command, false, value);

    // Mark as unsaved
    handleContentChange();
  };

  const getWordCount = () => {
    const text = editorRef.current?.textContent || "";
    return text.split(/\s+/).filter((w) => w).length;
  };

  const getCharCount = () => {
    return editorRef.current?.textContent?.length || 0;
  };

  if (loading || !doc) {
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

            <div className="hidden md:flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">{doc.name}</h2>
              {!saved && (
                <span className="text-xs text-gray-400">• Unsaved changes</span>
              )}
              {saved && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check size={12} /> Saved
                </span>
              )}
            </div>
          </div>

          <div className="w-6 h-6 rounded-full border-4 border-[#2962FF]"></div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                saved
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#2962FF] text-white hover:bg-[#1E4FCC]"
              }`}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </button>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#2962FF] flex items-center justify-center text-white font-semibold text-sm">
                S
              </div>
              <span className="hidden sm:block font-medium text-gray-900">
                Student
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Back to Folder
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-3 border border-[#E8E9EC] rounded-t-lg bg-gray-50">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("bold");
                }}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("italic");
                }}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("underline");
                }}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Underline"
              >
                <Underline size={18} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("insertUnorderedList");
                }}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bullet List"
              >
                <List size={18} />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("insertOrderedList");
                }}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Numbered List"
              >
                <ListOrdered size={18} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <select
                onChange={(e) => {
                  formatText("fontSize", e.target.value);
                  e.target.value = "3";
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2962FF]"
                defaultValue="3"
              >
                <option value="1">Small</option>
                <option value="3">Normal</option>
                <option value="5">Large</option>
                <option value="7">Huge</option>
              </select>
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              className="w-full min-h-[600px] p-6 border border-t-0 border-[#E8E9EC] rounded-b-lg focus:outline-none focus:border-[#2962FF] font-['Instrument_Sans'] text-base leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
              style={{
                fontFamily: "Instrument Sans, sans-serif",
              }}
              suppressContentEditableWarning
            />

            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>
                {getWordCount()} words • {getCharCount()} characters
              </span>
              <span>
                Last updated:{" "}
                {new Date(doc.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}