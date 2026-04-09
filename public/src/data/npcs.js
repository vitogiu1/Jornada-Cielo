/**
 * @fileoverview Dados de todos os NPCs do jogo, organizados por cena.
 * @module data/npcs
 */

/**
 * @typedef {Object} NPCData
 * @property {string} id - Identificador único do NPC.
 * @property {string} name - Nome exibido na caixa de diálogo.
 * @property {string} characterKey - Chave do spritesheet (ex: "alan", "amelia").
 * @property {number} x - Posição X relativa à cena.
 * @property {number} y - Posição Y relativa à cena.
 * @property {string[]} dialogs - Falas exibidas em sequência durante o diálogo.
 * @property {string} [negotiationId] - Se definido, inicia uma negociação ao fim do diálogo.
 */

export const cityNPCs = [];
export const farmNPCs = [];

export const interiorNPCs = {
  // --- CITY ---
  EstacionamentoScene: [
    {
      id: "estacionamento_city_1",
      name: "Valet Marcos",
      characterKey: "npc4",
      x: 512,
      y: 350,
      negotiationId: "estacionamento_city_1",
      dialogs: [
        "Bem-vindo ao estacionamento rotativo!",
        "Cobramos por hora. Normalmente recebo em dinheiro ou Pix.",
        "Como uma maquininha ajudaria na correria de manobrar os carros?",
      ],
    },
  ],
  SorveteriaScene: [
    {
      id: "sorveteria_city_1",
      name: "Sorveteiro Marcos",
      characterKey: "npc_praia",
      x: 512,
      y: 350,
      negotiationId: "sorveteria_city_1",
      dialogs: [
        "Bem-vindo à Gelateria! Sabores artesanais todos os dias.",
        "Nosso ticket médio é baixo e muita gente, principalmente crianças, paga em dinheiro.",
        "Acha mesmo que compensa alugar uma máquina pra vender casquinhas?",
      ],
    },
  ],
  MuseuScene: [
    {
      id: "museu_city_1",
      name: "Curador Otávio",
      characterKey: "npc_praia2",
      x: 512,
      y: 350,
      negotiationId: "museu_city_1",
      dialogs: [
        "Silêncio, por favor. O acervo histórico precisa de paz.",
        "A bilheteria funciona online, mas ainda temos ingressos na porta.",
        "Eu duvido que a sua solução seja robusta para a nossa fundação.",
      ],
    },
  ],
  TeatroScene: [
    {
      id: "teatro_city_1",
      name: "Ator João",
      characterKey: "npc_praia3",
      x: 512,
      y: 350,
      negotiationId: "teatro_city_1",
      dialogs: [
        "A peça vai começar daqui a pouco! Já pegou seu programa?",
        "Vendemos merchandising e ingressos sobressalentes aqui no foyer.",
        "Mas a comissão dos atores não pode ser deduzida do teatro. Como resolvemos isso?",
      ],
    },
  ],
  FloriculturaScene: [
    {
      id: "floricultura_city_1",
      name: "Florista Rosa",
      characterKey: "npc4",
      x: 512,
      y: 350,
      negotiationId: "floricultura_city_1",
      dialogs: [
        "Olá, procurando orquídeas ou buquês de rosas?",
        "Hoje em dia eu aceito muitas encomendas pelo WhatsApp para entregas.",
        "Sua maquininha tradicional não me ajuda a receber à distância...",
      ],
    },
  ],
  ChaveiroScene: [
    {
      id: "chaveiro_city_1",
      name: "Chaveiro Beto",
      characterKey: "npc_praia",
      x: 512,
      y: 350,
      negotiationId: "chaveiro_city_1",
      dialogs: [
        "Cópia de chave? Abertura de cofre? Faço tudo.",
        "Eu vivo correndo pra atender emergências nas casas dos clientes.",
        "Se a sua solução for pesada ou precisar de muita bateria, tô fora.",
      ],
    },
  ],

  // --- FARM ---
  BarScene: [
    {
      id: "bar_farm_1",
      name: "Barman Zeca",
      characterKey: "npc_fazenda",
      x: 512,
      y: 200,
      negotiationId: "bar_farm_1",
      dialogs: [
        "Noite animada hoje, aceita uma dose?",
        "Com o bar lotado, meu maior problema é fechar contas no fim da noite.",
        "Se você me mostrar que seu sistema é rápido, talvez eu mude de ideia.",
      ],
    },
  ],
  LojaScene: [
    {
      id: "loja_farm_1",
      name: "Lojista Silvio",
      characterKey: "npc_fazenda2",
      x: 512,
      y: 500,
      negotiationId: "loja_farm_1",
      dialogs: [
        "Tudo o que você precisa pro campo, você encontra aqui.",
        "Vendo desde sementes até ferramentas caras. Alguns compram de pouco, outros de muito.",
        "Preciso de uma solução flexível, e não algo genérico.",
      ],
    },
  ],
  CasaAmarelaScene: [
    {
      id: "casa1_farm_1",
      name: "Morador Juca",
      characterKey: "npc_fazenda3",
      x: 512,
      y: 350,
      negotiationId: "casa1_farm_1",
      dialogs: [
        "Oi, quer comprar queijos artesanais?",
        "Eu produzo aqui mesmo, mas vendo na beira da estrada. É bem rústico.",
        "Acho que maquininha é coisa de cidade grande. Mostre-me que estou errado.",
      ],
    },
  ],
  CasaAmarela2Scene: [
    {
      id: "casa2_farm_1",
      name: "Artesão André",
      characterKey: "npc_fazenda",
      x: 512,
      y: 350,
      negotiationId: "casa2_farm_1",
      dialogs: [
        "Faço potes de barro e tapeçarias rústicas.",
        "Turistas compram muito, mas quase não trazem dinheiro vivo pra roça.",
        "Sua maquininha depende de sinal de telefone? Porque aqui é tenso...",
      ],
    },
  ],
  CeleiroScene: [
    {
      id: "celeiro_farm_1",
      name: "Fazendeiro Tonho",
      characterKey: "npc_fazenda2",
      x: 512,
      y: 350,
      negotiationId: "celeiro_farm_1",
      dialogs: [
        "Esse trator não conserta sozinho...",
        "Eu vendo grandes sacas de grãos pra cooperativa, os valores são bem altos.",
        "Eu preciso de controle e segurança, não de uma maquineta básica de camelô.",
      ],
    },
  ],
  QuiosquePraiaScene: [
    {
      id: "quiosquep_beach_1",
      name: "Banhista Dudu",
      characterKey: "npc_praia3",
      x: 512,
      y: 750,
      negotiationId: "carlos_praia_1",
      dialogs: [
        "Bem-vindo ao Quiosque do Carlos! O melhor coco da região.",
        "Muitos turistas preferem pagar com cartão hoje em dia.",
        "Como a sua solução me ajudaria a não perder vendas na areia?",
      ],
    },
  ],
  LojaPraiaScene: [
    {
      id: "lojap_beach_1",
      name: "Artesão Moisés",
      characterKey: "npc_praia",
      x: 512,
      y: 750,
      negotiationId: "carlos_praia_2",
      dialogs: [
        "Olá! Sou a Marina, faço artesanato aqui na praia.",
        "Minhas peças são únicas. Alguns clientes compram várias de uma vez.",
        "Uma maquininha agilizaria muito o meu atendimento aqui dentro.",
      ],
    },
  ],
  QuiosDoisPraiaScene: [
    {
      id: "quiosque2_beach_1",
      name: "Cozinheiro Léo",
      characterKey: "npc_praia",
      x: 512,
      y: 750,
      negotiationId: "quiosque2_beach_1",
      dialogs: [
        "Temos porções de peixe fresco e bebidas geladas!",
        "Na hora do rush, as contas de mesa se acumulam rapidinho.",
        "Quero ver se seu sistema aguenta a movimentação de um feriado!",
      ],
    },
  ],
  QuiosSurfScene: [
    {
      id: "quiossurf_beach_1",
      name: "Instrutor Vitor",
      characterKey: "npc_praia2",
      x: 512,
      y: 700,
      negotiationId: "quiossurf_beach_1",
      dialogs: [
        "E aí! Quer aprender a surfar ou alugar uma prancha?",
        "Minhas aulas têm valor fixo, mas os aluguéis variam por hora.",
        "Sua tecnologia é resistente a maresia e areia? Porque aqui é tenso.",
      ],
    },
  ],
  QuiosTresScene: [
    {
      id: "quiosque3_beach_1",
      name: "Vendedor Carlos",
      characterKey: "npc_praia3",
      x: 512,
      y: 700,
      negotiationId: "quiosque3_beach_1",
      dialogs: [
        "O melhor açaí da orla você encontra aqui!",
        "Tenho muitos clientes fiéis que moram aqui perto.",
        "Como o seu software pode me ajudar com o controle de estoque?",
      ],
    },
  ],
  // --- INDUSTRIAL ---
  MecanicaScene: [
    {
      id: "mecanica_ind_1",
      name: "Mecânico César",
      characterKey: "npc_industrial",
      x: 512,
      y: 750,
      negotiationId: "mecanica_ind_1",
      dialogs: [
        "E aí, precisa de um reparo? A oficina tá cheia hoje.",
        "Peças caras, mão de obra pesada... o pagamento precisa ser seguro.",
        "Mostra pra mim que essa maquininha de vocês aguenta o tranco!",
      ],
    },
  ],
  CentroMotorScene: [
    {
      id: "centromotor_ind_1",
      name: "Supervisor José",
      characterKey: "npc_industrial2",
      x: 512,
      y: 750,
      negotiationId: "centromotor_ind_1",
      dialogs: [
        "Bem-vinda ao setor de motores. Aqui tudo funciona com precisão.",
        "Temos um volume alto de transações com fornecedores internacionais.",
        "Quero ver se a Cielo tem tecnologia suficiente pra nos atender.",
      ],
    },
  ],
  CentroSuprimentoScene: [
    {
      id: "centrosuprimento_ind_1",
      name: "Fornecedor Fábio",
      characterKey: "npc_industrial",
      x: 512,
      y: 750,
      negotiationId: "centrosuprimento_ind_1",
      dialogs: [
        "Sou o Alan, cuido de toda a logística de suprimentos.",
        "Processamos centenas de pedidos por dia, tudo via boleto.",
        "Se quiser me convencer a mudar, vai ter que mostrar algo muito bom!",
      ],
    },
  ],
  CentroDePecasScene: [
    {
      id: "centrodepecas_ind_1",
      name: "Estoquista Paulo",
      characterKey: "npc_industrial2",
      x: 512,
      y: 750,
      negotiationId: "centrodepecas_ind_1",
      dialogs: [
        "Cada peça aqui tem rastreabilidade. Nada sai sem nota.",
        "Nossos clientes pagam no faturamento, mas já tivemos calotes.",
        "Me mostre como a Cielo pode garantir segurança nas nossas vendas.",
      ],
    },
  ],
  GalpaoMergulhoScene: [
    {
      id: "galpaomergulho_ind_1",
      name: "Gerente Denis",
      characterKey: "npc_industrial",
      x: 512,
      y: 750,
      negotiationId: "galpaomergulho_ind_1",
      dialogs: [
        "Sou o Roberto, cuido da logística e financeiro da fábrica.",
        "Processamos milhares de boletos todo mês, o sistema bancário atual nos atende bem.",
        "Se quiser me convencer a mudar, vai ter que mostrar algo muito bom!",
      ],
    },
  ],
  SecaoHidraulicaScene: [
    {
      id: "secaohidraulica_ind_1",
      name: "Técnico Laerte",
      characterKey: "npc_industrial2",
      x: 512,
      y: 750,
      negotiationId: "secaohidraulica_ind_1",
      dialogs: [
        "Cuido da manutenção hidráulica de toda a planta industrial.",
        "As peças que uso são importadas e caras, preciso de controle total.",
        "Sua solução suporta parcelamento com valores altos?",
      ],
    },
  ],
};

// ─── BeachScene ───────────────────────────────────────────────────────────────
export const beachNPCs = [];

// ─── IndustrialScene ──────────────────────────────────────────────────────────
export const industrialNPCs = [];

// ─── cieloScene ───────────────────────────────────────────────────────────────
export const cieloHQNPCs = [
  {
    id: "amelia_cielo",
    name: "Guia Cielo",
    characterKey: "thiago",
    x: 416,
    y: 150,
    dialogs: [
      "Bem vindo ao HUB de Controle da Cielo.",
      "Temos muitos clientes precisando de modernização nas transações.",
      "Vá lá fora, negocie com eles e ganhe Experiência para subir seu Nível!",
    ],
  },
];
