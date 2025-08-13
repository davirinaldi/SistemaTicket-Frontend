import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { suggestionsAPI } from '../services/api';
import './SuggestionsModal.css';

const SuggestionsModal = ({ isOpen, onClose, onSuccess, dashboard }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!suggestion.trim()) {
      setError('Por favor, digite sua sugestão');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await suggestionsAPI.create(suggestion.trim(), dashboard);

      setSuggestion('');
      onSuccess('Sugestão enviada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao enviar sugestão. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSuggestion('');
    setError('');
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="suggestions-modal-overlay" onClick={onClose}>
      <div className="suggestions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="suggestions-modal-header">
          <h2>Deixar Sugestão</h2>
          <button
            type="button"
            onClick={handleCancel}
            className="close-button"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="suggestions-form">
          <div className="form-group">
            <label htmlFor="suggestion">
              Como podemos melhorar o sistema?
            </label>
            <textarea
              id="suggestion"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Descreva sua sugestão de melhoria..."
              rows={6}
              disabled={isSubmitting}
              className={error && !suggestion.trim() ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !suggestion.trim()}
              className="submit-button"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionsModal;