import { create } from 'zustand';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { BranchMapping, MapLocator, StateData, ChannelData, KPIData, ClinicDocument, BranchEntry } from '../types';

interface DataStore {
  branchMappings: BranchMapping[];
  filteredData: BranchMapping[];
  mapLocators: MapLocator[];
  isLoading: boolean;
  error: string | null;

  // Filters
  searchTerm: string;
  stateFilter: string;
  channelFilter: string;
  branchFilter: string;
  pinCodeFilter: string;

  // Computed data (from filtered data)
  stateData: StateData[];
  channelData: ChannelData[];
  kpiData: KPIData;

  // Filter options (from all data)
  allStates: string[];
  allChannels: string[];
  allBranches: string[];
  allPinCodes: string[];

  // Extra filter options (from mapLocator)
  allClinicTypes: string[];
  allRegions: string[];
  allTlNames: string[];
  allNurseNames: string[];
  allDcNames: string[];
  allStatuses: string[];
  allNurseTypes: string[];

  // Actions
  fetchData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setStateFilter: (state: string) => void;
  setChannelFilter: (channel: string) => void;
  setBranchFilter: (branch: string) => void;
  setPinCodeFilter: (pinCode: string) => void;
  clearAllFilters: () => void;
  updateBranchMapping: (id: string, data: Partial<BranchMapping>) => Promise<void>;
  updateMapLocator: (id: string, data: Partial<MapLocator>) => Promise<void>;
  getClinicDetails: (clinicCode: string) => MapLocator | undefined;
}

// NOTE: Removed getFilteredData from interface - use filteredData directly from state

const computeStateData = (data: BranchMapping[]): StateData[] => {
  const stateMap = new Map<string, StateData & { clinicSet: Set<string> }>();

  data.forEach(item => {
    const state = item.state || 'Unknown';
    const existing = stateMap.get(state) || {
      state,
      clinics: 0,
      activeBase: 0,
      totalBase: 0,
      consultation: 0,
      clinicSet: new Set<string>(),
    };

    existing.clinicSet.add(item.clinicCode);
    existing.activeBase += item.activeBase || 0;
    existing.totalBase += item.totalBase || 0;
    existing.consultation += item.consultation || 0;

    stateMap.set(state, existing);
  });

  // Convert clinicSet size to clinics count
  return Array.from(stateMap.values())
    .map(({ clinicSet, ...rest }) => ({ ...rest, clinics: clinicSet.size }))
    .sort((a, b) => b.clinics - a.clinics);
};

const computeChannelData = (data: BranchMapping[]): ChannelData[] => {
  const channelMap = new Map<string, ChannelData & { clinicSet: Set<string> }>();

  data.forEach(item => {
    const channel = item.channelName || 'Unknown';
    const existing = channelMap.get(channel) || {
      channel,
      clinics: 0,
      activeBase: 0,
      totalBase: 0,
      consultation: 0,
      clinicSet: new Set<string>(),
    };

    existing.clinicSet.add(item.clinicCode);
    existing.activeBase += item.activeBase || 0;
    existing.totalBase += item.totalBase || 0;
    existing.consultation += item.consultation || 0;

    channelMap.set(channel, existing);
  });

  // Convert clinicSet size to clinics count
  return Array.from(channelMap.values())
    .map(({ clinicSet, ...rest }) => ({ ...rest, clinics: clinicSet.size }))
    .sort((a, b) => b.clinics - a.clinics);
};

const computeKPIData = (data: BranchMapping[], totalClinics: number): KPIData => {
  const uniqueStates = new Set(data.map(d => d.state));
  const uniqueChannels = new Set(data.map(d => d.channelName));

  return {
    totalClinics,  // Direct from Firestore document count
    totalActiveBase: data.reduce((sum, d) => sum + (d.activeBase || 0), 0),
    totalTotalBase: data.reduce((sum, d) => sum + (d.totalBase || 0), 0),
    totalConsultation: data.reduce((sum, d) => sum + (d.consultation || 0), 0),
    totalStates: uniqueStates.size,
    totalChannels: uniqueChannels.size,
  };
};

// Helper to safely convert to lowercase string
const safeString = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  return String(val).toLowerCase();
};

// Helper to parse comma-separated filter values
const parseFilterValues = (filter: string): string[] => {
  if (!filter) return [];
  return filter.split(',').map(v => v.trim()).filter(Boolean);
};

// Helper to apply filters
const applyFilters = (
  data: BranchMapping[],
  filters: { searchTerm: string; stateFilter: string; channelFilter: string; branchFilter: string; pinCodeFilter: string }
): BranchMapping[] => {
  let filtered = data;

  // Handle clinic code / search term (multi-select support)
  if (filters.searchTerm) {
    const terms = parseFilterValues(filters.searchTerm);
    if (terms.length > 0) {
      // If multiple specific clinic codes are selected, do exact matching
      filtered = filtered.filter(row => {
        const clinicCode = String(row.clinicCode || '');
        return terms.some(term => clinicCode === term || clinicCode.toLowerCase().includes(term.toLowerCase()));
      });
    }
  }

  // Handle state filter (multi-select support)
  if (filters.stateFilter) {
    const states = parseFilterValues(filters.stateFilter);
    if (states.length > 0) {
      filtered = filtered.filter(row => states.includes(String(row.state || '')));
    }
  }

  // Handle channel filter (multi-select support)
  if (filters.channelFilter) {
    const channels = parseFilterValues(filters.channelFilter);
    if (channels.length > 0) {
      filtered = filtered.filter(row => channels.includes(String(row.channelName || '')));
    }
  }

  // Handle branch filter (multi-select support)
  if (filters.branchFilter) {
    const branches = parseFilterValues(filters.branchFilter);
    if (branches.length > 0) {
      filtered = filtered.filter(row => branches.includes(String(row.branchName || '')));
    }
  }

  // Handle pin code filter (multi-select support)
  if (filters.pinCodeFilter) {
    const pinCodes = parseFilterValues(filters.pinCodeFilter);
    if (pinCodes.length > 0) {
      filtered = filtered.filter(row => pinCodes.includes(String(row.pinCode || '')));
    }
  }

  return filtered;
};

// Helper to recompute filtered data and aggregates
const recomputeFiltered = (
  branchMappings: BranchMapping[],
  filters: { searchTerm: string; stateFilter: string; channelFilter: string; branchFilter: string; pinCodeFilter: string }
) => {
  const filtered = applyFilters(branchMappings, filters);
  const uniqueClinics = new Set(filtered.map(d => d.clinicCode)).size;

  return {
    filteredData: filtered,
    stateData: computeStateData(filtered),
    channelData: computeChannelData(filtered),
    kpiData: computeKPIData(filtered, uniqueClinics),
  };
};

export const useDataStore = create<DataStore>((set, get) => ({
  branchMappings: [],
  filteredData: [],
  mapLocators: [],
  isLoading: true,
  error: null,
  searchTerm: '',
  stateFilter: '',
  channelFilter: '',
  branchFilter: '',
  pinCodeFilter: '',
  stateData: [],
  channelData: [],
  kpiData: {
    totalClinics: 0,
    totalActiveBase: 0,
    totalTotalBase: 0,
    totalConsultation: 0,
    totalStates: 0,
    totalChannels: 0,
  },
  allStates: [],
  allChannels: [],
  allBranches: [],
  allPinCodes: [],

  // Extra filter options (from mapLocator)
  allClinicTypes: [],
  allRegions: [],
  allTlNames: [],
  allNurseNames: [],
  allDcNames: [],
  allStatuses: [],
  allNurseTypes: [],

  fetchData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch branchMapping collection (new nested structure)
      // Document ID = clinicCode, contains pinCode, state, entries[]
      const branchMappingSnapshot = await getDocs(collection(db, 'branchMapping'));

      // Flatten the nested structure for table display
      const branchMappings: BranchMapping[] = [];

      branchMappingSnapshot.docs.forEach(docSnapshot => {
        const clinicCode = docSnapshot.id;
        const data = docSnapshot.data() as ClinicDocument;

        // Flatten each entry into a BranchMapping row
        if (data.entries && Array.isArray(data.entries)) {
          data.entries.forEach((entry: BranchEntry, index: number) => {
            branchMappings.push({
              id: `${clinicCode}_${index}`,
              clinicCode,
              pinCode: data.pinCode || '',
              state: data.state || '',
              channelName: entry.channelName || '',
              branchName: entry.branchName || '',
              activeBase: entry.activeBase || 0,
              totalBase: entry.totalBase || 0,
              consultation: entry.consultation || 0,
            });
          });
        }
      });

      // Fetch mapLocator collection
      const mapLocatorSnapshot = await getDocs(collection(db, 'mapLocator'));
      const mapLocators: MapLocator[] = mapLocatorSnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as MapLocator));

      // Extract unique filter options from all data
      const allStates = [...new Set(branchMappings.map(d => d.state).filter(Boolean))].sort();
      const allChannels = [...new Set(branchMappings.map(d => d.channelName).filter(Boolean))].sort();
      const allBranches = [...new Set(branchMappings.map(d => d.branchName).filter(Boolean))].sort();
      const allPinCodes = [...new Set(branchMappings.map(d => d.pinCode).filter(Boolean))].sort();

      // Extract unique extra filter options from mapLocator
      const allClinicTypes = [...new Set(mapLocators.map(d => d.clinicType).filter(Boolean))].sort();
      const allRegions = [...new Set(mapLocators.map(d => d.region).filter(Boolean))].sort();
      const allTlNames = [...new Set(mapLocators.map(d => d.tlName).filter(Boolean))].sort();
      const allNurseNames = [...new Set(mapLocators.map(d => d.nurseName).filter(Boolean))].sort();
      const allDcNames = [...new Set(mapLocators.map(d => d.dcName).filter(Boolean))].sort();
      const allStatuses = [...new Set(mapLocators.map(d => d.status).filter(Boolean))].sort();
      const allNurseTypes = [...new Set(mapLocators.map(d => d.nurseType).filter(Boolean))].sort();

      // Compute aggregated data from all data initially
      const stateData = computeStateData(branchMappings);
      const channelData = computeChannelData(branchMappings);
      const kpiData = computeKPIData(branchMappings, branchMappingSnapshot.docs.length);

      set({
        branchMappings,
        filteredData: branchMappings, // Initially all data
        mapLocators,
        stateData,
        channelData,
        kpiData,
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
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSearchTerm: (term) => {
    const { branchMappings, stateFilter, channelFilter, branchFilter, pinCodeFilter } = get();
    const filters = { searchTerm: term, stateFilter, channelFilter, branchFilter, pinCodeFilter };
    set({ searchTerm: term, ...recomputeFiltered(branchMappings, filters) });
  },

  setStateFilter: (state) => {
    const { branchMappings, searchTerm, channelFilter, branchFilter, pinCodeFilter } = get();
    const filters = { searchTerm, stateFilter: state, channelFilter, branchFilter, pinCodeFilter };
    set({ stateFilter: state, ...recomputeFiltered(branchMappings, filters) });
  },

  setChannelFilter: (channel) => {
    const { branchMappings, searchTerm, stateFilter, branchFilter, pinCodeFilter } = get();
    const filters = { searchTerm, stateFilter, channelFilter: channel, branchFilter, pinCodeFilter };
    set({ channelFilter: channel, ...recomputeFiltered(branchMappings, filters) });
  },

  setBranchFilter: (branch) => {
    const { branchMappings, searchTerm, stateFilter, channelFilter, pinCodeFilter } = get();
    const filters = { searchTerm, stateFilter, channelFilter, branchFilter: branch, pinCodeFilter };
    set({ branchFilter: branch, ...recomputeFiltered(branchMappings, filters) });
  },

  setPinCodeFilter: (pinCode) => {
    const { branchMappings, searchTerm, stateFilter, channelFilter, branchFilter } = get();
    const filters = { searchTerm, stateFilter, channelFilter, branchFilter, pinCodeFilter: pinCode };
    set({ pinCodeFilter: pinCode, ...recomputeFiltered(branchMappings, filters) });
  },

  clearAllFilters: () => {
    const { branchMappings } = get();
    const uniqueClinics = new Set(branchMappings.map(d => d.clinicCode)).size;
    set({
      searchTerm: '',
      stateFilter: '',
      channelFilter: '',
      branchFilter: '',
      pinCodeFilter: '',
      filteredData: branchMappings,
      stateData: computeStateData(branchMappings),
      channelData: computeChannelData(branchMappings),
      kpiData: computeKPIData(branchMappings, uniqueClinics),
    });
  },

  updateBranchMapping: async (id, data) => {
    try {
      // ID format: clinicCode_entryIndex
      const [clinicCode, indexStr] = id.split('_');
      const entryIndex = parseInt(indexStr, 10);

      // Get current document
      const docRef = doc(db, 'branchMapping', clinicCode);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Document ${clinicCode} not found`);
      }

      const currentData = docSnap.data() as ClinicDocument;
      const entries = [...currentData.entries];

      // Update the specific entry
      entries[entryIndex] = {
        ...entries[entryIndex],
        channelName: data.channelName ?? entries[entryIndex].channelName,
        branchName: data.branchName ?? entries[entryIndex].branchName,
        activeBase: data.activeBase ?? entries[entryIndex].activeBase,
        totalBase: data.totalBase ?? entries[entryIndex].totalBase,
        consultation: data.consultation ?? entries[entryIndex].consultation,
      };

      // Update Firestore
      await updateDoc(docRef, {
        pinCode: data.pinCode ?? currentData.pinCode,
        state: data.state ?? currentData.state,
        entries,
      });

      // Update local state
      const { branchMappings, searchTerm, stateFilter, channelFilter, branchFilter, pinCodeFilter } = get();
      const updated = branchMappings.map(item =>
        item.id === id ? { ...item, ...data } : item
      );

      const filters = { searchTerm, stateFilter, channelFilter, branchFilter, pinCodeFilter };
      set({
        branchMappings: updated,
        ...recomputeFiltered(updated, filters),
      });
    } catch (error) {
      console.error('Error updating branchMapping:', error);
      throw error;
    }
  },

  updateMapLocator: async (id, data) => {
    try {
      const docRef = doc(db, 'mapLocator', id);
      await updateDoc(docRef, data);

      // Update local state
      const { mapLocators } = get();
      const updated = mapLocators.map(item =>
        item.id === id ? { ...item, ...data } : item
      );

      set({ mapLocators: updated });
    } catch (error) {
      console.error('Error updating mapLocator:', error);
      throw error;
    }
  },

  getClinicDetails: (clinicCode) => {
    const { mapLocators } = get();
    return mapLocators.find(loc => loc.clinicCode === clinicCode);
  },
}));
