import Link from "next/link";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  badge?: string;
};

export function ModulePlaceholder({
  title,
  description,
  badge = "Coming Soon",
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {badge}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              PurpleSoftHub Platform Shell
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/platform/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/platform/settings">
              <Sparkles className="mr-2 h-4 w-4" />
              Review workspace settings
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Alert className="border-purple-200/70 bg-purple-50 text-purple-950 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-100">
        <Construction className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          This module will be plugged into the shared Platform Shell in a future sprint.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-border/60">
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


