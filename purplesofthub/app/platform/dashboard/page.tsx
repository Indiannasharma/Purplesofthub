import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { platformWorkspaces } from "@/lib/workspace";

export default function PlatformDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platformWorkspaces.map((workspace) => (
          <Link key={workspace.key} href={workspace.href} className="group">
            <Card className="h-full border-border/60 transition-colors group-hover:border-primary/40 group-focus-visible:border-primary">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <workspace.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  {workspace.badge ? (
                    <Badge variant="secondary" className="rounded-full">
                      {workspace.badge}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-lg">{workspace.title}</CardTitle>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Open workspace</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
