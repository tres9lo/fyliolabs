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
  List,
  BookOpen,
  AlignLeft,
  Paintbrush,
  Underline,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  Eraser,
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
  
  // Code-specific: Themes
  const [selectedTheme, setSelectedTheme] = useState<CodeTheme>("onedark");

  // Selection range retention state for contentEditable focus prevention
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);

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
        description: "Only text-based files are editable.",
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

      // Load content into contentEditable
      setTimeout(() => {
        if (editableRef.current) {
          editableRef.current.innerHTML = text;
        }
      }, 50);
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
        // Update local state record
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

  // Selection range retention to prevent toolbar clicks from stealing focus
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (!savedRange) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
  };

  // Word formatting helper: execution of browser commands
  const execFormat = (command: string, value: string = "") => {
    restoreSelection();
    document.execCommand(command, false, value);
    // Focus back on editable container
    if (editableRef.current) {
      editableRef.current.focus();
      setTextContent(editableRef.current.innerHTML);
    }
    saveSelection();
  };

  // Monitor edits inside contentEditable
  const handleEditableInput = () => {
    if (editableRef.current) {
      setTextContent(editableRef.current.innerHTML);
    }
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
  // Strip HTML tags to get pure word count for Document mode
  const getPureText = (htmlStr: string) => {
    return htmlStr.replace(/<[^>]*>/g, " ");
  };
  const pureText = editorMode === "document" ? getPureText(textContent) : textContent;
  const wordsCount = pureText.trim() === "" ? 0 : pureText.trim().split(/\s+/).length;
  const charsCount = pureText.length;

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
      
      {/* ─── Styles to enforce extreme high-contrast white text inside Microsoft Word canvas in dark mode ─── */}
      <style>{`
        .word-editor-canvas p {
          color: inherit !important;
          margin-bottom: 0.75rem;
        }
        .word-editor-canvas h1 { font-size: 1.5rem !important; font-weight: 700 !important; color: inherit !important; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .word-editor-canvas h2 { font-size: 1.25rem !important; font-weight: 700 !important; color: inherit !important; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .word-editor-canvas h3 { font-size: 1.1rem !important; font-weight: 700 !important; color: inherit !important; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .word-editor-canvas ul { list-style-type: disc !important; margin-left: 1.5rem !important; margin-bottom: 0.75rem !important; color: inherit !important; }
        .word-editor-canvas ol { list-style-type: decimal !important; margin-left: 1.5rem !important; margin-bottom: 0.75rem !important; color: inherit !important; }
        .word-editor-canvas li { color: inherit !important; }
        .word-editor-canvas pre { background-color: rgba(243, 244, 246, 0.1); padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; color: inherit !important; }
      `}</style>

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
          <div className="flex-1 flex flex-col min-h-0 bg-gray-50/20 dark:bg-gray-950/10">
            {/* Editor Workspace Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedFile.display_name}
                    {textContent !== originalText && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400 capitalize">
                    {selectedFile.mime_type} • {editorMode === "document" ? "📘 Microsoft Word Mode" : "⚙️ Code IDE Mode"}
                  </span>
                </div>
              </div>

              {/* Top controls: Dual mode switcher and Save action */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-0.5 border border-[var(--border)] text-xs font-semibold">
                  <button
                    onClick={() => {
                      setEditorMode("document");
                      setTimeout(() => {
                        if (editableRef.current) editableRef.current.innerHTML = textContent;
                      }, 50);
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      editorMode === "document"
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Word Editor
                  </button>
                  <button
                    onClick={() => setEditorMode("code")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      editorMode === "code"
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Code className="h-3.5 w-3.5" />
                    Code IDE
                  </button>
                </div>

                <div className="h-4 w-[1px] bg-[var(--border)]" />

                <Button
                  size="sm"
                  onClick={handleSave}
                  isLoading={savingContent}
                  disabled={textContent === originalText}
                  icon={<Save className="h-4 w-4" />}
                  className="bg-blue-600 hover:bg-blue-700 border-none text-white shadow-sm"
                >
                  Save (Ctrl+S)
                </Button>
              </div>
            </div>

            {/* Formatting Ribbon Toolbar (Word Style vs Developer IDE Toolbars) */}
            <div className="px-6 py-2.5 bg-white dark:bg-gray-900 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
              {editorMode === "document" ? (
                /* 📘 MICROSOFT WORD RICH FORMATTING RIBBON TOOLBAR */
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  {/* Style drop selector */}
                  <select
                    onFocus={saveSelection}
                    onChange={(e) => {
                      execFormat("formatBlock", e.target.value);
                      e.target.value = "<p>";
                    }}
                    className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-250 border border-[var(--border)] rounded-lg px-2 py-1 text-xs focus:outline-none font-semibold mr-1 cursor-pointer"
                    defaultValue="<p>"
                  >
                    <option value="<p>">Normal Text</option>
                    <option value="<h1>">Heading 1</option>
                    <option value="<h2>">Heading 2</option>
                    <option value="<h3>">Heading 3</option>
                    <option value="<pre>">Code Block</option>
                  </select>

                  <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />

                  {/* Font Styling Ribbon group (Uses onMouseDown to retain selection focus) */}
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("bold"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("italic"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("underline"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </button>

                  <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />

                  {/* Alignments group */}
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("justifyLeft"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("justifyCenter"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("justifyRight"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("justifyFull"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Justify Align"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </button>

                  <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />

                  {/* Lists group */}
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("insertUnorderedList"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Bullet Points"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("insertOrderedList"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-850 dark:hover:text-white transition-colors cursor-pointer"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>

                  <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />

                  {/* Clear formatting ribbon utility */}
                  <button
                    onMouseDown={(e) => { e.preventDefault(); execFormat("removeFormat"); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    title="Clear Formatting"
                  >
                    <Eraser className="h-4 w-4" />
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
                      className="bg-gray-150 dark:bg-gray-850 text-gray-700 dark:text-gray-250 border border-[var(--border)] rounded px-1.5 py-0.5 text-xs focus:outline-none cursor-pointer"
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
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 border border-[var(--border)] rounded hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Prettify Code"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Format Code
                  </button>
                </div>
              )}
            </div>

            {/* Microsoft Word Canvas & Code IDE Canvas Area */}
            <div className="flex-1 relative flex min-h-0 overflow-hidden bg-gray-100/50 dark:bg-gray-950/30">
              {loadingContent ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <div className="flex-1 flex min-h-0">
                  
                  {/* ─── ⚙️ CODE IDE CANVAS ─── */}
                  {editorMode === "code" && (
                    <div className="flex-1 flex min-h-0 bg-white dark:bg-gray-900">
                      {/* Line numbers column */}
                      <div className="py-4 select-none pr-3 text-right bg-gray-50 dark:bg-gray-950/30 border-r border-[var(--border)] font-mono text-[11px] text-gray-400 w-12 hidden sm:block shrink-0 leading-relaxed font-semibold">
                        {Array.from({ length: linesCount }).map((_, idx) => (
                          <div key={idx}>{idx + 1}</div>
                        ))}
                      </div>

                      <textarea
                        ref={textareaRef}
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className={`flex-1 p-4 outline-none border-none resize-none focus:ring-0 leading-relaxed overflow-y-auto ${getThemeClass()}`}
                        placeholder="Start coding here..."
                      />
                    </div>
                  )}

                  {/* ─── 📘 MICROSOFT WORD LIVE WORKSPACE CANVAS (With total accessibility & white text in dark mode!) ─── */}
                  {editorMode === "document" && (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                      {/* Live Microsoft Word editable paper sheet */}
                      <div className="max-w-4xl mx-auto border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-lg p-6 sm:p-14 min-h-[650px] focus:outline-none">
                        
                        {/* Word style header tab */}
                        <div className="text-[10px] font-bold text-blue-500 border-b border-blue-100 dark:border-blue-950 pb-2 mb-6 uppercase tracking-wider flex items-center gap-1.5 select-none justify-between">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                            Microsoft Word Live Canvas
                          </span>
                          <span className="text-[8px] bg-blue-50 dark:bg-blue-950/70 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">
                            Wysiwyg In-Place
                          </span>
                        </div>

                        {/* Direct Editable Page Div */}
                        <div
                          ref={editableRef}
                          contentEditable={true}
                          onInput={handleEditableInput}
                          onMouseUp={saveSelection}
                          onKeyUp={saveSelection}
                          className="min-h-[500px] outline-none text-slate-900 dark:text-white font-sans text-sm focus:outline-none cursor-text leading-relaxed select-text word-editor-canvas"
                          style={{ minHeight: "500px" }}
                          {...({ placeholder: "Click here and start typing, just like in Microsoft Word..." } as any)}
                        />
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Document / IDE Status Metrics Footer */}
            <div className="px-6 py-2.5 border-t border-[var(--border)] flex items-center justify-between bg-white dark:bg-gray-900 text-[10px] font-bold text-gray-400 tracking-wide uppercase shrink-0 select-none">
              <div className="flex items-center gap-4">
                {editorMode === "code" && <span>{linesCount} lines</span>}
                <span>{wordsCount} words</span>
                <span>{charsCount} characters</span>
                {editorMode === "document" && (
                  <span className="text-blue-500 hidden sm:inline">
                    📘 Live Word Workspace Active (No Compile Needed)
                  </span>
                )}
              </div>
              <span className="hidden sm:flex items-center gap-1.5 text-blue-500">
                <CheckCircle className="h-3.5 w-3.5" />
                Auto-synced
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
              Select any editable text-based file from the sidebar explorer tree on the left.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 max-w-sm w-full">
              <div className="flex items-center gap-1.5 text-xs text-gray-450 bg-gray-50 dark:bg-gray-850 px-3 py-1.5 rounded-lg border border-[var(--border)] w-full">
                <Info className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                <span>Double click files or click folders to navigate your hierarchy.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
