import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AgentDashboard from './pages/AgentDashboard';
import AgentBoard from './components/AgentBoard';
import AdminDashboard from './pages/AdminDashboard';
import AgentManagement from './pages/AgentManagement';
import TicketManagement from './pages/TicketManagement';
import './App.css';

const AppRoutes = () => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  // console.log('AppRoutes estado:', { isAuthenticated, isAdmin: isAdmin(), loading, user });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: '16px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to={isAdmin() ? "/admin/dashboard" : "/dashboard"} replace />} 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/agents" 
        element={
          <ProtectedRoute requireAdmin>
            <AgentManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/tickets" 
        element={
          <ProtectedRoute requireAdmin>
            <TicketManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/agenda" 
        element={
          <ProtectedRoute>
            <AgentBoard />
          </ProtectedRoute>
        } 
      />
      
      
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? (isAdmin() ? "/admin/dashboard" : "/dashboard") : "/login"} replace />} 
      />
      
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
