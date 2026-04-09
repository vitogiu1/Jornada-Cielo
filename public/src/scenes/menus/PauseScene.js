/**
 * @fileoverview Cena do Menu de Pausa.
 * Exibida como overlay sobre a cena de jogo atual.
 * O design segue o padrão Glassmorphism moderno.
 * @module scenes/menus/PauseScene
 */

import Phaser from "phaser";
import { SaveSystem } from "../../utils/SaveSystem";

/**
 * Cena de pausa.
 * @extends Phaser.Scene
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  /**
   * Recebe a chave da cena que disparou a pausa.
   * @param {object} data - { returnScene: string }
   */
  init(data) {
    this.returnScene = data.returnScene;
  }

  create() {
    this.scene.bringToTop();
    const { width: w, height: h } = this.scale;
    const cx = w / 2;
    const isMobile = !this.sys.game.device.os.desktop;

    // Fundo escurecido suave
    const bg = this.add.rectangle(0, 0, w, h, 0x070b19, 0).setOrigin(0);
    this.tweens.add({
      targets: bg,
      fillAlpha: 0.85,
      duration: 400,
    });

    // Círculos brilhantes decorativos (efeito glow sutil).
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0x0055ff, 0.08);
    glowGfx.fillCircle(cx, h * 0.5, 250);

    // ==========================================
    // CARD CENTRAL (GLASSMORPHISM)
    // ==========================================
    const cardW = isMobile ? w * 0.85 : 400;
    const cardH = 460;
    const cardY = h / 2;

    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0xffffff, 0.04);
    cardGfx.fillRoundedRect(
      cx - cardW / 2,
      cardY - cardH / 2,
      cardW,
      cardH,
      24,
    );
    cardGfx.lineStyle(2, 0x00adef, 0.3);
    cardGfx.strokeRoundedRect(
      cx - cardW / 2,
      cardY - cardH / 2,
      cardW,
      cardH,
      24,
    );
    cardGfx.setAlpha(0);

    this.tweens.add({
      targets: cardGfx,
      alpha: 1,
      duration: 400,
      ease: "Power2.easeOut",
    });

    // ==========================================
    // TÍTULO
    // ==========================================
    const title = this.add
      .text(cx, cardY - cardH / 2 + 50, "⏸ PAUSA", {
        fontFamily: "monospace",
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "rgba(0, 173, 239, 0.6)", 15, true, false)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: "+=10",
      duration: 500,
      ease: "Back.easeOut",
    });

    // ==========================================
    // BOTÕES
    // ==========================================
    const startY = cardY - cardH / 2 + 130;
    const spacing = 65;
    const btnW = cardW - 80;
    const btnH = 48;

    const options = [
      {
        text: "RETOMAR",
        color: 0x2ecc71,
        hover: 0x27ae60,
        action: () => this.resumeGame(),
      },
      {
        text: "SALVAR JOGO",
        color: 0x00adef,
        hover: 0x0088cc,
        action: () => this.saveGame(),
      },
      {
        text: "CONFIGURAÇÕES",
        color: 0x34495e,
        hover: 0x455a64,
        action: () => this.openSettings(),
      },
      {
        text: "MAPA DO MUNDO",
        color: 0x34495e,
        hover: 0x455a64,
        action: () => this.goToWorldSelector(),
      },
      {
        text: "SAIR PARA O MENU",
        color: 0xe74c3c,
        hover: 0xc0392b,
        action: () => this.goToMainMenu(),
      },
    ];

    options.forEach((opt, index) => {
      const btnContainer = this._createModernButton(
        cx,
        startY + index * spacing,
        btnW,
        btnH,
        opt.text,
        opt.color,
        opt.hover,
        opt.action,
      );

      // Esconde o botão para a animação de entrada escalonada
      btnContainer.setAlpha(0);
      btnContainer.y += 20;

      this.tweens.add({
        targets: btnContainer,
        alpha: 1,
        y: "-=20",
        duration: 400,
        delay: 150 + index * 80,
        ease: "Back.easeOut",
      });
    });

    // Atalhos de teclado (ESC para despausar).
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // Oculta os HUDs enquanto o menu de pausa estiver aberto.
    this.toggleHUDs(false);
  }

  /**
   * Helper para criar botões arredondados modernos contidos num Phaser.Container.
   */
  _createModernButton(
    x,
    y,
    width,
    height,
    text,
    defaultColor,
    hoverColor,
    onClickCallback,
  ) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    const draw = (color) => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    };
    draw(defaultColor);

    const txt = this.add
      .text(0, 0, text, {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const zone = this.add
      .rectangle(0, 0, width, height, 0, 0)
      .setInteractive({ useHandCursor: true });

    zone.on("pointerover", () => {
      draw(hoverColor);
      this.tweens.add({ targets: container, scale: 1.03, duration: 150 });
    });
    zone.on("pointerout", () => {
      draw(defaultColor);
      this.tweens.add({ targets: container, scale: 1, duration: 150 });
    });
    zone.on("pointerdown", onClickCallback);

    container.add([bg, txt, zone]);
    return container;
  }

  /** Altera a visibilidade/estado das cenas de HUD. */
  toggleHUDs(visible) {
    const huds = ["PlayerHudScene", "MobileHudScene"];
    huds.forEach((key) => {
      if (this.scene.isActive(key) || this.scene.isPaused(key)) {
        if (visible) {
          this.scene.resume(key);
          this.scene.setVisible(true, key);
        } else {
          this.scene.pause(key);
          this.scene.setVisible(false, key);
        }
      }
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.resumeGame();
    }
  }

  /** Retoma a cena de jogo original. */
  resumeGame() {
    this.toggleHUDs(true);
    this.scene.resume(this.returnScene);
    this.scene.stop();
  }

  /** Volta para o seletor de mundos. */
  goToWorldSelector() {
    this.stopAllGameplay();
    this.scene.start("WorldMapScene");
  }

  /** Abre a cena de configurações (overlay). */
  openSettings() {
    if (this.scene.isActive("SettingsScene")) return;

    // Lança a cena de configurações sobre o menu de pausa.
    this.scene.launch("SettingsScene", { returnScene: "PauseScene" });
    // Pausa esta cena para evitar interações com os botões por baixo.
    this.scene.pause();
  }

  /** Salva o progresso atual do jogador no slot ativo e exibe um Toast estilizado. */
  saveGame() {
    SaveSystem.saveCurrentState(this);

    const { width, height } = this.scale;
    const toastW = 200;
    const toastH = 45;

    const toastContainer = this.add
      .container(width / 2, height * 0.15)
      .setDepth(500);

    const bg = this.add.graphics();
    bg.fillStyle(0x2ecc71, 0.9);
    bg.fillRoundedRect(-toastW / 2, -toastH / 2, toastW, toastH, 20);
    bg.lineStyle(2, 0xffffff, 0.8);
    bg.strokeRoundedRect(-toastW / 2, -toastH / 2, toastW, toastH, 20);

    const txt = this.add
      .text(0, 0, "✔ JOGO SALVO!", {
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    toastContainer.add([bg, txt]);
    toastContainer.setAlpha(0);
    toastContainer.y -= 20;

    // Animação de entrada e saída do Toast
    this.tweens.add({
      targets: toastContainer,
      alpha: 1,
      y: "+=20",
      duration: 300,
      ease: "Back.easeOut",
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          this.tweens.add({
            targets: toastContainer,
            alpha: 0,
            y: "-=10",
            duration: 300,
            onComplete: () => toastContainer.destroy(),
          });
        });
      },
    });
  }

  /** Retorna ao menu principal. */
  goToMainMenu() {
    // Para todas as cenas de overlay/HUD
    this.stopAllGameplay(true);

    // Suspende a cena de jogo (torna invisível e garante pausa)
    if (this.returnScene) {
      const scene = this.scene.get(this.returnScene);
      if (scene) {
        scene.scene.pause();
        scene.scene.setVisible(false);
      }
    }

    this.scene.start("MenuScene");
  }

  /** Interrompe as cenas de jogabilidade ativas. */
  stopAllGameplay(keepMap = false) {
    const scenesToStop = [
      "PlayerHudScene",
      "MobileHudScene",
      "InventoryScene",
      "NegotiationScene",
      "SettingsScene",
      "PauseScene",
    ];

    if (!keepMap && this.returnScene) {
      scenesToStop.push(this.returnScene);
    }

    scenesToStop.forEach((key) => {
      if (
        this.scene.isActive(key) ||
        this.scene.isPaused(key) ||
        this.scene.isSleeping(key)
      ) {
        try {
          this.scene.stop(key);
        } catch (e) {}
      }
    });
  }
}
