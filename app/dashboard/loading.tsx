export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-40 rounded-lg bg-gray-800" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-800" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-gray-800" />
    </div>
  )
}
