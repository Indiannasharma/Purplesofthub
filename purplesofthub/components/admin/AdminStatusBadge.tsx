import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "error" | "info" | "muted" | "accent";

const toneByStatus: Record<string, StatusTone> = {
  completed: "success",
  paid: "success",
  active: "success",
  pending: "warning",
  processing: "warning",
  failed: "error",
  rejected: "error",
  cancelled: "muted",
};

export function AdminStatusBadge({
  status,
  tone,
  className,
}: {
  status: string | null | undefined;
  tone?: StatusTone;
  className?: string;
}) {
  const normalized = (status || "Unknown").trim();
  const resolvedTone = tone || toneByStatus[normalized.toLowerCase()] || "muted";

  return (
    <span className={cn("cc-pill", `cc-pill-${resolvedTone}`, className)}>
      {normalized}
    </span>
  );
}
