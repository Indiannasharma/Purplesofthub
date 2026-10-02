import { ReceiptText } from "lucide-react";
import { WorkspacePage } from "@/components/workspace/page";
import { WorkspacePageHeader } from "@/components/workspace/page-header";
import { WorkspaceEmptyState } from "@/components/workspace/empty-state";
import { CustomerRecordStatus } from "@/components/workspace/customer-record-status";
import { CustomerRecordsError, CustomerRecordsSupport } from "@/components/workspace/customer-record-states";
import { invoiceAmount, overviewDate, type OverviewSection } from "@/lib/customer-overview";
import { invoiceProjectTitle, type CustomerInvoice } from "@/lib/customer-records";

/** Native recorded amounts only; neither regional prices nor total reconciliations. */
export default function InvoicesClient({ section }: { section: OverviewSection<CustomerInvoice> }) {
  return <WorkspacePage kind="customer" className="customer-records customer-invoices">
    <WorkspacePageHeader title="Invoices" description="Review the invoices and payment records associated with your PurpleSoftHub account." />
    {section.state !== "ready" ? <CustomerRecordsError state={section.state} /> : !section.rows.length ? <WorkspaceEmptyState title="No invoices yet" description="Invoices from PurpleSoftHub will appear here when they are issued to your account." icon={ReceiptText} /> : <section className="customer-invoice-section" aria-labelledby="customer-invoice-list-title"><div className="customer-invoice-intro"><h2 id="customer-invoice-list-title">Your invoice records</h2><p>Each amount is shown in its recorded currency.</p></div><ul className="customer-invoice-list">{section.rows.map(invoice => <li key={invoice.id}><article className="ws-card customer-invoice-card"><div className="customer-invoice-heading"><div><p className="customer-record-service">Invoice reference</p><h3>#{invoice.id}</h3><p className="customer-invoice-project">{invoiceProjectTitle(invoice.projects)}</p></div><CustomerRecordStatus value={invoice.status} /></div><div className="customer-invoice-value"><span>Recorded amount</span><strong>{invoiceAmount(invoice.amount, invoice.currency)}</strong></div><dl className="customer-record-dates"><div><dt>Issued</dt><dd>{overviewDate(invoice.created_at)}</dd></div><div><dt>Due</dt><dd>{invoice.due_date ? overviewDate(invoice.due_date) : "Not specified"}</dd></div></dl></article></li>)}</ul></section>}
    <CustomerRecordsSupport />
  </WorkspacePage>;
}
