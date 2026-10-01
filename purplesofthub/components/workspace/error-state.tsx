import { AlertCircle, RefreshCw } from "lucide-react";

export function WorkspaceErrorState({
  title = "Could not load this page",
  description = "Try again. If the problem continues, check your connection and permissions.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="cc-error-state" role="alert">
      <AlertCircle aria-hidden="true" size={22} />
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {onRetry ? (
        <button type="button" className="cc-btn cc-btn-ghost" onClick={onRetry}>
          <RefreshCw aria-hidden="true" size={15} />
          Retry
        </button>
      ) : null}
    </div>
  );
}
