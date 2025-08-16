import React from 'react';

const CreateAgentModal = ({ 
  newAgent, 
  setNewAgent, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Criar Novo Agente</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Nome do Agente:</label>
            <input
              type="text"
              value={newAgent.name}
              onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
              placeholder="Digite o nome completo do agente"
              required
            />
          </div>
          <div className="form-group">
            <p className="form-help">
              <strong>Nota:</strong> O sistema irá gerar automaticamente:
              <br />• Username baseado no nome
              <br />• Senha aleatória
              <br />• Email no formato username@sistema.local
            </p>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Criar Agente</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(CreateAgentModal);