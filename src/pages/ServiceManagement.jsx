import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Header from '../components/Header';
import './ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit, view
  const [selectedService, setSelectedService] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Estados para autocomplete de agentes
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [filteredAgents, setFilteredAgents] = useState([]);

  // Status disponíveis
  const statusOptions = [
    { value: 'Pendente', label: 'Pendente', color: '#f59e0b' },
    { value: 'Em Andamento', label: 'Em Andamento', color: '#3b82f6' },
    { value: 'Finalizado', label: 'Finalizado', color: '#10b981' },
    { value: 'Cancelado', label: 'Cancelado', color: '#ef4444' }
  ];

  // Form state
  const [formData, setFormData] = useState({
    agent_id: '',
    client_name: '',
    service_description: '',
    opened_date: '',
    visit_date: '',
    phone: '',
    email: '',
    whatsapp: '',
    status: 'Pendente',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, selectedAgent, selectedStatus]);

  // Debounce para pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filtrar agentes baseado na pesquisa
  useEffect(() => {
    if (Array.isArray(agents) && agents.length > 0) {
      const activeAgents = agents.filter(agent => agent.role === 'agent' && agent.is_active);
      
      if (agentSearchTerm) {
        const filtered = activeAgents.filter(agent => 
          agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase())
        );
        setFilteredAgents(filtered);
      } else {
        setFilteredAgents(activeAgents);
      }
    } else {
      setFilteredAgents([]);
    }
  }, [agents, agentSearchTerm]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAgentDropdown && !event.target.closest('.autocomplete-container')) {
        setShowAgentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAgentDropdown]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 10
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedAgent) params.agent_id = selectedAgent;
      if (selectedStatus) params.status = selectedStatus;

      // Carregar apenas agentes e serviços (estatísticas causam problemas)
      const [agentsResponse, servicesResponse] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllServices(params)
      ]);
      
      
      setAgents(agentsResponse.data?.users || []);
      setServices(servicesResponse.data?.services || []);
      setTotalPages(servicesResponse.data?.pagination?.totalPages || 1);
      setStats(null);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error.response?.data || error.message);
      
      // Definir valores padrão em caso de erro
      setServices([]);
      setAgents([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'agent') {
      setSelectedAgent(value);
    } else if (type === 'status') {
      setSelectedStatus(value);
    }
    setCurrentPage(1);
  };

  // Funções para autocomplete de agentes
  const handleAgentSearch = (term) => {
    setAgentSearchTerm(term);
    setShowAgentDropdown(term.length > 0);
  };

  const selectAgent = (agent) => {
    setFormData({...formData, agent_id: agent.id});
    setAgentSearchTerm(agent.name);
    setShowAgentDropdown(false);
  };

  const clearAgentSelection = () => {
    setFormData({...formData, agent_id: ''});
    setAgentSearchTerm('');
    setShowAgentDropdown(false);
  };

  const getSelectedAgentName = () => {
    if (formData.agent_id && Array.isArray(agents)) {
      const agent = agents.find(a => a.id === parseInt(formData.agent_id));
      return agent ? agent.name : '';
    }
    return '';
  };

  const openModal = (type, service = null) => {
    setModalType(type);
    setSelectedService(service);
    
    if (type === 'create') {
      setFormData({
        agent_id: '',
        client_name: '',
        service_description: '',
        opened_date: new Date().toISOString().split('T')[0],
        visit_date: '',
        phone: '',
        email: '',
        whatsapp: '',
        status: 'Pendente',
        notes: ''
      });
      setAgentSearchTerm('');
    } else if (service) {
      setFormData({
        agent_id: service.agent_id || '',
        client_name: service.client_name,
        service_description: service.service_description,
        opened_date: service.opened_date,
        visit_date: service.visit_date || '',
        phone: service.phone || '',
        email: service.email || '',
        whatsapp: service.whatsapp || '',
        status: service.status || 'Pendente',
        notes: service.notes || ''
      });
      // Definir o nome do agente para o autocomplete
      setAgentSearchTerm(service.agent ? service.agent.name : '');
    }
    
    setShowAgentDropdown(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setAgentSearchTerm('');
    setShowAgentDropdown(false);
    setFormData({
      agent_id: '',
      client_name: '',
      service_description: '',
      opened_date: '',
      visit_date: '',
      phone: '',
      email: '',
      whatsapp: '',
      status: 'Pendente',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await adminAPI.createService(formData);
      } else if (modalType === 'edit') {
        await adminAPI.updateService(selectedService.id, formData);
      }
      
      closeModal();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error.response?.data || error.message);
      alert('Erro ao salvar serviço: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (service) => {
    if (window.confirm(`Deseja realmente deletar o serviço ${service.control_id}?`)) {
      try {
        await adminAPI.deleteService(service.id);
        loadData();
      } catch (error) {
        console.error('Erro ao deletar serviço:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pendente': return <Clock size={16} />;
      case 'Em Andamento': return <AlertCircle size={16} />;
      case 'Finalizado': return <CheckCircle size={16} />;
      case 'Cancelado': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || '#f59e0b';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="service-management">
      <Header />
      
      <div className="service-content">
        <div className="service-header">
          <h1>Gerenciamento de Serviços</h1>
          <button 
            onClick={() => openModal('create')} 
            className="create-service-button"
          >
            <Plus size={18} />
            Novo Serviço
          </button>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon total">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <h3>Total de Serviços</h3>
                <p className="stat-number">{stats.totalServices}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon month">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <h3>Este Mês</h3>
                <p className="stat-number">{stats.servicesThisMonth}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon visits">
                <User size={24} />
              </div>
              <div className="stat-content">
                <h3>Visitas Agendadas</h3>
                <p className="stat-number">{stats.scheduledVisits}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon today">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <h3>Visitas Hoje</h3>
                <p className="stat-number">{stats.visitsToday}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente, descrição, telefone..."
              value={searchInput}
              onChange={handleSearch}
            />
          </div>

          <div className="filters">
            <select 
              value={selectedAgent} 
              onChange={(e) => handleFilterChange('agent', e.target.value)}
            >
              <option value="">Todos os agentes</option>
              {Array.isArray(agents) && agents.filter(agent => agent.role === 'agent' && agent.is_active).map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos os status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Serviços */}
        <div className="services-section">
          {services.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>Nenhum serviço encontrado</p>
              <small>Tente ajustar os filtros ou criar um novo serviço</small>
            </div>
          ) : (
            <div className="services-table">
              <div className="table-header">
                <div className="header-cell">Cliente</div>
                <div className="header-cell">Descrição</div>
                <div className="header-cell">Agente</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Data Abertura</div>
                <div className="header-cell">Data Visita</div>
                <div className="header-cell">Contato</div>
                <div className="header-cell">Ações</div>
              </div>

              <div className="table-body">
                {services.map((service) => (
                  <div key={service.id} className="table-row">
                    <div className="table-cell client-name">
                      <span title={service.client_name}>
                        {service.client_name.length > 30 
                          ? service.client_name.substring(0, 30) + '...' 
                          : service.client_name
                        }
                      </span>
                    </div>
                    
                    <div className="table-cell service-description">
                      <span title={service.service_description}>
                        {service.service_description.length > 40 
                          ? service.service_description.substring(0, 40) + '...' 
                          : service.service_description
                        }
                      </span>
                    </div>
                    
                    <div className="table-cell agent-name">
                      <div className="agent-info">
                        <User size={14} />
                        <span>{service.agent ? service.agent.name : 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="table-cell status">
                      <span className={`status-badge ${
                        service.status === 'Pendente' ? 'status-waiting' :
                        service.status === 'Em Andamento' ? 'status-progress' :
                        service.status === 'Finalizado' ? 'status-done' :
                        service.status === 'Cancelado' ? 'status-cancelled' : 'status-waiting'
                      }`}>
                        {service.status || 'Pendente'}
                      </span>
                    </div>
                    
                    <div className="table-cell date">
                      <Calendar size={14} />
                      <span>{formatDate(service.opened_date)}</span>
                    </div>
                    
                    <div className="table-cell date">
                      {service.visit_date ? (
                        <>
                          <Clock size={14} />
                          <span>{formatDate(service.visit_date)}</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    
                    <div className="table-cell contact">
                      <div className="contact-info">
                        {service.phone && (
                          <div className="contact-item" title={service.phone}>
                            <Phone size={12} />
                          </div>
                        )}
                        {service.email && (
                          <div className="contact-item" title={service.email}>
                            <Mail size={12} />
                          </div>
                        )}
                        {service.whatsapp && (
                          <div className="contact-item" title={service.whatsapp}>
                            <MessageCircle size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="table-cell actions">
                      <button
                        onClick={() => openModal('view', service)}
                        className="action-button view"
                        title="Ver detalhes"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openModal('edit', service)}
                        className="action-button edit"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="action-button delete"
                        title="Deletar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal service-modal">
            <div className="modal-header">
              <h3>
                {modalType === 'create' && 'Novo Serviço'}
                {modalType === 'edit' && 'Editar Serviço'}
                {modalType === 'view' && 'Visualizar Serviço'}
              </h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>

            <div className="modal-body">
              {modalType === 'view' ? (
                <div className="service-view">
                  <div className="view-header">
                    <h2>{selectedService?.client_name}</h2>
                    <div 
                      className="status-badge large"
                      style={{ backgroundColor: getStatusColor(selectedService?.status) }}
                    >
                      {getStatusIcon(selectedService?.status)}
                      {selectedService?.status}
                    </div>
                  </div>
                  
                  <div className="view-details">
                    <div className="detail-group">
                      <label>ID de Controle:</label>
                      <span>{selectedService?.control_id}</span>
                    </div>
                    
                    <div className="detail-group">
                      <label>Descrição do Serviço:</label>
                      <div className="service-description-display">
                        {selectedService?.service_description}
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-group">
                        <label>Data de Abertura:</label>
                        <span>{formatDate(selectedService?.opened_date)}</span>
                      </div>
                      
                      <div className="detail-group">
                        <label>Data da Visita:</label>
                        <span>{selectedService?.visit_date ? formatDate(selectedService.visit_date) : 'Não agendada'}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-group">
                        <label>Telefone:</label>
                        <span>{selectedService?.phone || 'Não informado'}</span>
                      </div>
                      
                      <div className="detail-group">
                        <label>Email:</label>
                        <span>{selectedService?.email || 'Não informado'}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-group">
                        <label>WhatsApp:</label>
                        <span>{selectedService?.whatsapp || 'Não informado'}</span>
                      </div>
                      
                      <div className="detail-group">
                        <label>Agente Responsável:</label>
                        <span>{selectedService?.agent?.name || 'Não atribuído'}</span>
                      </div>
                    </div>
                    
                    <div className="detail-group">
                      <label>Observações:</label>
                      <div className="service-description-display">
                        {selectedService?.notes || 'Nenhuma observação'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cliente *</label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Agente Responsável</label>
                      <div className="autocomplete-container">
                        <input
                          type="text"
                          placeholder="Digite para buscar agente..."
                          value={agentSearchTerm}
                          onChange={(e) => handleAgentSearch(e.target.value)}
                          onFocus={() => setShowAgentDropdown(agentSearchTerm.length > 0)}
                        />
                        {formData.agent_id && (
                          <button 
                            type="button" 
                            className="clear-agent-button"
                            onClick={clearAgentSelection}
                            title="Remover agente selecionado"
                          >
                            ×
                          </button>
                        )}
                        {showAgentDropdown && filteredAgents.length > 0 && (
                          <div className="agent-dropdown">
                            {filteredAgents.slice(0, 10).map(agent => (
                              <div
                                key={agent.id}
                                className="agent-option"
                                onClick={() => selectAgent(agent)}
                              >
                                <div className="agent-name">{agent.name}</div>
                                <div className="agent-info">
                                  {agent.email && (
                                    <span className="agent-email">{agent.email}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {showAgentDropdown && filteredAgents.length === 0 && agentSearchTerm && (
                          <div className="agent-dropdown">
                            <div className="no-agents">
                              Nenhum agente encontrado
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descrição do Serviço *</label>
                    <textarea
                      value={formData.service_description}
                      onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                      required
                      rows={4}
                      className="service-description-textarea"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Data de Abertura *</label>
                      <input
                        type="date"
                        value={formData.opened_date}
                        onChange={(e) => setFormData({...formData, opened_date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Data da Visita</label>
                      <input
                        type="date"
                        value={formData.visit_date}
                        onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>WhatsApp</label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Observações</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      placeholder="Observações adicionais sobre o serviço..."
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit">
                      {modalType === 'create' ? 'Criar Serviço' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;