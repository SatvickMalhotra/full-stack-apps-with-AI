import { useState } from 'react';
import { Building2, Users, Activity, Stethoscope, MapPin, GitBranch } from 'lucide-react';
import KpiCard from './KpiCard';
import KpiDetailModal from '../modals/KpiDetailModal';
import { useDataStore } from '../../stores/dataStore';
import { useThemeStore } from '../../stores/themeStore';
import { themes } from '../../themes';

type KpiType = 'clinics' | 'activeBase' | 'totalBase' | 'consultation' | 'states' | 'channels';

interface KpiDetail {
  title: string;
  data: { label: string; value: number }[];
}

export default function KpiGrid() {
  const { kpiData, stateData, channelData } = useDataStore();
  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];
  const colors = theme.chart.colors;

  const [selectedKpi, setSelectedKpi] = useState<KpiType | null>(null);

  const getKpiDetails = (type: KpiType): KpiDetail => {
    switch (type) {
      case 'clinics':
        return {
          title: 'Clinics by State',
          data: stateData.slice(0, 10).map(s => ({ label: s.state, value: s.clinics })),
        };
      case 'activeBase':
        return {
          title: 'Active Policies by State',
          data: stateData.slice(0, 10).map(s => ({ label: s.state, value: s.activeBase })),
        };
      case 'totalBase':
        return {
          title: 'Total Policies by State',
          data: stateData.slice(0, 10).map(s => ({ label: s.state, value: s.totalBase })),
        };
      case 'consultation':
        return {
          title: 'Consultations by State',
          data: stateData.slice(0, 10).map(s => ({ label: s.state, value: s.consultation })),
        };
      case 'states':
        return {
          title: 'Top States by Clinics',
          data: stateData.slice(0, 10).map(s => ({ label: s.state, value: s.clinics })),
        };
      case 'channels':
        return {
          title: 'Clinics by Channel',
          data: channelData.slice(0, 10).map(c => ({ label: c.channel, value: c.clinics })),
        };
      default:
        return { title: '', data: [] };
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <KpiCard
          title="Total Clinics"
          value={kpiData.totalClinics}
          icon={Building2}
          color={colors[0]}
          delay={0}
          onClick={() => setSelectedKpi('clinics')}
        />
        <KpiCard
          title="Active Policies"
          value={kpiData.totalActiveBase}
          icon={Users}
          color={colors[1]}
          delay={1}
          onClick={() => setSelectedKpi('activeBase')}
          format="compact"
        />
        <KpiCard
          title="Total Policies"
          value={kpiData.totalTotalBase}
          icon={Activity}
          color={colors[2]}
          delay={2}
          onClick={() => setSelectedKpi('totalBase')}
          format="compact"
        />
        <KpiCard
          title="Consultations"
          value={kpiData.totalConsultation}
          icon={Stethoscope}
          color={colors[3]}
          delay={3}
          onClick={() => setSelectedKpi('consultation')}
        />
        <KpiCard
          title="States"
          value={kpiData.totalStates}
          icon={MapPin}
          color={colors[4]}
          delay={4}
          onClick={() => setSelectedKpi('states')}
        />
        <KpiCard
          title="Channels"
          value={kpiData.totalChannels}
          icon={GitBranch}
          color={colors[5]}
          delay={5}
          onClick={() => setSelectedKpi('channels')}
        />
      </div>

      {selectedKpi && (
        <KpiDetailModal
          isOpen={!!selectedKpi}
          onClose={() => setSelectedKpi(null)}
          title={getKpiDetails(selectedKpi).title}
          data={getKpiDetails(selectedKpi).data}
        />
      )}
    </>
  );
}
