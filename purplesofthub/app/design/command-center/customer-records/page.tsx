import { CustomerRecordsPreview } from "@/components/workspace/customer-records-preview";
import "@/app/styles/customer-workspace.css";
import "@/app/styles/customer-records.css";

// Inherits existing production-disabled guard and noindex/nofollow metadata.
export default function CustomerRecordsPreviewPage() {
  return <CustomerRecordsPreview />;
}
