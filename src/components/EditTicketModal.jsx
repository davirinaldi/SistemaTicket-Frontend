import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import './CreateTicketModal.css'; // Reusar os mesmos estilos

const EditTicketModal = ({ ticket, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: ticket.title || '',
    description: ticket.description || '',
    ticket: ticket.ticket || '',
    fcia: ticket.fcia || '',
    sistema: ticket.sistema || '',
    labels: ticket.labels || [],
    checklist: (() => {
      try {
        return typeof ticket.checklist === 'string' 
          ? JSON.parse(ticket.checklist) 
          : (ticket.checklist || []);
      } catch {
        return [];
      }
    })()
  });
  const [newLabel, setNewLabel] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [loading, setLoading] = useState(false);

  const availableLabels = [
    'Pentaho',
    'Unificação', 
    'Base Padrão',
    'Manual',
    'Cloud',
    'Conversão',
    'Zeramento',
    'Relatórios',
    'Multilojas'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLabel = (label) => {
    if (!formData.labels.includes(label)) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, label]
      }));
    }
  };

  const removeLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const addCustomLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      addLabel(newLabel.trim());
      setNewLabel('');
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, {
          id: Date.now(),
          text: newChecklistItem.trim(),
          completed: false
        }]
      }));
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== itemId)
    }));
  };

  const toggleChecklistItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { ticketsAPI } = await import('../services/api');
      
      await ticketsAPI.update(ticket.id, formData);
      
      onSave();
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      alert('Erro ao atualizar ticket: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Ticket</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Digite o título do ticket"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ticket">Número do Ticket</label>
              <input
                type="text"
                id="ticket"
                value={formData.ticket}
                onChange={(e) => handleInputChange('ticket', e.target.value)}
                placeholder="Ex: 3684501"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fcia">FCIA</label>
              <input
                type="text"
                id="fcia"
                value={formData.fcia}
                onChange={(e) => handleInputChange('fcia', e.target.value)}
                placeholder="Ex: 30290"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sistema">Sistema</label>
              <input
                type="text"
                id="sistema"
                value={formData.sistema}
                onChange={(e) => handleInputChange('sistema', e.target.value)}
                placeholder="Ex: ultrapdv"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o ticket..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Labels</label>
            <div className="labels-section">
              <div className="available-labels">
                {availableLabels.map(label => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => addLabel(label)}
                    className={`label-button ${formData.labels.includes(label) ? 'selected' : ''}`}
                    disabled={formData.labels.includes(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              <div className="custom-label-input">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label personalizada"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLabel())}
                />
                <button type="button" onClick={addCustomLabel} className="add-button">
                  <Plus size={16} />
                </button>
              </div>

              {formData.labels.length > 0 && (
                <div className="selected-labels">
                  {formData.labels.map(label => (
                    <span key={label} className="selected-label">
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="remove-label"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Checklist</label>
            <div className="checklist-section">
              <div className="checklist-input">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Adicionar item ao checklist"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                />
                <button type="button" onClick={addChecklistItem} className="add-button">
                  <Plus size={16} />
                </button>
              </div>

              {formData.checklist.length > 0 && (
                <div className="checklist-items">
                  {formData.checklist.map(item => (
                    <div key={item.id} className="checklist-item">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                      />
                      <span className={item.completed ? 'completed' : ''}>{item.text}</span>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(item.id)}
                        className="remove-item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicketModal;