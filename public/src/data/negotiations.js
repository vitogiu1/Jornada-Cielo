/**
 * @fileoverview Dados de todas as negociações do jogo organizados por região.
 * Boa parte dos diálogos foram gerados com IA.
 * @module data/negotiations
 */

export const hqNegotiations = {
  alan_cielo_1: {
    id: "alan_cielo_1",
    enemyName: "Lojista 0",
    enemyKey: "npc4",
    enemyMaxResistance: 120,
    playerMaxConfidence: 100,
    introText:
      "Eu já tenho maquininha da concorrência, e a taxa deles me atende. Por que eu trocaria pela Cielo?",
    playerArguments: [
      {
        id: "taxa",
        name: "Garantia de Taxas Customizadas",
        text: "Nós cobrimos as propostas da concorrência! E a Cielo analisa o seu negócio de perto para construir uma taxa personalizada que faz sentido para você.",
        power: 45,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "antecipacao",
        name: "Antecipação de Recebíveis Automática",
        text: "Com a nossa plataforma, você recebe o valor das suas vendas ainda hoje, direto na sua conta, melhorando totalmente o seu fluxo de caixa.",
        power: 50,
      },
      {
        id: "suporte",
        name: "Suporte Técnico Expresso",
        text: "Nós sabemos que tempo é dinheiro. Troca de máquina quebrada em até 24h, sem frescura e com suporte local dedicado. A concorrência te entrega isso?",
        power: 60,
      },
      {
        id: "mentira_descarada",
        name: "Prometer Taxa Zero",
        text: "Eu prometo que se você fechar, nunca vai pagar taxa nenhuma na vida!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [
      {
        id: "cafe_expresso",
        name: "[Item] Café Expresso",
        text: "Você tomou um Café Expresso da lanchonete ao lado... Sentiu sua Confiança recarregando!",
        power: 35,
        type: "heal",
      },
    ],
    enemyCounters: [
      {
        text: "Hum... Mas eu detesto mudar de banco. A configuração vai atrasar as minhas vendas hoje.",
        power: 20,
      },
      {
        text: "Suporte bom? Da última vez que mudei de máquina, fiquei três dias com o negócio parado no Carnaval.",
        power: 25,
      },
      {
        text: "Meu vizinho usa Cielo e falou que o app de vocês é complicado de entender. Gosto do meu simples.",
        power: 30,
      },
    ],
  },
  amelia_cielo_1: {
    id: "amelia_cielo_1",
    enemyName: "Lojista 1",
    enemyKey: "npc_praia",
    enemyMaxResistance: 150,
    playerMaxConfidence: 100,
    introText:
      "Nossa operação funciona totalmente via Pix e transferência! Pra que eu vou gastar dinheiro alugando maquininha?",
    playerArguments: [
      {
        id: "pix_nativo",
        name: "Pix na Máquina Integrado",
        text: "Você sabia que as maquininhas Cielo geram QR Code Pix na tela? É Pix na conta na hora, com gestão 100% automatizada e recibos impressos.",
        power: 55,
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "seguranca",
        name: "Prevenção a Fraudes e Chargeback",
        text: "Transferências manuais sofrem risco de fraude, agendamento falso e lavagem. Com a máquina, o risco de calote cai pra quase zero.",
        power: 60,
      },
      {
        id: "credito",
        name: "Venda no Crédito Parcelado",
        text: "Se você não aceita cartão, está perdendo clientes! Aumente seu ticket médio parcelando vendas e receba tudo de uma vez com o Receba Rápido.",
        power: 70,
      },
      {
        id: "maquina_bonita",
        name: "Cor da Máquina",
        text: "Você sabia que a maquininha combina super bem com a decoração da sua loja?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [
      {
        id: "tablet_demonstracao",
        name: "[Item] Tablet com Case Cielo",
        text: "Você mostrou um case de sucesso de uma loja igual a dela usando a Cielo. Os olhos dela brilharam!",
        power: 45,
        type: "attack",
      },
      {
        id: "agua_coco",
        name: "[Item] Água de Coco",
        text: "Você tomou uma água de coco gelada. Sua Confiança foi restaurada consideravelmente!",
        power: 40,
        type: "heal",
      },
    ],
    enemyCounters: [
      {
        text: "Mas se eu começar a aceitar cartão, o imposto e as taxas de crédito vão corroer minha margem de lucro inteira!",
        power: 25,
      },
      {
        text: "As pessoas já estão acostumadas a transferir pelo celular. Quase ninguém anda focado em passar cartão pra coisas do dia a dia...",
        power: 35,
      },
      {
        text: "Aluguel de maquininha pesa no fim do mês! Se tiver um mês fraco, continuo pagando os custos fixos.",
        power: 30,
      },
    ],
  },
  ingrid_cielo_1: {
    id: "ingrid_cielo_1",
    enemyName: "Lojista 2",
    enemyKey: "npc_praia2",
    enemyMaxResistance: 180,
    playerMaxConfidence: 100,
    introText:
      "Temos um volume brutal de transações corporativas na indústria B2B. Sua solução de ponto de venda (POS) aguenta esse tranco sem travar?",
    playerArguments: [
      {
        id: "infra",
        name: "Cielo LIO",
        text: "Nós temos a Cielo LIO, uma máquina inteligente que se integra diretamente ao seu software de ERP e estoque, feita exatamente para o mundo corporativo.",
        power: 70,
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "link",
        name: "Soluções E-commerce e Link de Pagamento",
        text: "Não só as máquinas! Podemos turbinar o seu faturamento online com a API de check-out da Cielo para pagamento B2B direto do seu portal.",
        power: 65,
      },
      {
        id: "dados",
        name: "Cielo Farol (Data Intelligence)",
        text: "Oferecemos o Cielo Farol, uma plataforma robusta de dados pra você comparar o faturamento da sua indústria com negócios do mesmo segmento na região.",
        power: 80,
      },
      {
        id: "fazer_pressao",
        name: "Forçar a Venda",
        text: "Olha, bate a meta por mim, fecha logo esse negócio hoje, vai?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [
      {
        id: "relatorio_farol",
        name: "[Item] Relatório Farol Impresso",
        text: "Você entregou um relatório impresso da plataforma Farol com o logo da empresa dela. Ela ficou em choque!",
        power: 85,
        type: "attack",
      },
      {
        id: "energetico",
        name: "[Item] Lata de Energético",
        text: "Você virou uma lata de energético e limpou as suas dúvidas. Confiança parcialmente restaurada!",
        power: 30,
        type: "heal",
      },
    ],
    enemyCounters: [
      {
        text: "Integração B2B de vocês sempre tem gargalos com sistemas legados antigos, nosso ERP usa tecnologia defasada.",
        power: 40,
      },
      {
        text: "Data Intelligence não me interessa se a maquininha perder sinal nos galpões fechados da nossa planta. E aí, cai a venda?",
        power: 45,
      },
      {
        text: "Meu departamento financeiro quer relatórios D+1 organizados. Me prometeram isso uma vez e entregaram um app inacabado.",
        power: 35,
      },
    ],
  },
};

export const cityNegotiations = {
  thiago_city_1: {
    id: "thiago_city_1",
    enemyName: "Lojista 3",
    enemyKey: "npc_praia3",
    enemyMaxResistance: 110,
    playerMaxConfidence: 100,
    introText:
      "Eita, mais um vendedor de maquininha? Olha, eu vendo na rua e no aplicativo. Cartão não faz sentido pra mim.",
    playerArguments: [
      {
        id: "tap_celular",
        name: "Cielo Tap (NFC no celular)",
        text: "Você nem precisa de máquina! Com o Cielo Tap, seu próprio celular vira um terminal de pagamento por aproximação. Zero custo de equipamento.",
        power: 40,
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "link_pagamento",
        name: "Link de Pagamento Cielo",
        text: "Pra vendas online você gera um link e manda pro cliente no WhatsApp. Ele paga por cartão ou Pix e você recebe na hora, sem complicação.",
        power: 45,
      },
      {
        id: "gestao_integrada",
        name: "Gestão Integrada",
        text: "Com o app Cielo Gestão você controla tudo: vendas na rua, no app e no link, tudo num painel só. Nada de ficar somando no caderninho.",
        power: 50,
      },
      {
        id: "mentira_descarada",
        name: "Prometer Taxa Zero",
        text: "Eu prometo que se você fechar, nunca vai pagar taxa nenhuma na vida!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Mas eu já uso Pix do meu banco, o dinheiro cai na hora e eu não pago nada por isso. Por que mudar?",
        power: 20,
      },
      {
        text: "E se o cliente quiser pagar em dinheiro? Maquininha não resolve isso, é só mais um trambolho no bolso.",
        power: 25,
      },
      {
        text: "Eu vendo pouco por dia, não compensa pagar tarifa de cartão pra vender bala e paçoca na porta do metrô.",
        power: 30,
      },
    ],
  },
  estacionamento_city_1: {
    id: "estacionamento_city_1",
    enemyName: "Valet Marcos",
    enemyKey: "npc4",
    enemyMaxResistance: 120,
    playerMaxConfidence: 100,
    introText:
      "Cobramos por hora. Normalmente recebo em dinheiro ou Pix. Como uma maquininha ajudaria na correria de manobrar os carros?",
    playerArguments: [
      {
        id: "rapidez",
        name: "Pagamento Rápido por NFC",
        text: "Com NFC, o cliente paga por aproximação em 2 segundos sem sair do carro. É mais rápido que procurar troco!",
        power: 50,
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "relatorio_caixa",
        name: "Fechamento de Caixa",
        text: "No fim do turno, a Cielo gera um relatório exato das transações. Nada de contar dinheiro e errar o troco no escuro.",
        power: 60,
      },
      {
        id: "garantia",
        name: "Garantia de Pagamento",
        text: "Aceitando crédito, você garante que o cliente sempre tenha como pagar, mesmo se o app do banco dele estiver fora do ar.",
        power: 45,
      },
      {
        id: "mentira_descarada",
        name: "Prometer Taxa Zero",
        text: "Eu prometo que se você fechar, nunca vai pagar taxa nenhuma na vida!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Mas e se chover? A máquina estraga fácil na mão do funcionário lá fora.",
        power: 25,
      },
      {
        text: "Dinheiro vivo é bom para dar troco para os flanelinhas aqui da rua.",
        power: 20,
      },
    ],
  },
  sorveteria_city_1: {
    id: "sorveteria_city_1",
    enemyName: "Sorveteiro Marcos",
    enemyKey: "npc_praia",
    enemyMaxResistance: 110,
    playerMaxConfidence: 100,
    introText:
      "Nosso ticket médio é baixo e muita gente, principalmente crianças, paga em dinheiro. Acha mesmo que compensa alugar uma máquina pra vender casquinhas?",
    playerArguments: [
      {
        id: "maquininha_barata",
        name: "Cielo ZIP",
        text: "A Cielo ZIP é leve, barata e ideal para ticket médio baixo. O custo compensa o volume de vendas rápidas.",
        power: 55,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "mais_vendas",
        name: "Impulso de Compra",
        text: "As pessoas consomem mais quando usam cartão. Em vez de uma casquinha, levam um sundae e uma água!",
        power: 45,
      },
      {
        id: "pix_integrado",
        name: "Pix Integrado",
        text: "O Pix na maquininha não tem taxa abusiva e cai na hora. Sem risco de transferirem pra conta errada.",
        power: 40,
      },
      {
        id: "maquina_bonita",
        name: "Cor da Máquina",
        text: "Você sabia que a maquininha combina super bem com a decoração da sua loja?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "A meninada sai do colégio com moeda no bolso, não com cartão de crédito.",
        power: 30,
      },
      {
        text: "Se as taxas comerem meu lucro, vou precisar subir o preço do sorvete.",
        power: 20,
      },
    ],
  },
  museu_city_1: {
    id: "museu_city_1",
    enemyName: "Curador Otávio",
    enemyKey: "npc_praia2",
    enemyMaxResistance: 130,
    playerMaxConfidence: 100,
    introText:
      "A bilheteria funciona online, mas ainda temos ingressos na porta. Eu duvido que a sua solução seja robusta para a nossa fundação.",
    playerArguments: [
      {
        id: "terminal_inteligente",
        name: "Cielo LIO",
        text: "A Cielo LIO integra direto com seu sistema de bilheteria e catracas, imprimindo o ingresso na hora.",
        power: 65,
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "turismo",
        name: "Cartões Internacionais",
        text: "Turistas estrangeiros adoram museus e só andam com cartões internacionais. A Cielo aceita mais de 80 bandeiras!",
        power: 60,
      },
      {
        id: "ecommerce",
        name: "E-Commerce",
        text: "Podemos melhorar também sua bilheteria online com as APIs da Cielo, centralizando tudo.",
        power: 50,
      },
      {
        id: "fazer_pressao",
        name: "Forçar a Venda",
        text: "Olha, bate a meta por mim, fecha logo esse negócio hoje, vai?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "A diretoria do museu tem muita burocracia para aprovar novos fornecedores de tecnologia.",
        power: 35,
      },
      {
        text: "Temos descontos complexos para estudantes e idosos, não sei se a máquina acompanha.",
        power: 25,
      },
    ],
  },
  teatro_city_1: {
    id: "teatro_city_1",
    enemyName: "Ator João",
    enemyKey: "npc_praia3",
    enemyMaxResistance: 140,
    playerMaxConfidence: 100,
    introText:
      "Vendemos ingressos aqui no foyer. Mas a comissão dos atores não pode ser deduzida do teatro. Como resolvemos isso?",
    playerArguments: [
      {
        id: "split_pagamento",
        name: "Split de Pagamentos",
        text: "A Cielo possui o Split de Pagamentos! A venda é processada e a comissão vai direto pra conta do ator e do teatro automaticamente.",
        power: 75,
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "venda_intervalo",
        name: "Vendas no Intervalo",
        text: "Mande os vendedores passarem nas poltronas vendendo snacks no intervalo com as máquinas móveis.",
        power: 50,
      },
      {
        id: "api_bilheteria",
        name: "Totens de Autoatendimento",
        text: "Podemos integrar a solução nos totens de autoatendimento para reduzir as filas antes do espetáculo.",
        power: 40,
      },
      {
        id: "ofender_concorrente",
        name: "Xingar a Concorrência",
        text: "A concorrência que você usa é um lixo, a empresa deles vai falir mês que vem!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Isso soa ótimo, mas o repasse do Split funciona pra bancos diferentes?",
        power: 30,
      },
      {
        text: "O sinal de celular dentro do teatro é um buraco negro, a maquininha não vai ter sinal.",
        power: 35,
      },
    ],
  },
  floricultura_city_1: {
    id: "floricultura_city_1",
    enemyName: "Florista Rosa",
    enemyKey: "npc4",
    enemyMaxResistance: 120,
    playerMaxConfidence: 100,
    introText:
      "Hoje em dia eu aceito muitas encomendas pelo WhatsApp para entregas. Sua maquininha tradicional não me ajuda a receber à distância...",
    playerArguments: [
      {
        id: "link_pagamento",
        name: "Link de Pagamento Cielo",
        text: "Você pode gerar Links de Pagamento pelo app e enviar no WhatsApp! O cliente paga com segurança de casa.",
        power: 65,
        requiredProduct: "cielo_link",
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "recorrencia",
        name: "Pagamento Recorrente",
        text: "Vende planos mensais de flores? A Cielo tem solução de assinatura automática no cartão do cliente.",
        power: 60,
      },
      {
        id: "nfc_entrega",
        name: "Pagamento na Entrega",
        text: "O entregador leva a Cielo ZIP, compacta e com bateria de longa duração para cobrar direto na porta do cliente.",
        power: 45,
      },
      {
        id: "mentira_descarada",
        name: "Prometer Taxa Zero",
        text: "Eu prometo que se você fechar, nunca vai pagar taxa nenhuma na vida!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Meus clientes mandam foto do comprovante do Pix, por que mandar um Link?",
        power: 25,
      },
      {
        text: "Os motoboys perdem as maquininhas com frequência, preciso de algo seguro.",
        power: 30,
      },
    ],
  },
  chaveiro_city_1: {
    id: "chaveiro_city_1",
    enemyName: "Chaveiro Beto",
    enemyKey: "npc_praia",
    enemyMaxResistance: 110,
    playerMaxConfidence: 100,
    introText:
      "Eu vivo correndo pra atender emergências nas casas dos clientes. Se a sua solução for pesada ou precisar de muita bateria, tô fora.",
    playerArguments: [
      {
        id: "cielo_tap",
        name: "Cielo Tap",
        text: "Não carregue máquina nenhuma! Use o Cielo Tap para transformar seu próprio celular na maquininha, só por aproximação.",
        power: 70,
        requiredProduct: "cielo_tap",
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "bateria",
        name: "Bateria de Longa Duração",
        text: "Ainda prefere máquina? Nossa maquininha mobile tem bateria que dura o dia todo sem te deixar na mão na emergência.",
        power: 45,
      },
      {
        id: "credito_parcelado",
        name: "Serviços Caros Parcelados",
        text: "Trocar o miolo de um cofre sai caro. Com a Cielo você parcela em 12x e não perde o serviço por falta de dinheiro do cliente.",
        power: 55,
      },
      {
        id: "maquina_bonita",
        name: "Cor da Máquina",
        text: "Você sabia que a maquininha combina super bem com a decoração da sua loja?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Uso a moto o dia todo e esqueço de recarregar tudo. Celular descarregou, fico sem receber.",
        power: 35,
      },
      {
        text: "Taxa de maquininha num serviço de R$30 de cópia de chave? Vai esvaziar meu bolso.",
        power: 25,
      },
    ],
  },
};

export const farmNegotiations = {
  amanda_farm_1: {
    id: "amanda_farm_1",
    enemyName: "Lojista 4",
    enemyKey: "npc4",
    enemyMaxResistance: 130,
    playerMaxConfidence: 100,
    introText:
      "Minha banca é de orgânicos e os clientes pagam em dinheiro na feira. Maquininha só vai atrasar a fila!",
    playerArguments: [
      {
        id: "agilidade",
        name: "Pagamento por Aproximação",
        text: "Com NFC a venda demora 2 segundos. É mais rápido que contar troco! O cliente encosta o cartão e pronto.",
        power: 45,
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "ticket_medio",
        name: "Aumento do Ticket Médio",
        text: "Pesquisas mostram que clientes gastam 30% a mais quando podem parcelar. Imagine vender cestas maiores toda semana!",
        power: 50,
      },
      {
        id: "seguranca_rural",
        name: "Segurança no Campo",
        text: "Andar com dinheiro vivo na zona rural é arriscado. Com a maquininha, o dinheiro vai direto pra sua conta, sem risco de assalto.",
        power: 55,
      },
      {
        id: "maquina_bonita",
        name: "Cor da Máquina",
        text: "Você sabia que a maquininha combina super bem com a decoração da sua loja?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Mas e se faltar sinal aqui no meio do mato? Já tentei usar internet móvel e não funciona direito!",
        power: 25,
      },
      {
        text: "Meus clientes são idosos, mal conseguem usar o celular. Imagina pedir pra eles aproximarem o cartão...",
        power: 30,
      },
    ],
  },
  bar_farm_1: {
    id: "bar_farm_1",
    enemyName: "Barman Zeca",
    enemyKey: "npc_fazenda",
    enemyMaxResistance: 130,
    playerMaxConfidence: 100,
    introText:
      "Com o bar lotado, meu maior problema é fechar contas no fim da noite. Se você me mostrar que seu sistema é rápido, talvez eu mude de ideia.",
    playerArguments: [
      {
        id: "lio_bar",
        name: "Cielo LIO",
        text: "Integre a máquina com o seu sistema de comandas! A conta já sai na tela e o garçom fecha a mesa ali mesmo.",
        power: 65,
        requiredProduct: "cielo_lio",
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "nfc_bar",
        name: "NFC Ultrarrápido",
        text: "Os pagamentos por aproximação levam literalmente 2 segundos, acabando com as filas monstruosas do final da noite.",
        power: 50,
      },
      {
        id: "seguranca_caixa",
        name: "Controle de Gorjetas",
        text: "Se o garçom recebe os 10% na máquina, a gorjeta já cai organizada nos relatórios do fim do expediente.",
        power: 55,
      },
      {
        id: "fazer_pressao",
        name: "Forçar a Venda",
        text: "Olha, bate a meta por mim, fecha logo esse negócio hoje, vai?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Já vi sistemas assim travarem e eu ficar com 50 pessoas gritando pra ir embora.",
        power: 35,
      },
      {
        text: "Bebado derruba cerveja na máquina toda sexta-feira. Elas aguentam o tranco?",
        power: 25,
      },
    ],
  },
  loja_farm_1: {
    id: "loja_farm_1",
    enemyName: "Lojista Silvio",
    enemyKey: "npc_fazenda2",
    enemyMaxResistance: 120,
    playerMaxConfidence: 100,
    introText:
      "Vendo desde sementes baratinhas até ferramentas caras. Alguns compram de pouco, outros de muito. Preciso de uma solução flexível.",
    playerArguments: [
      {
        id: "antencipacao_loja",
        name: "Antecipação de Vendas",
        text: "A ferramenta é cara e o cliente reparcela? Você antecipa os recebíveis com a Cielo e compra mais estoque num instante.",
        power: 60,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "maquininha_balcao",
        name: "Maquininha de Balcão",
        text: "Equipamento fixo no balcão que imprime a nota fiscal e já dá baixa no estoque. Robusto para lojas rurais.",
        power: 50,
      },
      {
        id: "credito_rural",
        name: "Aceite de Vários Cartões",
        text: "Aceitamos as principais bandeiras, incluindo vales governamentais e benefícios voltados para agricultores.",
        power: 55,
      },
      {
        id: "ofender_concorrente",
        name: "Xingar a Concorrência",
        text: "A concorrência que você usa é um lixo, a empresa deles vai falir mês que vem!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Antecipar tem taxa. Produtor não paga se eu colocar juros em cima da semente.",
        power: 30,
      },
      {
        text: "O sistema na roça cai se chover muito. A máquina depende do wi-fi da loja?",
        power: 25,
      },
    ],
  },
  casa1_farm_1: {
    id: "casa1_farm_1",
    enemyName: "Morador Juca",
    enemyKey: "npc_fazenda3",
    enemyMaxResistance: 100,
    playerMaxConfidence: 100,
    introText:
      "Acho que maquininha é coisa de cidade grande. Mostre-me que estou errado se quiser que eu use pra vender meus queijos.",
    playerArguments: [
      {
        id: "simplicidade",
        name: "Simplicidade",
        text: "Não precisa de cidade grande! A configuração é fácil, rápida, e o chip 3G embutido funciona na beira da estrada.",
        power: 60,
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "faturamento",
        name: "Atendimento a Turistas",
        text: "Muitos motoristas param pra comprar seu queijo e só têm cartão. Aceitar crédito vai dobrar suas vendas aos domingos.",
        power: 55,
      },
      {
        id: "isencao_aluguel",
        name: "Isenção de Aluguel",
        text: "Dependendo do seu volume de vendas, você alcança rápido a faixa de isenção e não paga aluguel na maquininha.",
        power: 45,
      },
      {
        id: "mentira_descarada",
        name: "Prometer Taxa Zero",
        text: "Eu prometo que se você fechar, nunca vai pagar taxa nenhuma na vida!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Ninguém para o carro aqui. O movimento é bem fraco nas terças e quartas...",
        power: 30,
      },
      {
        text: "Eu só passo o queijo pro cliente, não sou de mexer com aparelhos digitais.",
        power: 20,
      },
    ],
  },
  casa2_farm_1: {
    id: "casa2_farm_1",
    enemyName: "Artesão André",
    enemyKey: "npc_fazenda",
    enemyMaxResistance: 110,
    playerMaxConfidence: 100,
    introText:
      "Sua maquininha depende de sinal de telefone? Porque aqui é tenso... e os turistas da roça mal andam com dinheiro.",
    playerArguments: [
      {
        id: "chip_duplo",
        name: "Sinal Multi-operadora",
        text: "A maquininha Cielo alterna automaticamente entre os sinais das maiores operadoras! E ela também conecta no seu Wi-fi.",
        power: 65,
        requiredProduct: "cielo_zip",
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "qr_code",
        name: "QR Code offline",
        text: "Mesmo com o sinal oscilando, gerar o QR code Pix na tela resolve 90% dos problemas de falta de dinheiro físico.",
        power: 50,
      },
      {
        id: "app_cielo",
        name: "Gestão Pela Nuvem",
        text: "Quando o sinal voltar, todos os seus pagamentos estarão sincronizados no aplicativo Cielo do seu celular.",
        power: 45,
      },
      {
        id: "maquina_bonita",
        name: "Cor da Máquina",
        text: "Você sabia que a maquininha combina super bem com a decoração da sua loja?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Na chuva, meu wi-fi cai e todas as operadoras somem. É a realidade do campo.",
        power: 35,
      },
      {
        text: "As pessoas esquecem a carteira no hotel quando vêm passear na terra de barro.",
        power: 20,
      },
    ],
  },
  celeiro_farm_1: {
    id: "celeiro_farm_1",
    enemyName: "Fazendeiro Tonho",
    enemyKey: "npc_fazenda2",
    enemyMaxResistance: 140,
    playerMaxConfidence: 100,
    introText:
      "Eu vendo grandes sacas de grãos pra cooperativa, os valores são bem altos. Eu preciso de controle e segurança, não de uma maquineta básica de camelô.",
    playerArguments: [
      {
        id: "limite_alto",
        name: "Alta Capacidade de Vendas",
        text: "Diferente dessas maquinetas básicas, nossos limites transacionais são ajustados para o grande atacado agropecuário.",
        power: 70,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "portal_cielo",
        name: "Portal Cielo",
        text: "Você acessa um dashboard completo no seu computador para conciliar extratos de vendas de centenas de milhares de reais com total segurança bancária.",
        power: 60,
        requiredProduct: "cielo_gestao",
      },
      {
        id: "link_b2b",
        name: "Link Corporativo",
        text: "Pra compras da cooperativa a distância, enviamos links de pagamento blindados com anti-fraude de altíssima segurança.",
        power: 50,
      },
      {
        id: "fazer_pressao",
        name: "Forçar a Venda",
        text: "Olha, bate a meta por mim, fecha logo esse negócio hoje, vai?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Mas o banco já faz isso. Qual a real vantagem de botar a Cielo no meio da cadeia agropecuária?",
        power: 35,
      },
      {
        text: "Se uma venda de meio milhão for bloqueada pelo seu antifraude sem motivo, a semente apodrece.",
        power: 45,
      },
    ],
  },
};

export const beachNegotiations = {
  carlos_praia_1: {
    id: "carlos_praia_1",
    enemyName: "Banhista Dudu",
    enemyKey: "npc_praia3",
    enemySprite: "enemy-carlos",
    enemyMaxResistance: 150,
    playerMaxConfidence: 100,
    introText:
      "Ah, Cielo? Minha maquininha sem aluguel me serve bem, e eu vendo picolé e coco por 5 reais. Por que eu alugaria uma máquina?",
    playerArguments: [
      {
        id: "maquininha_barata",
        name: "Cielo ZIP ou Cielo Flash",
        text: "Nós temos máquinas de baixo custo voltadas para pequenos negócios. Não precisa ser um aluguel absurdo para ter a qualidade da rede Cielo e bateria que dura o dia todo na praia.",
        power: 45,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "fluxo_caixa",
        name: "Estabilidade Incomparável",
        text: "Aqui na praia o 3G cai muito e sua máquina fica sem sinal no verão, não é? A Cielo tem dupla conexão, você não perde a venda pro turista apressado.",
        power: 55,
      },
      {
        id: "vendas_dados",
        name: "Demonstração de Dados",
        text: "Veja isso: um quiosque parceiro nosso registrou 30% a mais de vendas apenas nos finais de semana de sol por aceitar crédito e NFC. A chuva não te impede de faturar nos dias de pico!",
        power: 60,
        requiredLevel: 9,
      },
      {
        id: "ofender_concorrente",
        name: "Xingar a Concorrência",
        text: "A concorrência que você usa é um lixo, a empresa deles vai falir mês que vem!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [
      {
        id: "agua_de_coco",
        name: "[Item] Tomar Água de Coco",
        text: "Você comprou uma água de coco geladinha dele para ganhar intimidade... e restaurou sua Confiança!",
        power: 40,
        type: "heal",
      },
    ],
    enemyCounters: [
      {
        text: "Mas se o turista for comprar só uma água no crédito, eu saio no prejuízo com a tarifa fixa por transação da Cielo!",
        power: 25,
      },
      {
        text: "Sem aluguel eu durmo tranquilo sabendo que, se chover fim de semana, eu não tô devendo boleto de maquineta.",
        power: 30,
      },
    ],
  },
  carlos_praia_2: {
    id: "carlos_praia_2",
    enemyName: "Artesão Moisés",
    enemyKey: "npc_praia",
    enemyMaxResistance: 140,
    playerMaxConfidence: 100,
    introText:
      "Eu faço pulseiras e colares artesanais. Meus preços são baixos demais pra justificar maquininha, não acha?",
    playerArguments: [
      {
        id: "pix_qr",
        name: "QR Code Pix na Maquininha",
        text: "Gera QR Code Pix direto na tela da máquina. Sem taxa de cartão, recebe na hora e imprime comprovante pro turista!",
        power: 50,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "credibilidade",
        name: "Credibilidade com Turistas",
        text: "Turista estrangeiro não anda com dinheiro. Se você aceitar cartão internacional, vende pra gringo o dia inteiro!",
        power: 55,
      },
      {
        id: "controle_vendas",
        name: "Controle de Vendas",
        text: "No final do dia você sabe exatamente quanto vendeu, sem precisar contar moedas. O relatório aparece no app.",
        power: 45,
      },
      {
        id: "fazer_pressao",
        name: "Forçar a Venda",
        text: "Olha, bate a meta por mim, fecha logo esse negócio hoje, vai?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Mas eu faço tudo artesanal... ter maquininha me faz parecer uma loja grande, perde o charme do artesanato.",
        power: 25,
      },
      {
        text: "E se der problema com o pagamento e o turista já tiver ido embora? Fico no prejuízo!",
        power: 30,
      },
    ],
  },
  quiosque2_beach_1: {
    id: "quiosque2_beach_1",
    enemyName: "Cozinheiro Léo",
    enemyKey: "npc_praia",
    enemyMaxResistance: 140,
    playerMaxConfidence: 100,
    introText:
      "Na hora do rush, as contas de mesa se acumulam rapidinho. Quero ver se seu sistema aguenta a movimentação de um feriado!",
    playerArguments: [
      {
        id: "gestao_mesas",
        name: "Gestão de Mesas com Cielo LIO",
        text: "A Cielo LIO permite abrir e fechar contas de mesa direto na máquina. Cada garçom carrega a sua e fecha a conta na hora, sem fila no caixa.",
        power: 55,
        requiredProduct: "cielo_lio",
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "pix_rapido",
        name: "Pix na Maquininha",
        text: "Gera QR Code Pix direto na tela. O turista paga na hora e o dinheiro cai instantaneamente na sua conta, sem demora!",
        power: 50,
      },
      {
        id: "dupla_conexao",
        name: "Dupla Conexão (Wi-Fi + Chip)",
        text: "Na praia o sinal oscila. A Cielo trabalha com Wi-Fi e chip 4G simultaneamente — se um cai, o outro assume. Sem venda perdida!",
        power: 60,
      },
      {
        id: "ofender_concorrente",
        name: "Xingar a Concorrência",
        text: "A concorrência que você usa é um lixo, a empresa deles vai falir mês que vem!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "No feriado eu mal tenho tempo de respirar, imagina mexer em sistema novo no meio da loucura!",
        power: 30,
      },
      {
        text: "Maquininha na beira do mar estraga rápido com a maresia. Já perdi duas assim.",
        power: 35,
      },
    ],
  },
  quiossurf_beach_1: {
    id: "quiossurf_beach_1",
    enemyName: "Instrutor Vitor",
    enemyKey: "npc_praia2",
    enemyMaxResistance: 130,
    playerMaxConfidence: 100,
    introText:
      "Minhas aulas têm valor fixo, mas os aluguéis de prancha variam por hora. Sua tecnologia é resistente a maresia e areia? Porque aqui é tenso.",
    playerArguments: [
      {
        id: "cielo_tap",
        name: "Cielo Tap (Celular como Maquininha)",
        text: "Use o Cielo Tap direto no celular! Nada de carregar máquina pesada na areia. O surfista encosta o cartão e pronto.",
        power: 50,
        requiredProduct: "cielo_tap",
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "link_pagamento",
        name: "Link de Pagamento para Reservas",
        text: "Seus alunos podem reservar e pagar aulas antecipadamente por um link enviado no WhatsApp. Chega de no-show!",
        power: 55,
      },
      {
        id: "controle_alugueis",
        name: "Controle de Aluguéis pelo App",
        text: "No app Cielo Gestão você controla cada aluguel: horário, valor e status do pagamento. Fim da confusão de pranchas!",
        power: 45,
      },
      {
        id: "maquina_bonita",
        name: "Cor da Máquina",
        text: "Você sabia que a maquininha combina super bem com a decoração da sua loja?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Eu fico descalço na areia o dia todo. Onde vou guardar uma maquininha sem estragar?",
        power: 25,
      },
      {
        text: "Aula de surf custa R$80, aluguel R$30. É pouco pra justificar taxa de maquininha.",
        power: 30,
      },
    ],
  },
  quiosque3_beach_1: {
    id: "quiosque3_beach_1",
    enemyName: "Vendedor Carlos",
    enemyKey: "npc_praia3",
    enemyMaxResistance: 120,
    playerMaxConfidence: 100,
    introText:
      "Tenho muitos clientes fiéis que moram aqui perto. Como o seu software pode me ajudar com o controle de estoque?",
    playerArguments: [
      {
        id: "cielo_gestao",
        name: "Cielo Gestão para Estoque",
        text: "A plataforma Cielo Gestão mostra exatamente quais produtos vendem mais e em quais horários. Você nunca mais vai ficar sem açaí no pico da demanda!",
        power: 60,
        requiredProduct: "cielo_gestao",
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "fidelidade",
        name: "Programa de Fidelidade",
        text: "Com o Cielo Promo, você cria promoções automáticas para clientes recorrentes. O vizinho que compra açaí todo dia ganha um desconto e nunca mais troca de quiosque!",
        power: 50,
        requiredProduct: "cielo_promo",
      },
      {
        id: "antecipacao",
        name: "Antecipação de Recebíveis",
        text: "Vendeu hoje no crédito parcelado? Com a antecipação da Cielo, o dinheiro cai amanhã. Fluxo de caixa garantido para comprar polpa fresquinha!",
        power: 45,
      },
      {
        id: "mentira_descarada",
        name: "Prometer Taxa Zero",
        text: "Eu prometo que se você fechar, nunca vai pagar taxa nenhuma na vida!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Meus clientes são da vizinhança e pagam tudo no Pix do meu celular pessoal. Por que complicar?",
        power: 25,
      },
      {
        text: "Açaí derrete rápido, se a máquina travar no meio da venda, o cliente vai embora irritado e o produto se perde.",
        power: 30,
      },
    ],
  },
};

export const industrialNegotiations = {
  ingrid_industrial_2: {
    id: "ingrid_industrial_2",
    enemyName: "Lojista 5",
    enemyKey: "npc_praia",
    enemyMaxResistance: 160,
    playerMaxConfidence: 100,
    introText:
      "Nossa empresa processa milhares de boletos por mês. O sistema bancário atual nos atende. Convença-me do contrário.",
    playerArguments: [
      {
        id: "conciliacao",
        name: "Conciliação Automática Cielo",
        text: "Chega de conferir boleto por boleto! A plataforma Cielo faz conciliação automática com seu ERP e aponta divergências na hora.",
        power: 60,
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "split_pagamento",
        name: "Split de Pagamento",
        text: "Precisa dividir pagamento entre filiais ou fornecedores? O Split Cielo faz isso automaticamente em cada transação.",
        power: 55,
      },
      {
        id: "api_checkout",
        name: "API de Checkout Integrada",
        text: "Sua equipe de TI integra nossa API em dias, não meses. Documentação completa, sandbox de teste e suporte dedicado pra enterprise.",
        power: 65,
      },
      {
        id: "ofender_concorrente",
        name: "Xingar a Concorrência",
        text: "A concorrência que você usa é um lixo, a empresa deles vai falir mês que vem!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Integração sempre dá problema. Nosso time de TI já está sobrecarregado com o sistema atual, sem tempo pra migração.",
        power: 35,
      },
      {
        text: "Boleto não tem taxa de cartão. Se migrar pra cartão, vou pagar uma fortuna em taxas sobre o volume que processamos.",
        power: 40,
      },
    ],
  },
  mecanica_ind_1: {
    id: "mecanica_ind_1",
    enemyName: "Mecânico César",
    enemyKey: "npc_industrial",
    enemyMaxResistance: 150,
    playerMaxConfidence: 100,
    introText:
      "Peças caras, mão de obra pesada... o pagamento precisa ser seguro. Mostra pra mim que essa maquininha de vocês aguenta o tranco!",
    playerArguments: [
      {
        id: "parcelamento",
        name: "Parcelamento em até 18x",
        text: "Serviço caro? O cliente parcela em até 18 vezes no cartão pela Cielo. Você recebe tudo antecipado e ele sai satisfeito!",
        power: 55,
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "resistencia",
        name: "Máquina Resistente",
        text: "A Cielo LIO tem carcaça robusta e protegida contra quedas e poeira. Feita para ambientes pesados como oficinas!",
        power: 60,
        requiredProduct: "cielo_lio",
      },
      {
        id: "nota_fiscal",
        name: "Emissão de Nota Integrada",
        text: "A Cielo LIO emite nota fiscal direto na máquina. Menos papelada e mais controle para você e seu cliente.",
        power: 45,
      },
      {
        id: "fazer_pressao",
        name: "Forçar a Venda",
        text: "Olha, bate a meta por mim, fecha logo esse negócio hoje, vai?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Minhas mãos ficam cheias de graxa, não dá pra ficar mexendo em tela touch delicada!",
        power: 30,
      },
      {
        text: "Um reparo grande pode levar dias. Se o cartão do cliente for recusado depois, perdi peça e mão de obra.",
        power: 35,
      },
    ],
  },
  centromotor_ind_1: {
    id: "centromotor_ind_1",
    enemyName: "Supervisor José",
    enemyKey: "npc_industrial2",
    enemyMaxResistance: 160,
    playerMaxConfidence: 100,
    introText:
      "Temos um volume alto de transações com fornecedores internacionais. Quero ver se a Cielo tem tecnologia suficiente pra nos atender.",
    playerArguments: [
      {
        id: "api_integracao",
        name: "API de Integração Enterprise",
        text: "Nossa API enterprise se integra ao seu ERP em dias, com sandbox completo para testes. Transações internacionais processadas com segurança total.",
        power: 70,
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "multi_bandeira",
        name: "80+ Bandeiras Internacionais",
        text: "A Cielo aceita mais de 80 bandeiras internacionais. Seus fornecedores de qualquer país pagam sem atrito!",
        power: 60,
      },
      {
        id: "cielo_farol",
        name: "Cielo Farol de Dados",
        text: "Compare seu faturamento com indústrias do mesmo porte no Cielo Farol. Decisões baseadas em dados reais do mercado.",
        power: 55,
        requiredProduct: "cielo_farol",
      },
      {
        id: "ofender_concorrente",
        name: "Xingar a Concorrência",
        text: "A concorrência que você usa é um lixo, a empresa deles vai falir mês que vem!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Nosso sistema de ERP é legado e de 15 anos atrás. Nenhuma integração nova funciona sem meses de ajuste.",
        power: 40,
      },
      {
        text: "Precisamos de relatórios D+1 detalhados por centro de custo. Sua plataforma suporta isso?",
        power: 35,
      },
    ],
  },
  centrosuprimento_ind_1: {
    id: "centrosuprimento_ind_1",
    enemyName: "Fornecedor Fábio",
    enemyKey: "npc_industrial",
    enemyMaxResistance: 140,
    playerMaxConfidence: 100,
    introText:
      "Processamos centenas de pedidos por dia, tudo via boleto. Se quiser me convencer a mudar, vai ter que mostrar algo muito bom!",
    playerArguments: [
      {
        id: "conciliacao",
        name: "Conciliação Automática",
        text: "Chega de conferir boleto por boleto! A plataforma Cielo faz conciliação automática com seu sistema e aponta divergências na hora.",
        power: 65,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "recebimento_rapido",
        name: "Recebimento em D+1",
        text: "Com boleto você espera dias pela compensação. Com a Cielo, o valor cai na sua conta no dia seguinte!",
        power: 55,
      },
      {
        id: "antifraude",
        name: "Anti-fraude Avançado",
        text: "Nosso sistema anti-fraude analisa cada transação em milissegundos. Sem calotes nem chargebacks surpresa no seu fluxo.",
        power: 50,
      },
      {
        id: "mentira_descarada",
        name: "Prometer Taxa Zero",
        text: "Eu prometo que se você fechar, nunca vai pagar taxa nenhuma na vida!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Boleto não tem taxa de intermediário. Se migrar pra cartão, as taxas vão corroer minha margem!",
        power: 35,
      },
      {
        text: "Nossos fornecedores já estão acostumados com boleto. Mudar o processo vai gerar resistência interna.",
        power: 30,
      },
    ],
  },
  centrodepecas_ind_1: {
    id: "centrodepecas_ind_1",
    enemyName: "Estoquista Paulo",
    enemyKey: "npc_industrial2",
    enemyMaxResistance: 130,
    playerMaxConfidence: 100,
    introText:
      "Cada peça aqui tem rastreabilidade. Nada sai sem nota. Nossos clientes pagam no faturamento, mas já tivemos calotes.",
    playerArguments: [
      {
        id: "garantia_pagamento",
        name: "Garantia de Pagamento",
        text: "Com cartão de crédito, a Cielo garante o recebimento. Acabou o risco de calote no faturamento – a bandeira do cartão cobre!",
        power: 60,
        rhetoric: {
          question:
            "Tô achando legal a conversa... mas a mensalidade do aluguel hoje em dia pesa muito.",
          responses: [
            {
              textOption:
                "Dependendo do seu teto de faturamento, podemos isentar 100% do aluguel.",
              textPlayer: "O brilho nos olhos do cliente foi imediato!",
              type: "super",
            },
            {
              textOption:
                "A Cielo TEM opções de compra definitiva, como a Cielo ZIP.",
              textPlayer: "Uma ótima alternativa para driblar o aluguel.",
              type: "normal",
            },
            {
              textOption: "Tem que pagar pra ter qualidade, não tem jeito.",
              textPlayer: "Você pareceu muito arrogante...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "rastreio_integrado",
        name: "Rastreio Integrado à Venda",
        text: "A Cielo LIO pode ser integrada ao seu sistema de inventário: cada venda baixa automaticamente a peça do estoque.",
        power: 55,
        requiredProduct: "cielo_lio",
      },
      {
        id: "link_cobranca",
        name: "Link de Cobrança Seguro",
        text: "Venda à distância para outras filiais? Gere um Link de Pagamento Cielo com anti-fraude integrado e receba sem risco.",
        power: 45,
        requiredProduct: "cielo_link",
      },
      {
        id: "maquina_bonita",
        name: "Cor da Máquina",
        text: "Você sabia que a maquininha combina super bem com a decoração da sua loja?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Peças industriais custam milhares de reais. Se der chargeback, o prejuízo é enorme e a peça já saiu!",
        power: 35,
      },
      {
        text: "Nosso sistema de controle de estoque é fechado. Não sei se aceita integração externa.",
        power: 30,
      },
    ],
  },
  galpaomergulho_ind_1: {
    id: "galpaomergulho_ind_1",
    enemyName: "Gerente Denis",
    enemyKey: "npc_industrial",
    enemyMaxResistance: 150,
    playerMaxConfidence: 100,
    introText:
      "Processamos milhares de boletos todo mês, o sistema bancário atual nos atende bem. Se quiser me convencer a mudar, vai ter que mostrar algo muito bom!",
    playerArguments: [
      {
        id: "portal_web",
        name: "Portal Cielo Conciliador",
        text: "Nosso portal web concilia milhares de transações automaticamente com seu ERP. Sem planilha de Excel, sem erro humano!",
        power: 65,
        requiredProduct: "cielo_gestao",
        rhetoric: {
          question:
            "E como ficam as minhas margens se eu tiver que vender no crédito?",
          responses: [
            {
              textOption:
                "Oferecemos antecipação de recebíveis no mesmo dia e você pode embutir o custo na venda.",
              textPlayer: "A resposta foi matemática e certeira!",
              type: "super",
            },
            {
              textOption:
                "O crédito traz mais pessoas, acaba compensando a taxa.",
              textPlayer: "Argumento válido, mas superficial.",
              type: "normal",
            },
            {
              textOption:
                "Você só vai perder alguns centavos, não dói no bolso.",
              textPlayer:
                "O cliente detestou sua falta de sensibilidade financeira.",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "split_filiais",
        name: "Split entre Filiais",
        text: "Precisa dividir recebimento entre unidades? O Split de Pagamento Cielo distribui automaticamente cada valor para a conta certa.",
        power: 55,
      },
      {
        id: "checkout_b2b",
        name: "Checkout B2B Online",
        text: "Crie um portal de pedidos online com checkout Cielo integrado. Seus clientes compram direto, 24 horas, sem ligar pro comercial.",
        power: 50,
      },
      {
        id: "fazer_pressao",
        name: "Forçar a Venda",
        text: "Olha, bate a meta por mim, fecha logo esse negócio hoje, vai?",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Trocar de sistema financeiro numa fábrica desse porte pode paralisar a produção por dias.",
        power: 40,
      },
      {
        text: "Nosso volume justifica taxas especiais de boleto. As taxas de cartão seriam proibitivas nessa escala.",
        power: 35,
      },
    ],
  },
  secaohidraulica_ind_1: {
    id: "secaohidraulica_ind_1",
    enemyName: "Técnico Laerte",
    enemyKey: "npc_industrial2",
    enemyMaxResistance: 140,
    playerMaxConfidence: 100,
    introText:
      "As peças que uso são importadas e caras, preciso de controle total. Sua solução suporta parcelamento com valores altos?",
    playerArguments: [
      {
        id: "limite_alto",
        name: "Limites Transacionais Elevados",
        text: "A Cielo ajusta limites de transação para operações industriais de alto valor. Peças de R$50 mil? Sem bloqueio, sem burocracia!",
        power: 65,
        rhetoric: {
          question:
            "Tudo bem, a ideia é boa. Mas e o suporte? Da última vez que precisei, fiquei 3 dias parado.",
          responses: [
            {
              textOption:
                "A Cielo foca em troca de máquina expressa em até 24h em grandes polos.",
              textPlayer: "Você transmite muita segurança no suporte!",
              type: "super",
            },
            {
              textOption: "O suporte melhorou muito, confia.",
              textPlayer: "Você pareceu meio incerto...",
              type: "normal",
            },
            {
              textOption:
                "Bom, suporte a gente não controla muito quem atende, né?",
              textPlayer: "O cliente ficou decepcionado com a sinceridade...",
              type: "invalid",
            },
          ],
        },
      },
      {
        id: "antecipacao_industria",
        name: "Antecipação para Capital de Giro",
        text: "Peças importadas exigem pagamento adiantado ao fornecedor. Com a antecipação Cielo, você recebe hoje e paga o importador sem apertar o caixa!",
        power: 55,
        requiredProduct: "cielo_ante",
      },
      {
        id: "controle_manutencao",
        name: "Relatório de Manutenção por Venda",
        text: "No relatório Cielo Gestão, cada transação pode ser associada a uma ordem de serviço. Rastreabilidade total de peça por peça.",
        power: 50,
      },
      {
        id: "ofender_concorrente",
        name: "Xingar a Concorrência",
        text: "A concorrência que você usa é um lixo, a empresa deles vai falir mês que vem!",
        power: 0,
        type: "invalid",
      },
    ],
    items: [],
    enemyCounters: [
      {
        text: "Se o antifraude bloquear uma compra de peça importada, a linha de produção inteira para!",
        power: 40,
      },
      {
        text: "Parcelamento alto tem inadimplência alta. Quem garante que não vou ficar no prejuízo?",
        power: 30,
      },
    ],
  },
};

/**
 * Exportação consolidada para compatibilidade com o ProgressManager e NegotiationScene.
 */
export const negotiations = {
  ...hqNegotiations,
  ...cityNegotiations,
  ...farmNegotiations,
  ...beachNegotiations,
  ...industrialNegotiations,
};
