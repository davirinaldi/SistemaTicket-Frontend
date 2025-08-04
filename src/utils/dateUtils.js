// Utilitário para formatação de datas no horário de Brasília

/**
 * Converte data UTC para horário de Brasília e formata
 */
export const formatDateBrasilia = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Configurações padrão para horário de Brasília
  const defaultOptions = {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  // Mescla opções padrão com opções fornecidas
  const formatOptions = { ...defaultOptions, ...options };
  
  return date.toLocaleString('pt-BR', formatOptions);
};

/**
 * Formata apenas a data (sem horário) no horário de Brasília
 */
export const formatDateOnlyBrasilia = (dateString) => {
  return formatDateBrasilia(dateString, {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Verifica se uma data é recente (últimos 7 dias)
 */
export const isRecentDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
  
  return daysDiff <= 7;
};