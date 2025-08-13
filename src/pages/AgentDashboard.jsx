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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth < 480);
  const [stats, setStats] = useState({
    total: 0,
    finalizados: 0,
    emAndamento: 0,
    aguardando: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'finalizado', 'andamento', 'aguardando'

  // Hook para detectar mudanças de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Função para filtrar tickets baseado no status selecionado
  const getFilteredTickets = () => {
    switch (activeFilter) {
      case 'finalizado':
        return tickets.filter(ticket => ticket.status === 'Finalizado');
      case 'andamento':
        return tickets.filter(ticket => ticket.status === 'Em Andamento');
      case 'aguardando':
        return tickets.filter(ticket => ticket.status === 'Aguardando Implantação');
      case 'all':
      default:
        return tickets;
    }
  };

  // Função para lidar com clique nos cards de estatísticas
  const handleStatCardClick = (filterType) => {
    setActiveFilter(filterType);
  };

  // Função para obter o título da seção baseado no filtro ativo
  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'finalizado':
        return 'Tickets Finalizados';
      case 'andamento':
        return 'Tickets Em Andamento';
      case 'aguardando':
        return 'Tickets Aguardando';
      case 'all':
      default:
        return 'Tickets Recentes';
    }
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
          <button 
            className={`stat-card total ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('all')}
            title="Clique para ver todos os tickets"
          >
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Total de Tickets</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </button>

          <button 
            className={`stat-card completed ${activeFilter === 'finalizado' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('finalizado')}
            title="Clique para ver apenas tickets finalizados"
          >
            <div className="stat-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-content">
              <h3>Finalizados</h3>
              <p className="stat-number">{stats.finalizados}</p>
            </div>
          </button>

          <button 
            className={`stat-card in-progress ${activeFilter === 'andamento' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('andamento')}
            title="Clique para ver apenas tickets em andamento"
          >
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Em Andamento</h3>
              <p className="stat-number">{stats.emAndamento}</p>
            </div>
          </button>

          <button 
            className={`stat-card waiting ${activeFilter === 'aguardando' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('aguardando')}
            title="Clique para ver apenas tickets aguardando"
          >
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>Aguardando</h3>
              <p className="stat-number">{stats.aguardando}</p>
            </div>
          </button>
        </div>

        {/* Gráfico de Implantações por Mês */}
        <div className="chart-section">
          <div className="chart-header">
            <h2>Lojas Implantadas por Mês</h2>
            <p>2025 - 2026</p>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyData} 
                margin={{ 
                  top: 20, 
                  right: isMobile ? 15 : 30, 
                  left: isMobile ? 15 : 20, 
                  bottom: 80 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: isMobile ? 9 : 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={isSmallMobile ? 3 : isMobile ? 2 : 1}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  allowDecimals={false}
                  width={isMobile ? 35 : 60}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Implantações']}
                  labelStyle={{ color: '#333', fontSize: '12px' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: isMobile ? '11px' : '12px',
                    padding: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: isMobile ? '11px' : '14px',
                    paddingTop: '10px'
                  }}
                />
                <Bar 
                  dataKey="implantacoes" 
                  fill="#4f46e5" 
                  name="Lojas Implantadas"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={isSmallMobile ? 20 : isMobile ? 30 : 50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumo dos Tickets Recentes */}
        {tickets.length > 0 && (
          <div className="recent-tickets">
            <div className="recent-tickets-header">
              <h2>{getFilterTitle()}</h2>
              {activeFilter !== 'all' && (
                <button 
                  className="clear-filter-btn"
                  onClick={() => handleStatCardClick('all')}
                  title="Ver todos os tickets"
                >
                  Ver Todos
                </button>
              )}
            </div>
            <div className="tickets-preview">
              {getFilteredTickets().length > 0 ? (
                getFilteredTickets().slice(0, 10).map(ticket => (
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
                ))
              ) : (
                <div className="no-tickets-filtered">
                  <p>Nenhum ticket encontrado para o filtro selecionado.</p>
                  <button 
                    className="show-all-btn"
                    onClick={() => handleStatCardClick('all')}
                  >
                    Ver Todos os Tickets
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;