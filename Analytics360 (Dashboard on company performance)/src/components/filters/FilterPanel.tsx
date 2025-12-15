import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, RotateCcw, ChevronRight, Check, Sliders } from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Multi-Select Filter Popup Modal Component
interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValues: string[];
  onApply: (values: string[]) => void;
}

function FilterPopup({ isOpen, onClose, title, options, selectedValues, onApply }: FilterPopupProps) {
  const [searchText, setSearchText] = useState('');
  const [tempValues, setTempValues] = useState<string[]>(selectedValues);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset temp values when popup opens
  useEffect(() => {
    if (isOpen) {
      setTempValues(selectedValues);
      setSearchText('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, selectedValues]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const term = searchText.toLowerCase();
    return options.filter(opt => String(opt).toLowerCase().includes(term));
  }, [searchText, options]);

  const handleApply = () => {
    onApply(tempValues);
    onClose();
  };

  const handleClear = () => {
    setTempValues([]);
  };

  const toggleOption = (opt: string) => {
    setTempValues(prev => {
      if (prev.includes(opt)) {
        return prev.filter(v => v !== opt);
      } else {
        return [...prev, opt];
      }
    });
  };

  const selectAll = () => {
    setTempValues([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className="glass-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">Select {title}</h3>
                  {tempValues.length > 0 && (
                    <p className="text-xs text-[var(--color-primary)] mt-0.5">
                      {tempValues.length} selected
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  aria-label="Close filter popup"
                  className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-[var(--color-border)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)] pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-64 overflow-y-auto">
                {/* All Option */}
                <button
                  type="button"
                  onClick={selectAll}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-colors ${
                    tempValues.length === 0 ? 'bg-[var(--color-primary)]/10' : ''
                  }`}
                >
                  <span className={tempValues.length === 0 ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text)]'}>
                    All {title}s
                  </span>
                  {tempValues.length === 0 && <Check className="w-5 h-5 text-[var(--color-primary)]" />}
                </button>

                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    No matches found
                  </div>
                ) : (
                  filteredOptions.slice(0, 100).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleOption(opt)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-colors ${
                        tempValues.includes(opt) ? 'bg-[var(--color-primary)]/10' : ''
                      }`}
                    >
                      <span className={tempValues.includes(opt) ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text)]'}>
                        {opt}
                      </span>
                      {tempValues.includes(opt) && <Check className="w-5 h-5 text-[var(--color-primary)]" />}
                    </button>
                  ))
                )}
                {filteredOptions.length > 100 && (
                  <div className="px-4 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                    Showing first 100 results. Search to find more.
                  </div>
                )}
              </div>

              {/* Footer with Apply/Clear buttons */}
              <div className="p-4 border-t border-[var(--color-border)] flex gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors font-medium"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Filter Button Component
interface FilterButtonProps {
  label: string;
  values: string[];
  onClick: () => void;
  onClear: () => void;
}

function FilterButton({ label, values, onClick, onClear }: FilterButtonProps) {
  const displayValue = values.length === 0
    ? `All ${label}s`
    : values.length === 1
      ? values[0]
      : `${values.length} selected`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
        values.length > 0
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--color-text-secondary)] mb-0.5">{label}</div>
        <div className={`text-sm font-medium truncate ${values.length > 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
          {displayValue}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {values.length > 0 && (
          <span
            role="button"
            tabIndex={0}
            title="Clear filter"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                onClear();
              }
            }}
            className="p-1 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
      </div>
    </motion.button>
  );
}

export default function FilterPanel({ isOpen, onToggle }: FilterPanelProps) {
  const {
    searchTerm,
    stateFilter,
    channelFilter,
    branchFilter,
    pinCodeFilter,
    allStates,
    allChannels,
    allBranches,
    allPinCodes,
    allClinicTypes,
    allRegions,
    allTlNames,
    allNurseNames,
    allDcNames,
    allStatuses,
    allNurseTypes,
    mapLocators,
    setSearchTerm,
    setStateFilter,
    setChannelFilter,
    setBranchFilter,
    setPinCodeFilter,
    clearAllFilters,
    filteredData,
    branchMappings,
  } = useDataStore();

  // Multi-select state (convert single values to arrays)
  const [clinicFilters, setClinicFilters] = useState<string[]>(searchTerm ? [searchTerm] : []);
  const [stateFilters, setStateFilters] = useState<string[]>(stateFilter ? [stateFilter] : []);
  const [channelFilters, setChannelFilters] = useState<string[]>(channelFilter ? [channelFilter] : []);
  const [branchFilters, setBranchFilters] = useState<string[]>(branchFilter ? [branchFilter] : []);
  const [pinCodeFilters, setPinCodeFilters] = useState<string[]>(pinCodeFilter ? [pinCodeFilter] : []);

  // Extra filters state (from mapLocator)
  const [clinicTypeFilters, setClinicTypeFilters] = useState<string[]>([]);
  const [regionFilters, setRegionFilters] = useState<string[]>([]);
  const [tlNameFilters, setTlNameFilters] = useState<string[]>([]);
  const [nurseNameFilters, setNurseNameFilters] = useState<string[]>([]);
  const [dcNameFilters, setDcNameFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [nurseTypeFilters, setNurseTypeFilters] = useState<string[]>([]);

  // Popup states
  const [activePopup, setActivePopup] = useState<'clinic' | 'state' | 'channel' | 'branch' | 'pinCode' | 'clinicType' | 'region' | 'tlName' | 'nurseName' | 'dcName' | 'status' | 'nurseType' | null>(null);

  // Compute clinic codes that match extra filters from mapLocator
  // If ALL options of a filter are selected, treat it as "no filter" for that field
  const extraFilteredClinicCodes = useMemo(() => {
    // Check if filter is "active" (has selections but NOT all options selected)
    const isClinicTypeActive = clinicTypeFilters.length > 0 && clinicTypeFilters.length < allClinicTypes.length;
    const isRegionActive = regionFilters.length > 0 && regionFilters.length < allRegions.length;
    const isTlNameActive = tlNameFilters.length > 0 && tlNameFilters.length < allTlNames.length;
    const isNurseNameActive = nurseNameFilters.length > 0 && nurseNameFilters.length < allNurseNames.length;
    const isDcNameActive = dcNameFilters.length > 0 && dcNameFilters.length < allDcNames.length;
    const isStatusActive = statusFilters.length > 0 && statusFilters.length < allStatuses.length;
    const isNurseTypeActive = nurseTypeFilters.length > 0 && nurseTypeFilters.length < allNurseTypes.length;

    const hasActiveExtraFilters = isClinicTypeActive || isRegionActive || isTlNameActive ||
      isNurseNameActive || isDcNameActive || isStatusActive || isNurseTypeActive;

    if (!hasActiveExtraFilters) return null; // No extra filters actively filtering

    return mapLocators
      .filter(loc => {
        if (isClinicTypeActive && !clinicTypeFilters.includes(loc.clinicType)) return false;
        if (isRegionActive && !regionFilters.includes(loc.region)) return false;
        if (isTlNameActive && !tlNameFilters.includes(loc.tlName)) return false;
        if (isNurseNameActive && !nurseNameFilters.includes(loc.nurseName)) return false;
        if (isDcNameActive && !dcNameFilters.includes(loc.dcName)) return false;
        if (isStatusActive && !statusFilters.includes(loc.status)) return false;
        if (isNurseTypeActive && !nurseTypeFilters.includes(loc.nurseType)) return false;
        return true;
      })
      .map(loc => loc.clinicCode)
      .filter(Boolean);
  }, [mapLocators, clinicTypeFilters, regionFilters, tlNameFilters, nurseNameFilters, dcNameFilters, statusFilters, nurseTypeFilters, allClinicTypes, allRegions, allTlNames, allNurseNames, allDcNames, allStatuses, allNurseTypes]);

  // Sync with store (for backward compatibility, use first value)
  // Combine clinic filters with extra-filtered clinic codes
  useEffect(() => {
    let finalClinicFilters = clinicFilters;

    if (extraFilteredClinicCodes !== null) {
      // If extra filters are active, intersect with their results
      if (clinicFilters.length > 0) {
        // Intersection of manually selected clinics and extra-filtered clinics
        finalClinicFilters = clinicFilters.filter(c => extraFilteredClinicCodes.includes(c));
      } else {
        // Just use extra-filtered clinics
        finalClinicFilters = extraFilteredClinicCodes;
      }
    }

    setSearchTerm(finalClinicFilters.join(','));
  }, [clinicFilters, extraFilteredClinicCodes, setSearchTerm]);

  useEffect(() => {
    setStateFilter(stateFilters.join(','));
  }, [stateFilters, setStateFilter]);

  useEffect(() => {
    setChannelFilter(channelFilters.join(','));
  }, [channelFilters, setChannelFilter]);

  useEffect(() => {
    setBranchFilter(branchFilters.join(','));
  }, [branchFilters, setBranchFilter]);

  useEffect(() => {
    setPinCodeFilter(pinCodeFilters.join(','));
  }, [pinCodeFilters, setPinCodeFilter]);

  // Get unique clinic codes
  const allClinicCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const d of branchMappings) {
      if (d.clinicCode) codes.add(String(d.clinicCode));
    }
    return Array.from(codes).sort();
  }, [branchMappings]);

  const hasActiveFilters = clinicFilters.length > 0 || stateFilters.length > 0 || channelFilters.length > 0 || branchFilters.length > 0 || pinCodeFilters.length > 0 ||
    clinicTypeFilters.length > 0 || regionFilters.length > 0 || tlNameFilters.length > 0 || nurseNameFilters.length > 0 || dcNameFilters.length > 0 || statusFilters.length > 0 || nurseTypeFilters.length > 0;

  const activeFilterCount = [
    clinicFilters.length > 0, stateFilters.length > 0, channelFilters.length > 0, branchFilters.length > 0, pinCodeFilters.length > 0,
    clinicTypeFilters.length > 0, regionFilters.length > 0, tlNameFilters.length > 0, nurseNameFilters.length > 0, dcNameFilters.length > 0, statusFilters.length > 0, nurseTypeFilters.length > 0
  ].filter(Boolean).length;

  const hasExtraFilters = clinicTypeFilters.length > 0 || regionFilters.length > 0 || tlNameFilters.length > 0 || nurseNameFilters.length > 0 || dcNameFilters.length > 0 || statusFilters.length > 0 || nurseTypeFilters.length > 0;
  const extraFilterCount = [clinicTypeFilters.length > 0, regionFilters.length > 0, tlNameFilters.length > 0, nurseNameFilters.length > 0, dcNameFilters.length > 0, statusFilters.length > 0, nurseTypeFilters.length > 0].filter(Boolean).length;

  const handleClearAll = useCallback(() => {
    setClinicFilters([]);
    setStateFilters([]);
    setChannelFilters([]);
    setBranchFilters([]);
    setPinCodeFilters([]);
    // Clear extra filters
    setClinicTypeFilters([]);
    setRegionFilters([]);
    setTlNameFilters([]);
    setNurseNameFilters([]);
    setDcNameFilters([]);
    setStatusFilters([]);
    setNurseTypeFilters([]);
    clearAllFilters();
  }, [clearAllFilters]);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 300 : 48 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="sidebar h-screen sticky top-0 z-40 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col overflow-hidden"
      >
        {/* Toggle Button */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full p-3 flex items-center gap-3 hover:bg-[var(--color-primary)]/10 transition-colors border-b border-[var(--color-border)]"
          title={isOpen ? 'Collapse filters' : 'Expand filters'}
        >
          <Filter className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-[var(--color-text)]"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-xs">
                  {activeFilterCount}
                </span>
              )}
            </motion.span>
          )}
        </button>

        {/* Sidebar Content - Only visible when open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col"
            >
              {/* Filter Buttons */}
              <div className="flex flex-col gap-3 flex-1">
                <FilterButton
                  label="Clinic"
                  values={clinicFilters}
                  onClick={() => setActivePopup('clinic')}
                  onClear={() => setClinicFilters([])}
                />

                <FilterButton
                  label="State"
                  values={stateFilters}
                  onClick={() => setActivePopup('state')}
                  onClear={() => setStateFilters([])}
                />

                <FilterButton
                  label="Channel"
                  values={channelFilters}
                  onClick={() => setActivePopup('channel')}
                  onClear={() => setChannelFilters([])}
                />

                <FilterButton
                  label="Branch"
                  values={branchFilters}
                  onClick={() => setActivePopup('branch')}
                  onClear={() => setBranchFilters([])}
                />

                <FilterButton
                  label="Pin Code"
                  values={pinCodeFilters}
                  onClick={() => setActivePopup('pinCode')}
                  onClear={() => setPinCodeFilters([])}
                />

                {/* Extra Filters Section */}
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Sliders className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      Extra Filters
                    </span>
                    {extraFilterCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-xs">
                        {extraFilterCount}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <FilterButton
                      label="Clinic Type"
                      values={clinicTypeFilters}
                      onClick={() => setActivePopup('clinicType')}
                      onClear={() => setClinicTypeFilters([])}
                    />

                    <FilterButton
                      label="Region"
                      values={regionFilters}
                      onClick={() => setActivePopup('region')}
                      onClear={() => setRegionFilters([])}
                    />

                    <FilterButton
                      label="TL Name"
                      values={tlNameFilters}
                      onClick={() => setActivePopup('tlName')}
                      onClear={() => setTlNameFilters([])}
                    />

                    <FilterButton
                      label="Nurse Name"
                      values={nurseNameFilters}
                      onClick={() => setActivePopup('nurseName')}
                      onClear={() => setNurseNameFilters([])}
                    />

                    <FilterButton
                      label="DC Name"
                      values={dcNameFilters}
                      onClick={() => setActivePopup('dcName')}
                      onClear={() => setDcNameFilters([])}
                    />

                    <FilterButton
                      label="Status"
                      values={statusFilters}
                      onClick={() => setActivePopup('status')}
                      onClear={() => setStatusFilters([])}
                    />

                    <FilterButton
                      label="Nurse Type"
                      values={nurseTypeFilters}
                      onClick={() => setActivePopup('nurseType')}
                      onClear={() => setNurseTypeFilters([])}
                    />
                  </div>
                </div>

                {/* Clear All Button */}
                {hasActiveFilters && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearAll}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 mt-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear All Filters
                  </motion.button>
                )}
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <div className="glass-card p-3 text-center">
                  <div className="text-2xl font-bold gradient-text">
                    {new Set(filteredData.map(d => d.clinicCode)).size.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    of {new Set(branchMappings.map(d => d.clinicCode)).size.toLocaleString()} clinics
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed state */}
        {!isOpen && (
          <div className="flex-1 flex flex-col items-center pt-4 gap-3">
            {hasActiveFilters && (
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </div>
            )}
          </div>
        )}
      </motion.aside>

      {/* Filter Popups */}
      <FilterPopup
        isOpen={activePopup === 'clinic'}
        onClose={() => setActivePopup(null)}
        title="Clinic"
        options={allClinicCodes}
        selectedValues={clinicFilters}
        onApply={setClinicFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'state'}
        onClose={() => setActivePopup(null)}
        title="State"
        options={allStates.map(String)}
        selectedValues={stateFilters}
        onApply={setStateFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'channel'}
        onClose={() => setActivePopup(null)}
        title="Channel"
        options={allChannels.map(String)}
        selectedValues={channelFilters}
        onApply={setChannelFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'branch'}
        onClose={() => setActivePopup(null)}
        title="Branch"
        options={allBranches.map(String)}
        selectedValues={branchFilters}
        onApply={setBranchFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'pinCode'}
        onClose={() => setActivePopup(null)}
        title="Pin Code"
        options={allPinCodes.map(String)}
        selectedValues={pinCodeFilters}
        onApply={setPinCodeFilters}
      />

      {/* Extra Filter Popups */}
      <FilterPopup
        isOpen={activePopup === 'clinicType'}
        onClose={() => setActivePopup(null)}
        title="Clinic Type"
        options={allClinicTypes.map(String)}
        selectedValues={clinicTypeFilters}
        onApply={setClinicTypeFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'region'}
        onClose={() => setActivePopup(null)}
        title="Region"
        options={allRegions.map(String)}
        selectedValues={regionFilters}
        onApply={setRegionFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'tlName'}
        onClose={() => setActivePopup(null)}
        title="TL Name"
        options={allTlNames.map(String)}
        selectedValues={tlNameFilters}
        onApply={setTlNameFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'nurseName'}
        onClose={() => setActivePopup(null)}
        title="Nurse Name"
        options={allNurseNames.map(String)}
        selectedValues={nurseNameFilters}
        onApply={setNurseNameFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'dcName'}
        onClose={() => setActivePopup(null)}
        title="DC Name"
        options={allDcNames.map(String)}
        selectedValues={dcNameFilters}
        onApply={setDcNameFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'status'}
        onClose={() => setActivePopup(null)}
        title="Status"
        options={allStatuses.map(String)}
        selectedValues={statusFilters}
        onApply={setStatusFilters}
      />

      <FilterPopup
        isOpen={activePopup === 'nurseType'}
        onClose={() => setActivePopup(null)}
        title="Nurse Type"
        options={allNurseTypes.map(String)}
        selectedValues={nurseTypeFilters}
        onApply={setNurseTypeFilters}
      />
    </>
  );
}
