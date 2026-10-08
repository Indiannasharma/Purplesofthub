export default function Template({
  children
}: {
  children: React.ReactNode
}) {
  // Keep the document in normal paint flow. A failed page animation must never
  // hide the header, sections and footer while root-level controls remain visible.
  return <div>{children}</div>
}
