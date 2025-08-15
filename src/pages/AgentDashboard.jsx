import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI, servicesAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateBrasilia } from '../utils/dateUtils';
import { 
  Home, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar,
  FileText,
  Wrench,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Header from '../components/Header';
import './AgentDashboard.css';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth < 480);
  const [viewMode, setViewMode] = useState('tickets'); // 'tickets', 'services'
  const [stats, setStats] = useState({
    total: 0,
    finalizados: 0,
    emAndamento: 0,
    aguardando: 0
  });
  const [serviceStats, setServiceStats] = useState({
    total: 0,
    pendentes: 0,
    emAndamento: 0,
    finalizados: 0,
    cancelados: 0
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

  // useEffect separado para atualizar gráfico quando viewMode mudar
  useEffect(() => {
    if (tickets.length > 0 || services.length > 0) {
      if (viewMode === 'tickets') {
        generateMonthlyData(tickets);
      } else {
        generateMonthlyServiceData(services);
      }
    }
  }, [viewMode, tickets, services]);

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
      
      // Carregar tickets
      const ticketsResponse = await ticketsAPI.getByAgent(user.id);
      const ticketsData = ticketsResponse.data || [];
      setTickets(ticketsData);
      
      // Carregar serviços
      let servicesData = [];
      try {
        const servicesResponse = await servicesAPI.getMyServices();
        servicesData = servicesResponse.data || [];
      } catch (serviceError) {
        console.warn('Erro ao carregar serviços:', serviceError);
        // Se não conseguir carregar serviços, continua apenas com tickets
      }
      setServices(servicesData);
      
      // Calcular estatísticas de tickets
      const statsData = {
        total: ticketsData.length,
        finalizados: ticketsData.filter(t => t.status === 'Finalizado').length,
        emAndamento: ticketsData.filter(t => t.status === 'Em Andamento').length,
        aguardando: ticketsData.filter(t => t.status === 'Aguardando Implantação').length
      };
      console.log('Stats calculadas:', statsData);
      console.log('Tickets data:', ticketsData);
      setStats(statsData);

      // Calcular estatísticas de serviços
      const serviceStatsData = {
        total: servicesData.length,
        pendentes: servicesData.filter(s => s.status === 'Pendente').length,
        emAndamento: servicesData.filter(s => s.status === 'Em Andamento').length,
        finalizados: servicesData.filter(s => s.status === 'Finalizado').length,
        cancelados: servicesData.filter(s => s.status === 'Cancelado').length
      };
      setServiceStats(serviceStatsData);

      // Gerar dados mensais baseado no modo atual (sempre gerar para tickets inicialmente)
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

  const generateMonthlyServiceData = (servicesData) => {
    const months = [];
    
    // Gerar dados de 2025 até 2026 (24 meses)
    for (let year = 2025; year <= 2026; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthName = date.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric'
        });
        
        // Contar serviços finalizados no mês
        const servicosFinalizados = servicesData.filter(service => {
          if (service.status !== 'Finalizado' || !service.updated_at) return false;
          
          const serviceDate = new Date(service.updated_at);
          return serviceDate.getMonth() === month && 
                 serviceDate.getFullYear() === year;
        }).length;

        months.push({
          mes: monthName,
          implantacoes: servicosFinalizados
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

  // Função para filtrar serviços baseado no status selecionado
  const getFilteredServices = () => {
    switch (activeFilter) {
      case 'finalizado':
        return services.filter(service => service.status === 'Finalizado');
      case 'andamento':
        return services.filter(service => service.status === 'Em Andamento');
      case 'aguardando':
        return services.filter(service => service.status === 'Pendente');
      case 'cancelado':
        return services.filter(service => service.status === 'Cancelado');
      case 'all':
      default:
        return services;
    }
  };

  // Função para lidar com clique nos cards de estatísticas
  const handleStatCardClick = (filterType) => {
    setActiveFilter(filterType);
  };

  // Função para alternar entre tickets e serviços
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setActiveFilter('all'); // Reset filter when changing mode
  };

  // Função para obter o título da seção baseado no filtro ativo
  const getFilterTitle = () => {
    const isServices = viewMode === 'services';
    
    switch (activeFilter) {
      case 'finalizado':
        return isServices ? 'Serviços Finalizados' : 'Tickets Finalizados';
      case 'andamento':
        return isServices ? 'Serviços Em Andamento' : 'Tickets Em Andamento';
      case 'aguardando':
        return isServices ? 'Serviços Pendentes' : 'Tickets Aguardando';
      case 'cancelado':
        return 'Serviços Cancelados';
      case 'all':
      default:
        return isServices ? 'Serviços Recentes' : 'Tickets Recentes';
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
          
          {/* Botão para alternar entre Tickets e Serviços */}
          <div className="view-mode-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'tickets' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('tickets')}
            >
              <FileText size={18} />
              Tickets
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'services' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('services')}
            >
              <Wrench size={18} />
              Serviços
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-cards">
          {viewMode === 'tickets' ? (
            <>
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
            </>
          ) : (
            <>
              <button 
                className={`stat-card total ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleStatCardClick('all')}
                title="Clique para ver todos os serviços"
              >
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>Total de Serviços</h3>
                  <p className="stat-number">{serviceStats.total}</p>
                </div>
              </button>

              <button 
                className={`stat-card waiting ${activeFilter === 'aguardando' ? 'active' : ''}`}
                onClick={() => handleStatCardClick('aguardando')}
                title="Clique para ver apenas serviços pendentes"
              >
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <h3>Pendentes</h3>
                  <p className="stat-number">{serviceStats.pendentes}</p>
                </div>
              </button>

              <button 
                className={`stat-card in-progress ${activeFilter === 'andamento' ? 'active' : ''}`}
                onClick={() => handleStatCardClick('andamento')}
                title="Clique para ver apenas serviços em andamento"
              >
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <h3>Em Andamento</h3>
                  <p className="stat-number">{serviceStats.emAndamento}</p>
                </div>
              </button>

              <button 
                className={`stat-card completed ${activeFilter === 'finalizado' ? 'active' : ''}`}
                onClick={() => handleStatCardClick('finalizado')}
                title="Clique para ver apenas serviços finalizados"
              >
                <div className="stat-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div className="stat-content">
                  <h3>Finalizados</h3>
                  <p className="stat-number">{serviceStats.finalizados}</p>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Gráfico de Implantações por Mês */}
        <div className="chart-section">
          <div className="chart-header">
            <h2>{viewMode === 'tickets' ? 'Lojas Implantadas por Mês' : 'Serviços Finalizados por Mês'}</h2>
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

        {/* Resumo dos Tickets/Serviços Recentes */}
        {((viewMode === 'tickets' && tickets.length > 0) || (viewMode === 'services' && services.length > 0)) && (
          <div className="recent-tickets">
            <div className="recent-tickets-header">
              <h2>{getFilterTitle()}</h2>
              {activeFilter !== 'all' && (
                <button 
                  className="clear-filter-btn"
                  onClick={() => handleStatCardClick('all')}
                  title={`Ver todos os ${viewMode === 'tickets' ? 'tickets' : 'serviços'}`}
                >
                  Ver Todos
                </button>
              )}
            </div>
            <div className="tickets-preview">
              {viewMode === 'tickets' ? (
                getFilteredTickets().length > 0 ? (
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
                )
              ) : (
                getFilteredServices().length > 0 ? (
                  getFilteredServices().slice(0, 10).map(service => (
                    <div key={service.id} className="ticket-preview-card">
                      <div className="ticket-preview-info">
                        <h4>{service.client_name}</h4>
                        <p>{service.service_description}</p>
                      </div>
                      <div className="ticket-preview-status">
                        <span className={`status-indicator ${
                          service.status === 'Finalizado' ? 'completed' :
                          service.status === 'Em Andamento' ? 'in-progress' :
                          service.status === 'Cancelado' ? 'cancelled' : 'waiting'
                        }`}>
                          {service.status}
                        </span>
                        <small>{formatDateBrasilia(service.updated_at)}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-tickets-filtered">
                    <p>Nenhum serviço encontrado para o filtro selecionado.</p>
                    <button 
                      className="show-all-btn"
                      onClick={() => handleStatCardClick('all')}
                    >
                      Ver Todos os Serviços
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;