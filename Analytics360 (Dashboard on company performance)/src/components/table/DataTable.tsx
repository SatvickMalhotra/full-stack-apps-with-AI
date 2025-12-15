import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { BranchMapping } from '../../types';
import { useDataStore } from '../../stores/dataStore';

const columnHelper = createColumnHelper<BranchMapping>();

export default function DataTable() {
  const { filteredData, branchMappings } = useDataStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  const parentRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(
    () => [
      columnHelper.accessor('clinicCode', {
        header: 'Clinic Code',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('branchName', {
        header: 'Branch Name',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('channelName', {
        header: 'Channel',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('state', {
        header: 'State',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('pinCode', {
        header: 'Pin Code',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('activeBase', {
        header: 'Active Policies',
        cell: info => info.getValue()?.toLocaleString('en-IN') || '0',
      }),
      columnHelper.accessor('totalBase', {
        header: 'Total Policies',
        cell: info => info.getValue()?.toLocaleString('en-IN') || '0',
      }),
      columnHelper.accessor('consultation', {
        header: 'Consultations',
        cell: info => info.getValue()?.toLocaleString('en-IN') || '0',
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header with count */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-text)]">Data Table</h3>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {filteredData.length.toLocaleString()} of {branchMappings.length.toLocaleString()} rows
        </span>
      </div>

      {/* Table */}
      <div ref={parentRef} className="h-[500px] overflow-auto">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-[var(--color-text-secondary)]">
                  No data found
                </td>
              </tr>
            ) : (
              <>
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
