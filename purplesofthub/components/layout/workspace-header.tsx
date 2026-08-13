import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import type { WorkspaceMeta } from "@/lib/workspace";

type WorkspaceHeaderProps = {
  workspace: WorkspaceMeta;
};

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <workspace.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {workspace.badge ?? "Platform Shell"}
            </p>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{workspace.title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {workspace.description}
          </p>
        </div>

        <Badge variant="outline" className="w-fit rounded-full">
          Reusable shell
        </Badge>
      </CardContent>
    </Card>
  );
}
