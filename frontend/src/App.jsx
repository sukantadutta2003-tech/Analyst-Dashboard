import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Datasets from './pages/Datasets';
import Analysis from './pages/Analysis';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/analysis/:id" element={<Analysis />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
