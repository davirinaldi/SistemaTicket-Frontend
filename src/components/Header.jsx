import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, Home, Users, FileText, Shield } from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [];

  if (isAdmin()) {
    navItems.push(
      {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: Home
      },
      {
        path: '/admin/tickets',
        label: 'Tickets',
        icon: FileText
      },
      {
        path: '/admin/agents',
        label: 'Agentes',
        icon: Users
      }
    );
  } else {
    navItems.push(
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: Home
      },
      {
        path: '/tickets',
        label: 'Meus Tickets',
        icon: FileText
      }
    );
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <FileText size={24} />
            <span>Sistema de Tickets</span>
          </div>
          
          <nav className="navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {isAdmin() ? <Shield size={16} /> : <User size={16} />}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">
                {isAdmin() ? 'Administrador' : 'Agente'}
              </span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;