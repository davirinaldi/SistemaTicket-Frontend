import React from 'react';

const CreateAdminModal = ({ 
  newAdmin, 
  setNewAdmin, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Criar Novo Administrador</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Criar Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(CreateAdminModal);