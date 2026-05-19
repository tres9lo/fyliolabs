"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderOpen, FileText, ChevronRight, ChevronDown, Save, Loader2, Code, FileCode, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { FileRecord } from "@/types/file";
import type { Folder } from "@/types/folder";

export default function EditorPage() {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Active file editing states
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [originalText, setOriginalText] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  // Load all folders and files in workspace
  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        fetch("/api/files?all=true").then((r) => r.json()),
        fetch("/api/folders").then((r) => r.json()),
      ]);

      if (filesRes.success) setFiles(filesRes.data ?? []);
      if (foldersRes.success) setFolders(foldersRes.data ?? []);
    } catch (err) {
      console.error("Failed to load workspace data:", err);
      toast.error("Failed to load folders or files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  // Utility to determine if a file is an editable text file
  const isEditable = useCallback((file: FileRecord) => {
    const textExtensions = ["txt", "md", "json", "csv", "js", "ts", "tsx", "html", "css", "xml", "py", "sh", "yaml", "yml"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return file.mime_type.startsWith("text/") || textExtensions.includes(ext);
  }, []);

  // Handle active file selection
  const handleSelectFile = async (file: FileRecord) => {
    if (!isEditable(file)) {
      toast.info("Read-only Preview", {
        description: "Only text-based files (txt, md, js, json, css, etc.) are editable.",
      });
      return;
    }

    if (textContent !== originalText) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }

    setSelectedFile(file);
    setLoadingContent(true);
    setTextContent("");
    setOriginalText("");

    try {
      const res = await fetch(file.cloudinary_url);
      if (!res.ok) throw new Error("Could not fetch file content");
      const text = await res.text();
      setTextContent(text);
      setOriginalText(text);
    } catch (err) {
      console.error(err);
      toast.error("Error reading file contents.");
    } finally {
      setLoadingContent(false);
    }
  };

  // Save modified text back to Cloudinary
  const handleSave = async () => {
    if (!selectedFile) return;
    setSavingContent(true);

    try {
      const res = await fetch(`/api/files/${selectedFile.id}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textContent }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setOriginalText(textContent);
        toast.success("Changes saved successfully!");
        // Update local state record in case size changed
        setFiles((prev) => prev.map((f) => (f.id === selectedFile.id ? json.data : f)));
      } else {
        toast.error(json.error || "Save failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving.");
    } finally {
      setSavingContent(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (selectedFile && textContent !== originalText && !savingContent) {
          void handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFile, textContent, originalText, savingContent]);

  // Expand / collapse folder node
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Count lines, words, chars
  const linesCount = textContent.split("\n").length;
  const wordsCount = textContent.trim() === "" ? 0 : textContent.trim().split(/\s+/).length;
  const charsCount = textContent.length;

  // Folder tree rendering helper
  const renderTree = () => {
    // Root files (no folder)
    const rootFiles = files.filter((f) => !f.folder_id);

    return (
      <div className="space-y-4">
        {/* Folders & sub-files */}
        <div className="space-y-1">
          {folders.map((folder) => {
            const isExpanded = !!expandedFolders[folder.id];
            const folderFiles = files.filter((f) => f.folder_id === folder.id);

            return (
              <div key={folder.id} className="space-y-1">
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-250 transition-colors font-semibold group cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                  )}
                  <FolderOpen className="h-4 w-4 text-primary-500" />
                  <span className="truncate flex-1">{folder.name}</span>
                  {folderFiles.length > 0 && (
                    <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-gray-200/50 dark:bg-gray-700/50">
                      {folderFiles.length}
                    </span>
                  )}
                </button>

                {isExpanded && (
                  <div className="pl-6 border-l border-gray-200 dark:border-gray-700 space-y-1 ml-4 mt-1">
                    {folderFiles.length === 0 ? (
                      <span className="text-xs text-gray-400 block py-1 italic">Empty Folder</span>
                    ) : (
                      folderFiles.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => handleSelectFile(file)}
                          className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            selectedFile?.id === file.id
                              ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-medium"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-650 dark:text-gray-300"
                          }`}
                        >
                          <FileText className={`h-3.5 w-3.5 ${isEditable(file) ? "text-green-500" : "text-gray-450"}`} />
                          <span className="truncate flex-1">{file.display_name}</span>
                          {!isEditable(file) && (
                            <span className="text-[8px] text-gray-400 border border-gray-200 dark:border-gray-750 px-1 rounded uppercase font-bold shrink-0">
                              Locked
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Root Files */}
        {rootFiles.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-gray-450 uppercase px-2 mb-1 tracking-wider">Root Workspace</h3>
            {rootFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => handleSelectFile(file)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedFile?.id === file.id
                    ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-650 dark:text-gray-300"
                }`}
              >
                <FileText className={`h-3.5 w-3.5 ${isEditable(file) ? "text-green-500" : "text-gray-450"}`} />
                <span className="truncate flex-1">{file.display_name}</span>
                {!isEditable(file) && (
                  <span className="text-[8px] text-gray-400 border border-gray-200 dark:border-gray-750 px-1 rounded uppercase font-bold shrink-0">
                    Locked
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ─── Explorer Sidebar ─── */}
      <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col glass rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm h-[300px] lg:h-auto">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/10">
          <span className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
            <Code className="h-4 w-4 text-primary-500" />
            File Explorer
          </span>
          <Button size="sm" variant="secondary" onClick={loadWorkspace} className="h-7 text-[10px] px-2">
            Refresh
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
            </div>
          ) : (
            renderTree()
          )}
        </div>
      </div>

      {/* ─── Code/Text Editor Panel ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden glass rounded-2xl border border-[var(--border)] shadow-sm bg-white dark:bg-gray-900">
        {selectedFile ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Editor Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-green-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedFile.display_name}
                    {textContent !== originalText && (
                      <span className="h-2 w-2 rounded-full bg-amber-500" title="Unsaved changes" />
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400 capitalize">
                    Workspace / {selectedFile.mime_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {textContent !== originalText && (
                  <span className="text-xs font-semibold text-amber-500 hidden sm:inline mr-2 animate-pulse">
                    Unsaved Changes
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  isLoading={savingContent}
                  disabled={textContent === originalText}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Editing Pane */}
            <div className="flex-1 relative flex min-h-0 overflow-hidden bg-gray-50/30 dark:bg-gray-950/20">
              {loadingContent ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <div className="flex-1 flex min-h-0">
                  {/* Pseudo Line Numbers panel */}
                  <div className="py-4 select-none pr-3 text-right bg-gray-100/50 dark:bg-gray-950/40 border-r border-[var(--border)] font-mono text-xs text-gray-450 w-12 hidden sm:block shrink-0 leading-relaxed font-semibold">
                    {Array.from({ length: linesCount }).map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>

                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="flex-1 p-4 font-mono text-xs text-gray-800 dark:text-gray-250 bg-transparent border-none outline-none resize-none focus:ring-0 leading-relaxed overflow-y-auto"
                    placeholder="Enter file text here..."
                  />
                </div>
              )}
            </div>

            {/* Editor Footer / Info panel */}
            <div className="px-6 py-2 border-t border-[var(--border)] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/10 text-[10px] font-semibold text-gray-450 tracking-wide uppercase shrink-0">
              <div className="flex items-center gap-4">
                <span>{linesCount} lines</span>
                <span>{wordsCount} words</span>
                <span>{charsCount} characters</span>
              </div>
              <span className="hidden sm:flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                Ready to Edit (Ctrl+S to save)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
            <div className="p-4 bg-primary-100 dark:bg-primary-950/30 rounded-full border border-primary-200 dark:border-primary-900 mb-4">
              <Code className="h-10 w-10 text-primary-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Welcome to Fyliolabs IDE</h2>
            <p className="max-w-md text-sm text-gray-500 leading-relaxed">
              Select any editable text-based file from the sidebar explorer tree on the left to start editing. Standard documents are completely read-only.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 dark:bg-gray-850 px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-sm">
              <Info className="h-3.5 w-3.5 text-primary-500 shrink-0" />
              <span>Use the standard <kbd className="font-bold border border-gray-300 dark:border-gray-700 px-1 rounded bg-white dark:bg-gray-800 font-mono">Ctrl + S</kbd> keyboard shortcut to save updates.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
