import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import SettingsModal from './components/SettingsModal';
import InfoPage from './components/InfoPage';

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'info'>('dashboard');

  const handleNavigateToInfo = () => {
    setIsSettingsOpen(false);
    setView('info');
  };

  return (
    <div className="min-h-screen">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onNavigateHome={() => setView('dashboard')}
      />
      <main className="p-4 sm:p-6 md:p-8">
        {view === 'dashboard' ? (
          <Dashboard />
        ) : (
          <InfoPage onBack={() => setView('dashboard')} />
        )}
      </main>
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)}
          onNavigateToInfo={handleNavigateToInfo} 
        />
      </Modal>
    </div>
  );
};

export default App;