
import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-4 sm:p-6 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
};

export default App;
