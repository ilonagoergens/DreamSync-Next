import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VisionBoardPage from './pages/VisionBoardPage';
import EnergyCheckPage from './pages/EnergyCheckPage';
import ManifestationTrackerPage from './pages/ManifestationTrackerPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import { useAuthStore } from './lib/auth';
import { useAppStore } from './store';

if (import.meta.env.DEV) {
  window.useAppStore = useAppStore;
}

function App() {
  const { isAuthenticated, userId } = useAuthStore();
  const setUserId = useAppStore(state => state.setUserId); // ✅ Fix: `setUser` zu `setUserId`

  // ✅ Synchronisiere userId zwischen Auth-Store und App-Store
  useEffect(() => {
    if (isAuthenticated && userId) {
      setUserId(userId);
    } else {
      setUserId(null);
    }
  }, [isAuthenticated, userId, setUserId]);

  return (
    <Router>
      <Routes>
        {/* 🔹 Login-Route */}
        <Route path="/login" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} />
        
        {/* 🔹 Geschützte Routen nach Login */}
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<VisionBoardPage />} />
          <Route path="energy-check" element={<EnergyCheckPage />} />
          <Route path="manifestation-tracker" element={<ManifestationTrackerPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
        </Route>

        {/* 🔹 Fallback für nicht gefundene Seiten */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
