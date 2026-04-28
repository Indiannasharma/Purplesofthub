"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { ChangeEvent, CSSProperties } from "react";

type DashboardFile = {
  id: number;
  client_id: string | null;
  uploaded_by: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string | null;
};

type Notice = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const shellStyle: CSSProperties = {
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
  color: "var(--cmd-body)",
};

const panelStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(26,31,46,0.96), rgba(15,18,32,0.96))",
  border: "1px solid rgba(124,58,237,0.16)",
  borderRadius: 20,
  boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() || "";
}

function getTypeLabel(file: DashboardFile) {
  const fallback = getExtension(file.file_name) || "file";
  if (!file.file_type) return fallback.toUpperCase();

  const [major, minor] = file.file_type.split("/");
  if (minor) return minor.toUpperCase();
  if (major) return major.toUpperCase();

  return fallback.toUpperCase();
}

function getFileIcon(file: DashboardFile) {
  const ext = (file.file_type || getExtension(file.file_name) || "").toLowerCase();

  if (ext.includes("pdf")) return "📄";
  if (ext.includes("word") || ext.includes("doc")) return "📝";
  if (ext.includes("sheet") || ext.includes("excel") || ext.includes("csv")) return "📊";
  if (ext.includes("zip") || ext.includes("archive")) return "🗜️";
  if (ext.includes("video") || ["mp4", "mov", "webm", "mkv"].includes(ext)) return "🎬";
  if (ext.includes("audio") || ["mp3", "wav", "m4a", "aac"].includes(ext)) return "🎵";
  if (ext.includes("image") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "🖼️";
  if (["txt", "md", "mdx", "rtf"].includes(ext)) return "📎";

  return "📁";
}

function makeInitials(user: User | null) {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientFilesPage() {
  const [supabase] = useState(() => createClient());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<DashboardFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const authReady = !loading;
  const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);

  const refreshFiles = async () => {
    setLoadingFiles(true);

    try {
      const response = await fetch("/api/dashboard/files", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          setFiles([]);
          setNotice({
            type: "error",
            message: "Your session expired. Please sign in again.",
          });
          return;
        }

        throw new Error(data?.error || "Failed to load files");
      }

      setFiles((data?.files || []) as DashboardFile[]);
    } catch (error: any) {
      setFiles([]);
      setNotice({
        type: "error",
        message: error?.message || "Unable to load your files right now.",
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    let active = true;

    const boot = async () => {
      setLoading(true);

      try {
        const { data } = await supabase.auth.getUser();

        if (!active) return;

        const authUser = data?.user || null;
        setUser(authUser);

        if (!authUser) {
          setFiles([]);
          setLoadingFiles(false);
          return;
        }

        await refreshFiles();
      } catch (error: any) {
        if (!active) return;
        setNotice({
          type: "error",
          message: error?.message || "Could not verify your session.",
        });
        setFiles([]);
        setLoadingFiles(false);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    boot();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setNotice(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "dashboard-files");

      const uploadResponse = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: uploadData,
      });

      const uploadJson = await uploadResponse.json().catch(() => null);

      if (!uploadResponse.ok) {
        throw new Error(uploadJson?.error || "File upload failed");
      }

      const fileUrl = uploadJson?.secure_url || uploadJson?.url;
      const fileName = file.name;
      const fileType = uploadJson?.format || file.type || getExtension(file.name);
      const fileSize = Number(uploadJson?.bytes ?? file.size);

      const saveResponse = await fetch("/api/dashboard/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          file_size: Number.isFinite(fileSize) ? fileSize : file.size,
        }),
      });

      const saveJson = await saveResponse.json().catch(() => null);

      if (!saveResponse.ok) {
        throw new Error(saveJson?.error || "Could not save file metadata");
      }

      setSelectedFileName("");
      setNotice({
        type: "success",
        message: `${fileName} uploaded successfully.`,
      });

      await refreshFiles();
    } catch (error: any) {
      setNotice({
        type: "error",
        message: error?.message || "Upload failed.",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFileName(file.name);
    await uploadFile(file);
  };

  const handleDelete = async (file: DashboardFile) => {
    const confirmed = window.confirm(`Delete "${file.file_name}"? This cannot be undone.`);

    if (!confirmed) return;

    setDeletingId(file.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/dashboard/files/${file.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Delete failed");
      }

      setNotice({
        type: "success",
        message: `${file.file_name} deleted successfully.`,
      });

      await refreshFiles();
    } catch (error: any) {
      setNotice({
        type: "error",
        message: error?.message || "Could not delete the file.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const initials = makeInitials(user);
  const activeCardCount = files.length;
  const formatLabel =
    loadingFiles && files.length === 0 ? "Syncing files..." : `${files.length} file${files.length === 1 ? "" : "s"}`;

  return (
    <div style={shellStyle}>
      <div
        style={{
          ...panelStyle,
          padding: "clamp(18px, 2.5vw, 28px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(124,58,237,0.16), transparent 35%), radial-gradient(circle at top right, rgba(34,211,238,0.1), transparent 28%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 999,
                  padding: "6px 14px",
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.24)",
                  color: "#c084fc",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22d3ee",
                    boxShadow: "0 0 10px rgba(34,211,238,0.8)",
                    display: "inline-block",
                  }}
                />
                Files Command Center
              </div>

              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 34px)",
                  lineHeight: 1.05,
                  color: "var(--cmd-heading)",
                  margin: "0 0 8px",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                My Files
              </h1>
              <p style={{ fontSize: 14, color: "var(--cmd-body)", margin: 0, lineHeight: 1.6, maxWidth: 720 }}>
                Upload briefs, reference assets, invoices, and deliverables. Your files are private to your account and ready to open from the dashboard.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
                minWidth: 280,
                width: "100%",
                maxWidth: 420,
              }}
            >
              {[
                { label: "Files", value: activeCardCount, color: "#7c3aed" },
                { label: "Storage", value: formatBytes(totalSize), color: "#22d3ee" },
                { label: "Status", value: user ? "Online" : "Locked", color: user ? "#10b981" : "#f59e0b" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "14px 14px 12px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(124,58,237,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--cmd-muted)", marginBottom: 6, fontWeight: 700 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: item.color, lineHeight: 1 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {notice && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${
                  notice.type === "success"
                    ? "rgba(16,185,129,0.25)"
                    : notice.type === "error"
                    ? "rgba(239,68,68,0.25)"
                    : "rgba(34,211,238,0.25)"
                }`,
                background:
                  notice.type === "success"
                    ? "rgba(16,185,129,0.08)"
                    : notice.type === "error"
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(34,211,238,0.08)",
                color:
                  notice.type === "success"
                    ? "#34d399"
                    : notice.type === "error"
                    ? "#f87171"
                    : "#22d3ee",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {notice.message}
            </div>
          )}
        </div>
      </div>

      {!authReady ? (
        <div
          style={{
            ...panelStyle,
            padding: "40px 24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 260,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "3px solid rgba(124,58,237,0.18)",
                borderTopColor: "#7c3aed",
                margin: "0 auto 14px",
                animation: "psh-spin 0.9s linear infinite",
              }}
            />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--cmd-heading)" }}>Checking your session...</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--cmd-muted)" }}>Preparing your dashboard files view.</p>
          </div>
        </div>
      ) : !user ? (
        <div
          style={{
            ...panelStyle,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 54, marginBottom: 14 }}>🔒</div>
          <h2 style={{ margin: "0 0 8px", color: "var(--cmd-heading)", fontSize: 22, fontWeight: 900 }}>Sign in required</h2>
          <p style={{ margin: "0 auto 22px", maxWidth: 520, color: "var(--cmd-body)", fontSize: 14, lineHeight: 1.7 }}>
            You need to be signed in to view and manage your uploaded files.
          </p>
          <Link
            href="/sign-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 22px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
              boxShadow: "0 8px 24px rgba(124,58,237,0.28)",
            }}
          >
            Go to Sign In
          </Link>
        </div>
      ) : (
        <>
          <div
            style={{
              ...panelStyle,
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#22d3ee" }}>
                  Upload files
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--cmd-body)" }}>
                  PDFs, images, documents, videos, and archives are supported.
                </p>
              </div>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: "11px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: uploading
                    ? "rgba(124,58,237,0.45)"
                    : "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: uploading ? "wait" : "pointer",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.28)",
                }}
              >
                {uploading ? "Uploading..." : "Choose File"}
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div
              style={{
                borderRadius: 18,
                border: "1px dashed rgba(34,211,238,0.25)",
                background: "rgba(34,211,238,0.04)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, rgba(124,58,237,0.16), rgba(34,211,238,0.12))",
                    border: "1px solid rgba(124,58,237,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  ⤴
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "var(--cmd-heading)" }}>
                    Drop or select a file to upload
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--cmd-muted)" }}>
                    We store the file in Cloudinary and save the metadata in Supabase.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["PDF", "Images", "Docs", "Videos", "Archives"].map((item) => (
                  <span
                    key={item}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(124,58,237,0.08)",
                      border: "1px solid rgba(124,58,237,0.18)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#c084fc",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              {selectedFileName && (
                <div style={{ fontSize: 13, color: "#22d3ee", fontWeight: 700 }}>
                  Selected: {selectedFileName}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              ...panelStyle,
              padding: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", color: "var(--cmd-heading)", fontSize: 18, fontWeight: 900 }}>
                  Your uploaded files
                </h2>
                <p style={{ margin: 0, color: "var(--cmd-muted)", fontSize: 13 }}>
                  Open, download, or delete files you uploaded yourself.
                </p>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.16)",
                  color: "#c084fc",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {formatLabel}
              </div>
            </div>

            {loadingFiles ? (
              <div style={{ display: "grid", gap: 12 }}>
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(124,58,237,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      padding: 16,
                      minHeight: 92,
                      animation: "psh-pulse 1.4s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            ) : files.length === 0 ? (
              <div
                style={{
                  padding: "44px 18px",
                  borderRadius: 18,
                  border: "1px solid rgba(124,58,237,0.12)",
                  background: "rgba(255,255,255,0.02)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "var(--cmd-heading)" }}>
                  No files yet
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--cmd-muted)" }}>
                  Upload your first file to begin building your asset library.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {files.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      borderRadius: 18,
                      border: "1px solid rgba(124,58,237,0.14)",
                      background: "rgba(255,255,255,0.03)",
                      padding: "16px",
                      display: "grid",
                      gridTemplateColumns: "auto minmax(0,1fr) auto",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(124,58,237,0.16), rgba(34,211,238,0.12))",
                        border: "1px solid rgba(124,58,237,0.16)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {getFileIcon(file)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 800,
                            color: "var(--cmd-heading)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                          }}
                        >
                          {file.file_name}
                        </p>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: "rgba(34,211,238,0.08)",
                            border: "1px solid rgba(34,211,238,0.18)",
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "#22d3ee",
                          }}
                        >
                          {getTypeLabel(file)}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, color: "var(--cmd-muted)", fontSize: 12 }}>
                        <span>Size: {formatBytes(file.file_size)}</span>
                        <span>Uploaded: {file.created_at ? format(new Date(file.created_at), "MMM d, yyyy") : "—"}</span>
                        <span>Type: {file.file_type || getExtension(file.file_name) || "—"}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        gap: 10,
                      }}
                    >
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "1px solid rgba(34,211,238,0.18)",
                          background: "rgba(34,211,238,0.08)",
                          color: "#22d3ee",
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Open
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(file)}
                        disabled={deletingId === file.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "1px solid rgba(239,68,68,0.22)",
                          background: deletingId === file.id ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
                          color: "#f87171",
                          cursor: deletingId === file.id ? "wait" : "pointer",
                          fontSize: 13,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {deletingId === file.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <style>{`
            @keyframes psh-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            @keyframes psh-pulse {
              0%, 100% { opacity: 0.45; }
              50% { opacity: 1; }
            }

            @media (max-width: 768px) {
              .files-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 720px) {
              .file-row {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
