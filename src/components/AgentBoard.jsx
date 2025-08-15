import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI, servicesAPI } from '../services/api';
import { formatDateOnlyBrasilia } from '../utils/dateUtils';
import { 
  createChecklistForTicket, 
  validateChecklist, 
  isLegacyChecklist, 
  migrateLegacyChecklist 
} from '../config/checklistCategories';
import { 
  Clock, 
  Play, 
  CheckCircle2, 
  Edit, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Filter,
  Wrench,
  FileText
} from 'lucide-react';
import Header from './Header';
import AttachmentUpload from './AttachmentUpload';
import './AgentBoard.css';

const AgentBoard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('both'); // 'tickets', 'services', 'both'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [message, setMessage] = useState(null);
  const [attachments, setAttachments] = useState({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar tickets e serviços em paralelo
      const [ticketsResponse, servicesResponse] = await Promise.all([
        ticketsAPI.getByAgent(user.id),
        servicesAPI.getMyServices()
      ]);
      
      setTickets(ticketsResponse.data || []);
      setServices(servicesResponse.data || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao carregar dados: ' + (error.response?.data?.error || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const moveTicket = async (ticketId, newStatus) => {
    try {
      await ticketsAPI.updateStatus(ticketId, newStatus);
      
      // Atualiza o status na lista (incluindo finalizados)
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
      
      if (newStatus === 'Finalizado') {
        setMessage({
          type: 'success',
          text: 'Ticket finalizado com sucesso!'
        });
        
        // Sinalizar atualização para o dashboard
        window.dispatchEvent(new CustomEvent('ticketFinalized', { 
          detail: { ticketId, timestamp: new Date().toISOString() } 
        }));
      } else {
        setMessage({
          type: 'success',
          text: `Ticket movido para "${newStatus}"`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao mover ticket: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const updateService = async (serviceId, newStatus, notes = null) => {
    try {
      const updateData = { status: newStatus };
      if (notes !== null) updateData.notes = notes;
      
      await servicesAPI.updateService(serviceId, updateData);
      
      // Atualiza o serviço na lista
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, ...updateData } : s
      ));
      
      setMessage({
        type: 'success',
        text: `Serviço atualizado para "${newStatus}"`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao atualizar serviço: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    
    let currentChecklist = {};
    let needsAutoSave = false;
    
    if (ticket.checklist) {
      try {
        const parsedChecklist = typeof ticket.checklist === 'string' ? 
          JSON.parse(ticket.checklist) : ticket.checklist;
        
        // Verifica se é checklist no formato antigo
        if (isLegacyChecklist(parsedChecklist)) {
          currentChecklist = migrateLegacyChecklist(parsedChecklist, ticket);
          needsAutoSave = true; // Marca para salvar automaticamente
          
          setMessage({
            type: 'success',
            text: 'Checklist atualizado para o novo formato automaticamente!'
          });
        } else if (validateChecklist(parsedChecklist)) {
          // Checklist já está no formato novo
          currentChecklist = parsedChecklist;
        } else {
          // Checklist inválido, criar novo
          currentChecklist = createChecklistForTicket(ticket);
          needsAutoSave = true;
        }
      } catch (e) {
        console.error('Erro ao parsear checklist existente:', e);
        currentChecklist = createChecklistForTicket(ticket);
        needsAutoSave = true;
      }
    } else {
      // Sem checklist, cria novo baseado nas labels do ticket
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
    setEditingChecklist(false);
    setChecklist({});
    setExpandedCategories({});
    setAttachments({});
  };

  const openServiceModal = (service) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  // useEffect para detectar ESC nos modais
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (selectedTicket) {
          closeTicketModal();
        } else if (selectedService) {
          closeServiceModal();
        }
      }
    };

    if (selectedTicket || selectedService) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTicket, selectedService]);

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
      await ticketsAPI.updateChecklist(selectedTicket.id, checklist);
      
      // Atualizar o ticket na lista
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, checklist: JSON.stringify(checklist) } : t
      ));
      
      // Atualizar o ticket selecionado
      setSelectedTicket(prev => ({ ...prev, checklist: JSON.stringify(checklist) }));
      
      setEditingChecklist(false);
      setMessage({
        type: 'success',
        text: 'Checklist atualizado com sucesso!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao salvar checklist: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const autoSaveChecklist = async (ticketId, checklistToSave) => {
    try {
      await ticketsAPI.updateChecklist(ticketId, checklistToSave);
      
      // Atualizar o ticket na lista silenciosamente
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, checklist: JSON.stringify(checklistToSave) } : t
      ));
    } catch (error) {
      // Não mostra erro para o usuário no auto-save, apenas falha silenciosamente
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Aguardando Implantação':
        return <Clock size={16} />;
      case 'Em Andamento':
        return <Play size={16} />;
      case 'Finalizado':
        return <CheckCircle2 size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aguardando Implantação':
        return 'status-waiting';
      case 'Em Andamento':
        return 'status-progress';
      case 'Finalizado':
        return 'status-done';
      default:
        return 'status-waiting';
    }
  };

  const hideMessage = () => {
    setMessage(null);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  const ticketsByStatus = {
    'Aguardando Implantação': tickets.filter(t => t.status === 'Aguardando Implantação'),
    'Em Andamento': tickets.filter(t => t.status === 'Em Andamento'),
    'Finalizado': tickets.filter(t => t.status === 'Finalizado'),
  };

  const servicesByStatus = {
    'Pendente': services.filter(s => s.status === 'Pendente'),
    'Em Andamento': services.filter(s => s.status === 'Em Andamento'),
    'Finalizado': services.filter(s => s.status === 'Finalizado'),
  };

  const shouldShowTickets = viewMode === 'tickets' || viewMode === 'both';
  const shouldShowServices = viewMode === 'services' || viewMode === 'both';

  return (
    <div className="agent-board">
      <Header />
      
      <div className="board-content">
        <div className="board-header">
          <h1>Minha Área</h1>
          <div className="view-controls">
            <div className="view-mode-selector">
              <button 
                className={`mode-button ${viewMode === 'tickets' ? 'active' : ''}`}
                onClick={() => setViewMode('tickets')}
                title="Apenas Tickets"
              >
                <FileText size={16} />
                Tickets ({tickets.length})
              </button>
              <button 
                className={`mode-button ${viewMode === 'services' ? 'active' : ''}`}
                onClick={() => setViewMode('services')}
                title="Apenas Serviços"
              >
                <Wrench size={16} />
                Serviços ({services.length})
              </button>
              <button 
                className={`mode-button ${viewMode === 'both' ? 'active' : ''}`}
                onClick={() => setViewMode('both')}
                title="Tickets e Serviços"
              >
                <Filter size={16} />
                Ambos
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
            <button onClick={hideMessage} className="message-close">×</button>
          </div>
        )}

        <div className="board-columns">
          {['Aguardando Implantação', 'Em Andamento', 'Finalizado'].map((status) => {
            // Obter items para esta coluna baseado no modo de visualização
            const statusTickets = shouldShowTickets ? ticketsByStatus[status] || [] : [];
            const serviceStatus = status === 'Aguardando Implantação' ? 'Pendente' : status;
            const statusServices = shouldShowServices ? servicesByStatus[serviceStatus] || [] : [];
            const totalItems = statusTickets.length + statusServices.length;
            
            // Sempre mostrar todas as colunas, independente do filtro
            // Para manter consistência visual
            
            return (
              <div key={status} className={`board-column ${getStatusColor(status)}`}>
                <div className="column-header">
                  {getStatusIcon(status)}
                  <h2>
                    {status === 'Aguardando Implantação' && shouldShowServices && shouldShowTickets
                      ? 'Aguardando/Pendente'
                      : status === 'Aguardando Implantação' && shouldShowServices 
                      ? 'Pendente'
                      : status
                    }
                  </h2>
                  <span className="ticket-count">{totalItems}</span>
                </div>

                <div className="column-content">
                  {/* Tickets */}
                  {shouldShowTickets && statusTickets.map((ticket) => (
                    <div key={`ticket-${ticket.id}`} className="ticket-card">
                      <div className="card-type-badge tickets">
                        <FileText size={12} />
                        Ticket
                      </div>
                      
                      <div className="ticket-header">
                        <div className="ticket-id">
                          {ticket.ticket || `#${ticket.id}`}
                        </div>
                        <button
                          onClick={() => openTicketModal(ticket)}
                          className="ticket-action view"
                          title="Ver detalhes"
                        >
                          <Edit size={14} />
                        </button>
                      </div>

                      <h3 className="ticket-title">{ticket.title}</h3>

                      {ticket.sistema && (
                        <div className="ticket-system">
                          <Tag size={12} />
                          <span>{ticket.sistema}</span>
                        </div>
                      )}

                      <div className="ticket-date">
                        <Calendar size={12} />
                        <span>{formatDateOnlyBrasilia(ticket.created_at)}</span>
                      </div>

                      <div className="ticket-actions">
                        {status === 'Aguardando Implantação' && (
                          <button
                            onClick={() => moveTicket(ticket.id, 'Em Andamento')}
                            className="action-button start"
                          >
                            <Play size={14} />
                            Iniciar
                          </button>
                        )}
                        
                        {status === 'Em Andamento' && (
                          <>
                            <button
                              onClick={() => moveTicket(ticket.id, 'Aguardando Implantação')}
                              className="action-button back"
                            >
                              <Clock size={14} />
                              Voltar
                            </button>
                            <button
                              onClick={() => moveTicket(ticket.id, 'Finalizado')}
                              className="action-button finish"
                            >
                              <CheckCircle2 size={14} />
                              Finalizar
                            </button>
                          </>
                        )}
                        
                        {status === 'Finalizado' && (
                          <div className="finalized-ticket">
                            <CheckCircle2 size={14} />
                            <span>Concluído</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Serviços */}
                  {shouldShowServices && statusServices.map((service) => (
                    <div key={`service-${service.id}`} className="ticket-card service-card">
                      <div className="card-type-badge services">
                        <Wrench size={12} />
                        Serviço
                      </div>
                      
                      <div className="ticket-header">
                        <div className="ticket-id">
                          {service.control_id}
                        </div>
                        <button
                          onClick={() => openServiceModal(service)}
                          className="ticket-action view"
                          title="Ver detalhes"
                        >
                          <Edit size={14} />
                        </button>
                      </div>

                      <h3 className="ticket-title">{service.client_name}</h3>
                      <p className="service-description">{service.service_description}</p>

                      <div className="ticket-date">
                        <Calendar size={12} />
                        <span>{(() => {
                          if (!service.opened_date) return '-';
                          // Para datas YYYY-MM-DD, força interpretação local
                          if (typeof service.opened_date === 'string' && service.opened_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = service.opened_date.split('-');
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('pt-BR');
                          }
                          return new Date(service.opened_date).toLocaleDateString('pt-BR');
                        })()}</span>
                      </div>

                      <div className="ticket-actions">
                        {serviceStatus === 'Pendente' && (
                          <button
                            onClick={() => updateService(service.id, 'Em Andamento')}
                            className="action-button start"
                          >
                            <Play size={14} />
                            Iniciar
                          </button>
                        )}
                        
                        {serviceStatus === 'Em Andamento' && (
                          <>
                            <button
                              onClick={() => updateService(service.id, 'Pendente')}
                              className="action-button back"
                            >
                              <Clock size={14} />
                              Voltar
                            </button>
                            <button
                              onClick={() => updateService(service.id, 'Finalizado')}
                              className="action-button finish"
                            >
                              <CheckCircle2 size={14} />
                              Finalizar
                            </button>
                          </>
                        )}
                        
                        {serviceStatus === 'Finalizado' && (
                          <div className="finalized-ticket">
                            <CheckCircle2 size={14} />
                            <span>Concluído</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Mensagem quando vazio */}
                  {totalItems === 0 && (
                    <div className="empty-column">
                      <p>Nenhum item neste status</p>
                    </div>
                  )}
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      </div>

      {/* Modal de detalhes do ticket */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detalhes do Ticket</h2>
              <button onClick={closeTicketModal} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="ticket-detail-section">
                <h3>Informações Básicas</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>ID:</strong>
                    <span>{selectedTicket.ticket || `#${selectedTicket.id}`}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Título:</strong>
                    <span>{selectedTicket.title}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Sistema:</strong>
                    <span>{selectedTicket.sistema || 'N/A'}</span>
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

              <div className="ticket-detail-section">
                <div className="checklist-header">
                  <h3>Checklist</h3>
                  {!editingChecklist ? (
                    <button
                      onClick={startEditingChecklist}
                      className="edit-button"
                    >
                      <Edit size={16} />
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
                                        <textarea
                                          value={item.textValue || ''}
                                          onChange={(e) => updateChecklistItem(categoryId, item.id, 'textValue', e.target.value)}
                                          placeholder="Digite aqui..."
                                          className="text-input"
                                          rows="3"
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

      {/* Modal de detalhes do serviço */}
      {selectedService && (
        <div className="modal-overlay">
          <div className="modal-content service-modal-content">
            <div className="modal-header">
              <h2>Detalhes do Serviço</h2>
              <button onClick={closeServiceModal} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="service-detail-section">
                <h3>Informações Básicas</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>ID de Controle:</strong>
                    <span>{selectedService.control_id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Cliente:</strong>
                    <span>{selectedService.client_name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-badge service-${selectedService.status?.toLowerCase()?.replace(/\s+/g, '-')}`}>
                      {selectedService.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Data de Abertura:</strong>
                    <span>
                      {(() => {
                        if (!selectedService.opened_date) return 'N/A';
                        // Para datas YYYY-MM-DD, força interpretação local
                        if (typeof selectedService.opened_date === 'string' && selectedService.opened_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          const [year, month, day] = selectedService.opened_date.split('-');
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString('pt-BR');
                        }
                        return new Date(selectedService.opened_date).toLocaleDateString('pt-BR');
                      })()}
                    </span>
                  </div>
                  {selectedService.visit_date && (
                    <div className="detail-item">
                      <strong>Data da Visita:</strong>
                      <span>
                        {(() => {
                          if (!selectedService.visit_date) return '-';
                          // Para datas YYYY-MM-DD, força interpretação local
                          if (typeof selectedService.visit_date === 'string' && selectedService.visit_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = selectedService.visit_date.split('-');
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('pt-BR');
                          }
                          return new Date(selectedService.visit_date).toLocaleDateString('pt-BR');
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="service-detail-section">
                <h3>Descrição do Serviço</h3>
                <p className="service-description-full">
                  {selectedService.service_description}
                </p>
              </div>

              <div className="service-detail-section">
                <h3>Contatos</h3>
                <div className="contact-grid">
                  <div className="contact-item">
                    <strong>Telefone:</strong>
                    <span>{selectedService.phone || 'Não informado'}</span>
                  </div>
                  <div className="contact-item">
                    <strong>Email:</strong>
                    <span>{selectedService.email || 'Não informado'}</span>
                  </div>
                  <div className="contact-item">
                    <strong>WhatsApp:</strong>
                    <span>{selectedService.whatsapp || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              <div className="service-detail-section">
                <h3>Observações</h3>
                <p className="service-notes">
                  {selectedService.notes || 'Nenhuma observação'}
                </p>
              </div>

              <div className="service-detail-section">
                <h3>Ações</h3>
                <div className="service-actions-modal">
                  {selectedService.status === 'Pendente' && (
                    <button
                      onClick={() => {
                        updateService(selectedService.id, 'Em Andamento');
                        setSelectedService({...selectedService, status: 'Em Andamento'});
                      }}
                      className="action-button start"
                    >
                      <Play size={16} />
                      Iniciar Serviço
                    </button>
                  )}
                  
                  {selectedService.status === 'Em Andamento' && (
                    <>
                      <button
                        onClick={() => {
                          updateService(selectedService.id, 'Pendente');
                          setSelectedService({...selectedService, status: 'Pendente'});
                        }}
                        className="action-button back"
                      >
                        <Clock size={16} />
                        Voltar para Pendente
                      </button>
                      <button
                        onClick={() => {
                          updateService(selectedService.id, 'Finalizado');
                          setSelectedService({...selectedService, status: 'Finalizado'});
                        }}
                        className="action-button finish"
                      >
                        <CheckCircle2 size={16} />
                        Finalizar Serviço
                      </button>
                    </>
                  )}
                  
                  {selectedService.status === 'Finalizado' && (
                    <div className="finalized-service">
                      <CheckCircle2 size={16} />
                      <span>Serviço Finalizado</span>
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

export default AgentBoard;