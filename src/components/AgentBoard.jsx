import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI } from '../services/api';
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
  ChevronUp
} from 'lucide-react';
import Header from './Header';
import AttachmentUpload from './AttachmentUpload';
import './AgentBoard.css';

const AgentBoard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [message, setMessage] = useState(null);
  const [attachments, setAttachments] = useState({});

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getByAgent(user.id);
      setTickets(response.data || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao carregar tickets: ' + (error.response?.data?.error || error.message)
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
        <p>Carregando seus tickets...</p>
      </div>
    );
  }

  const ticketsByStatus = {
    'Aguardando Implantação': tickets.filter(t => t.status === 'Aguardando Implantação'),
    'Em Andamento': tickets.filter(t => t.status === 'Em Andamento'),
    'Finalizado': tickets.filter(t => t.status === 'Finalizado'),
  };

  return (
    <div className="agent-board">
      <Header />
      
      <div className="board-content">
        <div className="board-header">
          <h1>Meus Tickets</h1>
          <div className="board-stats">
            <span>Total: {tickets.length}</span>
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
          {Object.entries(ticketsByStatus).map(([status, statusTickets]) => (
            <div key={status} className={`board-column ${getStatusColor(status)}`}>
              <div className="column-header">
                {getStatusIcon(status)}
                <h2>{status}</h2>
                <span className="ticket-count">{statusTickets.length}</span>
              </div>

              <div className="column-content">
                {statusTickets.length === 0 ? (
                  <div className="empty-column">
                    <p>Nenhum ticket neste status</p>
                  </div>
                ) : (
                  statusTickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card">
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
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalhes do ticket */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeTicketModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

export default AgentBoard;