"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { normalizeProject } from "@/lib/portfolio-normalize"
import ProjectForm from "../_components/ProjectForm"
import { isPortfolioId } from "@/lib/portfolio-validation"

export default function EditPortfolioProjectPage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")
  const [initial, setInitial] = useState<{
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
  }>()

  useEffect(() => {
    let active = true
    const supabase = createClient()
    async function load() {
      try {
        if (!isPortfolioId(projectId)) throw new Error('Invalid project')
        const { data, error: readError } = await supabase.from("portfolio_projects").select("*").eq("id", projectId).maybeSingle()
        if (!active) return
        if (readError || !data) throw new Error('Project unavailable')
        const project = normalizeProject(data)
        setInitial({
          title: project.title,
          client: project.clientName || "",
          year: project.year || "",
          category: project.category || "Web",
          overview: project.overview || "",
          body: project.finalSolution || "",
          cover: project.coverImage || "",
          youtube: project.videos?.youtube || "",
          featured: project.featured,
          status: project.status,
        })
      } catch {
        if (active) setError("This project could not be loaded. Return to Work and try again.")
      } finally {
        if (active) setReady(true)
      }
    }
    void Promise.resolve().then(load)
    return () => { active = false }
  }, [projectId])

  if (!ready) return <p style={{ color: "#9d8fd4" }}>Loading…</p>
  if (error) return <p role="alert" style={{ color: "var(--cc-error)" }}>{error}</p>
  return <ProjectForm projectId={projectId} initial={initial} />
}
