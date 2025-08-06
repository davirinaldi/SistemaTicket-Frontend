import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateBrasilia } from '../utils/dateUtils';
import { 
  Home, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar
} from 'lucide-react';
import Header from '../components/Header';
import './AgentDashboard.css';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    finalizados: 0,
    emAndamento: 0,
    aguardando: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Escutar eventos de tickets finalizados
  useEffect(() => {
    const handleTicketFinalized = () => {
      // Recarregar dados do dashboard quando um ticket for finalizado
      loadDashboardData();
    };

    window.addEventListener('ticketFinalized', handleTicketFinalized);

    return () => {
      window.removeEventListener('ticketFinalized', handleTicketFinalized);
    };
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getByAgent(user.id);
      const ticketsData = response.data || [];
      setTickets(ticketsData);
      
      // Calcular estatísticas
      const statsData = {
        total: ticketsData.length,
        finalizados: ticketsData.filter(t => t.status === 'Finalizado').length,
        emAndamento: ticketsData.filter(t => t.status === 'Em Andamento').length,
        aguardando: ticketsData.filter(t => t.status === 'Aguardando Implantação').length
      };
      setStats(statsData);

      // Gerar dados mensais (últimos 12 meses)
      generateMonthlyData(ticketsData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (ticketsData) => {
    const months = [];
    
    // Gerar dados de 2025 até 2026 (24 meses)
    for (let year = 2025; year <= 2026; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthName = date.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric'
        });
        
        // Contar tickets finalizados no mês
        const ticketsFinalizados = ticketsData.filter(ticket => {
          if (ticket.status !== 'Finalizado' || !ticket.updated_at) return false;
          
          const ticketDate = new Date(ticket.updated_at);
          return ticketDate.getMonth() === month && 
                 ticketDate.getFullYear() === year;
        }).length;

        months.push({
          mes: monthName,
          implantacoes: ticketsFinalizados
        });
        
      }
    }
    
    setMonthlyData(months);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="agent-dashboard">
      <Header />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-title">
            <Home size={24} />
            <h1>Dashboard - {user?.name}</h1>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Total de Tickets</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-content">
              <h3>Finalizados</h3>
              <p className="stat-number">{stats.finalizados}</p>
            </div>
          </div>

          <div className="stat-card in-progress">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Em Andamento</h3>
              <p className="stat-number">{stats.emAndamento}</p>
            </div>
          </div>

          <div className="stat-card waiting">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>Aguardando</h3>
              <p className="stat-number">{stats.aguardando}</p>
            </div>
          </div>
        </div>

        {/* Gráfico de Implantações por Mês */}
        <div className="chart-section">
          <div className="chart-header">
            <h2>Lojas Implantadas por Mês</h2>
            <p>2025 - 2026</p>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Implantações']}
                  labelStyle={{ color: '#333' }}
                />
                <Legend />
                <Bar 
                  dataKey="implantacoes" 
                  fill="#4f46e5" 
                  name="Lojas Implantadas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumo dos Tickets Recentes */}
        {tickets.length > 0 && (
          <div className="recent-tickets">
            <h2>Tickets Recentes</h2>
            <div className="tickets-preview">
              {tickets.slice(0, 5).map(ticket => (
                <div key={ticket.id} className="ticket-preview-card">
                  <div className="ticket-preview-info">
                    <h4>{ticket.title}</h4>
                    <p>Sistema: {ticket.sistema || 'N/A'}</p>
                  </div>
                  <div className="ticket-preview-status">
                    <span className={`status-indicator ${
                      ticket.status === 'Finalizado' ? 'completed' :
                      ticket.status === 'Em Andamento' ? 'in-progress' : 'waiting'
                    }`}>
                      {ticket.status}
                    </span>
                    <small>{formatDateBrasilia(ticket.updated_at)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;