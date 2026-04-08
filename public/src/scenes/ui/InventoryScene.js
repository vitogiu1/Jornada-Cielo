import Phaser from "phaser";

export class InventoryScene extends Phaser.Scene {
  constructor() {
    super("InventoryScene");
  }

  /**
   * Recebe a cena de mapa que estava ativa antes de abrir o inventário,
   * para poder retornar a ela ao fechar.
   * @param {object} data - Dados passados pelo Scene.launch().
   */
  init(data) {
    this.returnScene = data.returnScene || "CityScene";
  }

  create() {
    this.scene.bringToTop();
    const { width, height } = this.scale;
    const isMobile = !this.sys.game.device.os.desktop;

    // Pausa a cena de mapa e o HUD enquanto o inventário estiver aberto.
    if (this.scene.isActive(this.returnScene)) {
      this.scene.pause(this.returnScene);
    }
    if (this.scene.isActive("PlayerHudScene")) {
      this.scene.pause("PlayerHudScene");
    }

    // Fundo escuro semi-transparente cobrindo a tela toda.
    this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0);

    // Dimensões do painel central do inventário.
    const panelW = isMobile ? width * 0.9 : Math.min(width * 0.6, 600);
    const panelH = isMobile ? height * 0.85 : Math.min(height * 0.7, 500);

    // Fundo e borda do painel.
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a2e, 0.95);
    panelBg.fillRoundedRect(
      width / 2 - panelW / 2,
      height / 2 - panelH / 2,
      panelW,
      panelH,
      16,
    );
    panelBg.lineStyle(3, 0x00adef, 1);
    panelBg.strokeRoundedRect(
      width / 2 - panelW / 2,
      height / 2 - panelH / 2,
      panelW,
      panelH,
      16,
    );

    // Título do painel.
    this.add
      .text(width / 2, height / 2 - panelH / 2 + 30, "🎒 SEU INVENTÁRIO", {
        fontFamily: "Arial",
        fontSize: isMobile ? "20px" : "28px",
        fontWeight: "bold",
        color: "#00adef",
      })
      .setOrigin(0.5);

    // Linha divisória abaixo do título.
    const lineY = height / 2 - panelH / 2 + 60;
    const line = this.add.graphics();
    line.lineStyle(2, 0x00adef, 0.5);
    line.beginPath();
    line.moveTo(width / 2 - panelW / 2 + 20, lineY);
    line.lineTo(width / 2 + panelW / 2 - 20, lineY);
    line.strokePath();

    // Botão de fechar no canto superior direito do painel.
    const closeX = width / 2 + panelW / 2 - 30;
    const closeY = height / 2 - panelH / 2 + 30;
    const closeBtn = this.add
      .text(closeX, closeY, "✖", {
        fontSize: "24px",
        color: "#ff5555",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Fecha o inventário ao clicar no X ou pressionar I/ESC.
    closeBtn.on("pointerdown", () => this.closeInventory());
    this.input.keyboard.on("keydown-I", () => this.closeInventory());
    this.input.keyboard.on("keydown-ESC", () => this.closeInventory());

    // Renderiza os itens do inventário dentro do painel.
    this.renderItems(width, height, panelW, panelH, isMobile);
  }

  /**
   * Lê o inventário do registry e exibe cada item em uma linha.
   * Se estiver vazio, exibe uma mensagem no centro do painel.
   */
  renderItems(width, height, panelW, panelH, isMobile) {
    // Ponto de partida da lista de itens.
    const startY = height / 2 - panelH / 2 + 90;
    const startX = width / 2 - panelW / 2 + (isMobile ? 20 : 40);
    const itemSpacing = isMobile ? 55 : 65;

    const inventory = this.registry.get("playerInventory") || [];

    // Exibe mensagem caso o inventário esteja vazio.
    if (inventory.length === 0) {
      this.add
        .text(
          width / 2,
          height / 2,
          "Sua mochila está vazia.\nRealize negociações para conseguir itens!",
          {
            fontFamily: "Courier New",
            fontSize: isMobile ? "14px" : "18px",
            color: "#8888aa",
            align: "center",
          },
        )
        .setOrigin(0.5);
      return;
    }

    // Cria um container para rolar os itens
    const listContainer = this.add.container(0, 0);

    // Exibe cada item com ícone, nome e descrição do efeito.
    inventory.forEach((item, index) => {
      // Espaça cada item verticalmente pelo índice.
      const y = startY + index * itemSpacing;

      // Define ícone, cor e texto de acordo com o tipo do item.
      const isHeal = item.type === "heal";
      const icon = isHeal ? "🙌" : "🤝";
      const color = isHeal ? "#00ff00" : "#00adef";
      const actionText = isHeal
        ? `Recupera +${item.power} de Confiança`
        : `Aumenta em ${item.power} a Confiança do Cliente`;

      // Nome do item.
      const title = this.add.text(startX, y, `${icon} ${item.name}`, {
        fontFamily: "Arial",
        fontSize: isMobile ? "16px" : "18px",
        fontWeight: "bold",
        color: color,
      });

      // Descrição do efeito do item.
      const desc = this.add.text(startX + 30, y + 20, actionText, {
        fontFamily: "Courier New",
        fontSize: isMobile ? "12px" : "14px",
        color: "#aaa",
      });

      listContainer.add([title, desc]);
    });

    // Cria máscara de recorte
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    const maskY = startY - 10;
    const maskH = panelH - (maskY - (height / 2 - panelH / 2)) - 20;
    maskShape.fillRect(width / 2 - panelW / 2, maskY, panelW, maskH);
    const mask = maskShape.createGeometryMask();
    listContainer.setMask(mask);

    // Lógica de Scroll e Arrastar
    const totalHeight = inventory.length * itemSpacing;
    const maxScroll = Math.max(0, totalHeight - maskH + 40);

    const hitZone = this.add
      .zone(width / 2, height / 2, panelW, panelH)
      .setInteractive();

    let currentY = 0;

    hitZone.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        currentY += pointer.y - pointer.prevPosition.y;
        currentY = Phaser.Math.Clamp(currentY, -maxScroll, 0);
        listContainer.y = currentY;
      }
    });

    hitZone.on("wheel", (pointer, deltaX, deltaY, deltaZ) => {
      currentY -= deltaY * 0.5;
      currentY = Phaser.Math.Clamp(currentY, -maxScroll, 0);
      listContainer.y = currentY;
    });
  }

  /** Retoma a cena de mapa e o HUD, depois encerra o inventário. */
  closeInventory() {
    if (this.scene.isPaused(this.returnScene)) {
      this.scene.resume(this.returnScene);
    }
    if (this.scene.isPaused("PlayerHudScene")) {
      this.scene.resume("PlayerHudScene");
    }
    this.scene.stop();
  }
}
