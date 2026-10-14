export default function AnalyticsLoading() {
  return <div className="p-6" role="status" aria-label="Loading verified analytics"><p className="mb-6 text-sm text-muted-foreground">Loading verified reports…</p><div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="cc-panel h-28 bg-muted" />)}</div><div className="cc-panel mt-5 h-80 bg-muted" /></div>
}
