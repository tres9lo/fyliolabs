"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Save,
  Loader2,
  Code,
  FileCode,
  CheckCircle,
  Info,
  Sparkles,
  Bold,
  Italic,
  Heading,
  List,
  Link2,
  Table2,
  CheckSquare,
  BookOpen,
  Eye,
  AlignLeft,
  Paintbrush,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { FileRecord } from "@/types/file";
import type { Folder } from "@/types/folder";

type EditorMode = "document" | "code";
type CodeTheme = "monokai" | "onedark" | "dracula" | "github-light";

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

  // Dual Editor Modes
  const [editorMode, setEditorMode] = useState<EditorMode>("document");
  
  // Document-specific: Markdown split-pane preview
  const [showSplitPreview, setShowSplitPreview] = useState(false);
  
  // Code-specific: Themes
  const [selectedTheme, setSelectedTheme] = useState<CodeTheme>("onedark");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Detect and set optimal initial editor mode based on extension
  const getOptimalMode = (fileName: string): EditorMode => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const codeExts = ["json", "js", "ts", "tsx", "html", "css", "py", "sh", "yaml", "yml", "xml"];
    return codeExts.includes(ext) ? "code" : "document";
  };

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
    
    // Auto toggle mode based on file type
    setEditorMode(getOptimalMode(file.name));

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

  // Document Helpers: Insert markup tags at current selection
  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setTextContent(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  // Code Helpers: Prettifier / JSON alignment
  const handleFormatCode = () => {
    try {
      if (selectedFile?.name.endsWith(".json")) {
        const formatted = JSON.stringify(JSON.parse(textContent), null, 2);
        setTextContent(formatted);
        toast.success("JSON formatted perfectly!");
        return;
      }
      // General beautifier (clean empty lines & strip trailing spaces)
      const formatted = textContent
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n");
      setTextContent(formatted);
      toast.success("Code clean & indented!");
    } catch (err) {
      toast.error("Prettify Failed", { description: "Invalid code syntax." });
    }
  };

  // Count lines, words, chars
  const linesCount = textContent.split("\n").length;
  const wordsCount = textContent.trim() === "" ? 0 : textContent.trim().split(/\s+/).length;
  const charsCount = textContent.length;

  // Reading time estimator (Avg. 200 words / minute)
  const readingTime = Math.max(1, Math.ceil(wordsCount / 200));

  // Custom live Markdown side parser
  const renderMarkdown = (md: string) => {
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-gray-900 dark:text-white mt-4 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-gray-900 dark:text-white border-b border-[var(--border)] pb-1 mt-5 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-gray-900 dark:text-white pb-1.5 mt-6 mb-3">$1</h1>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code blocks & inline code
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-950 p-3 rounded-xl font-mono text-[10px] my-3 overflow-x-auto border border-[var(--border)]">$1</pre>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-950 px-1 py-0.5 rounded font-mono text-[10px]">$1</code>');

    // Lists (simple)
    html = html.replace(/^\s*-\s*\[\s*\]\s+(.*$)/gim, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded border-gray-300 text-primary-600" /> <span class="text-sm">$1</span></div>');
    html = html.replace(/^\s*-\s*\[\s*x\s*\]\s+(.*$)/gim, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded border-gray-300 text-primary-600" /> <span class="line-through text-gray-400 text-sm">$1</span></div>');
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc list-inside ml-2 my-1 text-sm">$1</li>');

    // Line breaks
    html = html.replace(/\n/g, "<br />");

    return { __html: html };
  };

  // Theme color maps for code editor
  const getThemeClass = (): string => {
    switch (selectedTheme) {
      case "monokai":
        return "bg-[#272822] text-[#F8F8F2] font-mono focus:ring-[#f8f8f2]/10";
      case "dracula":
        return "bg-[#282a36] text-[#f8f8f2] font-mono focus:ring-[#bd93f9]/10";
      case "github-light":
        return "bg-[#ffffff] text-[#24292e] font-mono border-gray-200 focus:ring-gray-100";
      case "onedark":
      default:
        return "bg-[#282C34] text-[#ABB2BF] font-mono focus:ring-[#61afef]/10";
    }
  };

  // Folder tree explorer renderer
  const renderTree = () => {
    const rootFiles = files.filter((f) => !f.folder_id);

    return (
      <div className="space-y-4">
        {/* Folders */}
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
                            <span className="text-[8px] text-gray-450 border border-gray-250 dark:border-gray-750 px-1 rounded uppercase font-bold shrink-0">
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
                  <span className="text-[8px] text-gray-450 border border-gray-250 dark:border-gray-750 px-1 rounded uppercase font-bold shrink-0">
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
    <div className="flex flex-col lg:flex-row gap-6 min-h-[650px] lg:h-[calc(100vh-130px)] w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ─── Explorer Sidebar ─── */}
      <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col glass rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm h-[380px] lg:h-full">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden glass rounded-2xl border border-[var(--border)] shadow-sm bg-white dark:bg-gray-900 lg:h-full">
        {selectedFile ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Editor Workspace Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-green-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedFile.display_name}
                    {textContent !== originalText && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400 capitalize">
                    {selectedFile.mime_type} • {editorMode === "document" ? "📄 Rich Document" : "⚙️ Code IDE"} Mode
                  </span>
                </div>
              </div>

              {/* Top controls: Dual mode switcher, formatting actions, and theme dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mode Selector Tab group */}
                <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-0.5 border border-[var(--border)] text-xs font-semibold">
                  <button
                    onClick={() => setEditorMode("document")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      editorMode === "document"
                        ? "bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                    Document
                  </button>
                  <button
                    onClick={() => setEditorMode("code")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      editorMode === "code"
                        ? "bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Code className="h-3.5 w-3.5" />
                    Code IDE
                  </button>
                </div>

                <div className="h-4 w-[1px] bg-[var(--border)]" />

                {/* Save button */}
                <Button
                  size="sm"
                  onClick={handleSave}
                  isLoading={savingContent}
                  disabled={textContent === originalText}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save (Ctrl+S)
                </Button>
              </div>
            </div>

            {/* Mode Specific Toolbars */}
            <div className="px-6 py-2 bg-gray-50/30 dark:bg-gray-900/50 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 shrink-0">
              {editorMode === "document" ? (
                /* 📝 TEXT EDITOR TOOLBAR */
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => insertTextAtCursor("**", "**")}
                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor("*", "*")}
                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor("## ")}
                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Header"
                  >
                    <Heading className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor("- ")}
                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor("- [ ] ")}
                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Checklist"
                  >
                    <CheckSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor("[", "](url)")}
                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Insert Link"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor("\n| Header | Header |\n| ------ | ------ |\n| Cell | Cell |\n")}
                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Insert Table"
                  >
                    <Table2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* ⚙️ CODE IDE TOOLBAR */
                <div className="flex items-center gap-3">
                  {/* Theme Selector */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Paintbrush className="h-3.5 w-3.5 text-amber-500" />
                    <span>IDE Theme:</span>
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value as CodeTheme)}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-250 border border-[var(--border)] rounded px-1.5 py-0.5 text-xs focus:outline-none"
                    >
                      <option value="onedark">One Dark Pro</option>
                      <option value="monokai">Monokai Dark</option>
                      <option value="dracula">Dracula Dark</option>
                      <option value="github-light">Github Light</option>
                    </select>
                  </div>

                  <div className="h-4 w-[1px] bg-[var(--border)]" />

                  {/* Format Beautifier */}
                  <button
                    onClick={handleFormatCode}
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 border border-[var(--border)] rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Prettify / Clean Syntax"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Format Code
                  </button>
                </div>
              )}

              {/* Mode Specific Toggle Preview (Document specific) */}
              {editorMode === "document" && (
                <button
                  onClick={() => setShowSplitPreview(!showSplitPreview)}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border rounded-lg transition-all cursor-pointer ${
                    showSplitPreview
                      ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600 border-primary-200 dark:border-primary-900"
                      : "border-[var(--border)] text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {showSplitPreview ? "Hide Preview" : "Split Live Preview"}
                </button>
              )}
            </div>

            {/* Editing Canvas */}
            <div className="flex-1 relative flex min-h-0 overflow-hidden bg-gray-50/30 dark:bg-gray-950/20">
              {loadingContent ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <div className="flex-1 flex min-h-0 divide-x divide-[var(--border)]">
                  {/* Left Side Editing Box */}
                  <div className="flex-1 flex min-h-0">
                    {/* Line numbers (only visible in Code mode) */}
                    {editorMode === "code" && (
                      <div className="py-4 select-none pr-3 text-right bg-gray-100/30 dark:bg-gray-950/30 border-r border-[var(--border)] font-mono text-[11px] text-gray-400 w-12 hidden sm:block shrink-0 leading-relaxed font-semibold">
                        {Array.from({ length: linesCount }).map((_, idx) => (
                          <div key={idx}>{idx + 1}</div>
                        ))}
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className={`flex-1 p-4 outline-none border-none resize-none focus:ring-0 leading-relaxed overflow-y-auto ${
                        editorMode === "code"
                          ? getThemeClass()
                          : "font-sans text-sm text-gray-800 dark:text-gray-200"
                      }`}
                      placeholder="Start typing your file content here..."
                    />
                  </div>

                  {/* Right Side Live Split Preview (Document specific) */}
                  {editorMode === "document" && showSplitPreview && (
                    <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-gray-900/60 prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-250 border-l border-[var(--border)]">
                      <div className="text-[10px] font-bold text-gray-400 border-b border-[var(--border)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-primary-500" />
                        Live Document Preview
                      </div>
                      <div dangerouslySetInnerHTML={renderMarkdown(textContent)} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Editor Footer / Info panel */}
            <div className="px-6 py-2.5 border-t border-[var(--border)] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/10 text-[10px] font-bold text-gray-450 tracking-wide uppercase shrink-0">
              <div className="flex items-center gap-4">
                <span>{linesCount} lines</span>
                <span>{wordsCount} words</span>
                <span>{charsCount} characters</span>
                {editorMode === "document" && (
                  <span className="hidden sm:inline border-l border-[var(--border)] pl-4 text-primary-500">
                    📖 Est. Reading Time: ~{readingTime} min{readingTime > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <span className="hidden sm:flex items-center gap-1.5 text-green-500">
                <CheckCircle className="h-3.5 w-3.5" />
                Workspace synced
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
            <div className="p-4 bg-primary-100 dark:bg-primary-950/30 rounded-full border border-primary-200 dark:border-primary-900 mb-4">
              <Code className="h-10 w-10 text-primary-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Welcome to Fyliolabs Workspace</h2>
            <p className="max-w-md text-sm text-gray-500 leading-relaxed">
              Select any editable text-based file from the sidebar explorer tree on the left. Toggle between **📄 Document** mode for formatted summaries or **⚙️ Code IDE** mode for programming.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 max-w-sm w-full">
              <div className="flex items-center gap-1.5 text-xs text-gray-450 bg-gray-50 dark:bg-gray-850 px-3 py-1.5 rounded-lg border border-[var(--border)] w-full">
                <Info className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                <span>Supports shortcut saving with <kbd className="font-bold border border-gray-300 dark:border-gray-700 px-1 rounded bg-white dark:bg-gray-800 font-mono">Ctrl + S</kbd>.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
