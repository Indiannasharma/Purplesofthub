import Link from "next/link";
import { ArrowRight, FolderKanban, ReceiptText, Music4, GraduationCap, FolderOpen, Wrench, MessagesSquare } from "lucide-react";
import type { ReactNode } from "react";
import { WorkspacePage, WorkspaceSectionHeader } from "@/components/workspace/page";
import { WorkspacePageHeader } from "@/components/workspace/page-header";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import { WorkspaceEmptyState } from "@/components/workspace/empty-state";
import { WorkspaceErrorState } from "@/components/workspace/error-state";
import { WorkspaceStatusBadge } from "@/components/workspace/status-badge";
import { WorkspaceLoadingState } from "@/components/workspace/loading-state";
import { nextOverviewAction, invoiceAmount, overviewDate, projectProgress, type CustomerOverviewData, type OverviewSection } from "@/lib/customer-overview";

function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="customer-text-link" href={href}>{children}<ArrowRight size={15} aria-hidden="true" /></Link>;
}
function Status({ value }: { value: string | null }) {
  const tone = value === "in_progress" ? "info" : value === "overdue" ? "error" : value === "sent" ? "warning" : undefined;
  return <WorkspaceStatusBadge status={value?.replace(/_/g, " ") || "Status unavailable"} tone={tone} />;
}
function SectionState<T>({ section, emptyTitle, description, action, children }: { section: OverviewSection<T>; emptyTitle: string; description: string; action?: ReactNode; children: ReactNode }) {
  if (section.state !== "ready") return <WorkspaceErrorState title={section.state === "unauthorized" ? "Access unavailable" : section.state === "unavailable" ? "This information is unavailable" : "Could not load this information"} description={section.state === "unauthorized" ? "Your current session cannot read this information. Try signing in again or contact the team." : section.state === "unavailable" ? "This section is unavailable right now. Contact the team if you need help." : "Refresh this page to try again. Your other workspace sections are still available."} />;
  if (!section.rows.length) return <WorkspaceEmptyState title={emptyTitle} description={description} action={action} />;
  return children;
}
export function CustomerOverviewLoading() {
  return <WorkspacePage kind="customer"><WorkspacePageHeader title="Your workspace" description="Loading your recent work…" /><WorkspaceLoadingState rows={4} /></WorkspacePage>;
}
/** Pure view used by the authenticated server page and isolated visual QA. */
export function CustomerOverview({ data }: { data: CustomerOverviewData }) {
  const next = nextOverviewAction(data);
  return <WorkspacePage kind="customer" className="customer-overview">
    <WorkspacePageHeader title={"Welcome back, " + data.firstName} description="Your work, your next steps, and the people here to help." actions={<Button asChild variant="outline"><Link href="/dashboard/files"><FolderOpen size={16} aria-hidden="true" />Open your files</Link></Button>} />
    <section className="customer-next-step" aria-labelledby="customer-next-title"><div><p className="customer-eyebrow">A good place to start</p><h2 id="customer-next-title">{next.title}</h2><p>{next.description}</p></div><Button asChild size="lg"><Link href={next.href}>{next.label}<ArrowRight size={16} aria-hidden="true" /></Link></Button></section>
    <section className="ws-card customer-section" aria-labelledby="customer-projects-title"><WorkspaceSectionHeader id="customer-projects-title" title="Your recent projects" description="Your five most recently created projects. Open Projects for the full list and available updates." actions={<ActionLink href="/dashboard/projects">View all projects</ActionLink>} />
      <SectionState section={data.projects} emptyTitle="Your next project starts here" description="When a project is set up for your account, its status and progress will appear here." action={<ActionLink href="/dashboard/services">Explore services</ActionLink>}><ul className="customer-record-list">{data.projects.rows.map(project => { const progress = projectProgress(project.progress);return <li key={project.id} className="customer-project-row"><span className="customer-record-icon"><FolderKanban size={18} aria-hidden="true" /></span><div className="customer-record-main"><h3>{project.title || "Untitled project"}</h3><p>{project.service_type?.replace(/_/g, " ") || "Service not specified"} · Created {overviewDate(project.created_at)}</p></div><div className="customer-project-state"><Status value={project.status} />{progress !== null ? <div className="customer-progress"><div role="progressbar" aria-label={(project.title || "Project") + " progress"} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: progress + "%" }} /></div><span>{progress}%</span></div> : <small>Progress unavailable</small>}</div></li>;})}</ul></SectionState>
    </section>
    <div className="customer-overview-grid">
      <section className="ws-card customer-section" aria-labelledby="customer-invoices-title"><WorkspaceSectionHeader id="customer-invoices-title" title="Recent invoices" description="The latest five, in their recorded currencies." actions={<ActionLink href="/dashboard/invoices">View invoices</ActionLink>} /><SectionState section={data.invoices} emptyTitle="No invoices yet" description="Invoices issued to your account will appear here with their recorded amount and status."><ul className="customer-record-list">{data.invoices.rows.map(invoice => <li key={invoice.id} className="customer-invoice-row"><div className="customer-record-main"><h3>{invoice.invoice_number || "Invoice"}</h3><p>{invoice.due_date ? "Due " + overviewDate(invoice.due_date) : "Issued " + overviewDate(invoice.created_at)}</p><Status value={invoice.status} /></div><strong className="customer-invoice-amount">{invoiceAmount(invoice.amount, invoice.currency)}</strong></li>)}</ul></SectionState><p className="customer-section-note"><ReceiptText size={14} aria-hidden="true" />Invoice details are available in Invoices.</p></section>
      <section className="ws-card customer-section" aria-labelledby="customer-music-title"><WorkspaceSectionHeader id="customer-music-title" title="Your music" description="Your three most recently submitted campaigns." actions={<ActionLink href="/dashboard/music">Open Music</ActionLink>} /><SectionState section={data.music} emptyTitle="Make room for your next release" description="Explore promotion and distribution, submit your artist details, and follow your campaign status." action={<ActionLink href="/dashboard/music">Explore Music</ActionLink>}><ul className="customer-record-list">{data.music.rows.map(campaign => <li key={campaign.id} className="customer-music-row"><span className="customer-record-icon"><Music4 size={18} aria-hidden="true" /></span><div className="customer-record-main"><h3>{campaign.track_title || "Untitled track"}</h3><p>{campaign.artist_name || "Artist not specified"}</p><p>{campaign.plan_name || "Plan not specified"} · Submitted {overviewDate(campaign.created_at)}</p><Status value={campaign.status} /></div></li>)}</ul></SectionState></section>
    </div>
    <div className="customer-discovery-grid">
      <section className="ws-card customer-discovery" aria-labelledby="customer-services-title"><Wrench size={21} aria-hidden="true" /><div><p className="customer-eyebrow">PurpleSoftHub Studio</p><h2 id="customer-services-title">Bring your next idea to life</h2><p>Digital products, design, and marketing services for your next move.</p></div><ActionLink href="/dashboard/services">Explore services</ActionLink></section>
      <section className="ws-card customer-discovery" aria-labelledby="customer-academy-title"><GraduationCap size={23} aria-hidden="true" /><div><p className="customer-eyebrow">PurpleSoftHub Academy</p><h2 id="customer-academy-title">Keep building your skills</h2><p>Explore our public learning tracks and join the waitlist for future training.</p></div><ActionLink href="/academy">Browse Academy</ActionLink></section>
    </div>
    <section className="customer-help" aria-labelledby="customer-help-title"><MessagesSquare size={21} aria-hidden="true" /><div><h2 id="customer-help-title">A little guidance goes a long way</h2><p>Use Nova in the corner for assistance, or speak with the team on WhatsApp.</p></div><a className="customer-text-link" href="https://wa.me/qr/L36LMHQ4RLP2B1" target="_blank" rel="noopener noreferrer">Talk to the team<span className="sr-only"> (opens a new tab)</span><ArrowRight size={15} aria-hidden="true" /></a></section>
  </WorkspacePage>;
}
