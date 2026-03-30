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
      name: "Valet Thiago",
      characterKey: "thiago",
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
      name: "Amélia",
      characterKey: "amelia",
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
      name: "Curador Alan",
      characterKey: "alan",
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
      name: "Atriz Amanda",
      characterKey: "amanda",
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
      name: "Florista Ingrid",
      characterKey: "ingrid",
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
      name: "Chaveiro Carlos",
      characterKey: "thiago",
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
      name: "Felipe do Bar",
      characterKey: "alan",
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
      name: "Lojista Amélia",
      characterKey: "amelia",
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
      name: "Morador Thiago",
      characterKey: "thiago",
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
      name: "Artesã Amanda",
      characterKey: "amanda",
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
      name: "Fazendeiro Alan",
      characterKey: "alan",
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
};

// ─── BeachScene ───────────────────────────────────────────────────────────────
export const beachNPCs = [
  {
    id: "carlos_praia",
    name: "Carlos",
    characterKey: "thiago",
    negotiationId: "carlos_praia_1",
    x: 400,
    y: 600,
    dialogs: [
      "Ei! Sou o dono desse quiosque de coco verde e picolé aqui da frente.",
      "Estou preocupado com o movimento, a praia está vazia hoje...",
      "Sério que você vai tentar me vender uma maquininha logo agora?",
    ],
  },
  {
    id: "marina_praia",
    name: "Marina",
    characterKey: "amelia",
    negotiationId: "carlos_praia_2",
    x: 550,
    y: 400,
    dialogs: [
      "Olá! Sou a Marina, faço artesanato aqui na praia.",
      "Pulseiras, colares, tudo feito à mão com materiais naturais.",
      "Maquininha pra quem vende pulseira de R$10? Acho que não faz sentido...",
    ],
  },
];

// ─── IndustrialScene ──────────────────────────────────────────────────────────
export const industrialNPCs = [
  {
    id: "ingrid_industrial",
    name: "Ingrid",
    characterKey: "ingrid",
    negotiationId: "ingrid_cielo_1",
    x: 300,
    y: 250,
    dialogs: [
      "Bem-vinda! Sou a Ingrid, supervisiono o setor corporativo desta fábrica.",
      "Temos um volume de dinheiro em maquinários que passaria do limite da maioria das transações normais.",
      "Quero ver se a empresa que você trabalha tem tecnologia o suficiente pra me atender, vamos ver do que você é capaz!",
    ],
  },
  {
    id: "roberto_industrial",
    name: "Roberto",
    characterKey: "alan",
    negotiationId: "ingrid_industrial_2",
    x: 500,
    y: 400,
    dialogs: [
      "Sou o Roberto, cuido da logística e financeiro da fábrica.",
      "Processamos milhares de boletos todo mês, o sistema bancário atual nos atende bem.",
      "Se quiser me convencer a mudar, vai ter que mostrar algo muito bom!",
    ],
  },
];

// ─── cieloScene ───────────────────────────────────────────────────────────────
export const cieloHQNPCs = [
  {
    id: "amelia_cielo",
    name: "Amélia (Cielo)",
    characterKey: "amelia",
    x: 416,
    y: 150,
    dialogs: [
      "Bem vindo ao HUB de Controle da Cielo.",
      "Temos muitos clientes precisando de modernização nas transações.",
      "Vá lá fora, negocie com eles e ganhe Experiência para subir seu Nível!",
    ],
  },
];
