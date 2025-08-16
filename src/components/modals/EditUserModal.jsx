import React from 'react';

const EditUserModal = ({ 
  editForm, 
  setEditForm, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Usuário</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
              required
            >
              <option value="agent">Agente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserModal);