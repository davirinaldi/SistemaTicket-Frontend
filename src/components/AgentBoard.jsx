import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketsAPI } from '../services/api';
import { formatDateOnlyBrasilia } from '../utils/dateUtils';
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
  Plus,
  Trash2
} from 'lucide-react';
import Header from './Header';
import './AgentBoard.css';

const AgentBoard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [message, setMessage] = useState(null);

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
      
      if (newStatus === 'Finalizado') {
        // Remove o ticket da lista quando finalizado
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        setMessage({
          type: 'success',
          text: 'Ticket finalizado com sucesso!'
        });
      } else {
        // Atualiza o status na lista
        setTickets(prev => prev.map(t => 
          t.id === ticketId ? { ...t, status: newStatus } : t
        ));
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
    const currentChecklist = ticket.checklist ? 
      (typeof ticket.checklist === 'string' ? JSON.parse(ticket.checklist) : ticket.checklist) : 
      [];
    setChecklist(currentChecklist);
    setEditingChecklist(false);
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
    setEditingChecklist(false);
    setChecklist([]);
  };

  const startEditingChecklist = () => {
    setEditingChecklist(true);
  };

  const cancelEditingChecklist = () => {
    const originalChecklist = selectedTicket.checklist ? 
      (typeof selectedTicket.checklist === 'string' ? JSON.parse(selectedTicket.checklist) : selectedTicket.checklist) : 
      [];
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

  const addChecklistItem = () => {
    setChecklist(prev => [...prev, { id: Date.now(), text: '', completed: false }]);
  };

  const updateChecklistItem = (id, field, value) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeChecklistItem = (id) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
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
                  {editingChecklist ? (
                    <>
                      {checklist.map((item) => (
                        <div key={item.id} className="checklist-item editing">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => updateChecklistItem(item.id, 'completed', e.target.checked)}
                          />
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateChecklistItem(item.id, 'text', e.target.value)}
                            placeholder="Descrição do item..."
                            className="checklist-input"
                          />
                          <button
                            onClick={() => removeChecklistItem(item.id)}
                            className="remove-item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={addChecklistItem}
                        className="add-item-button"
                      >
                        <Plus size={16} />
                        Adicionar Item
                      </button>
                    </>
                  ) : (
                    <>
                      {checklist.length === 0 ? (
                        <p className="no-checklist">Nenhum item no checklist</p>
                      ) : (
                        checklist.map((item) => (
                          <div key={item.id} className="checklist-item readonly">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              disabled
                            />
                            <span className={item.completed ? 'completed' : ''}>
                              {item.text}
                            </span>
                          </div>
                        ))
                      )}
                    </>
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