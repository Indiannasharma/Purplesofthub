export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-48 rounded-lg bg-gray-800" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-800" />
        ))}
      </div>
      <div className="mb-6 h-20 rounded-xl bg-gray-800" />
      <div className="h-64 rounded-xl bg-gray-800" />
    </div>
  )
}
