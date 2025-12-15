import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProjectDetail } from './components/project/ProjectDetail';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleProjectClick = (id: string) => {
    setSelectedProjectId(id);
    setActiveTab('project_detail');
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (activeTab === 'project_detail' && selectedProjectId) {
      return <ProjectDetail projectId={selectedProjectId} onBack={handleBackToDashboard} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onProjectClick={handleProjectClick} />;
      case 'projects':
        return <Dashboard onProjectClick={handleProjectClick} />; // Reusing dashboard for now
      case 'settings':
        return <div className="text-center mt-20 text-[var(--text-muted)]">Settings Panel Coming Soon</div>;
      default:
        return <Dashboard onProjectClick={handleProjectClick} />;
    }
  };

  return (
    <ThemeProvider>
      <DataProvider>
        <Layout activeTab={activeTab === 'project_detail' ? 'projects' : activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </Layout>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
