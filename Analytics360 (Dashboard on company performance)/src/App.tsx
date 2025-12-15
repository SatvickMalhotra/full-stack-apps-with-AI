import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import LoadingScreen from './components/layout/LoadingScreen';
import KpiGrid from './components/kpi/KpiGrid';
import FilterPanel from './components/filters/FilterPanel';
import BarChart from './components/charts/BarChart';
import PieChart from './components/charts/PieChart';
import DataTable from './components/table/DataTable';
import MasterPortal from './components/master/MasterPortal';
import { useDataStore } from './stores/dataStore';
import { useThemeStore } from './stores/themeStore';

type TabType = 'dashboard' | 'master';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMasterAuthenticated, setIsMasterAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const { fetchData, stateData, channelData, filteredData, branchMappings, error } = useDataStore();
  const { setLoading, setTheme } = useThemeStore();

  const handleTabChange = (tab: TabType) => {
    if (tab === 'master' && !isMasterAuthenticated) {
      setShowPasswordModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === 'admin') {
      setIsMasterAuthenticated(true);
      setShowPasswordModal(false);
      setActiveTab('master');
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('mswasth-theme');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state?.currentTheme) {
        setTheme(parsed.state.currentTheme);
      }
    } else {
      setTheme('normal');
    }

    // Fetch data
    fetchData();

    // Hide loading after initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Prepare chart data
  const topStatesData = stateData.slice(0, 10).map(s => ({
    label: s.state,
    value: s.clinics,
  }));

  const channelDistributionData = channelData.slice(0, 8).map(c => ({
    label: c.channel,
    value: c.clinics,
  }));

  const activePoliciesByState = stateData.slice(0, 10).map(s => ({
    label: s.state,
    value: s.activeBase,
  }));

  const totalPoliciesByChannel = channelData.slice(0, 8).map(c => ({
    label: c.channel,
    value: c.totalBase,
  }));

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error Loading Data</h2>
          <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
          <button type="button" onClick={() => fetchData()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate results for main area display
  const totalClinics = new Set(branchMappings.map(d => d.clinicCode)).size;
  const filteredClinics = new Set(filteredData.map(d => d.clinicCode)).size;
  const totalRows = filteredData.length;

  return (
    <>
      <LoadingScreen />

      <div className="min-h-screen flex">
        {/* Sidebar Filter Panel - Only on Dashboard */}
        {activeTab === 'dashboard' && (
          <FilterPanel
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <div className="p-6 flex-1 overflow-auto">
            <Header activeTab={activeTab} onTabChange={handleTabChange} />

            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Results Summary - Main Area */}
                  <div className="glass-card px-4 py-3 mb-6 flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Showing <span className="font-semibold text-[var(--color-primary)]">{filteredClinics.toLocaleString()}</span> of{' '}
                      <span className="font-semibold">{totalClinics.toLocaleString()}</span> clinics
                      <span className="text-[var(--color-text-secondary)]/60 ml-2">({totalRows.toLocaleString()} rows)</span>
                    </span>
                  </div>

                  {/* KPI Cards */}
                  <KpiGrid />

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <BarChart
                      title="Clinics by State (Top 10)"
                      data={topStatesData}
                      horizontal
                    />
                    <PieChart
                      title="Clinics by Channel"
                      data={channelDistributionData}
                      donut
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <BarChart
                      title="Active Policies by State (Top 10)"
                      data={activePoliciesByState}
                    />
                    <PieChart
                      title="Total Policies by Channel"
                      data={totalPoliciesByChannel}
                    />
                  </div>

                  {/* Data Table */}
                  <DataTable />
                </motion.div>
              ) : (
                <motion.div
                  key="master"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MasterPortal />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Password Modal for Master Portal */}
      {showPasswordModal && (
        <div className="modal-backdrop flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-80"
          >
            <h3 className="text-lg font-semibold mb-4 gradient-text">Master Portal Access</h3>
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="input-field w-full mb-3"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-400 text-sm mb-3">Incorrect password</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                  setPasswordError(false);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                className="btn-primary flex-1"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default App;
