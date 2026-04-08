import Phaser from "phaser";

/**
 * @typedef {Object} CieloProduct
 * @property {string} name - Nome do produto.
 * @property {string} icon - Emoji usado como ícone do produto.
 * @property {string} desc - Breve descrição do produto.
 */

/**
 * Catálogo fixo de produtos Cielo que o jogador pode destrancar.
 * Funciona como um dicionário onde a chave é o ID do produto.
 * * @type {Object.<string, CieloProduct>}
 */
export const cieloCatalog = {
  cielo_lio: {
    name: "Cielo Lio",
    icon: "📱",
    desc: "Plataforma de gestão integrada com apps fiscais.",
  },
  cielo_tap: {
    name: "Cielo Tap",
    icon: "📲",
    desc: "Transforma o celular em maquininha via NFC.",
  },
  cielo_farol: {
    name: "Cielo Farol",
    icon: "📊",
    desc: "Plataforma de inteligência de dados comparativa.",
  },
  cielo_zip: {
    name: "Cielo ZIP",
    icon: "🔵",
    desc: "Máquina com mensalidade zero dependendo do volume.",
  },
  cielo_ante: {
    name: "Antecipação de Recebíveis",
    icon: "💵",
    desc: "Receba hoje o que foi vendido parcelado.",
  },
  cielo_qr: {
    name: "QR Code Pay",
    icon: "🔳",
    desc: "Pagamento instantâneo via QR Code na máquina.",
  },
  cielo_link: {
    name: "Link de Pagamento",
    icon: "🔗",
    desc: "Venda pelas redes sociais ou WhatsApp facilmente.",
  },
  cielo_ecomm: {
    name: "API E-Commerce",
    icon: "🛒",
    desc: "Integração transparente de checkout para lojas virtuais.",
  },
  cielo_promo: {
    name: "Cielo Promo",
    icon: "🎁",
    desc: "Criação de promoções e cupons direto na maquininha.",
  },
  cielo_gestao: {
    name: "Cielo Gestão",
    icon: "📈",
    desc: "App para acompanhar vendas e fluxo de caixa em tempo real.",
  },
  cielo_conver: {
    name: "Conversor de Moedas",
    icon: "💱",
    desc: "Permite pagamentos internacionais com a moeda de origem.",
  },
};

/**
 * Cena responsável por exibir o "Cielo Dex", uma interface estilo Pokédex.
 * Mostra os produtos desbloqueados e os clientes convertidos pelo jogador.
 * * @class CielodexScene
 * @extends {Phaser.Scene}
 */
export class CielodexScene extends Phaser.Scene {
  constructor() {
    super("CielodexScene");
  }

  /**
   * Inicializa a cena com os dados passados.
   * * @param {Object} data - Dados passados ao chamar a cena.
   * @param {string} [data.returnScene="CityScene"] - Nome da cena para a qual retornar ao fechar o Dex.
   */
  init(data) {
    this.returnScene = data.returnScene || "CityScene";
    this.currentTab = "products"; // Inicia na aba de produtos ('products' ou 'customers')
  }

  /**
   * Método de ciclo de vida do Phaser responsável por criar os elementos visuais.
   */
  create() {
    // Garante que a cena apareça sobre as outras
    this.scene.bringToTop();
    const { width, height } = this.scale;
    const isMobile = !this.sys.game.device.os.desktop;

    // Pausa as cenas que ficaram no fundo
    if (this.scene.isActive(this.returnScene))
      this.scene.pause(this.returnScene);
    if (this.scene.isActive("PlayerHudScene"))
      this.scene.pause("PlayerHudScene");

    // Fundo semitransparente escuro
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Dimensões dinâmicas do painel baseadas no dispositivo
    const panelW = isMobile ? width * 0.95 : Math.min(width * 0.7, 700);
    const panelH = isMobile ? height * 0.9 : Math.min(height * 0.8, 550);
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    // Fundo do Painel principal
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a192f, 1);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 16);
    panelBg.lineStyle(2, 0x00adef, 1);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 16);

    // Título Central Superior
    this.add
      .text(width / 2, panelY + 25, "📘 CIELO DEX", {
        fontFamily: "Arial",
        fontSize: isMobile ? "22px" : "28px",
        fontWeight: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Cria as abas de navegação
    this.createTabs(panelX, panelY, panelW, isMobile);

    // Botão de fechar (X)
    const closeBtn = this.add
      .text(panelX + panelW - 30, panelY + 25, "✖", {
        fontSize: "24px",
        color: "#ff5555",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Eventos para fechar o Dex (Clique, tecla P ou ESC)
    closeBtn.on("pointerdown", () => this.closeDex());
    this.input.keyboard.on("keydown-P", () => this.closeDex());
    this.input.keyboard.on("keydown-ESC", () => this.closeDex());

    // Container de conteúdo e máscara para permitir rolagem (scroll) sem vazar do painel
    this.contentContainer = this.add.container(0, 0);
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    const maskY = panelY + 110;
    const maskH = panelH - 120;
    maskShape.fillRect(panelX, maskY, panelW, maskH);
    this.contentContainer.setMask(maskShape.createGeometryMask());

    // Zona interativa para capturar gestos de scroll (mouse drag e roda do mouse)
    this.hitZone = this.add
      .zone(width / 2, height / 2 + 50, panelW, maskH)
      .setInteractive();

    let currentYOffset = 0;

    // Scroll por arraste (touch/mouse)
    this.hitZone.on("pointermove", (pointer) => {
      if (pointer.isDown && this.maxScroll > 0) {
        currentYOffset += pointer.y - pointer.prevPosition.y;
        currentYOffset = Phaser.Math.Clamp(currentYOffset, -this.maxScroll, 0);
        this.contentContainer.y = currentYOffset;
      }
    });

    // Scroll por roda do mouse
    this.hitZone.on("wheel", (pointer, deltaX, deltaY, deltaZ) => {
      if (this.maxScroll > 0) {
        currentYOffset -= deltaY * 0.5;
        currentYOffset = Phaser.Math.Clamp(currentYOffset, -this.maxScroll, 0);
        this.contentContainer.y = currentYOffset;
      }
    });

    // Renderiza o conteúdo inicial da aba selecionada
    this.renderCurrentTab(panelX, panelY, panelW, panelH, isMobile);
  }

  /**
   * Desenha os botões das abas "Produtos" e "Clientes".
   * * @param {number} panelX - Posição X do painel.
   * @param {number} panelY - Posição Y do painel.
   * @param {number} panelW - Largura do painel.
   * @param {boolean} isMobile - Flag indicando se o dispositivo é móvel.
   */
  createTabs(panelX, panelY, panelW, isMobile) {
    const tabY = panelY + 70;
    const fontSize = isMobile ? "14px" : "16px";

    // Aba 1: Produtos Cielo
    this.tabProdBg = this.add
      .rectangle(panelX + panelW * 0.25, tabY, panelW * 0.5 - 20, 35, 0x00adef)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tabProdTxt = this.add
      .text(panelX + panelW * 0.25, tabY, "Produtos Cielo", {
        fontSize,
        color: "#ffffff",
        fontWeight: "bold",
      })
      .setOrigin(0.5);

    // Aba 2: Clientes Convertidos
    this.tabCustBg = this.add
      .rectangle(panelX + panelW * 0.75, tabY, panelW * 0.5 - 20, 35, 0x1a2e4c)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tabCustTxt = this.add
      .text(panelX + panelW * 0.75, tabY, "Clientes Convertidos", {
        fontSize,
        color: "#88aaff",
      })
      .setOrigin(0.5);

    // Adiciona interatividade nas abas
    this.tabProdBg.on("pointerdown", () => this.switchTab("products"));
    this.tabCustBg.on("pointerdown", () => this.switchTab("customers"));
  }

  /**
   * Alterna visualmente e logicamente entre as abas.
   * * @param {string} tab - Nome da aba alvo ('products' ou 'customers').
   */
  switchTab(tab) {
    if (this.currentTab === tab) return; // Evita re-renderização se já estiver na aba
    this.currentTab = tab;

    // Atualiza o estilo dos botões dependendo da aba ativa
    if (tab === "products") {
      this.tabProdBg.fillColor = 0x00adef;
      this.tabProdTxt.setColor("#ffffff");
      this.tabCustBg.fillColor = 0x1a2e4c;
      this.tabCustTxt.setColor("#88aaff");
    } else {
      this.tabCustBg.fillColor = 0x00adef;
      this.tabCustTxt.setColor("#ffffff");
      this.tabProdBg.fillColor = 0x1a2e4c;
      this.tabProdTxt.setColor("#88aaff");
    }

    // Reseta o scroll ao trocar de aba
    this.contentContainer.y = 0;

    // Recalcula dimensões e re-renderiza o conteúdo
    const { width, height } = this.scale;
    const isMobile = !this.sys.game.device.os.desktop;
    const panelW = isMobile ? width * 0.95 : Math.min(width * 0.7, 700);
    const panelH = isMobile ? height * 0.9 : Math.min(height * 0.8, 550);
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    this.renderCurrentTab(panelX, panelY, panelW, panelH, isMobile);
  }

  /**
   * Lê os dados do jogador (Registry) e constrói a lista de itens da aba atual.
   * * @param {number} panelX - Posição X do painel.
   * @param {number} panelY - Posição Y do painel.
   * @param {number} panelW - Largura do painel.
   * @param {number} panelH - Altura do painel.
   * @param {boolean} isMobile - Flag indicando se o dispositivo é móvel.
   */
  renderCurrentTab(panelX, panelY, panelW, panelH, isMobile) {
    // Limpa o conteúdo anterior
    this.contentContainer.removeAll(true);

    const startX = panelX + (isMobile ? 15 : 30);
    const startY = panelY + 110;
    const itemSpacing = 70;

    let itemsCount = 0;

    if (this.currentTab === "products") {
      // Busca os produtos que o jogador possui no registro global
      const owned = this.registry.get("cieloProducts") || [];

      if (owned.length === 0) {
        // Mensagem de estado vazio
        const emptyMsg = this.add
          .text(
            panelX + panelW / 2,
            startY + 50,
            "Nenhum Produto Cielo desbloqueado ainda.\nVá explorar o mundo!",
            {
              color: "#8888aa",
              align: "center",
              fontSize: "16px",
              fontFamily: "Courier New",
            },
          )
          .setOrigin(0.5);
        this.contentContainer.add(emptyMsg);
      } else {
        // Lista os produtos desbloqueados
        owned.forEach((pid, index) => {
          const p = cieloCatalog[pid];
          if (!p) return;
          const y = startY + index * itemSpacing;

          const title = this.add.text(startX, y, `${p.icon} ${p.name}`, {
            fontSize: "18px",
            color: "#00adef",
            fontWeight: "bold",
          });

          const desc = this.add.text(startX + 35, y + 25, p.desc, {
            fontSize: "14px",
            color: "#cccccc",
            fontFamily: "Courier New",
          });

          this.contentContainer.add([title, desc]);
        });
        itemsCount = owned.length;
      }
    } else {
      // Busca os clientes convertidos no registro global
      const customers = this.registry.get("conqueredCustomers") || [];

      if (customers.length === 0) {
        // Mensagem de estado vazio
        const emptyMsg = this.add
          .text(
            panelX + panelW / 2,
            startY + 50,
            "Nenhum cliente convertido ainda.\nRealize negociações!",
            {
              color: "#8888aa",
              align: "center",
              fontSize: "16px",
              fontFamily: "Courier New",
            },
          )
          .setOrigin(0.5);
        this.contentContainer.add(emptyMsg);
      } else {
        // Lista os clientes
        customers.forEach((cust, index) => {
          const y = startY + index * itemSpacing;

          // Define o emoji e a cor baseado na taxa de satisfação
          const emoji =
            cust.satisfactionRate >= 80
              ? "😍"
              : cust.satisfactionRate >= 50
                ? "🙂"
                : "🤨";
          const color =
            cust.satisfactionRate >= 80
              ? "#00ff00"
              : cust.satisfactionRate >= 50
                ? "#ffff00"
                : "#ffaa00";

          const title = this.add.text(startX, y, `${emoji} ${cust.name}`, {
            fontSize: "18px",
            color: "#ffffff",
            fontWeight: "bold",
          });

          const rateText = this.add
            .text(panelX + panelW - 30, y, `${cust.satisfactionRate}%`, {
              fontSize: "18px",
              color: color,
              fontWeight: "bold",
            })
            .setOrigin(1, 0);

          const desc = this.add.text(
            startX + 35,
            y + 25,
            "Negociação fechada com sucesso.",
            { fontSize: "14px", color: "#cccccc", fontFamily: "Courier New" },
          );

          this.contentContainer.add([title, rateText, desc]);
        });
        itemsCount = customers.length;
      }
    }

    // Calcula a rolagem (scroll) máxima baseada na quantidade de itens renderizados
    const totalHeight = itemsCount * itemSpacing;
    const visibleH = panelH - 120;
    this.maxScroll = Math.max(0, totalHeight - visibleH + 40);
  }

  /**
   * Finaliza a cena do Dex e retoma (resume) as cenas do jogo e HUD.
   */
  closeDex() {
    if (this.scene.isPaused(this.returnScene))
      this.scene.resume(this.returnScene);

    if (this.scene.isPaused("PlayerHudScene"))
      this.scene.resume("PlayerHudScene");

    this.scene.stop();
  }
}
