import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAppSelector } from './store/hooks';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Landing from './pages/Landing';
import Results from './pages/Results';
import Standings from './pages/Standings';
import Layout from './components/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAppSelector((state) => state.auth);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, user } = useAppSelector((state) => state.auth);
    
    // If not logged in OR not an admin, show the Login page directly on the /admin route
    if (!token || user?.role !== 'ADMIN') {
        return <Login isAdminLogin={true} />;
    }
    
    return <Layout>{children}</Layout>;
};

function App() {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/theme');
        const theme = response.data.theme;
        const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
        if (themeLink) {
          themeLink.href = `/themes/${theme}/theme.css`;
        }
      } catch (error) {
        console.error('Error fetching theme', error);
      }
    };
    fetchTheme();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Route - Independent of PrivateRoute to prevent redirect */}
        <Route 
            path="/admin" 
            element={
                <AdminRoute>
                    <Admin />
                </AdminRoute>
            } 
        />

        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/picks" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;