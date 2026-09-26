"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";

export function AdminDataTable<TData>({
  data,
  columns,
  getRowId,
  mobileCard,
  pageSize = 10,
}: {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData) => string;
  mobileCard: (row: TData) => React.ReactNode;
  pageSize?: number;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [page, setPage] = React.useState(0);
  const table = useReactTable({ data, columns, state: { sorting }, getRowId, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const rows = table.getRowModel().rows;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visibleRows = rows.slice(safePage * pageSize, safePage * pageSize + pageSize);

  React.useEffect(() => { if (page !== safePage) setPage(safePage); }, [page, safePage]);

  return (
    <div className="cc-data-table">
      <div className="cc-table-desktop">
        <table>
          <thead>{table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id}>{header.isPlaceholder ? null : header.column.getCanSort() ? <button type="button" onClick={header.column.getToggleSortingHandler()} className="cc-table-sort">{flexRender(header.column.columnDef.header, header.getContext())}<ChevronsUpDown aria-hidden="true" size={13} /></button> : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
          <tbody>{visibleRows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="cc-table-mobile">{visibleRows.map((row) => <React.Fragment key={row.id}>{mobileCard(row.original)}</React.Fragment>)}</div>
      {rows.length > pageSize ? <div className="cc-pagination"><span>Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, rows.length)} of {rows.length}</span><div><button className="cc-icon-btn cc-icon-btn-sm" type="button" disabled={safePage === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} aria-label="Previous page"><ChevronLeft size={16} /></button><span>{safePage + 1} / {pages}</span><button className="cc-icon-btn cc-icon-btn-sm" type="button" disabled={safePage === pages - 1} onClick={() => setPage((current) => Math.min(pages - 1, current + 1))} aria-label="Next page"><ChevronRight size={16} /></button></div></div> : null}
    </div>
  );
}
