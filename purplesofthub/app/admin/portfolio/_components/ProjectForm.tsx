"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toSlug } from "@/lib/portfolio"

const CATEGORIES = ["Web", "Brand", "Mobile", "Music", "UI/UX", "Marketing"]

const field: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(124,58,237,0.18)",
  background: "rgba(124,58,237,0.05)",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
}

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#9d8fd4",
  letterSpacing: "0.04em",
  marginBottom: 8,
}

type FormState = {
  title: string
  client: string
  year: string
  category: string
  overview: string
  body: string
  cover: string
  youtube: string
  featured: boolean
  status: string
}

export default function ProjectForm({
  projectId,
  initial,
}: {
  projectId?: string
  initial?: Partial<FormState>
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<FormState>({
    title: initial?.title || "",
    client: initial?.client || "",
    year: initial?.year || String(new Date().getFullYear()),
    category: initial?.category || "Web",
    overview: initial?.overview || "",
    body: initial?.body || "",
    cover: initial?.cover || "",
    youtube: initial?.youtube || "",
    featured: initial?.featured || false,
    status: initial?.status || "published",
  })

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function save() {
    if (!form.title.trim()) {
      setError("Name is required")
      return
    }
    setSaving(true)
    setError("")
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug: toSlug(form.title),
      client_name: form.client.trim() || form.title.trim(),
      year: form.year.trim(),
      category: form.category,
      overview: form.overview.trim() || null,
      final_solution: form.body.trim() || null,
      cover_image: form.cover.trim() || null,
      featured: form.featured,
      status: form.status,
      videos: form.youtube.trim() ? { youtube: form.youtube.trim() } : {},
      color: "#7c3aed",
    }
    if (projectId) payload.id = projectId

    const res = await fetch("/api/portfolio", {
      method: projectId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(json.error || "Could not save")
      return
    }
    router.push("/admin/portfolio")
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <Link href="/admin/portfolio" style={{ fontSize: 13, color: "#9d8fd4", textDecoration: "none" }}>
            ← Work
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "10px 0 0" }}>
            {projectId ? "Edit project" : "New project"}
          </h1>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "11px 22px",
            fontWeight: 700,
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? (
        <p style={{ color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>{error}</p>
      ) : null}

      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <label style={label}>Name</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} style={field} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={label}>Client</label>
            <input value={form.client} onChange={(e) => set("client", e.target.value)} style={field} />
          </div>
          <div>
            <label style={label}>Year</label>
            <input value={form.year} onChange={(e) => set("year", e.target.value)} style={field} />
          </div>
        </div>
        <div>
          <label style={label}>Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} style={{ ...field, cursor: "pointer" }}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>One line</label>
          <input value={form.overview} onChange={(e) => set("overview", e.target.value)} placeholder="What you made, in one sentence" style={field} />
        </div>
        <div>
          <label style={label}>Story</label>
          <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={6} style={{ ...field, resize: "vertical", minHeight: 140 }} />
        </div>
        <div>
          <label style={label}>Cover image URL</label>
          <input value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://…" style={field} />
        </div>
        <div>
          <label style={label}>YouTube (optional)</label>
          <input value={form.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtube.com/watch?v=…" style={field} />
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center", color: "#d6d3e8", fontSize: 14 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured on home
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.status === "published"}
              onChange={(e) => set("status", e.target.checked ? "published" : "draft")}
            />
            Published
          </label>
        </div>
      </div>
    </div>
  )
}

