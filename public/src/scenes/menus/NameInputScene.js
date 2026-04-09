/**
 * @fileoverview Tela de Registro do Jogador.
 * Permite ao jogador inserir seu nome antes de prosseguir para a seleção do visual (avatar).
 * Este nome será usado por toda a UI do jogo.
 * @module scenes/menus/NameInputScene
 */

import Phaser from "phaser";

/**
 * Cena de registro de nome de jogador usando um input HTML nativo (DOM Element) via Phaser.
 * @extends Phaser.Scene
 */
export class NameInputScene extends Phaser.Scene {
  constructor() {
    super("NameInputScene");
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const isMobile = !this.sys.game.device.os.desktop;

    // Fundo escuro com partículas/glows herdado do modelo do SettingsScene
    this._buildBackground(width, height, cx);

    // Card principal
    const cardW = Math.min(width - 80, 500);
    const cardH = 320; // Aumentado de 260 para 320 para dar mais espaço
    const cardX = cx - cardW / 2;
    const cardY = (height - cardH) / 2;

    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0xffffff, 0.04);
    cardGfx.fillRoundedRect(cardX, cardY, cardW, cardH, 18);
    cardGfx.lineStyle(2, 0x00adef, 0.4);
    cardGfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 18);

    // Título (Ajustado para Y = 50)
    this.add
      .text(cx, cardY + 50, "BEM-VINDO(A)!", {
        fontFamily: "Arial",
        fontSize: isMobile ? "24px" : "32px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cardY + 100, "Como prefere ser chamado(a) na sua jornada?", {
        fontFamily: "Arial",
        fontSize: isMobile ? "14px" : "18px",
        color: "#aaccff",
      })
      .setOrigin(0.5)
      .setWordWrapWidth(cardW - 40)
      .setAlign("center");

    // Input HTML via DOM Element
    const inputCSS = `
      width: ${isMobile ? "240px" : "300px"};
      height: 45px;
      padding: 0 15px;
      font-size: 20px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      color: #ffffff;
      background-color: rgba(0, 0, 0, 0.4);
      border: 2px solid #00adef;
      border-radius: 8px;
      text-align: center;
      outline: none;
      box-shadow: 0 0 10px rgba(0, 173, 239, 0.2);
    `;

    // Input
    this.nameInput = this.add.dom(cx, cardY + 170, "input", inputCSS);
    this.nameInput.node.type = "text";
    this.nameInput.node.placeholder = "Seu Nome...";
    this.nameInput.node.maxLength = 15;
    this.nameInput.node.autocomplete = "off";

    // Tenta forçar o foco no input
    this.time.delayedCall(100, () => {
      this.nameInput.node.focus();
    });

    // Animação de brilho no input ao focar
    this.nameInput.node.addEventListener("focus", () => {
      this.nameInput.node.style.border = "2px solid #55ddff";
      this.nameInput.node.style.boxShadow = "0 0 15px rgba(85, 221, 255, 0.6)";
    });
    this.nameInput.node.addEventListener("blur", () => {
      this.nameInput.node.style.border = "2px solid #00adef";
      this.nameInput.node.style.boxShadow = "0 0 10px rgba(0, 173, 239, 0.2)";
    });

    // Suporte para a tecla "Enter"
    this.nameInput.node.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this._confirmName();
      }
    });

    // Botão de Avançar
    const btnW = 200;
    const btnH = 48;
    const btnY = cardY + 250;

    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x00adef, 0.8);
    btnGfx.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 24);
    btnGfx.lineStyle(2, 0x55ddff, 1);
    btnGfx.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 24);

    const btnText = this.add
      .text(cx, btnY, "AVANÇAR ➔", {
        fontFamily: "Arial",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const hitZone = this.add
      .rectangle(cx, btnY, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitZone.on("pointerdown", () => this._confirmName());

    // Efeito hover no botão
    hitZone.on("pointerover", () => btnGfx.setAlpha(0.8));
    hitZone.on("pointerout", () => btnGfx.setAlpha(1));
  }

  /** Cria o fundo escuro. */
  _buildBackground(w, h, cx) {
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1a2e, 0x0d1a2e, 0.95);
    bgGfx.fillRect(0, 0, w, h);

    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0x00adef, 0.08);
    glowGfx.fillCircle(cx, h / 2, 250);
  }

  /** Processa o nome digitado, salva no registry e avança para a seleção de visual. */
  _confirmName() {
    let name = this.nameInput.node.value.trim();

    // Bloqueia avanço se o campo estiver vazio
    if (name.length === 0) {
      this.nameInput.node.style.border = "2px solid #ff4444";
      this.nameInput.node.style.boxShadow = "0 0 15px rgba(255, 68, 68, 0.6)";
      
      try {
        const vol = this.registry.get("sfxVolume") ?? 0.7;
        this.sound.play("sfx_error", { volume: vol });
      } catch (e) {}

      // Efeito de tremor (shake) 
      const startX = this.nameInput.x;
      this.tweens.add({
        targets: this.nameInput,
        x: startX + 8,
        yoyo: true,
        repeat: 3,
        duration: 50,
        onComplete: () => {
          this.nameInput.x = startX;
        }
      });
      
      return; 
    }

    // Salva globalmente
    this.registry.set("playerName", name);

    // Desativa input virtual
    this.nameInput.node.blur();

    // Transição suave
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("CharacterSelectScene");
    });
  }
}
