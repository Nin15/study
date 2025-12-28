"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  ArrowLeft,
  FilePlus,
  FileText,
  Trash2,
  Calendar,
} from "lucide-react";
import Sidebar from "../../../../components/Sidebar";

export default function FolderView({ params }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [folder, setFolder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const foldersRes = await fetch("/api/folders");
      const docsRes = await fetch(`/api/documents?folderId=${params.id}`);

      if (!foldersRes.ok || !docsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const { folders } = await foldersRes.json();
      const { documents: docsData } = await docsRes.json();

      const currentFolder = folders.find((f) => f.id === parseInt(params.id));
      setFolder(currentFolder);
      setDocuments(docsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocName.trim()) return;

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: params.id,
          name: newDocName,
          content: "",
          fileType: "note",
        }),
      });

      if (!response.ok) throw new Error("Failed to create document");

      const { document } = await response.json();
      setNewDocName("");
      setShowNewDocModal(false);

      // Redirect to document editor
      window.location.href = `/subjects/document/${document.id}`;
    } catch (error) {
      console.error("Error creating document:", error);
      alert("Failed to create document");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents?id=${docId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      fetchData();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading || !folder) {
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
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <a
              href="/subjects"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Back to Subjects
            </a>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {folder.subject_color && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: folder.subject_color }}
                  ></div>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-medium text-gray-900">
                    {folder.name}
                  </h1>
                  {folder.subject_name && (
                    <p className="text-sm text-gray-500">
                      {folder.subject_name}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowNewDocModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2962FF] text-white rounded-full hover:bg-[#1E4FCC] transition-colors font-medium"
              >
                <FilePlus size={16} />
                New Note
              </button>
            </div>
          </div>

          {filteredDocuments.length === 0 && searchQuery ? (
            <div className="text-center py-12 text-gray-500">
              No documents found matching "{searchQuery}"
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first note or upload a document
              </p>
              <button
                onClick={() => setShowNewDocModal(true)}
                className="px-4 py-2 bg-[#2962FF] text-white rounded-full hover:bg-[#1E4FCC] transition-colors"
              >
                Create Note
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <a
                  key={doc.id}
                  href={`/subjects/document/${doc.id}`}
                  className="rounded-lg border border-[#E8E9EC] bg-white p-4 hover:border-[#2962FF] transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText size={20} className="text-[#2962FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {formatDate(doc.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteDocument(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                    >
                      <Trash2 size={16} className="text-gray-400" />
                    </button>
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
      </section>

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Note
            </h2>
            <input
              type="text"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="Note name (e.g. Homework - Chapter 5)"
              className="w-full px-4 py-2 border border-[#E8E9EC] rounded-lg focus:outline-none focus:border-[#2962FF] mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewDocModal(false);
                  setNewDocName("");
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="px-4 py-2 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E4FCC] transition-colors"
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
