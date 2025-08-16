import React from 'react';

const EditPasswordModal = ({ 
  selectedUser,
  newPassword, 
  setNewPassword, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Senha</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Usuário:</label>
            <p className="user-info">
              {selectedUser?.name || 'Usuário não encontrado'}
            </p>
          </div>
          <div className="form-group">
            <label>Nova senha:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <p className="form-help">
              <strong>Nota:</strong> A senha deve ter pelo menos 6 caracteres.
            </p>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={newPassword.length < 6}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditPasswordModal);