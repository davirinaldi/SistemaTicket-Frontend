// Configuração das categorias de checklist fixas (SEM CLOUD)
export const CHECKLIST_CATEGORIES = {
  'finalizacao_retaguarda': {
    id: 'finalizacao_retaguarda',
    name: 'Finalização Retaguarda',
    items: [
      { id: 'ret_clientes_crediario', text: 'Validado Cadastro de Clientes Crediário e Convênio?', completed: false },
      { id: 'ret_cadastro_produtos', text: 'Validado Cadastro de Produtos?', completed: false },
      { id: 'ret_descontos_grupo', text: 'Validado Cadastro de Descontos (por grupo)?', completed: false },
      { id: 'ret_nfe_saida', text: 'Validado Emissão NF-e (saída de vencidos/devolução para fornecedor)?', completed: false },
      { id: 'ret_contagem_estoque', text: 'Validado Contagem e Relatórios de Estoque?', completed: false },
      { id: 'ret_entrada_xml', text: 'Validado Entrada de Mercadorias (XML), configurado por e-mail e por certificado?', completed: false },
      { id: 'ret_contas_pagar', text: 'Validado Cadastro e Relatório de Contas a Pagar?', completed: false },
      { id: 'ret_contas_receber', text: 'Validado Relatório de Contas a Receber?', completed: false },
      { id: 'ret_compras_reposicao', text: 'Validado Relatório de Compras por reposição (da farmácia)?', completed: false }
    ]
  },
  'finalizacao_pdv': {
    id: 'finalizacao_pdv',
    name: 'Finalização PDV',
    items: [
      { id: 'pdv_abertura_caixa', text: 'Validado Abertura de Caixa?', completed: false },
      { id: 'pdv_venda_balcao', text: 'Validada venda balcão (Dav/orçamento) e caixa?', completed: false },
      { id: 'pdv_multiplas_formas', text: 'Validado Venda com Múltiplas Formas de Pagamento (Ex: pagar metade cartão/metade dinheiro)?', completed: false },
      { id: 'pdv_tele_entrega', text: 'Validado Venda Tele-Entrega?', completed: false },
      { id: 'pdv_pbms', text: 'Validado PBMs - Programa de Desconto (módulo)?', completed: false },
      { id: 'pdv_farmacia_popular', text: 'Validado Farmácia Popular (módulo)?', completed: false },
      { id: 'pdv_receita_digital', text: 'Validado Receita Digital (módulo)?', completed: false },
      { id: 'pdv_devolucao', text: 'Validado Devolução de Vendas?', completed: false },
      { id: 'pdv_recebimento_crediario', text: 'Validado Recebimento Crediário e Convênio?', completed: false },
      { id: 'pdv_fechamento_caixa', text: 'Finalização Validado Fechamento e Conferência de Caixa?', completed: false },
      { id: 'pdv_treinamento_passado', text: 'Finalização - Treinamento foi passado para:', completed: false, isText: true },
      { id: 'pdv_tipo_sngpc', text: 'Finalização - Qual o tipo de SNGPC?', completed: false, isText: true },
      { id: 'pdv_agente_inauguracao', text: 'Finalização - Vai ter agente presente na inauguração da farmácia?', completed: false },
      { id: 'pdv_ip_fixado', text: 'Fixado IP?', completed: false },
      { id: 'pdv_caminho_bkp', text: 'Configurado caminho do BKP no terminal?', completed: false },
      { id: 'pdv_dias_implantacao', text: 'Quantos dias em implantação?', completed: false, isText: true },
      { id: 'pdv_observacoes', text: 'Observações do Agente', completed: false, isText: true }
    ]
  }
};

// Configuração das categorias para tickets COM CLOUD
export const CHECKLIST_CATEGORIES_CLOUD = {
  'entrada_mercadorias': {
    id: 'entrada_mercadorias',
    name: '1 - Entrada de Mercadorias',
    items: [
      { id: 'cloud_confirmacao_preco', text: 'Confirmação Preço', completed: false },
      { id: 'cloud_fator_compras', text: 'Fator de Compras', completed: false },
      { id: 'cloud_confirmacao_cadastro', text: 'Confirmação de Cadastro', completed: false },
      { id: 'cloud_importacao_nfe', text: 'Importação de NFe', completed: false },
      { id: 'cloud_nao_utiliza_entrada', text: '❌ Não utiliza', completed: false }
    ]
  },
  'cadastros': {
    id: 'cadastros',
    name: '1 - Cadastros',
    items: [
      { id: 'cloud_cadastro_clientes', text: 'Cadastro de Clientes', completed: false },
      { id: 'cloud_cadastro_convenio', text: 'Cadastro de Convênio', completed: false },
      { id: 'cloud_cadastro_produtos', text: 'Cadastro de Produtos', completed: false },
      { id: 'cloud_grupo_produtos', text: 'Grupo de Produtos', completed: false }
    ]
  },
  'controle_estoque': {
    id: 'controle_estoque',
    name: '2 - Controle de Estoque',
    items: [
      { id: 'cloud_outras_saidas_entradas', text: 'Outras Saídas/Entradas', completed: false },
      { id: 'cloud_nao_utiliza_estoque', text: '❌ Não utiliza', completed: false }
    ]
  },
  'inventario_inicial': {
    id: 'inventario_inicial',
    name: '3 - Inventário Inicial',
    items: [
      { id: 'cloud_cliente_sem_liberacoes_inv', text: 'Cliente sem liberações, será feito posteriormente', completed: false },
      { id: 'cloud_abertura_inventario', text: 'Abertura de inventário', completed: false },
      { id: 'cloud_cadastros_produto_sngpc', text: 'Cadastros de Produto SNGPC', completed: false },
      { id: 'cloud_conferencia_dados', text: 'Conferência de Dados', completed: false },
      { id: 'cloud_confirmacao_inventario', text: 'Confirmação de Inventário', completed: false },
      { id: 'cloud_lancamento_itens', text: 'Lançamento de Itens', completed: false },
      { id: 'cloud_manteve_sngpc_web_inv', text: 'Manteve o uso do SNGPC Web', completed: false },
      { id: 'cloud_nao_utiliza_inventario', text: '❌ Não utiliza', completed: false }
    ]
  },
  'lotes_receitas': {
    id: 'lotes_receitas',
    name: '3 - Lotes e Receitas',
    items: [
      { id: 'cloud_cliente_sem_liberacoes_lotes', text: 'Cliente sem liberações, será feito posteriormente', completed: false },
      { id: 'cloud_cadastro_laboratorio', text: 'Cadastro de Laboratório', completed: false },
      { id: 'cloud_cadastro_principio_ativo', text: 'Cadastro de Princípio Ativo', completed: false },
      { id: 'cloud_cadastro_medico', text: 'Cadastro de Médico', completed: false },
      { id: 'cloud_entrada_mercadoria_sngpc', text: 'Entrada de Mercadoria SNGPC', completed: false },
      { id: 'cloud_lancamento_receitas', text: 'Lançamento de Receitas', completed: false },
      { id: 'cloud_manteve_sngpc_web_lotes', text: 'Manteve o uso do SNGPC Web', completed: false },
      { id: 'cloud_nao_utiliza_lotes', text: '❌ Não utiliza', completed: false }
    ]
  },
  'relatorios': {
    id: 'relatorios',
    name: '3 - Relatórios',
    items: [
      { id: 'cloud_cliente_sem_liberacoes_rel', text: 'Cliente sem liberações, será feito posteriormente', completed: false },
      { id: 'cloud_balanco_medicamentos', text: 'Balanço de Medicamentos', completed: false },
      { id: 'cloud_relacao_mensal_notificacoes', text: 'Relação Mensal de Notificações de Receita', completed: false },
      { id: 'cloud_relatorio_conferencia', text: 'Relatório de Conferência', completed: false },
      { id: 'cloud_relatorio_saldo_estoque', text: 'Relatório de Saldo em Estoque', completed: false },
      { id: 'cloud_relatorio_monofasicos', text: 'Relatório de Monofásicos', completed: false },
      { id: 'cloud_manteve_sngpc_web_rel', text: 'Manteve o uso do SNGPC Web', completed: false },
      { id: 'cloud_nao_utiliza_relatorios', text: '❌ Não utiliza', completed: false }
    ]
  },
  'caixa': {
    id: 'caixa',
    name: '4 - Caixa',
    items: [
      { id: 'cloud_abertura_fechamento_caixa', text: 'Abertura e Fechamento de Caixa', completed: false },
      { id: 'cloud_conferencia_caixa', text: 'Conferência de Caixa', completed: false },
      { id: 'cloud_movimento_caixa', text: 'Movimento de Caixa', completed: false },
      { id: 'cloud_nao_utiliza_caixa', text: '❌ Não utiliza', completed: false }
    ]
  },
  'vendas': {
    id: 'vendas',
    name: '4 - Vendas',
    items: [
      { id: 'cloud_cancelamento_vendas', text: 'Cancelamento de Vendas', completed: false },
      { id: 'cloud_multiplas_formas_pagamento', text: 'Múltiplas Formas de Pagamento', completed: false },
      { id: 'cloud_emissao_drogarias', text: 'Emissão de Drogarias', completed: false }
    ]
  },
  'tele_entrega': {
    id: 'tele_entrega',
    name: '4 - Tele-Entrega',
    items: [
      { id: 'cloud_venda_tele_entrega', text: 'Venda Tele-Entrega', completed: false },
      { id: 'cloud_cadastro_cliente_venda', text: 'Cadastro de Cliente na Venda', completed: false },
      { id: 'cloud_nao_utiliza_tele', text: '❌ Não utiliza', completed: false }
    ]
  },
  'descontos': {
    id: 'descontos',
    name: '4 - Descontos',
    items: [
      { id: 'cloud_desconto_produto', text: 'Desconto por Produto', completed: false },
      { id: 'cloud_nao_utiliza_descontos', text: '❌ Não utiliza', completed: false }
    ]
  },
  'compras': {
    id: 'compras',
    name: '5 - Compras',
    items: [
      { id: 'cloud_anotacao_compras', text: 'Anotação de Compras', completed: false },
      { id: 'cloud_pedido_anotacao_compra', text: 'Pedido por Anotação de Compra', completed: false },
      { id: 'cloud_compras_reposicao', text: 'Compras Por Reposição', completed: false },
      { id: 'cloud_nao_utiliza_compras', text: '❌ Não utiliza', completed: false }
    ]
  },
  'gestao_comissao': {
    id: 'gestao_comissao',
    name: '6 - Gestão de Comissão',
    items: [
      { id: 'cloud_comissao_produto', text: 'Por Produto', completed: false },
      { id: 'cloud_comissao_campanha', text: 'Por Campanha', completed: false },
      { id: 'cloud_comissao_atributos', text: 'Por Atributos de Produtos', completed: false },
      { id: 'cloud_nao_utiliza_comissao', text: '❌ Não utiliza', completed: false }
    ]
  },
  'funcionalidades_trier': {
    id: 'funcionalidades_trier',
    name: '7 - Funcionalidades Trier Cloud',
    items: [
      { id: 'cloud_favoritos', text: 'Favoritos', completed: false },
      { id: 'cloud_pesquisa_filtros', text: 'Pesquisa por Filtros', completed: false },
      { id: 'cloud_vendas_simultaneas', text: 'Vendas Simultâneas', completed: false },
      { id: 'cloud_geracao_relatorios', text: 'Geração de Relatórios', completed: false },
      { id: 'cloud_nao_utiliza_funcionalidades', text: '❌ Não utiliza', completed: false }
    ]
  },
  'finalizacao_cloud': {
    id: 'finalizacao_cloud',
    name: 'Finalização',
    items: [
      { id: 'cloud_anexar_venda_teste', text: '📌 Lembrete: anexar venda teste', completed: false },
      { id: 'cloud_observacoes_cliente', text: 'Observações do Cliente', completed: false, isText: true }
    ]
  }
};

// Função para obter todas as categorias (padrão)
export const getAllCategories = () => {
  return Object.values(CHECKLIST_CATEGORIES);
};

// Função para obter todas as categorias do cloud
export const getAllCategoriesCloud = () => {
  return Object.values(CHECKLIST_CATEGORIES_CLOUD);
};

// Função para obter uma categoria específica
export const getCategory = (categoryId) => {
  return CHECKLIST_CATEGORIES[categoryId] || CHECKLIST_CATEGORIES_CLOUD[categoryId] || null;
};

// Função para verificar se o ticket tem "cloud" nas labels
export const hasCloudLabel = (ticket) => {
  console.log('🔍 DEBUG hasCloudLabel:', {
    ticket: ticket?.id,
    title: ticket?.title,
    labels: ticket?.labels,
    labelsType: typeof ticket?.labels,
    isArray: Array.isArray(ticket?.labels)
  });
  
  if (!ticket || !ticket.labels) {
    console.log('❌ Sem ticket ou labels');
    return false;
  }
  
  // Se labels for uma string, converte para array
  let labels = ticket.labels;
  if (typeof labels === 'string') {
    try {
      labels = JSON.parse(labels);
      console.log('📄 Labels parseadas de string:', labels);
    } catch (e) {
      // Se não conseguir fazer parse, trata como string simples
      const result = labels.toLowerCase().includes('cloud');
      console.log('🔤 Verificando string simples:', { labels, result });
      return result;
    }
  }
  
  // Se for array, verifica se alguma label contém "cloud"  
  if (Array.isArray(labels)) {
    const result = labels.some(label => {
      const isString = typeof label === 'string';
      const hasCloud = isString && label.toLowerCase().includes('cloud');
      console.log('🏷️ Verificando label:', { label, isString, hasCloud });
      return hasCloud;
    });
    
    console.log('✅ Resultado final hasCloudLabel:', result);
    return result;
  }
  
  console.log('❌ Labels não é array nem string válida');
  return false;
};

// Função para criar checklist apropriado baseado no ticket
export const createChecklistForTicket = (ticket) => {
  console.log('🏗️ DEBUG createChecklistForTicket iniciado para:', ticket?.title);
  const checklist = {};
  
  const isCloudTicket = hasCloudLabel(ticket);
  console.log('🔍 Resultado detecção cloud:', isCloudTicket);
  
  if (isCloudTicket) {
    // Ticket COM cloud - usa todas as categorias do cloud
    console.log('🌤️ Ticket com label cloud - aplicando checklist cloud');
    console.log('📋 Categorias cloud disponíveis:', Object.keys(CHECKLIST_CATEGORIES_CLOUD));
    
    Object.keys(CHECKLIST_CATEGORIES_CLOUD).forEach(categoryId => {
      const category = CHECKLIST_CATEGORIES_CLOUD[categoryId];
      if (category) {
        checklist[categoryId] = {
          ...category,
          items: category.items.map(item => ({ 
            ...item,
            textValue: item.isText ? '' : undefined // Para campos de texto
          }))
        };
        console.log(`✅ Categoria adicionada: ${categoryId} (${category.name}) - ${category.items.length} itens`);
      }
    });
  } else {
    // Ticket SEM cloud - usa categorias padrão (Retaguarda + PDV)
    console.log('🏢 Ticket sem label cloud - aplicando checklist padrão');
    console.log('📋 Categorias padrão disponíveis:', Object.keys(CHECKLIST_CATEGORIES));
    
    ['finalizacao_retaguarda', 'finalizacao_pdv'].forEach(categoryId => {
      const category = CHECKLIST_CATEGORIES[categoryId];
      if (category) {
        checklist[categoryId] = {
          ...category,
          items: category.items.map(item => ({ 
            ...item,
            textValue: item.isText ? '' : undefined // Para campos de texto
          }))
        };
        console.log(`✅ Categoria adicionada: ${categoryId} (${category.name}) - ${category.items.length} itens`);
      }
    });
  }
  
  console.log('🏗️ Checklist final criado:', {
    totalCategorias: Object.keys(checklist).length,
    categorias: Object.keys(checklist),
    isCloud: isCloudTicket
  });
  
  return checklist;
};

// Função para criar um checklist inicial baseado nas categorias selecionadas
export const createInitialChecklist = (selectedCategories = []) => {
  const checklist = {};
  
  selectedCategories.forEach(categoryId => {
    const category = CHECKLIST_CATEGORIES[categoryId];
    if (category) {
      checklist[categoryId] = {
        ...category,
        items: category.items.map(item => ({ 
          ...item,
          textValue: item.isText ? '' : undefined // Para campos de texto
        }))
      };
    }
  });
  
  return checklist;
};

// Função para detectar se é checklist no formato antigo (array)
export const isLegacyChecklist = (checklist) => {
  if (!checklist) return false;
  
  // Se for array, é formato antigo
  if (Array.isArray(checklist)) {
    return true;
  }
  
  // Se for objeto mas não tem estrutura de categorias, pode ser antigo
  if (typeof checklist === 'object') {
    // Verifica se tem estrutura de categoria (com name e items)
    const values = Object.values(checklist);
    if (values.length > 0) {
      const firstValue = values[0];
      return !(firstValue && firstValue.name && Array.isArray(firstValue.items));
    }
  }
  
  return false;
};

// Função para migrar checklist antigo para novo formato
export const migrateLegacyChecklist = (legacyChecklist, ticket) => {
  console.log('🔄 Migrando checklist antigo para novo formato...');
  
  // Cria novo checklist baseado nas labels do ticket
  const newChecklist = createChecklistForTicket(ticket);
  
  // Se tinha itens no checklist antigo, tenta preservar o que for possível
  if (Array.isArray(legacyChecklist) && legacyChecklist.length > 0) {
    console.log(`📝 Tentando preservar ${legacyChecklist.length} itens do checklist antigo`);
    
    // Para cada categoria do novo checklist
    Object.keys(newChecklist).forEach(categoryId => {
      const category = newChecklist[categoryId];
      
      // Para cada item da categoria
      category.items.forEach(newItem => {
        // Procura no checklist antigo se tem algo similar
        const legacyItem = legacyChecklist.find(oldItem => {
          if (!oldItem.text) return false;
          
          // Compara textos simplificados (sem acentos, minúsculo)
          const normalize = (str) => str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
          
          const newText = normalize(newItem.text);
          const oldText = normalize(oldItem.text);
          
          // Se contém palavras-chave similares
          return newText.includes(oldText.slice(0, 10)) || 
                 oldText.includes(newText.slice(0, 10));
        });
        
        // Se encontrou item similar, preserva o status
        if (legacyItem) {
          newItem.completed = legacyItem.completed || false;
          if (newItem.isText && legacyItem.text) {
            newItem.textValue = legacyItem.text;
          }
          console.log(`✅ Preservado: ${newItem.text}`);
        }
      });
    });
  }
  
  return newChecklist;
};

// Função para validar um checklist
export const validateChecklist = (checklist) => {
  console.log('🔍 DEBUG validateChecklist:', { checklist, type: typeof checklist, isArray: Array.isArray(checklist), keys: Object.keys(checklist || {}) });
  
  if (!checklist || typeof checklist !== 'object') {
    console.log('❌ Checklist inválido: não é objeto');
    return false;
  }
  
  // Se for array, é formato antigo
  if (Array.isArray(checklist)) {
    console.log('❌ Checklist inválido: é array (formato antigo)');
    return false;
  }
  
  // Se for objeto vazio, é inválido
  const keys = Object.keys(checklist);
  if (keys.length === 0) {
    console.log('❌ Checklist inválido: objeto vazio');
    return false;
  }
  
  // Valida estrutura de categorias
  for (const categoryId in checklist) {
    const category = checklist[categoryId];
    if (!category || !category.items || !Array.isArray(category.items)) {
      console.log(`❌ Checklist inválido: categoria ${categoryId} malformada`);
      return false;
    }
  }
  
  console.log('✅ Checklist válido');
  return true;
};