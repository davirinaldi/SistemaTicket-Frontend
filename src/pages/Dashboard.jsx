import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { agentsAPI } from '../services/api';
import { FileText, Clock, User, Plus } from 'lucide-react';
import Header from '../components/Header';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import AgentBoard from '../components/AgentBoard';
import { isRecentDate } from '../utils/dateUtils';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  
  // Se for agente (não admin), mostra o novo board de tickets
  if (!isAdmin()) {
    return <AgentBoard />;
  }
  
  // Dashboard original para admins
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // console.log('Dashboard useEffect:', { user, userId: user?.id });
    if (user?.id) {
      loadTickets();
    } else {
      setLoading(false); // Se não tem usuário, para o loading
    }
  }, [user]);

  const loadTickets = async () => {
    try {
      const response = await agentsAPI.getTickets(user.id);
      setTickets(response.data);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    setShowCreateModal(true);
  };

  const handleTicketCreated = () => {
    setShowCreateModal(false);
    loadTickets(); // Recarregar tickets
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Carregando seus tickets...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-info">
            <h1>Meus Tickets</h1>
            <p>Bem-vindo, {user?.name}</p>
          </div>
          <button onClick={handleCreateTicket} className="create-button">
            <Plus size={18} />
            Novo Ticket
          </button>
        </div>

        <div className="stats-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <FileText size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-number">{tickets.length}</span>
              <span className="summary-label">Total de Tickets</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-number">
                {tickets.filter(t => isRecentDate(t.created_at)).length}
              </span>
              <span className="summary-label">Esta Semana</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <User size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-number">
                {tickets.reduce((acc, ticket) => {
                  const sistemas = ticket.sistema ? [ticket.sistema] : [];
                  sistemas.forEach(sistema => {
                    if (!acc.includes(sistema)) acc.push(sistema);
                  });
                  return acc;
                }, []).length}
              </span>
              <span className="summary-label">Sistemas</span>
            </div>
          </div>
        </div>

        <div className="tickets-section">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>Nenhum ticket encontrado</h3>
              <p>Você ainda não possui tickets atribuídos.</p>
              <button onClick={handleCreateTicket} className="create-button">
                <Plus size={18} />
                Criar Primeiro Ticket
              </button>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket}
                  onUpdate={loadTickets}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;