import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'https://backend-amber-tau-14.vercel.app/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configurar axios interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verificar token ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setToken(savedToken);
            setUser(userData);
          } catch (error) {
            console.error('Erro ao parsear dados do usuário:', error);
            logout();
          }
        }
      } catch (error) {
        console.error('Erro no checkAuth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/agents/login`, {
        username,
        password
      });

      const { agent, token: authToken, permissions } = response.data;
      
      const userData = {
        ...agent,
        permissions
      };

      setUser(userData);
      setToken(authToken);
      
      localStorage.setItem('user', JSON.stringify(userData));
      if (authToken) {
        localStorage.setItem('token', authToken);
      }

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isAgent = () => {
    return user?.role === 'agent';
  };

  const canViewAllTickets = () => {
    return user?.permissions?.canViewAllTickets || false;
  };

  const canManageAgents = () => {
    return user?.permissions?.canManageAgents || false;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isAgent,
    canViewAllTickets,
    canManageAgents,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};