import { useState, useEffect } from 'react';
import { adminAPI, syncAPI } from '../services/api';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Wrench
} from 'lucide-react';
import Header from '../components/Header';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardResponse, agentsResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAgents()
      ]);
      
      setDashboardData(dashboardResponse.data);
      setAgents(agentsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSync = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    
    try {
      const response = await syncAPI.run();
      setSyncResult(response.data);
      
      // Recarregar dados após sincronização
      if (response.data.success) {
        await loadDashboardData();
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: error.response?.data?.error || 'Erro na sincronização'
      });
    } finally {
      setSyncLoading(false);
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

  const { summary, agentStats, systemStats, labelStats, statusStats } = dashboardData || {};

  // Função para obter o nome do agente pelo ID
  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === parseInt(agentId));
    return agent ? agent.name : `Agente ${agentId}`;
  };

  return (
    <div className="admin-dashboard">
      <Header />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard Administrativo</h1>
          <button 
            onClick={handleSync} 
            disabled={syncLoading}
            className="sync-button"
          >
            <RefreshCw size={18} className={syncLoading ? 'spinning' : ''} />
            {syncLoading ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        {syncResult && (
          <div className={`sync-result ${syncResult.success ? 'success' : 'error'}`}>
            {syncResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{syncResult.message}</span>
            {syncResult.processed > 0 && (
              <span className="processed-count">
                {syncResult.processed} cartões processados
              </span>
            )}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon tickets">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3>Total de Tickets</h3>
              <p className="stat-number">{summary?.totalTickets || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon agents">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Agentes Ativos</h3>
              <p className="stat-number">{summary?.activeAgents || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Em Andamento</h3>
              <p className="stat-number">{statusStats?.['Em Andamento'] || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon done">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Finalizados</h3>
              <p className="stat-number">{statusStats?.['Finalizado'] || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon waiting">
              <Wrench size={24} />
            </div>
            <div className="stat-content">
              <h3>Aguardando Implantação</h3>
              <p className="stat-number">{statusStats?.['Aguardando Implantação'] || 0}</p>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Tickets por Agente</h3>
            <div className="chart-content">
              {agents && agents.length > 0 ? (
                <div className="bar-chart">
                  {(() => {
                    // Criar estatísticas completas incluindo agentes sem tickets
                    const completeAgentStats = {};
                    
                    // Incluir todos os agentes ativos
                    agents.filter(agent => agent.is_active && agent.role === 'agent').forEach(agent => {
                      completeAgentStats[agent.id] = agentStats?.[agent.id] || 0;
                    });
                    
                    // Incluir agentes que têm tickets mas podem estar inativos
                    if (agentStats) {
                      Object.keys(agentStats).forEach(agentId => {
                        if (!completeAgentStats[agentId]) {
                          completeAgentStats[agentId] = agentStats[agentId];
                        }
                      });
                    }
                    
                    const maxCount = Math.max(...Object.values(completeAgentStats), 1);
                    
                    return Object.entries(completeAgentStats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([agentId, count]) => (
                        <div key={agentId} className="bar-item">
                          <span className="bar-label">{getAgentName(agentId)}</span>
                          <div className="bar-container">
                            <div 
                              className="bar" 
                              style={{ 
                                width: `${(count / maxCount) * 100}%` 
                              }}
                            />
                            <span className="bar-value">{count}</span>
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              ) : (
                <p className="no-data">Nenhum agente disponível</p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Tickets por Sistema</h3>
            <div className="chart-content">
              {systemStats && Object.keys(systemStats).length > 0 ? (
                <div className="bar-chart">
                  {Object.entries(systemStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([system, count]) => (
                    <div key={system} className="bar-item">
                      <span className="bar-label">{system}</span>
                      <div className="bar-container">
                        <div 
                          className="bar" 
                          style={{ 
                            width: `${(count / Math.max(...Object.values(systemStats))) * 100}%` 
                          }}
                        />
                        <span className="bar-value">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">Nenhum dado disponível</p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Tickets por Label</h3>
            <div className="chart-content">
              {labelStats && Object.keys(labelStats).length > 0 ? (
                <div className="bar-chart">
                  {Object.entries(labelStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([label, count]) => (
                    <div key={label} className="bar-item">
                      <span className="bar-label">{label}</span>
                      <div className="bar-container">
                        <div 
                          className="bar" 
                          style={{ 
                            width: `${(count / Math.max(...Object.values(labelStats))) * 100}%` 
                          }}
                        />
                        <span className="bar-value">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;