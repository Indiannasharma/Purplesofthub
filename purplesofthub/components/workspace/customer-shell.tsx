"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, Settings, LogOut, ArrowUpRight, MessagesSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ccFontVariables } from "@/components/command-center/fonts";
import { WorkspaceRoot } from "@/components/workspace/page";
import { WorkspaceNavigation } from "@/components/workspace/workspace-shell";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import { WorkspaceSheetContent } from "@/components/workspace/overlays";
import { ThemeToggle } from "@/components/workspace/theme-toggle";
import { Sheet, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { customerNavigation, customerNavigationGroups, customerAdvertisingLinks, isCustomerNavItemActive } from "@/lib/customer-navigation";
import { customerName } from "@/lib/customer-overview";

export type CustomerIdentity = { id: string; name: string; email: string };
function Brand() {
  return <Link href="/dashboard" className="customer-brand" aria-label="PurpleSoftHub Workspace overview"><Image src="/images/logo/purplesoft-logo-main.png" alt="PurpleSoftHub" width={144} height={40} priority /><span>Workspace</span></Link>;
}
function CustomerNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <div className="customer-navigation">
    {customerNavigationGroups.map(group => <div key={group.title} className="customer-nav-group"><p>{group.title}</p><WorkspaceNavigation items={group.ids.map(id => customerNavigation.find(item => item.id === id)!)} pathname={pathname} rootHref="/dashboard" onNavigate={onNavigate} />{group.ids.some(id => id === "advertising") ? <WorkspaceNavigation items={customerAdvertisingLinks} pathname={pathname} rootHref="/dashboard" onNavigate={onNavigate} /> : null}</div>)}
    <a href="https://wa.me/qr/L36LMHQ4RLP2B1" target="_blank" rel="noopener noreferrer" className="customer-support" onClick={onNavigate}><MessagesSquare size={18} aria-hidden="true" /><span>Talk to the team<small>WhatsApp support · opens a new tab</small></span><ArrowUpRight size={15} aria-hidden="true" /></a>
  </div>;
}
function AccountMenu({ identity }: { identity: CustomerIdentity }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const name = customerName(identity.name) || "Your account";
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    const result = await createClient().auth.signOut();
    if (result.error) { setError("Could not sign out. Please try again."); setSigningOut(false); return; }
    router.push("/sign-in");
  }
  return <><DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="customer-account" aria-label="Open account menu"><span className="customer-avatar" aria-hidden="true">{initials}</span><span className="customer-account-name">{name}</span><ChevronDown size={14} aria-hidden="true" /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className={ccFontVariables + " workspace-overlay customer-account-menu"}><DropdownMenuLabel><strong>{name}</strong><span>{identity.email}</span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings size={16} aria-hidden="true" />Account settings</Link></DropdownMenuItem><DropdownMenuItem disabled={signingOut} onSelect={() => void signOut()}><LogOut size={16} aria-hidden="true" />{signingOut ? "Signing out…" : "Sign out"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>{error ? <span role="alert" className="customer-signout-error">{error}</span> : null}</>;
}
/** Customer presentation only. The existing server layout remains the session gate.
 * Fixed viewport + scrolling main preserve the contract of unmigrated customer bodies.
 */
export function CustomerShell({ identity, pathname, notifications, children }: { identity: CustomerIdentity; pathname: string; notifications?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const context = [...customerNavigation, ...customerAdvertisingLinks].find(item => isCustomerNavItemActive(pathname, item))?.title || "Workspace";
  return <WorkspaceRoot kind="customer" className={ccFontVariables + " customer-shell"}>
    <a className="ws-skip" href="#customer-main">Skip to content</a>
    <aside className="customer-sidebar"><Brand /><CustomerNavigation pathname={pathname} /><div className="customer-sidebar-foot"><span>One place for your work.</span><small>Projects, creative services & support.</small></div></aside>
    <div className="customer-main-frame"><header className="customer-topbar">
      <div className="customer-context"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button type="button" variant="ghost" size="icon" className="customer-mobile-trigger" aria-label="Open workspace navigation"><Menu size={20} aria-hidden="true" /></Button></SheetTrigger><WorkspaceSheetContent side="left" className="customer-mobile-sheet"><SheetTitle>Workspace navigation</SheetTitle><SheetDescription>Explore your work and PurpleSoftHub services.</SheetDescription><Brand /><CustomerNavigation pathname={pathname} onNavigate={() => setOpen(false)} /></WorkspaceSheetContent></Sheet><span className="customer-context-prefix">Workspace <span aria-hidden="true">/</span></span><span className="customer-context-title">{context}</span></div>
      <div className="customer-topbar-actions"><div className="customer-notifications">{notifications}</div><ThemeToggle contentClassName={ccFontVariables + " workspace-overlay"} /><AccountMenu identity={identity} /></div>
    </header><main id="customer-main" tabIndex={-1} className={pathname === "/dashboard" ? "customer-content customer-overview-content" : "customer-content"}>{children}</main><div className="customer-assistant-gutter"><span>Nova is here when you need a hand.</span></div></div>
  </WorkspaceRoot>;
}
