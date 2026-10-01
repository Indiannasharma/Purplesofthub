"use client";

import * as React from "react";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/Card";
import { Dialog, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { WorkspacePage, WorkspaceActions, WorkspaceSectionHeader, type WorkspaceKind } from "@/components/workspace/page";
import { WorkspacePageHeader } from "@/components/workspace/page-header";
import { WorkspaceField } from "@/components/workspace/field";
import { WorkspaceSelect } from "@/components/workspace/select";
import { WorkspaceDialogContent } from "@/components/workspace/overlays";
import { WorkspaceEmptyState } from "@/components/workspace/empty-state";
import { WorkspaceErrorState } from "@/components/workspace/error-state";
import { WorkspaceLoadingState } from "@/components/workspace/loading-state";
import { WorkspaceStatusBadge } from "@/components/workspace/status-badge";
import { ThemeToggle } from "@/components/workspace/theme-toggle";
import { ccFontVariables } from "@/components/command-center/fonts";
import { customerNavigation, customerAdvertisingLinks } from "@/lib/customer-navigation";
import { flattenAdminNavItems } from "@/lib/admin-navigation";

/** Guarded component harness. No records, API requests, writes, metrics or account simulation. */
export function FoundationPreview() {
  const [kind, setKind] = React.useState<WorkspaceKind>("customer");
  const [showError, setShowError] = React.useState(false);
  const navigation = kind === "customer" ? [...customerNavigation, ...customerAdvertisingLinks] : flattenAdminNavItems().map(item => ({ ...item, note: item.badge }));
  return <WorkspaceShell kind={kind} title="Application foundation preview" navigation={navigation} pathname="/design/command-center/foundation" actions={<ThemeToggle contentClassName={"workspace-overlay " + ccFontVariables} />}>
    <WorkspacePage kind={kind}>
      <WorkspacePageHeader title="One application foundation, different workspace needs" description="Review shared components and presentation density. This isolated preview does not fetch account data." actions={<WorkspaceActions><Button type="button" variant={kind === "customer" ? "default" : "outline"} aria-pressed={kind === "customer"} onClick={() => setKind("customer")}>Customer spacing</Button><Button type="button" variant={kind === "admin" ? "default" : "outline"} aria-pressed={kind === "admin"} onClick={() => setKind("admin")}>Admin spacing</Button></WorkspaceActions>} />
      <div className="ws-grid">
        <Card className="ws-card">
          <WorkspaceSectionHeader title="Fields and actions" description="Validation here is a presentation example. Nothing is submitted." />
          <div className="ws-stack">
            <WorkspaceField id="preview-name" label="Field example" description="Help text is linked to this control." error={showError ? "An example validation message linked to the field." : undefined}><Input autoComplete="off" placeholder="Enter text to inspect focus" /></WorkspaceField>
            <WorkspaceField id="preview-choice" label="Select example"><WorkspaceSelect defaultValue=""><option value="" disabled>Choose a presentation option</option><option value="comfortable">Comfortable</option><option value="compact">Compact</option></WorkspaceSelect></WorkspaceField>
            <WorkspaceField id="preview-notes" label="Textarea example" description="Resize the viewport to check wrapping."><Textarea placeholder="No information is saved" /></WorkspaceField>
            <WorkspaceActions><Button type="button" variant="outline" aria-pressed={showError} onClick={() => setShowError(value => !value)}>Toggle field error</Button>
              <Dialog><DialogTrigger asChild><Button type="button">Inspect dialog</Button></DialogTrigger><WorkspaceDialogContent><DialogTitle>Shared application foundation</DialogTitle><DialogDescription>This content uses Command Center tokens inside the existing Radix portal. Check focus trapping, Escape dismissal, focus return and viewport fit.</DialogDescription><DialogClose asChild><Button type="button" variant="outline">Close dialog</Button></DialogClose></WorkspaceDialogContent></Dialog>
            </WorkspaceActions>
          </div>
        </Card>
        <div className="ws-stack">
          <Card className="ws-card"><WorkspaceSectionHeader title="Status representation" description="Labels below illustrate presentation tones; they do not describe any account or campaign." /><WorkspaceActions><WorkspaceStatusBadge status="Active" /><WorkspaceStatusBadge status="Pending" /><WorkspaceStatusBadge status="Failed" /><WorkspaceStatusBadge status={null} /></WorkspaceActions></Card>
          <WorkspaceEmptyState title="No account records loaded" description="This preview does not query customer or staff data. Production pages keep their existing records and behavior." />
          <WorkspaceErrorState title="Error presentation example" description="No request was made. This component shows how a recoverable error is presented." />
        </div>
      </div>
      <Card className="ws-card"><WorkspaceSectionHeader title="Loading presentation" description="A skeleton example, not a running account request." /><WorkspaceLoadingState rows={2} /></Card>
      <p className="ws-preview-note">Academy links to the existing public course and waitlist experience. Music links to existing campaign functionality. Support uses the existing WhatsApp destination; no tickets or LMS operations are implied.</p>
    </WorkspacePage>
  </WorkspaceShell>;
}
