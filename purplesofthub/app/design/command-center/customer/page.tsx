import { CustomerWorkspacePreview } from "@/components/workspace/customer-preview";
import "@/app/styles/customer-workspace.css";

// Inherits the existing production preview guard and noindex metadata.
export default function CustomerWorkspacePreviewPage() {
  return <CustomerWorkspacePreview />;
}
