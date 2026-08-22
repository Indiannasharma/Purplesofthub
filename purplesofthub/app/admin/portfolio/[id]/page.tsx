"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { normalizeProject } from "@/lib/portfolio-normalize"
import ProjectForm from "../_components/ProjectForm"

export default function EditPortfolioProjectPage() {
  const params = useParams<{ id: string }>()
  const [ready, setReady] = useState(false)
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
    const supabase = createClient()
    supabase.from("portfolio_projects").select("*").eq("id", params.id).maybeSingle().then(({ data }) => {
      if (data) {
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
      }
      setReady(true)
    })
  }, [params.id])

  if (!ready) return <p style={{ color: "#9d8fd4" }}>Loading…</p>
  return <ProjectForm projectId={params.id} initial={initial} />
}
