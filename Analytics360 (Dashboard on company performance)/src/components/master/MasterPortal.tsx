import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X, Loader2, ChevronRight, GitBranch, MapPin } from 'lucide-react';
import type { BranchMapping, MapLocator } from '../../types';
import { useDataStore } from '../../stores/dataStore';

type TabType = 'branchMapping' | 'mapLocator';

// Grouped clinic type for branch mapping
interface GroupedClinic {
  clinicCode: string;
  state: string;
  pinCode: string;
  totalActiveBase: number;
  totalTotalBase: number;
  totalConsultation: number;
  entryCount: number;
  entries: BranchMapping[];
}

const mapColumnHelper = createColumnHelper<MapLocator>();

// Safe string conversion for filtering
const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

export default function MasterPortal() {
  const {
    branchMappings,
    mapLocators,
    updateBranchMapping,
    updateMapLocator,
  } = useDataStore();

  const [activeTab, setActiveTab] = useState<TabType>('branchMapping');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapSorting, setMapSorting] = useState<SortingState>([]);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedClinics, setExpandedClinics] = useState<Set<string>>(new Set());

  const branchParentRef = useRef<HTMLDivElement>(null);
  const mapParentRef = useRef<HTMLDivElement>(null);

  // Toggle clinic expansion
  const toggleExpand = (clinicCode: string) => {
    setExpandedClinics(prev => {
      const next = new Set(prev);
      if (next.has(clinicCode)) {
        next.delete(clinicCode);
      } else {
        next.add(clinicCode);
      }
      return next;
    });
  };

  const startEdit = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  const handleSave = async (id: string, field: string, type: 'branch' | 'map', value?: string) => {
    if (saving) return;
    setSaving(true);

    try {
      const finalValue = value !== undefined ? value : editValue;
      const numericFields = ['activeBase', 'totalBase', 'consultation'];
      const updateValue = numericFields.includes(field)
        ? { [field]: Number(finalValue) }
        : { [field]: finalValue };

      if (type === 'branch') {
        await updateBranchMapping(id, updateValue);
      } else {
        await updateMapLocator(id, updateValue);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Group branchMappings by clinicCode
  const groupedData = useMemo(() => {
    const groups = new Map<string, GroupedClinic>();

    branchMappings.forEach(row => {
      const clinicCode = safeString(row.clinicCode);
      if (!clinicCode) return;

      const existing = groups.get(clinicCode);
      if (existing) {
        existing.totalActiveBase += row.activeBase || 0;
        existing.totalTotalBase += row.totalBase || 0;
        existing.totalConsultation += row.consultation || 0;
        existing.entryCount += 1;
        existing.entries.push(row);
      } else {
        groups.set(clinicCode, {
          clinicCode,
          state: safeString(row.state),
          pinCode: safeString(row.pinCode),
          totalActiveBase: row.activeBase || 0,
          totalTotalBase: row.totalBase || 0,
          totalConsultation: row.consultation || 0,
          entryCount: 1,
          entries: [row],
        });
      }
    });

    return Array.from(groups.values());
  }, [branchMappings]);

  // Filter grouped data - only by clinic code (safe string handling)
  const filteredGroupedData = useMemo(() => {
    if (!searchTerm) return groupedData;

    const term = searchTerm.toLowerCase().trim();
    return groupedData.filter(row =>
      safeString(row.clinicCode).toLowerCase().includes(term)
    );
  }, [groupedData, searchTerm]);

  // Unique clinics count
  const uniqueClinicsCount = groupedData.length;

  // Map Locator Columns
  const mapColumns = useMemo(
    () => [
      mapColumnHelper.accessor('clinicCode', { header: 'Clinic Code' }),
      mapColumnHelper.accessor('clinicAddress', { header: 'Address' }),
      mapColumnHelper.accessor('clinicType', { header: 'Type' }),
      mapColumnHelper.accessor('state', { header: 'State' }),
      mapColumnHelper.accessor('region', { header: 'Region' }),
      mapColumnHelper.accessor('partnerName', { header: 'Partner' }),
      mapColumnHelper.accessor('nurseName', { header: 'Nurse' }),
      mapColumnHelper.accessor('dcName', { header: 'DC' }),
      mapColumnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
          const row = info.row.original;
          const isEditing = editingCell?.id === row.id && editingCell?.field === 'status';

          if (isEditing) {
            return (
              <select
                value={editValue}
                onChange={e => {
                  setEditValue(e.target.value);
                  handleSave(row.id, 'status', 'map', e.target.value);
                }}
                className="input-field w-24 py-1"
                autoFocus
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            );
          }
          return (
            <span
              onClick={() => startEdit(row.id, 'status', safeString(info.getValue()))}
              className={`cursor-pointer px-2 py-1 rounded-full text-xs ${
                info.getValue() === 'Active'
                  ? 'bg-green-500/20 text-green-400'
                  : info.getValue() === 'Inactive'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {info.getValue() || 'N/A'}
            </span>
          );
        },
      }),
    ],
    [editingCell, editValue]
  );

  // Filter map data by search term (safe string handling)
  const filteredMapData = useMemo(() => {
    if (!searchTerm) return mapLocators;
    const term = searchTerm.toLowerCase().trim();
    return mapLocators.filter(
      row => safeString(row.clinicCode).toLowerCase().includes(term)
    );
  }, [mapLocators, searchTerm]);

  const mapTable = useReactTable({
    data: filteredMapData,
    columns: mapColumns,
    state: { sorting: mapSorting },
    onSortingChange: setMapSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const mapRows = mapTable.getRowModel().rows;

  const mapVirtualizer = useVirtualizer({
    count: mapRows.length,
    getScrollElement: () => mapParentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  // Render editable cell for entry
  const renderEditableCell = (entry: BranchMapping, field: 'activeBase' | 'totalBase' | 'consultation', value: number) => {
    const isEditing = editingCell?.id === entry.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <input
          type="number"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => handleSave(entry.id, field, 'branch')}
          onKeyDown={e => e.key === 'Enter' && handleSave(entry.id, field, 'branch')}
          className="input-field w-20 py-1 text-sm"
          title={`Edit ${field}`}
          placeholder="0"
          autoFocus
        />
      );
    }

    return (
      <span
        onDoubleClick={() => startEdit(entry.id, field, String(value))}
        className="cursor-pointer hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-2 py-1 rounded transition-all"
        title="Double-click to edit"
      >
        {value.toLocaleString('en-IN')}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Master Portal</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Manage clinic data. Click row to expand, double-click values to edit.
            </p>
          </div>
          {saving && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Saving...</span>
            </div>
          )}
        </div>

        {/* Tab Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.button
            type="button"
            onClick={() => setActiveTab('branchMapping')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
              activeTab === 'branchMapping'
                ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                activeTab === 'branchMapping'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              }`}>
                <GitBranch className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  activeTab === 'branchMapping' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
                }`}>
                  Branch Mapping
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {uniqueClinicsCount.toLocaleString()} clinics
                </p>
              </div>
            </div>
            {activeTab === 'branchMapping' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-primary)]"
              />
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveTab('mapLocator')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
              activeTab === 'mapLocator'
                ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                activeTab === 'mapLocator'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              }`}>
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  activeTab === 'mapLocator' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
                }`}>
                  Map Locator
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {mapLocators.length.toLocaleString()} locations
                </p>
              </div>
            </div>
            {activeTab === 'mapLocator' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-primary)]"
              />
            )}
          </motion.button>
        </div>

        {/* Search Box */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Search by clinic code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-12 pr-10 py-3 w-full text-base rounded-xl"
          />
          {searchTerm && (
            <button
              type="button"
              title="Clear search"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-[var(--color-primary)] mt-2 ml-1">
            Found {activeTab === 'branchMapping' ? filteredGroupedData.length : filteredMapData.length} matches
          </p>
        )}
      </div>

      {/* Data Table Card */}
      <div className="glass-card overflow-hidden">
        {/* Branch Mapping Table - Grouped View */}
        {activeTab === 'branchMapping' && (
          <div ref={branchParentRef} className="h-[600px] overflow-auto">
            <table className="data-table w-full table-fixed">
              <thead>
                <tr>
                  <th className="w-10"><span className="sr-only">Expand</span></th>
                  <th className="text-left w-[18%]">Clinic Code</th>
                  <th className="text-left w-[8%]">State</th>
                  <th className="text-left w-[10%]">Pin Code</th>
                  <th className="text-center w-[10%]">Entries</th>
                  <th className="text-center w-[14%]">Active Base</th>
                  <th className="text-center w-[14%]">Total Base</th>
                  <th className="text-center w-[14%]">Consultations</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroupedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-[var(--color-text-secondary)]">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-30" />
                        <span>No clinics found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGroupedData.map(clinic => {
                    const isExpanded = expandedClinics.has(clinic.clinicCode);
                    return (
                      <AnimatePresence key={clinic.clinicCode}>
                        {/* Main Clinic Row */}
                        <motion.tr
                          onClick={() => toggleExpand(clinic.clinicCode)}
                          className={`cursor-pointer transition-colors ${
                            isExpanded
                              ? 'bg-[var(--color-primary)]/10'
                              : 'hover:bg-[var(--color-surface-hover)]'
                          }`}
                          initial={false}
                        >
                          <td className="w-12 text-center">
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className={`w-5 h-5 ${
                                isExpanded ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                              }`} />
                            </motion.div>
                          </td>
                          <td className="font-semibold text-[var(--color-text)]">{clinic.clinicCode}</td>
                          <td className="text-[var(--color-text-secondary)]">{clinic.state}</td>
                          <td className="text-[var(--color-text-secondary)]">{clinic.pinCode}</td>
                          <td className="text-center">
                            <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-semibold">
                              {clinic.entryCount}
                            </span>
                          </td>
                          <td className="text-center font-semibold text-[var(--color-text)]">
                            {clinic.totalActiveBase.toLocaleString('en-IN')}
                          </td>
                          <td className="text-center font-semibold text-[var(--color-text)]">
                            {clinic.totalTotalBase.toLocaleString('en-IN')}
                          </td>
                          <td className="text-center font-semibold text-[var(--color-text)]">
                            {clinic.totalConsultation.toLocaleString('en-IN')}
                          </td>
                        </motion.tr>

                        {/* Expanded Entry Rows */}
                        {isExpanded && (
                          <motion.tr
                            key={`${clinic.clinicCode}-expanded`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan={8} className="p-0">
                              <div className="bg-[var(--color-background)]/80 border-l-4 border-[var(--color-primary)] ml-6 mr-4 my-2 rounded-lg overflow-hidden">
                                <table className="w-full text-sm table-fixed">
                                  <colgroup>
                                    <col className="w-[30%]" />
                                    <col className="w-[30%]" />
                                    <col className="w-[13%]" />
                                    <col className="w-[13%]" />
                                    <col className="w-[14%]" />
                                  </colgroup>
                                  <thead>
                                    <tr className="bg-[var(--color-surface)]/50">
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Channel</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Branch</th>
                                      <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Active Base</th>
                                      <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Base</th>
                                      <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Consultations</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {clinic.entries.map((entry, idx) => (
                                      <tr
                                        key={entry.id || idx}
                                        className="border-t border-[var(--color-border)]/30 hover:bg-[var(--color-primary)]/5 transition-colors"
                                      >
                                        <td className="py-3 px-4 text-[var(--color-text)]">
                                          {safeString(entry.channelName) || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-[var(--color-text)]">
                                          {safeString(entry.branchName) || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          {renderEditableCell(entry, 'activeBase', entry.activeBase || 0)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          {renderEditableCell(entry, 'totalBase', entry.totalBase || 0)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          {renderEditableCell(entry, 'consultation', entry.consultation || 0)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Map Locator Table */}
        {activeTab === 'mapLocator' && (
          <div ref={mapParentRef} className="h-[600px] overflow-auto">
            <table className="data-table">
              <thead>
                {mapTable.getHeaderGroups().map(headerGroup => (
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
                {mapVirtualizer.getVirtualItems().length === 0 ? (
                  <tr>
                    <td colSpan={mapColumns.length} className="text-center py-16 text-[var(--color-text-secondary)]">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="w-8 h-8 opacity-30" />
                        <span>No locations found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mapVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = mapRows[virtualRow.index];
                    return (
                      <tr key={row.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
