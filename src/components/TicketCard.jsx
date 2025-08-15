import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Tag, 
  User, 
  Monitor, 
  Hash, 
  Building,
  Edit3,
  Trash2,
  CheckSquare,
  Eye
} from 'lucide-react';
import EditTicketModal from './EditTicketModal';
import { formatDateBrasilia } from '../utils/dateUtils';
import { 
  createChecklistForTicket, 
  validateChecklist, 
  isLegacyChecklist, 
  migrateLegacyChecklist 
} from '../config/checklistCategories';
import './TicketCard.css';

const TicketCard = ({ ticket, onUpdate, showAgent = false }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Removido - usando formatDateBrasilia do utils

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  const handleEditSave = () => {
    setShowEditModal(false);
    onUpdate();
  };

  // Funções do checklist
  const openChecklistModal = () => {
    let currentChecklist = {};
    
    if (ticket.checklist) {
      try {
        const parsedChecklist = typeof ticket.checklist === 'string' ? 
          JSON.parse(ticket.checklist) : ticket.checklist;
        
        // Verifica se é checklist no formato antigo
        if (isLegacyChecklist(parsedChecklist)) {
          console.log('🔄 Checklist antigo detectado, migrando...');
          currentChecklist = migrateLegacyChecklist(parsedChecklist, ticket);
        } else if (validateChecklist(parsedChecklist)) {
          currentChecklist = parsedChecklist;
        } else {
          currentChecklist = createChecklistForTicket(ticket);
        }
      } catch (e) {
        console.error('Erro ao parsear checklist existente:', e);
        currentChecklist = createChecklistForTicket(ticket);
      }
    } else {
      currentChecklist = createChecklistForTicket(ticket);
    }
    
    setChecklist(currentChecklist);
    
    // Expande todas as categorias por padrão
    const expanded = {};
    Object.keys(currentChecklist).forEach(categoryId => {
      expanded[categoryId] = true;
    });
    setExpandedCategories(expanded);
    
    setEditingChecklist(false);
    setShowChecklistModal(true);
  };

  const closeChecklistModal = () => {
    setShowChecklistModal(false);
    setEditingChecklist(false);
    setChecklist({});
    setExpandedCategories({});
  };

  // useEffect para detectar ESC no modal de checklist
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showChecklistModal) {
        closeChecklistModal();
      }
    };

    if (showChecklistModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showChecklistModal]);

  const startEditingChecklist = () => {
    setEditingChecklist(true);
  };

  const cancelEditingChecklist = () => {
    let originalChecklist = {};
    if (ticket.checklist) {
      try {
        originalChecklist = typeof ticket.checklist === 'string' ? 
          JSON.parse(ticket.checklist) : ticket.checklist;
      } catch (e) {
        originalChecklist = createChecklistForTicket(ticket);
      }
    } else {
      originalChecklist = createChecklistForTicket(ticket);
    }
    setChecklist(originalChecklist);
    setEditingChecklist(false);
  };

  const saveChecklist = async () => {
    try {
      const { ticketsAPI } = await import('../services/api');
      await ticketsAPI.updateChecklist(ticket.id, checklist);
      
      setEditingChecklist(false);
      onUpdate(); // Atualiza a lista de tickets
      alert('Checklist atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      alert('Erro ao salvar checklist: ' + (error.response?.data?.error || error.message));
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

  // Função para obter o resumo do checklist
  const getChecklistSummary = () => {
    if (!ticket.checklist) return { total: 0, completed: 0 };
    
    try {
      const parsedChecklist = typeof ticket.checklist === 'string' ? 
        JSON.parse(ticket.checklist) : ticket.checklist;
      
      let total = 0;
      let completed = 0;
      
      if (isLegacyChecklist(parsedChecklist)) {
        // Formato antigo - array de items
        if (Array.isArray(parsedChecklist)) {
          total = parsedChecklist.length;
          completed = parsedChecklist.filter(item => item.completed).length;
        }
      } else {
        // Formato novo - categorias
        Object.values(parsedChecklist).forEach(category => {
          if (category.items && Array.isArray(category.items)) {
            category.items.forEach(item => {
              if (!item.isText) { // Apenas conta checkboxes, não campos de texto
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

  const checklistSummary = getChecklistSummary();

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este ticket?')) {
      try {
        const { ticketsAPI } = await import('../services/api');
        await ticketsAPI.delete(ticket.id);
        onUpdate();
      } catch (error) {
        console.error('Erro ao deletar ticket:', error);
        alert('Erro ao deletar ticket: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <>
      <div className="ticket-card">
        <div className="ticket-header">
          <div className="ticket-title-section">
            <h3 className="ticket-title">{ticket.title}</h3>
          </div>
          <div className="ticket-actions">
            <button onClick={handleEdit} className="action-btn edit">
              <Edit3 size={16} />
            </button>
            <button onClick={handleDelete} className="action-btn delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {ticket.description && (
          <p className="ticket-description">{ticket.description}</p>
        )}

        <div className="ticket-info">
          {ticket.ticket && (
            <div className="info-item">
              <Hash size={16} />
              <span>Ticket: {ticket.ticket}</span>
            </div>
          )}

          {ticket.fcia && (
            <div className="info-item">
              <Building size={16} />
              <span>Fcia: {ticket.fcia}</span>
            </div>
          )}

          {(showAgent && ticket.agente) && (
            <div className="info-item">
              <User size={16} />
              <span>Agente: {ticket.agente}</span>
            </div>
          )}

          {ticket.sistema && (
            <div className="info-item">
              <Monitor size={16} />
              <span>Sistema: {ticket.sistema}</span>
            </div>
          )}

          <div className="info-item">
            <Calendar size={16} />
            <span>Criado: {formatDateBrasilia(ticket.created_at)}</span>
          </div>
        </div>

        {ticket.labels && ticket.labels.length > 0 && (
          <div className="ticket-labels">
            {ticket.labels.map((label, index) => (
              <span key={index} className="label-tag">
                <Tag size={12} />
                {label}
              </span>
            ))}
          </div>
        )}

        {ticket.due_date && (
          <div className="ticket-due">
            <Calendar size={16} />
            <span>Vencimento: {formatDateBrasilia(ticket.due_date)}</span>
          </div>
        )}

        {/* Resumo do Checklist */}
        <div className="ticket-checklist-summary">
          <div className="checklist-progress">
            <CheckSquare size={16} />
            <span>Checklist: {checklistSummary.completed}/{checklistSummary.total}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{
                  width: checklistSummary.total > 0 
                    ? `${(checklistSummary.completed / checklistSummary.total) * 100}%` 
                    : '0%'
                }}
              />
            </div>
          </div>
          <button 
            onClick={openChecklistModal} 
            className="view-checklist-btn"
            title="Ver checklist completo"
          >
            <Eye size={14} />
            Ver Checklist
          </button>
        </div>
      </div>

      {showEditModal && (
        <EditTicketModal
          ticket={ticket}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}

      {/* Modal do Checklist */}
      {showChecklistModal && (
        <div className="modal-overlay">
          <div className="modal-content checklist-modal">
            <div className="modal-header">
              <h2>Checklist - {ticket.title}</h2>
              <button onClick={closeChecklistModal} className="modal-close">
                <Eye size={20} />
              </button>
            </div>

            <div className="modal-body">
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
                  Object.entries(checklist).map(([categoryId, category]) => (
                    <div key={categoryId} className="checklist-category">
                      <div 
                        className="category-header"
                        onClick={() => toggleCategory(categoryId)}
                      >
                        <h4>{category.name}</h4>
                        {expandedCategories[categoryId] ? 
                          '▲' : '▼'
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
          </div>
        </div>
      )}
    </>
  );
};

export default TicketCard;