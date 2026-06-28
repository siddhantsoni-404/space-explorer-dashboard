import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Rocket, Image as ImageIcon, Camera, Globe, Heart } from 'lucide-react';

// Pages placeholder
import Dashboard from './pages/Dashboard';
import ApodExplorer from './pages/ApodExplorer';
import MarsExplorer from './pages/MarsExplorer';
import NeoExplorer from './pages/NeoExplorer';
import Favorites from './pages/Favorites';

const queryClient = new QueryClient();

function Navbar() {
  return (
    <nav className="bg-[#1e293b] border-b border-gray-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2 text-indigo-400">
          <Rocket size={24} /> Space Explorer
        </Link>
        <div className="flex gap-6">
          <Link to="/apod" className="flex items-center gap-1 hover:text-indigo-400 transition-colors"><ImageIcon size={18} /> APOD</Link>
          <Link to="/mars" className="flex items-center gap-1 hover:text-red-400 transition-colors"><Camera size={18} /> Mars</Link>
          <Link to="/neo" className="flex items-center gap-1 hover:text-emerald-400 transition-colors"><Globe size={18} /> NEO</Link>
          <Link to="/favorites" className="flex items-center gap-1 hover:text-pink-500 transition-colors"><Heart size={18} /> Favorites</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/apod" element={<ApodExplorer />} />
              <Route path="/mars" element={<MarsExplorer />} />
              <Route path="/neo" element={<NeoExplorer />} />
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
