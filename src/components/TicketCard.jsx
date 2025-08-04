import { useState } from 'react';
import { 
  Calendar, 
  Tag, 
  User, 
  Monitor, 
  Hash, 
  Building,
  Edit3,
  Trash2
} from 'lucide-react';
import EditTicketModal from './EditTicketModal';
import { formatDateBrasilia } from '../utils/dateUtils';
import './TicketCard.css';

const TicketCard = ({ ticket, onUpdate, showAgent = false }) => {
  const [showEditModal, setShowEditModal] = useState(false);

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
      </div>

      {showEditModal && (
        <EditTicketModal
          ticket={ticket}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
    </>
  );
};

export default TicketCard;