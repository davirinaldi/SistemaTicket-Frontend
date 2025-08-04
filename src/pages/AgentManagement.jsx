import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Users, 
  UserPlus, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Shield,
  User
} from 'lucide-react';
import Header from '../components/Header';
import './AgentManagement.css';

const AgentManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // Estados para modals
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPassword, setEditingPassword] = useState(null);
  
  // Estados para formulários
  const [newAdmin, setNewAdmin] = useState({ name: '', username: '', password: '', email: '' });
  const [newAgent, setNewAgent] = useState({ name: '' });
  const [editForm, setEditForm] = useState({ name: '', username: '', email: '', role: 'agent' });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao carregar usuários: ' + (error.response?.data?.error || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createAdmin(newAdmin);
      setNewAdmin({ name: '', username: '', password: '', email: '' });
      setShowCreateAdmin(false);
      setMessage({
        type: 'success',
        text: 'Administrador criado com sucesso!'
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao criar administrador: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    
    if (!newAgent.name.trim()) {
      setMessage({
        type: 'error',
        text: 'Nome do agente é obrigatório'
      });
      return;
    }
    
    try {
      await adminAPI.createAgent(newAgent.name);
      setNewAgent({ name: '' });
      setShowCreateAgent(false);
      setMessage({
        type: 'success',
        text: `Agente "${newAgent.name}" criado com sucesso!`
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao criar agente: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      await adminAPI.updateUser(editingUser, editForm);
      setEditingUser(null);
      setEditForm({ name: '', username: '', email: '', role: 'agent' });
      setMessage({
        type: 'success',
        text: 'Usuário atualizado com sucesso!'
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao atualizar usuário: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const handleEditPassword = async (userId) => {
    if (!newPassword.trim()) {
      setMessage({
        type: 'error',
        text: 'Nova senha é obrigatória'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'A senha deve ter pelo menos 6 caracteres'
      });
      return;
    }
    
    try {
      await adminAPI.editPassword(userId, newPassword);
      setEditingPassword(null);
      setNewPassword('');
      setMessage({
        type: 'success',
        text: 'Senha atualizada com sucesso!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao editar senha: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) {
      return;
    }
    
    try {
      await adminAPI.deleteUser(userId);
      setMessage({
        type: 'success',
        text: 'Usuário deletado com sucesso!'
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao deletar usuário: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserStatus(userId, !currentStatus);
      setMessage({
        type: 'success',
        text: `Usuário ${!currentStatus ? 'ativado' : 'inativado'} com sucesso!`
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao alterar status: ' + (error.response?.data?.error || error.message)
      });
    }
  };

  const hideMessage = () => {
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="agent-management">
      <Header />
      
      <div className="management-content">
        <div className="management-header">
          <div className="header-title">
            <Users size={24} />
            <h1>Gerenciamento de Usuários</h1>
          </div>
          <button 
            onClick={loadUsers} 
            className="refresh-button"
            title="Atualizar lista"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
            <button onClick={hideMessage} className="message-close">×</button>
          </div>
        )}

        <div className="create-section">
          <div className="create-buttons">
            <button 
              onClick={() => setShowCreateAgent(true)}
              className="create-button agent"
            >
              <UserPlus size={18} />
              Criar Agente
            </button>
            <button 
              onClick={() => setShowCreateAdmin(true)}
              className="create-button admin"
            >
              <Shield size={18} />
              Criar Admin
            </button>
          </div>
        </div>

        <div className="users-section">
          <h2>Usuários ({users.length})</h2>
          
          {users.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>Nenhum usuário encontrado</p>
              <small>Crie um novo usuário usando os botões acima</small>
            </div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Agente'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="action-btn edit"
                            title="Editar usuário"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setEditingPassword(user.id)}
                            className="action-btn password"
                            title="Editar senha"
                          >
                            🔑
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                            title={user.is_active ? 'Inativar' : 'Ativar'}
                          >
                            {user.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="action-btn delete"
                            title="Deletar usuário"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Admin */}
      {showCreateAdmin && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Criar Novo Administrador</h3>
            <form onSubmit={handleCreateAdmin}>
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
                <button type="button" onClick={() => setShowCreateAdmin(false)}>Cancelar</button>
                <button type="submit">Criar Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Agente */}
      {showCreateAgent && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Criar Novo Agente</h3>
            <form onSubmit={handleCreateAgent}>
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
                <button type="button" onClick={() => setShowCreateAgent(false)}>Cancelar</button>
                <button type="submit">Criar Agente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Usuário</h3>
            <form onSubmit={handleUpdateUser}>
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
                <button type="button" onClick={() => setEditingUser(null)}>Cancelar</button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Senha */}
      {editingPassword && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Senha</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditPassword(editingPassword);
            }}>
              <div className="form-group">
                <label>Usuário:</label>
                <p className="user-info">
                  {users.find(u => u.id === editingPassword)?.name || 'Usuário não encontrado'}
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
                <button type="button" onClick={() => {
                  setEditingPassword(null);
                  setNewPassword('');
                }}>Cancelar</button>
                <button type="submit" disabled={newPassword.length < 6}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;