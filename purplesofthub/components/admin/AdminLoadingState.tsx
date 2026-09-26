export function AdminLoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="cc-loading-panel" aria-busy="true" aria-label="Loading content">
      <div className="cc-skeleton cc-skeleton-title" />
      <div className="cc-skeleton cc-skeleton-toolbar" />
      <div className="cc-loading-rows">
        {Array.from({ length: rows }, (_, index) => <div key={index} className="cc-skeleton cc-skeleton-row" />)}
      </div>
    </div>
  );
}
