"use client"

import { useEffect, useState } from "react"
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { normalizeProjects } from "@/lib/portfolio-normalize"
import type { PortfolioProject } from "@/types/portfolio"

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [readError, setReadError] = useState(false);

  async function load() {
    try {
      setReadError(false);

    const supabase = createClient()
    const { data , error: readFailure1} = await supabase.from("portfolio_projects").select("*").order("created_at", { ascending: false })
      if (readFailure1) throw readFailure1;
    setProjects(normalizeProjects(data || []))
    setLoading(false)

    } catch { setReadError(true); } finally { setLoading(false); }
  }



  async function archive(id: string) {
    if (!confirm("Remove this project from the site?")) return
    await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" })
    setProjects((p) => p.filter((item) => item.id !== id))
  }

  useEffect(() => {
    // Resolve external reads in a callback after the committed render.
    void Promise.resolve().then(async () => {
    load()
      })
  }, [])

  if (readError) return <AdminPage className="cc-module"><AdminErrorState title="Could not load these records" description="Refresh to try again. No record counts are shown while the read has failed." onRetry={() => window.location.reload()} /></AdminPage>;

  return (
    <AdminPage className="cc-module admin-form admin-adopted">
      <AdminPageHeader title={<>Work</>} description={<>Add and edit case studies.</>} actions={<Link
          href="/admin/portfolio/new"
          style={{
            background: "var(--cc-accent)",
            color: "var(--cc-on-accent)",
            padding: "11px 20px",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          New project
        </Link>} />

      {loading ? (
        <p style={{ color: "var(--cc-text-secondary)" }}>Loading…</p>
      ) : projects.length === 0 ? (
        <div style={{ border: "1px solid var(--cc-border)", borderRadius: 12, padding: 48, textAlign: "center" }}>
          <p style={{ color: "var(--cc-text)", fontWeight: 600, margin: "0 0 8px" }}>No work yet</p>
          <Link href="/admin/portfolio/new" style={{ color: "var(--cc-accent)" }}>Add the first project</Link>
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
                background: "var(--cc-surface)",
                border: "1px solid var(--cc-border)",
                borderRadius: 12,
                padding: 12,
              }}
             className="admin-responsive-grid">
              <div style={{ width: 72, height: 56, borderRadius: 10, overflow: "hidden", background: "#2a1058" }}>
                {project.coverImage ? (
                  <Image unoptimized width={640} height={360} src={project.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div>
                <p style={{ margin: 0, color: "var(--cc-text)", fontWeight: 600 }}>{project.title}</p>
                <p style={{ margin: "4px 0 0", color: "var(--cc-text-secondary)", fontSize: 12 }}>
                  {[project.category, project.year, project.featured ? "Featured" : "", project.status].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/admin/portfolio/${project.id}`}
                  style={{ color: "var(--cc-accent)", fontSize: 13, textDecoration: "none", padding: "8px 12px" }}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => archive(project.id)}
                  style={{ background: "none", border: "none", color: "var(--cc-error)", cursor: "pointer", fontSize: 13 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  )
}
