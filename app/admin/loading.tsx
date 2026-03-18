export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`admin-skeleton-${index}`}
            className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}
