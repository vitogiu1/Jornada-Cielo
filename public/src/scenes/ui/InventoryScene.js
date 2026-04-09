/**
 * @fileoverview Cena de Inventário do Jogador.
 * Exibe itens possuídos
 * @module scenes/menus/InventoryScene
 */

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

    // Fundo escurecido suave
    const bg = this.add
      .rectangle(0, 0, width, height, 0x070b19, 0)
      .setOrigin(0);
    this.tweens.add({ targets: bg, fillAlpha: 0.85, duration: 300 });

    // Brilho decorativo no fundo (Glow)
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0x0055ff, 0.1);
    glowGfx.fillCircle(width / 2, height / 2, 280);

    // PAINEL CENTRAL
    const panelW = isMobile ? width * 0.9 : Math.min(width * 0.6, 600);
    const panelH = isMobile ? height * 0.85 : Math.min(height * 0.75, 550);
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    const panelContainer = this.add.container(0, 0);
    panelContainer.setAlpha(0); // Inicia invisível para animar

    const panelBg = this.add.graphics();
    // Fundo azul escuro profundo para dar alto contraste com textos brancos/claros
    panelBg.fillStyle(0x0a1128, 0.9);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 24);
    panelBg.lineStyle(2, 0x00adef, 0.5);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 24);
    panelContainer.add(panelBg);

    // Pilha de fontes que garante o carregamento de Emojis em PC e Mobile
    const emojiFontStack =
      '"Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

    // Título do painel com sombra/brilho
    const title = this.add
      .text(width / 2, panelY + 40, "INVENTÁRIO", {
        fontFamily: emojiFontStack,
        fontSize: isMobile ? "22px" : "28px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "rgba(0, 173, 239, 0.8)", 15, true, false);
    panelContainer.add(title);

    // Linha divisória
    const lineY = panelY + 80;
    const line = this.add.graphics();
    line.lineStyle(1.5, 0x00adef, 0.4);
    line.lineBetween(panelX + 30, lineY, panelX + panelW - 30, lineY);
    panelContainer.add(line);

    // BOTÃO DE FECHAR
    const closeX = panelX + panelW - 35;
    const closeY = panelY + 40;

    // Fundo circular do botão
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0xffffff, 0.1);
    closeBg.fillCircle(closeX, closeY, 18);

    // Usando "X" padrão em negrito para garantir que nunca falhe a renderização
    const closeBtn = this.add
      .text(closeX, closeY, "X", {
        fontFamily: "Arial, sans-serif",
        fontStyle: "bold",
        fontSize: "18px",
        color: "#ff5555",
      })
      .setOrigin(0.5);

    // HitZone interativa que cobre o círculo inteiro
    const closeZone = this.add
      .circle(closeX, closeY, 20, 0, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(10); // Garante que fique acima da rolagem

    closeZone.on("pointerover", () => {
      closeBg.clear();
      closeBg.fillStyle(0xff5555, 0.3); // Fica mais visível no hover
      closeBg.fillCircle(closeX, closeY, 18);
      this.tweens.add({
        targets: closeBtn,
        scale: 1.2,
        color: "#ffffff",
        duration: 150,
      });
    });
    closeZone.on("pointerout", () => {
      closeBg.clear();
      closeBg.fillStyle(0xffffff, 0.1);
      closeBg.fillCircle(closeX, closeY, 18);
      this.tweens.add({
        targets: closeBtn,
        scale: 1,
        color: "#ff5555",
        duration: 150,
      });
    });
    closeZone.on("pointerdown", () => this.closeInventory());

    panelContainer.add([closeBg, closeBtn]);

    // Animação de entrada do painel
    this.tweens.add({
      targets: panelContainer,
      alpha: 1,
      y: "-=10",
      duration: 400,
      ease: "Power2.easeOut",
    });

    // Teclado
    this.input.keyboard.on("keydown-I", () => this.closeInventory());
    this.input.keyboard.on("keydown-ESC", () => this.closeInventory());

    // Renderiza os itens do inventário
    this.renderItems(
      width,
      height,
      panelW,
      panelH,
      panelX,
      panelY,
      isMobile,
      emojiFontStack,
    );
  }

  /**
   * Lê o inventário do registry e exibe cada item dentro de "cards".
   */
  renderItems(
    width,
    height,
    panelW,
    panelH,
    panelX,
    panelY,
    isMobile,
    emojiFontStack,
  ) {
    const startY = panelY + 110;
    const startX = panelX + (isMobile ? 25 : 40);
    const rowW = panelW - (isMobile ? 50 : 80);
    const itemSpacing = isMobile ? 70 : 80;

    const inventory = this.registry.get("playerInventory") || [];

    // Mensagem de inventário vazio
    if (inventory.length === 0) {
      this.add
        .text(
          width / 2,
          height / 2 + 20,
          "Sua mochila está vazia.\nRealize negociações para conseguir itens!",
          {
            fontFamily: "Arial, sans-serif",
            fontSize: isMobile ? "14px" : "16px",
            color: "#aaccff",
            align: "center",
            fontStyle: "italic",
          },
        )
        .setOrigin(0.5);
      return;
    }

    // Cria um container para rolar os itens
    const listContainer = this.add.container(0, 0);

    inventory.forEach((item, index) => {
      const y = startY + index * itemSpacing;
      const isHeal = item.type === "heal";

      // Ícones alternativos
      const icon = isHeal ? "❤️" : "🤝";
      const color = isHeal ? "#2ecc71" : "#00adef";
      const actionText = isHeal
        ? `Recupera +${item.power} de Confiança`
        : `Aumenta em ${item.power} a Confiança do Cliente`;

      // Mini-card de fundo para cada item
      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x000000, 0.4); // Fundo bem escuro
      itemBg.fillRoundedRect(startX, y - 20, rowW, 60, 12);
      itemBg.lineStyle(1, 0x446688, 0.4); // Borda suave
      itemBg.strokeRoundedRect(startX, y - 20, rowW, 60, 12);

      // Ícone decorativo redondo ao lado do título
      const iconBg = this.add.graphics();
      iconBg.fillStyle(0xffffff, 0.08);
      iconBg.fillCircle(startX + 30, y + 10, 20);

      const iconText = this.add
        .text(startX + 30, y + 10, icon, {
          fontFamily: emojiFontStack,
          fontSize: "18px",
        })
        .setOrigin(0.5);

      // Nome do item
      const title = this.add.text(startX + 65, y - 5, item.name.toUpperCase(), {
        fontFamily: "Arial, sans-serif",
        fontSize: isMobile ? "15px" : "17px",
        fontWeight: "bold",
        color: color,
        letterSpacing: 1,
      });

      // Descrição do efeito
      const desc = this.add.text(startX + 65, y + 15, actionText, {
        fontFamily: "Arial, sans-serif",
        fontSize: isMobile ? "12px" : "13px",
        color: "#e0e0e0",
      });

      listContainer.add([itemBg, iconBg, iconText, title, desc]);
    });

    // Cria máscara de recorte para o scroll não vazar do painel
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    const maskY = panelY + 82;
    const maskH = panelH - 100;
    maskShape.fillRect(panelX, maskY, panelW, maskH);
    const mask = maskShape.createGeometryMask();
    listContainer.setMask(mask);

    // Lógica de Scroll e Arrastar
    const totalHeight = inventory.length * itemSpacing;
    const maxScroll = Math.max(0, totalHeight - maskH + 20);

    const hitZone = this.add
      .zone(width / 2, height / 2 + 40, panelW, maskH)
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

  /** Retoma a cena de mapa e o HUD, com um fade out suave antes de destruir. */
  closeInventory() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (this.scene.isPaused(this.returnScene)) {
        this.scene.resume(this.returnScene);
      }
      if (this.scene.isPaused("PlayerHudScene")) {
        this.scene.resume("PlayerHudScene");
      }
      this.scene.stop();
    });
  }
}
