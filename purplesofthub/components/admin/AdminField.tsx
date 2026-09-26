import { Label } from "@/components/ui/label";

export function AdminField({
  id,
  label,
  description,
  error,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return <div className="cc-field"><Label htmlFor={id}>{label}</Label>{description ? <p>{description}</p> : null}{children}{error ? <span role="alert">{error}</span> : null}</div>;
}
