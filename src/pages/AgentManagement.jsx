import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
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
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import Header from '../components/Header';
import './AgentManagement.css';

// Lazy load dos modals
const CreateAdminModal = lazy(() => import('../components/modals/CreateAdminModal'));
const CreateAgentModal = lazy(() => import('../components/modals/CreateAgentModal'));
const EditUserModal = lazy(() => import('../components/modals/EditUserModal'));
const EditPasswordModal = lazy(() => import('../components/modals/EditPasswordModal'));

const AgentManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
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

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 20
      };
      
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter === 'active';
      
      const response = await adminAPI.getAllUsers(params);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao carregar usuários: ' + (error.response?.data?.error || error.message)
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, pagination]);

  const handleCreateAdmin = useCallback(async (e) => {
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
  }, [newAdmin, loadUsers]);

  const handleCreateAgent = useCallback(async (e) => {
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
  }, [newAgent.name, loadUsers]);

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

  const hideMessage = useCallback(() => {
    setMessage(null);
  }, []);
  
  // Memoizar usuário selecionado para edição de senha
  const selectedUser = useMemo(() => 
    users.find(u => u.id === editingPassword), 
    [users, editingPassword]
  );

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

        <div className="filters-section">
          <div className="filters-row">
            <div className="search-filter">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por nome, username ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas as roles</option>
                <option value="admin">Administrador</option>
                <option value="agent">Agente</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </div>

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
          <div className="section-header">
            <h2>Usuários ({pagination.total})</h2>
            <div className="pagination-info">
              <span>
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
              </span>
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>Nenhum usuário encontrado</p>
              <small>Crie um novo usuário usando os botões acima</small>
            </div>
          ) : (
            <>
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
              
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={!pagination.hasPrevPage}
                    className="pagination-button"
                  >
                    Primeira
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="pagination-button"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>
                  
                  <div className="pagination-info">
                    <span>Página {pagination.page} de {pagination.totalPages}</span>
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="pagination-button"
                  >
                    Próxima
                    <ChevronRight size={16} />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={!pagination.hasNextPage}
                    className="pagination-button"
                  >
                    Última
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Criar Admin */}
      {showCreateAdmin && (
        <Suspense fallback={<div>Carregando...</div>}>
          <CreateAdminModal
            newAdmin={newAdmin}
            setNewAdmin={setNewAdmin}
            onSubmit={handleCreateAdmin}
            onClose={() => setShowCreateAdmin(false)}
          />
        </Suspense>
      )}

      {/* Modal Criar Agente */}
      {showCreateAgent && (
        <Suspense fallback={<div>Carregando...</div>}>
          <CreateAgentModal
            newAgent={newAgent}
            setNewAgent={setNewAgent}
            onSubmit={handleCreateAgent}
            onClose={() => setShowCreateAgent(false)}
          />
        </Suspense>
      )}

      {/* Modal Editar Usuário */}
      {editingUser && (
        <Suspense fallback={<div>Carregando...</div>}>
          <EditUserModal
            editForm={editForm}
            setEditForm={setEditForm}
            onSubmit={handleUpdateUser}
            onClose={() => setEditingUser(null)}
          />
        </Suspense>
      )}

      {/* Modal Editar Senha */}
      {editingPassword && (
        <Suspense fallback={<div>Carregando...</div>}>
          <EditPasswordModal
            selectedUser={selectedUser}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            onSubmit={(e) => {
              e.preventDefault();
              handleEditPassword(editingPassword);
            }}
            onClose={() => {
              setEditingPassword(null);
              setNewPassword('');
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AgentManagement;