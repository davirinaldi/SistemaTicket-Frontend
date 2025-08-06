import { useState, useEffect } from 'react';
import { adminAPI, ticketsAPI } from '../services/api';
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
  X,
  Edit3,
  Save,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Header from '../components/Header';
import { formatDateBrasilia, formatDateOnlyBrasilia } from '../utils/dateUtils';
import { 
  createChecklistForTicket, 
  validateChecklist, 
  isLegacyChecklist, 
  migrateLegacyChecklist 
} from '../config/checklistCategories';
import AttachmentUpload from '../components/AttachmentUpload';
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
  
  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Estados do checklist
  const [checklist, setChecklist] = useState({});
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [checklistMessage, setChecklistMessage] = useState(null);
  
  // Estados dos anexos
  const [attachments, setAttachments] = useState({});

  // Filtros únicos baseados nos dados
  const [availableLabels, setAvailableLabels] = useState([]);
  const [availableSystems, setAvailableSystems] = useState([]);
  const [availableStatuses] = useState(['Aguardando Implantação', 'Em Andamento', 'Finalizado']);

  useEffect(() => {
    loadData();
  }, [currentPage, selectedAgent, searchTerm, selectedStatus, selectedLabel, selectedSystem]);

  useEffect(() => {
    // Carregar valores únicos para filtros de todos os tickets
    const loadFilterValues = async () => {
      try {
        const response = await adminAPI.getFilterValues();
        const labels = response.data.data?.labels || [];
        const sistemas = response.data.data?.sistemas || [];
        
        setAvailableLabels(labels);
        setAvailableSystems(sistemas);
      } catch (error) {
        console.error('Erro ao carregar valores de filtros:', error);
      }
    };

    loadFilterValues();
  }, []); // Executa apenas uma vez ao montar o componente

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 10
      };
      
      if (selectedAgent) params.agente_id = selectedAgent;
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedLabel) params.label = selectedLabel;
      if (selectedSystem) params.sistema = selectedSystem;
      
      
      const [ticketsResponse, agentsResponse] = await Promise.all([
        adminAPI.getAllTickets(params),
        adminAPI.getAgents()
      ]);
      
      setTickets(ticketsResponse.data.tickets || []);
      setPagination(ticketsResponse.data.pagination || pagination);
      setAgents(agentsResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Todos os filtros agora são aplicados no backend
  const filteredTickets = tickets;

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
    setCurrentPage(1);
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    
    // Inicializar checklist
    let currentChecklist = {};
    let needsAutoSave = false;
    
    if (ticket.checklist) {
      try {
        const parsedChecklist = typeof ticket.checklist === 'string' ? 
          JSON.parse(ticket.checklist) : ticket.checklist;
        
        // Verifica se é checklist no formato antigo
        if (isLegacyChecklist(parsedChecklist)) {
          currentChecklist = migrateLegacyChecklist(parsedChecklist, ticket);
          needsAutoSave = true;
          
          setChecklistMessage({
            type: 'success',
            text: 'Checklist atualizado para o novo formato automaticamente!'
          });
        } else if (validateChecklist(parsedChecklist)) {
          currentChecklist = parsedChecklist;
        } else {
          currentChecklist = createChecklistForTicket(ticket);
          needsAutoSave = true;
        }
      } catch (e) {
        console.error('Erro ao parsear checklist existente:', e);
        currentChecklist = createChecklistForTicket(ticket);
        needsAutoSave = true;
      }
    } else {
      currentChecklist = createChecklistForTicket(ticket);
      needsAutoSave = true;
    }
    
    setChecklist(currentChecklist);
    
    // Carregar anexos do checklist
    const checklistAttachments = currentChecklist.attachments || {};
    setAttachments(checklistAttachments);
    
    // Expande todas as categorias por padrão (excluindo attachments)
    const expanded = {};
    Object.keys(currentChecklist).forEach(categoryId => {
      if (categoryId !== 'attachments') {
        expanded[categoryId] = true;
      }
    });
    setExpandedCategories(expanded);
    
    setEditingChecklist(false);
    
    // Auto-salva o checklist migrado/criado
    if (needsAutoSave) {
      autoSaveChecklist(ticket.id, currentChecklist);
    }
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
    setChecklist({});
    setEditingChecklist(false);
    setExpandedCategories({});
    setChecklistMessage(null);
    setAttachments({});
  };

  // Funções do checklist
  const startEditingChecklist = () => {
    setEditingChecklist(true);
  };

  const cancelEditingChecklist = () => {
    let originalChecklist = {};
    if (selectedTicket.checklist) {
      try {
        originalChecklist = typeof selectedTicket.checklist === 'string' ? 
          JSON.parse(selectedTicket.checklist) : selectedTicket.checklist;
      } catch (e) {
        originalChecklist = createChecklistForTicket(selectedTicket);
      }
    } else {
      originalChecklist = createChecklistForTicket(selectedTicket);
    }
    setChecklist(originalChecklist);
    setEditingChecklist(false);
  };

  const saveChecklist = async () => {
    try {
      const response = await ticketsAPI.updateChecklist(selectedTicket.id, checklist);
      
      // Atualizar ticket na lista
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, checklist: JSON.stringify(checklist) } : t
      ));
      
      // Atualizar ticket selecionado
      setSelectedTicket(prev => ({ ...prev, checklist: JSON.stringify(checklist) }));
      
      setEditingChecklist(false);
      setChecklistMessage({
        type: 'success',
        text: 'Checklist atualizado com sucesso!'
      });
    } catch (error) {
      
      setChecklistMessage({
        type: 'error',
        text: 'Erro ao salvar checklist: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const autoSaveChecklist = async (ticketId, checklistToSave) => {
    try {
      await ticketsAPI.updateChecklist(ticketId, checklistToSave);
      
      // Atualizar ticket na lista silenciosamente
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, checklist: JSON.stringify(checklistToSave) } : t
      ));
    } catch (error) {
    }
  };

  const updateChecklistItem = (categoryId, itemId, field, value) => {
    setChecklist(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        items: prev[categoryId].items.map(item => 
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const hideChecklistMessage = () => {
    setChecklistMessage(null);
  };

  // Funções dos anexos
  const handleAttachmentUpload = (newAttachment) => {
    const updatedAttachments = {
      ...attachments,
      [newAttachment.id]: newAttachment
    };
    
    const updatedChecklist = {
      ...checklist,
      attachments: updatedAttachments
    };
    
    // Atualizar estados locais
    setAttachments(updatedAttachments);
    setChecklist(updatedChecklist);
    
    // Atualizar ticket na lista
    setTickets(prevTickets => 
      prevTickets.map(t => {
        if (t.id === selectedTicket.id) {
          return { ...t, checklist: JSON.stringify(updatedChecklist) };
        }
        return t;
      })
    );
    
    // Atualizar ticket selecionado
    setSelectedTicket(prev => ({ ...prev, checklist: JSON.stringify(updatedChecklist) }));
  };

  const handleAttachmentDelete = (attachmentId) => {
    const updatedAttachments = { ...attachments };
    delete updatedAttachments[attachmentId];
    
    const updatedChecklist = { ...checklist };
    if (updatedChecklist.attachments) {
      delete updatedChecklist.attachments[attachmentId];
    }
    
    // Atualizar estados locais
    setAttachments(updatedAttachments);
    setChecklist(updatedChecklist);
    
    // Atualizar ticket na lista
    setTickets(prevTickets => 
      prevTickets.map(t => {
        if (t.id === selectedTicket.id) {
          return { ...t, checklist: JSON.stringify(updatedChecklist) };
        }
        return t;
      })
    );
    
    // Atualizar ticket selecionado
    setSelectedTicket(prev => ({ ...prev, checklist: JSON.stringify(updatedChecklist) }));
  };

  // Função para obter resumo do checklist para exibir na tabela
  const getChecklistSummary = (ticket) => {
    if (!ticket.checklist) return { total: 0, completed: 0 };
    
    try {
      const parsedChecklist = typeof ticket.checklist === 'string' ? 
        JSON.parse(ticket.checklist) : ticket.checklist;
      
      let total = 0;
      let completed = 0;
      
      if (isLegacyChecklist(parsedChecklist)) {
        if (Array.isArray(parsedChecklist)) {
          total = parsedChecklist.length;
          completed = parsedChecklist.filter(item => item.completed).length;
        }
      } else {
        Object.values(parsedChecklist).forEach(category => {
          if (category.items && Array.isArray(category.items)) {
            category.items.forEach(item => {
              if (!item.isText) {
                total++;
                if (item.completed) completed++;
              }
            });
          }
        });
      }
      
      return { total, completed };
    } catch (e) {
      return { total: 0, completed: 0 };
    }
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
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalItems)} de {pagination.totalItems} tickets
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
                <div className="header-cell">Checklist</div>
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
                    
                    <div className="table-cell checklist">
                      {(() => {
                        const summary = getChecklistSummary(ticket);
                        return (
                          <div className="checklist-summary">
                            <CheckSquare size={14} />
                            <span>{summary.completed}/{summary.total}</span>
                            <div className="mini-progress-bar">
                              <div 
                                className="mini-progress-fill" 
                                style={{
                                  width: summary.total > 0 
                                    ? `${(summary.completed / summary.total) * 100}%` 
                                    : '0%'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()} 
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
          
          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-button"
              >
                Primeira
              </button>
              
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-button"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              
              <div className="pagination-info">
                <span>Página {pagination.page} de {pagination.totalPages}</span>
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="pagination-button"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="pagination-button"
              >
                Última
              </button>
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

              {/* Seção do Checklist */}
              <div className="ticket-detail-section">
                <div className="checklist-header">
                  <h3>Checklist</h3>
                  {!editingChecklist ? (
                    <button
                      onClick={startEditingChecklist}
                      className="edit-button"
                    >
                      <Edit3 size={16} />
                      Editar
                    </button>
                  ) : (
                    <div className="checklist-actions">
                      <button
                        onClick={saveChecklist}
                        className="save-button"
                      >
                        <Save size={16} />
                        Salvar
                      </button>
                      <button
                        onClick={cancelEditingChecklist}
                        className="cancel-button"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {checklistMessage && (
                  <div className={`checklist-message ${checklistMessage.type}`}>
                    {checklistMessage.type === 'success' ? <CheckSquare size={16} /> : <AlertCircle size={16} />}
                    <span>{checklistMessage.text}</span>
                    <button onClick={hideChecklistMessage} className="message-close">×</button>
                  </div>
                )}

                <div className="checklist-content">
                  {Object.keys(checklist).length === 0 ? (
                    <p className="no-checklist">Nenhum checklist disponível para este ticket</p>
                  ) : (
                    Object.entries(checklist)
                      .filter(([categoryId]) => categoryId !== 'attachments')
                      .map(([categoryId, category]) => (
                      <div key={categoryId} className="checklist-category">
                        <div 
                          className="category-header"
                          onClick={() => toggleCategory(categoryId)}
                        >
                          <h4>{category.name}</h4>
                          {expandedCategories[categoryId] ? 
                            <ChevronUp size={16} /> : 
                            <ChevronDown size={16} />
                          }
                        </div>
                        
                        {expandedCategories[categoryId] && (
                          <div className="category-items">
                            {category.items.map((item) => (
                              <div key={item.id} className="checklist-item">
                                <div className="item-content">
                                  {!item.isText ? (
                                    // Checkbox normal
                                    <label className="checkbox-label">
                                      <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={(e) => updateChecklistItem(categoryId, item.id, 'completed', e.target.checked)}
                                        disabled={!editingChecklist}
                                      />
                                      <span className={item.completed ? 'completed' : ''}>
                                        {item.text}
                                      </span>
                                    </label>
                                  ) : (
                                    // Campo de texto
                                    <div className="text-item">
                                      <label className="text-label">
                                        {item.text}
                                      </label>
                                      {editingChecklist ? (
                                        <input
                                          type="text"
                                          value={item.textValue || ''}
                                          onChange={(e) => updateChecklistItem(categoryId, item.id, 'textValue', e.target.value)}
                                          placeholder="Digite aqui..."
                                          className="text-input"
                                        />
                                      ) : (
                                        <div className="text-display">
                                          {item.textValue || 'Não preenchido'}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Seção de Anexos */}
              <AttachmentUpload
                ticketId={selectedTicket.id}
                attachments={attachments}
                onUploadSuccess={handleAttachmentUpload}
                onDeleteSuccess={handleAttachmentDelete}
                disabled={false}
              />

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;