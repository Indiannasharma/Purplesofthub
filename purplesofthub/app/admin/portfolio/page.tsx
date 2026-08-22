"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { normalizeProjects } from "@/lib/portfolio-normalize"
import type { PortfolioProject } from "@/types/portfolio"

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from("portfolio_projects").select("*").order("created_at", { ascending: false })
    setProjects(normalizeProjects(data || []))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function archive(id: string) {
    if (!confirm("Remove this project from the site?")) return
    await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" })
    setProjects((p) => p.filter((item) => item.id !== id))
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Work</h1>
          <p style={{ fontSize: 14, color: "#9d8fd4", margin: 0 }}>Add and edit case studies.</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            color: "#fff",
            padding: "11px 20px",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          New project
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "#9d8fd4" }}>Loading…</p>
      ) : projects.length === 0 ? (
        <div style={{ border: "1px solid rgba(124,58,237,0.12)", borderRadius: 16, padding: 48, textAlign: "center" }}>
          <p style={{ color: "#fff", fontWeight: 700, margin: "0 0 8px" }}>No work yet</p>
          <Link href="/admin/portfolio/new" style={{ color: "#c4b5fd" }}>Add the first project</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((project) => (
            <div
              key={project.id || project.slug}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr auto",
                gap: 16,
                alignItems: "center",
                background: "#1a1f2e",
                border: "1px solid rgba(124,58,237,0.12)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ width: 72, height: 56, borderRadius: 10, overflow: "hidden", background: "#2a1058" }}>
                {project.coverImage ? (
                  <img src={project.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: 700 }}>{project.title}</p>
                <p style={{ margin: "4px 0 0", color: "#9d8fd4", fontSize: 12 }}>
                  {[project.category, project.year, project.featured ? "Featured" : "", project.status].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/admin/portfolio/${project.id}`}
                  style={{ color: "#c4b5fd", fontSize: 13, textDecoration: "none", padding: "8px 12px" }}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => archive(project.id)}
                  style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 13 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
