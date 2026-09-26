import { Search } from "lucide-react";

export function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="cc-toolbar">
      <label className="cc-search-field">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">{searchPlaceholder}</span>
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} />
      </label>
      {children ? <div className="cc-toolbar-actions">{children}</div> : null}
    </div>
  );
}
