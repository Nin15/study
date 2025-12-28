"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  FolderPlus,
  FileText,
  ChevronRight,
  Trash2,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";

export default function Subjects() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, foldersRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/folders"),
      ]);

      if (!subjectsRes.ok || !foldersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const { subjects: subjectsData } = await subjectsRes.json();
      const { folders: foldersData } = await foldersRes.json();

      setSubjects(subjectsData);
      setFolders(foldersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          subjectId: selectedSubjectId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      setNewFolderName("");
      setShowNewFolderModal(false);
      setSelectedSubjectId(null);
      fetchData();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder");
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;

    try {
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete folder");

      fetchData();
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder");
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (folder.subject_name &&
        folder.subject_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFoldersForSubject = (subjectId) => {
    return filteredFolders.filter((f) => f.subject_id === subjectId);
  };

  const getStandaloneFolders = () => {
    return filteredFolders.filter((f) => f.subject_id === null);
  };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              My Subjects
              {searchQuery && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  - Results for "{searchQuery}"
                </span>
              )}
            </h1>
          </div>

          {/* TOK and EE Folders */}
          {getStandaloneFolders().length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Core Components
              </h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {getStandaloneFolders().map((folder) => (
                  <a
                    key={folder.id}
                    href={`/subjects/folder/${folder.id}`}
                    className="rounded-lg border p-4 hover:border-opacity-100 transition-colors cursor-pointer group"
                    style={{
                      borderColor: "var(--color-secondary)",
                      backgroundColor: "var(--color-background)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                          <FileText size={20} className="text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {folder.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {folder.document_count || 0} documents
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteFolder(folder.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                      >
                        <Trash2 size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Subject Folders */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              IB Subjects
            </h2>
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No subjects found matching "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSubjects.map((subject) => {
                  const subjectFolders = getFoldersForSubject(subject.id);
                  return (
                    <div
                      key={subject.id}
                      className="rounded-lg border p-4"
                      style={{
                        borderColor: "var(--color-secondary)",
                        backgroundColor: "var(--color-background)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          ></div>
                          <h3 className="font-semibold text-gray-900">
                            {subject.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {subject.level}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSubjectId(subject.id);
                            setShowNewFolderModal(true);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-blue-50 rounded-lg transition-colors"
                          style={{ color: "var(--color-primary)" }}
                        >
                          <FolderPlus size={16} />
                          New Folder
                        </button>
                      </div>

                      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {subjectFolders.map((folder) => (
                          <a
                            key={folder.id}
                            href={`/subjects/folder/${folder.id}`}
                            className="rounded-lg border bg-gray-50 p-3 hover:bg-white transition-colors cursor-pointer group flex items-center justify-between"
                            style={{ borderColor: "var(--color-secondary)" }}
                          >
                            <div className="flex items-center gap-2">
                              <FileText size={18} className="text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {folder.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {folder.document_count || 0} documents
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteFolder(folder.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                              >
                                <Trash2 size={14} className="text-gray-400" />
                              </button>
                              <ChevronRight
                                size={16}
                                className="text-gray-400"
                              />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </section>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Folder
            </h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none mb-4"
              style={{ borderColor: "var(--color-secondary)" }}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName("");
                  setSelectedSubjectId(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}