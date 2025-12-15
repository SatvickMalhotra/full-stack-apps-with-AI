// Entry within a clinic (nested in Firestore)
export interface BranchEntry {
  channelName: string;
  branchName: string;
  activeBase: number;
  totalBase: number;
  consultation: number;
}

// Firestore document structure (clinicCode is document ID)
export interface ClinicDocument {
  pinCode: string;
  state: string;
  entries: BranchEntry[];
}

// Flattened structure for table display
export interface BranchMapping {
  id: string;
  channelName: string;
  branchName: string;
  clinicCode: string;
  pinCode: string;
  state: string;
  activeBase: number;
  totalBase: number;
  consultation: number;
}

export interface MapLocator {
  id: string;
  timestamp: string;
  email: string;
  clinicId: string;
  clinicCode: string;
  clinicAddress: string;
  clinicType: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  partnerName: string;
  region: string;
  state: string;
  agentName: string;
  tlName: string;
  nurseName: string;
  dcName: string;
  nurseNumber: string;
  dcNumber: string;
  status: string;
  nurseType: string;
}

export interface StateData {
  state: string;
  clinics: number;
  activeBase: number;
  totalBase: number;
  consultation: number;
}

export interface ChannelData {
  channel: string;
  clinics: number;
  activeBase: number;
  totalBase: number;
  consultation: number;
}

export interface KPIData {
  totalClinics: number;
  totalActiveBase: number;
  totalTotalBase: number;
  totalConsultation: number;
  totalStates: number;
  totalChannels: number;
}

export type ThemeName = 'normal' | 'retro' | 'batman' | 'flowers' | 'medical';

export interface Theme {
  name: ThemeName;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient1: string;
    gradient2: string;
    glowRgb: string;
  };
  chart: {
    colors: string[];
    backgroundColor: string;
    textColor: string;
    axisColor: string;
  };
}
