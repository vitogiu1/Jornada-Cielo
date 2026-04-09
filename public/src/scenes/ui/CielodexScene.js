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
 * @type {Object.<string, CieloProduct>}
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
 * @class CielodexScene
 * @extends {Phaser.Scene}
 */
export class CielodexScene extends Phaser.Scene {
  constructor() {
    super("CielodexScene");
  }

  init(data) {
    this.returnScene = data.returnScene || "CityScene";
    this.currentTab = "products";
  }

  create() {
    this.scene.bringToTop();
    const { width, height } = this.scale;
    const isMobile = !this.sys.game.device.os.desktop;

    if (this.scene.isActive(this.returnScene))
      this.scene.pause(this.returnScene);
    if (this.scene.isActive("PlayerHudScene"))
      this.scene.pause("PlayerHudScene");

    // Efeito de fade in suave ao abrir a Dex
    this.cameras.main.fadeIn(250, 0, 0, 0);

    // Fundo semitransparente escuro com leve blur (simulado por opacidade)
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const panelW = isMobile ? width * 0.95 : Math.min(width * 0.7, 700);
    const panelH = isMobile ? height * 0.9 : Math.min(height * 0.8, 550);
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    // Fundo do Painel principal (Dark UI)
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a192f, 0.98); // Azul escuro sólido
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 20);

    // Borda Glow da Cielo
    panelBg.lineStyle(3, 0x00adef, 0.8);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 20);

    // Header Título
    this.add
      .text(width / 2, panelY + 30, "📘 CIELO DEX", {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: isMobile ? "24px" : "32px",
        fontWeight: "900",
        color: "#ffffff",
        shadow: { fill: true, blur: 10, color: "#00adef", offsetY: 2 },
      })
      .setOrigin(0.5);

    // Linha divisória do header
    const line = this.add.graphics();
    line.lineStyle(1, 0x1a365d, 1);
    line.beginPath();
    line.moveTo(panelX + 30, panelY + 65);
    line.lineTo(panelX + panelW - 30, panelY + 65);
    line.strokePath();

    this.createTabs(panelX, panelY, panelW, isMobile);

    // Botão de Fechar Estilizado
    const closeBtnBg = this.add
      .circle(panelX + panelW - 25, panelY + 25, 16, 0x112240)
      .setInteractive({ useHandCursor: true });
    const closeBtnTxt = this.add
      .text(panelX + panelW - 25, panelY + 25, "✖", {
        fontSize: "16px",
        color: "#ff5555",
        fontWeight: "bold",
      })
      .setOrigin(0.5);

    // Hover effect no botão de fechar
    closeBtnBg.on("pointerover", () => {
      closeBtnBg.fillColor = 0x1a365d;
      closeBtnTxt.setColor("#ff7777");
    });
    closeBtnBg.on("pointerout", () => {
      closeBtnBg.fillColor = 0x112240;
      closeBtnTxt.setColor("#ff5555");
    });
    closeBtnBg.on("pointerdown", () => this.closeDex());

    this.input.keyboard.on("keydown-P", () => this.closeDex());
    this.input.keyboard.on("keydown-ESC", () => this.closeDex());

    this.contentContainer = this.add.container(0, 0);
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    const maskY = panelY + 125; // Abaixado para caber o novo design de abas
    const maskH = panelH - 145;
    maskShape.fillRoundedRect(panelX, maskY, panelW, maskH, 10);
    this.contentContainer.setMask(maskShape.createGeometryMask());

    this.hitZone = this.add
      .zone(width / 2, panelY + 125 + maskH / 2, panelW, maskH)
      .setInteractive();

    let currentYOffset = 0;

    this.hitZone.on("pointermove", (pointer) => {
      if (pointer.isDown && this.maxScroll > 0) {
        currentYOffset += pointer.y - pointer.prevPosition.y;
        currentYOffset = Phaser.Math.Clamp(currentYOffset, -this.maxScroll, 0);
        this.contentContainer.y = currentYOffset;
      }
    });

    this.hitZone.on("wheel", (pointer, deltaX, deltaY, deltaZ) => {
      if (this.maxScroll > 0) {
        currentYOffset -= deltaY * 0.6; // Scroll um pouco mais rápido e suave
        currentYOffset = Phaser.Math.Clamp(currentYOffset, -this.maxScroll, 0);
        this.contentContainer.y = currentYOffset;
      }
    });

    this.renderCurrentTab(panelX, panelY, panelW, panelH, isMobile);
  }

  createTabs(panelX, panelY, panelW, isMobile) {
    const tabY = panelY + 95;
    const tabW = panelW * 0.4;
    const tabH = 38;
    const fontSize = isMobile ? "14px" : "16px";
    const fontFam = "'Segoe UI', Tahoma, sans-serif";

    // Aba 1: Produtos Cielo
    this.tabProdBg = this.add.graphics();
    this.drawTabBg(
      this.tabProdBg,
      panelX + panelW * 0.25 - tabW / 2,
      tabY - tabH / 2,
      tabW,
      tabH,
      true,
    );

    this.tabProdZone = this.add
      .zone(panelX + panelW * 0.25, tabY, tabW, tabH)
      .setInteractive({ useHandCursor: true });

    this.tabProdTxt = this.add
      .text(panelX + panelW * 0.25, tabY, "📦 Produtos Cielo", {
        fontSize,
        fontFamily: fontFam,
        color: "#ffffff",
        fontWeight: "bold",
      })
      .setOrigin(0.5);

    // Aba 2: Clientes Convertidos
    this.tabCustBg = this.add.graphics();
    this.drawTabBg(
      this.tabCustBg,
      panelX + panelW * 0.75 - tabW / 2,
      tabY - tabH / 2,
      tabW,
      tabH,
      false,
    );

    this.tabCustZone = this.add
      .zone(panelX + panelW * 0.75, tabY, tabW, tabH)
      .setInteractive({ useHandCursor: true });

    this.tabCustTxt = this.add
      .text(panelX + panelW * 0.75, tabY, "🤝 Clientes Convertidos", {
        fontSize,
        fontFamily: fontFam,
        color: "#64748b",
        fontWeight: "normal",
      })
      .setOrigin(0.5);

    // Lógica de clique
    this.tabProdZone.on("pointerdown", () =>
      this.switchTab("products", panelX, panelY, panelW, tabW, tabH),
    );
    this.tabCustZone.on("pointerdown", () =>
      this.switchTab("customers", panelX, panelY, panelW, tabW, tabH),
    );
  }

  drawTabBg(graphics, x, y, w, h, isActive) {
    graphics.clear();
    if (isActive) {
      graphics.fillStyle(0x00adef, 0.2); // Fundo azul claro
      graphics.fillRoundedRect(x, y, w, h, 8);
      graphics.lineStyle(2, 0x00adef, 1); // Borda forte
      graphics.strokeRoundedRect(x, y, w, h, 8);
    } else {
      graphics.fillStyle(0x112240, 0.6); // Fundo inativo
      graphics.fillRoundedRect(x, y, w, h, 8);
      graphics.lineStyle(1, 0x1e293b, 1);
      graphics.strokeRoundedRect(x, y, w, h, 8);
    }
  }

  switchTab(tab, panelX, panelY, panelW, tabW, tabH) {
    if (this.currentTab === tab) return;
    this.currentTab = tab;

    if (tab === "products") {
      this.drawTabBg(
        this.tabProdBg,
        panelX + panelW * 0.25 - tabW / 2,
        panelY + 95 - tabH / 2,
        tabW,
        tabH,
        true,
      );
      this.tabProdTxt.setColor("#ffffff").setFontStyle("bold");

      this.drawTabBg(
        this.tabCustBg,
        panelX + panelW * 0.75 - tabW / 2,
        panelY + 95 - tabH / 2,
        tabW,
        tabH,
        false,
      );
      this.tabCustTxt.setColor("#64748b").setFontStyle("normal");
    } else {
      this.drawTabBg(
        this.tabCustBg,
        panelX + panelW * 0.75 - tabW / 2,
        panelY + 95 - tabH / 2,
        tabW,
        tabH,
        true,
      );
      this.tabCustTxt.setColor("#ffffff").setFontStyle("bold");

      this.drawTabBg(
        this.tabProdBg,
        panelX + panelW * 0.25 - tabW / 2,
        panelY + 95 - tabH / 2,
        tabW,
        tabH,
        false,
      );
      this.tabProdTxt.setColor("#64748b").setFontStyle("normal");
    }

    this.contentContainer.y = 0;

    const { width, height } = this.scale;
    const isMobile = !this.sys.game.device.os.desktop;
    const pW = isMobile ? width * 0.95 : Math.min(width * 0.7, 700);
    const pH = isMobile ? height * 0.9 : Math.min(height * 0.8, 550);

    this.renderCurrentTab(
      width / 2 - pW / 2,
      height / 2 - pH / 2,
      pW,
      pH,
      isMobile,
    );
  }

  renderCurrentTab(panelX, panelY, panelW, panelH, isMobile) {
    this.contentContainer.removeAll(true);

    const startX = panelX + (isMobile ? 15 : 30);
    const startY = panelY + 130;
    const cardSpacing = 90; // Aumentado para acomodar o design de Card
    const cardW = panelW - (isMobile ? 30 : 60);
    const fontFam = "'Segoe UI', Tahoma, sans-serif";

    let itemsCount = 0;

    if (this.currentTab === "products") {
      const owned = this.registry.get("cieloProducts") || [];

      if (owned.length === 0) {
        const emptyMsg = this.add
          .text(
            panelX + panelW / 2,
            startY + 60,
            "Nenhum Produto Cielo desbloqueado ainda.\nVá explorar o mundo!",
            {
              color: "#64748b",
              align: "center",
              fontSize: "16px",
              fontFamily: fontFam,
            },
          )
          .setOrigin(0.5);
        this.contentContainer.add(emptyMsg);
      } else {
        owned.forEach((pid, index) => {
          const p = cieloCatalog[pid];
          if (!p) return;
          const y = startY + index * cardSpacing;

          // Background do Card
          const cardBg = this.add.graphics();
          cardBg.fillStyle(0x112240, 1);
          cardBg.fillRoundedRect(startX, y, cardW, 80, 12);
          cardBg.lineStyle(1, 0x1e293b, 1);
          cardBg.strokeRoundedRect(startX, y, cardW, 80, 12);

          // Ícone Container (Círculo)
          const iconCircle = this.add.circle(startX + 35, y + 40, 24, 0x0a192f);
          const icon = this.add
            .text(startX + 35, y + 40, p.icon, { fontSize: "20px" })
            .setOrigin(0.5);

          const title = this.add.text(startX + 75, y + 15, p.name, {
            fontSize: "18px",
            color: "#00adef",
            fontWeight: "bold",
            fontFamily: fontFam,
          });

          const desc = this.add.text(startX + 75, y + 42, p.desc, {
            fontSize: "13px",
            color: "#94a3b8",
            fontFamily: fontFam,
            wordWrap: { width: cardW - 90 },
          });

          this.contentContainer.add([cardBg, iconCircle, icon, title, desc]);
        });
        itemsCount = owned.length;
      }
    } else {
      const customers = this.registry.get("conqueredCustomers") || [];

      if (customers.length === 0) {
        const emptyMsg = this.add
          .text(
            panelX + panelW / 2,
            startY + 60,
            "Nenhum cliente convertido ainda.\nRealize negociações e feche negócios!",
            {
              color: "#64748b",
              align: "center",
              fontSize: "16px",
              fontFamily: fontFam,
            },
          )
          .setOrigin(0.5);
        this.contentContainer.add(emptyMsg);
      } else {
        customers.forEach((cust, index) => {
          const y = startY + index * cardSpacing;

          const isSuper = cust.satisfactionRate >= 80;
          const isOk = cust.satisfactionRate >= 50;

          const emoji = isSuper ? "😍" : isOk ? "🙂" : "🤨";
          const color = isSuper ? 0x10b981 : isOk ? 0xf59e0b : 0xef4444; // Verde, Amarelo, Vermelho modernos
          const colorHex = isSuper ? "#10b981" : isOk ? "#f59e0b" : "#ef4444";

          // Background do Card
          const cardBg = this.add.graphics();
          cardBg.fillStyle(0x112240, 1);
          cardBg.fillRoundedRect(startX, y, cardW, 80, 12);

          // Borda sutil de acordo com a satisfação
          cardBg.lineStyle(1, color, 0.3);
          cardBg.strokeRoundedRect(startX, y, cardW, 80, 12);

          const icon = this.add
            .text(startX + 35, y + 40, emoji, { fontSize: "28px" })
            .setOrigin(0.5);

          const title = this.add.text(startX + 75, y + 15, cust.name, {
            fontSize: "18px",
            color: "#f8fafc",
            fontWeight: "bold",
            fontFamily: fontFam,
          });

          const desc = this.add.text(
            startX + 75,
            y + 42,
            "Negociação fechada com sucesso.",
            {
              fontSize: "13px",
              color: "#94a3b8",
              fontFamily: fontFam,
            },
          );

          // Barra de Satisfação Visual (Progress Bar)
          const barW = isMobile ? 80 : 120;
          const barX = startX + cardW - barW - 20;

          const barBg = this.add.graphics();
          barBg.fillStyle(0x0a192f, 1);
          barBg.fillRoundedRect(barX, y + 42, barW, 10, 5);

          const barFill = this.add.graphics();
          barFill.fillStyle(color, 1);
          barFill.fillRoundedRect(
            barX,
            y + 42,
            barW * (cust.satisfactionRate / 100),
            10,
            5,
          );

          const rateText = this.add
            .text(barX + barW, y + 15, `${cust.satisfactionRate}% Sat.`, {
              fontSize: "15px",
              color: colorHex,
              fontWeight: "bold",
              fontFamily: fontFam,
            })
            .setOrigin(1, 0);

          this.contentContainer.add([
            cardBg,
            icon,
            title,
            desc,
            barBg,
            barFill,
            rateText,
          ]);
        });
        itemsCount = customers.length;
      }
    }

    const totalHeight = itemsCount * cardSpacing;
    const visibleH = panelH - 145;
    this.maxScroll = Math.max(0, totalHeight - visibleH + 20);
  }

  closeDex() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        if (this.scene.isPaused(this.returnScene))
          this.scene.resume(this.returnScene);

        if (this.scene.isPaused("PlayerHudScene"))
          this.scene.resume("PlayerHudScene");

        this.scene.stop();
      },
    );
  }
}
