"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";
import { WorkspacePage } from "@/components/workspace/page";
import { WorkspacePageHeader } from "@/components/workspace/page-header";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import { WorkspaceEmptyState } from "@/components/workspace/empty-state";
import { WorkspaceField } from "@/components/workspace/field";
import { WorkspaceSelect } from "@/components/workspace/select";
import { CustomerRecordStatus } from "@/components/workspace/customer-record-status";
import { CustomerRecordsError, CustomerRecordsSupport } from "@/components/workspace/customer-record-states";
import { overviewDate, projectProgress, type OverviewSection } from "@/lib/customer-overview";
import { filterProjects, projectStatusOptions, recentProjectUpdate, type CustomerProject } from "@/lib/customer-records";

export function CustomerProjects({ section }: { section: OverviewSection<CustomerProject> }) {
  const [status, setStatus] = useState("all");
  const options = projectStatusOptions(section.rows);
  const selected = options.some(option => option.value === status) ? status : "all";
  const rows = filterProjects(section.rows, selected);
  return <WorkspacePage kind="customer" className="customer-records customer-projects">
    <WorkspacePageHeader title="Projects" description="Track the work PurpleSoftHub is delivering for you." actions={<Button asChild variant="outline"><Link href="/dashboard/services">Explore services<ArrowRight size={16} aria-hidden="true" /></Link></Button>} />
    {section.state !== "ready" ? <CustomerRecordsError state={section.state} /> : !section.rows.length ? <WorkspaceEmptyState title="No projects yet" description="When a project is set up for your account, you can follow its progress and updates here." icon={FolderKanban} action={<Button asChild><Link href="/dashboard/services">Explore services</Link></Button>} /> : <>
      {options.length > 1 ? <div className="customer-records-toolbar"><WorkspaceField id="customer-project-status" label="Project status"><WorkspaceSelect value={selected} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</WorkspaceSelect></WorkspaceField><p aria-live="polite">Showing {rows.length} of {section.rows.length} loaded projects</p></div> : null}
      <ul className="customer-project-list" aria-label="Your projects">{rows.map(project => {
        const progress = projectProgress(project.progress);
        const update = recentProjectUpdate(project);
        return <li key={project.id}><article className="ws-card customer-project-card"><header><div><p className="customer-record-service">{project.service_type?.replace(/_/g, " ") || "Service not specified"}</p><h2>{project.title || "Untitled project"}</h2></div><CustomerRecordStatus value={project.status} /></header>
          {project.description ? <p className="customer-project-description">{project.description}</p> : null}
          <div className="customer-project-progress"><div><span>Progress</span><strong>{progress === null ? "Unavailable" : progress + "%"}</strong></div>{progress !== null ? <div role="progressbar" aria-label={(project.title || "Project") + " progress"} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: progress + "%" }} /></div> : null}</div>
          <dl className="customer-record-dates"><div><dt>Created</dt><dd>{overviewDate(project.created_at)}</dd></div>{project.due_date ? <div><dt>Due</dt><dd>{overviewDate(project.due_date)}</dd></div> : null}</dl>
          {update ? <section className="customer-project-update" aria-label="Project update"><h3>Project update</h3><p>{update.message}</p><span>{overviewDate(update.created_at)}</span></section> : null}
        </article></li>;
      })}</ul>
    </>}
    <CustomerRecordsSupport />
  </WorkspacePage>;
}
