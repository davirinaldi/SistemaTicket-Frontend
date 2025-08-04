import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  FileText, 
  Filter, 
  Search, 
  RefreshCw, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  Eye,
  X
} from 'lucide-react';
import Header from '../components/Header';
import { formatDateBrasilia, formatDateOnlyBrasilia } from '../utils/dateUtils';
import './TicketManagement.css';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filtros únicos baseados nos dados
  const [availableLabels, setAvailableLabels] = useState([]);
  const [availableSystems, setAvailableSystems] = useState([]);
  const [availableStatuses] = useState(['Aguardando Implantação', 'Em Andamento', 'Finalizado']);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Extrair valores únicos para filtros
    const labels = new Set();
    const systems = new Set();

    tickets.forEach(ticket => {
      if (ticket.labels) {
        ticket.labels.forEach(label => labels.add(label));
      }
      if (ticket.sistema) {
        systems.add(ticket.sistema);
      }
    });

    setAvailableLabels([...labels].sort());
    setAvailableSystems([...systems].sort());
  }, [tickets]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsResponse, agentsResponse] = await Promise.all([
        adminAPI.getAllTickets(),
        adminAPI.getAgents()
      ]);
      
      setTickets(ticketsResponse.data.tickets || []);
      setAgents(agentsResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesAgent = !selectedAgent || ticket.agente_id?.toString() === selectedAgent;
    const matchesSearch = !searchTerm || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.agente?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLabel = !selectedLabel || ticket.labels?.includes(selectedLabel);
    const matchesSystem = !selectedSystem || ticket.sistema === selectedSystem;
    const matchesStatus = !selectedStatus || ticket.status === selectedStatus;

    return matchesAgent && matchesSearch && matchesLabel && matchesSystem && matchesStatus;
  });

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'N/A';
  };

  const clearFilters = () => {
    setSelectedAgent('');
    setSearchTerm('');
    setSelectedLabel('');
    setSelectedSystem('');
    setSelectedStatus('');
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Carregando tickets...</p>
      </div>
    );
  }

  return (
    <div className="ticket-management">
      <Header />
      
      <div className="management-content">
        <div className="management-header">
          <div className="header-title">
            <FileText size={24} />
            <h1>Gerenciamento de Tickets</h1>
          </div>
          <button 
            onClick={loadData} 
            className="refresh-button"
            title="Atualizar dados"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por título, ticket ou agente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <User size={16} />
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos os agentes</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Tag size={16} />
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas as labels</option>
                {availableLabels.map(label => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Filter size={16} />
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos os sistemas</option>
                {availableSystems.map(system => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Filter size={16} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos os status</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {(selectedAgent || searchTerm || selectedLabel || selectedSystem || selectedStatus) && (
              <button
                onClick={clearFilters}
                className="clear-filters-button"
                title="Limpar filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="results-summary">
            <span>
              Mostrando {filteredTickets.length} de {tickets.length} tickets
            </span>
          </div>
        </div>

        <div className="tickets-section">
          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>Nenhum ticket encontrado</p>
              <small>Tente ajustar os filtros ou aguarde a sincronização</small>
            </div>
          ) : (
            <div className="tickets-table">
              <div className="table-header">
                <div className="header-cell">Ticket</div>
                <div className="header-cell">Título</div>
                <div className="header-cell">Agente</div>
                <div className="header-cell">Sistema</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Labels</div>
                <div className="header-cell">Data</div>
                <div className="header-cell">Ações</div>
              </div>

              <div className="table-body">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="table-row">
                    <div className="table-cell ticket-id">
                      {ticket.ticket || 'N/A'}
                    </div>
                    
                    <div className="table-cell ticket-title">
                      <span title={ticket.title}>
                        {ticket.title.length > 50 
                          ? ticket.title.substring(0, 50) + '...' 
                          : ticket.title
                        }
                      </span>
                    </div>
                    
                    <div className="table-cell agent-name">
                      <div className="agent-info">
                        <User size={14} />
                        <span>{getAgentName(ticket.agente_id)}</span>
                      </div>
                    </div>
                    
                    <div className="table-cell system-name">
                      {ticket.sistema || 'N/A'}
                    </div>
                    
                    <div className="table-cell status">
                      <span className={`status-badge ${
                        ticket.status === 'Aguardando Implantação' ? 'status-waiting' :
                        ticket.status === 'Em Andamento' ? 'status-progress' :
                        ticket.status === 'Finalizado' ? 'status-done' : 'status-waiting'
                      }`}>
                        {ticket.status || 'Aguardando Implantação'}
                      </span>
                    </div>
                    
                    <div className="table-cell labels">
                      <div className="labels-container">
                        {ticket.labels?.slice(0, 2).map((label, index) => (
                          <span key={index} className="label-tag">
                            {label}
                          </span>
                        ))}
                        {ticket.labels?.length > 2 && (
                          <span className="label-more">
                            +{ticket.labels.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="table-cell date">
                      <Calendar size={14} />
                      <span>
                        {formatDateOnlyBrasilia(ticket.created_at)}
                      </span>
                    </div>
                    
                    <div className="table-cell actions">
                      <button
                        onClick={() => openTicketModal(ticket)}
                        className="action-button view"
                        title="Ver detalhes"
                      >
                        <Eye size={14} />
                      </button>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes do ticket */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeTicketModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Ticket</h2>
              <button
                onClick={closeTicketModal}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="ticket-detail-section">
                <h3>Informações Básicas</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>ID:</strong>
                    <span>{selectedTicket.ticket || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Título:</strong>
                    <span>{selectedTicket.title}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Agente:</strong>
                    <span>{getAgentName(selectedTicket.agente_id)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Sistema:</strong>
                    <span>{selectedTicket.sistema || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>FCIA:</strong>
                    <span>{selectedTicket.fcia || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedTicket.description && (
                <div className="ticket-detail-section">
                  <h3>Descrição</h3>
                  <p className="ticket-description">
                    {selectedTicket.description}
                  </p>
                </div>
              )}

              {selectedTicket.labels && selectedTicket.labels.length > 0 && (
                <div className="ticket-detail-section">
                  <h3>Labels</h3>
                  <div className="labels-list">
                    {selectedTicket.labels.map((label, index) => (
                      <span key={index} className="label-tag">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="ticket-detail-section">
                <h3>Datas</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Criado em:</strong>
                    <span>{formatDateBrasilia(selectedTicket.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Atualizado em:</strong>
                    <span>{formatDateBrasilia(selectedTicket.updated_at)}</span>
                  </div>
                  {selectedTicket.due_date && (
                    <div className="detail-item">
                      <strong>Data limite:</strong>
                      <span>{formatDateBrasilia(selectedTicket.due_date)}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;