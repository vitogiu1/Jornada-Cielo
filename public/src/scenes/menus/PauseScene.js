/**
 * @fileoverview Cena do Menu de Pausa.
 * Exibida como overlay sobre a cena de jogo atual.
 * @module scenes/menus/PauseScene
 */

import Phaser from "phaser";

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
    const { width, height } = this.scale;

    // Fundo semi-transparente com fade-in.
    const bg = this.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0);
    this.tweens.add({
      targets: bg,
      fillAlpha: 0.7,
      duration: 300,
    });

    // Título Central.
    const title = this.add
      .text(width / 2, height * 0.25, "PAUSA", {
        fontSize: "64px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: "+=20",
      duration: 500,
      ease: "Power2.easeOut",
    });

    // Botões.
    const buttonX = width / 2;
    const startY = height * 0.45;
    const spacing = 70;

    const options = [
      { text: "RETOMAR", action: () => this.resumeGame() },
      { text: "CONFIGURAÇÕES", action: () => this.openSettings() },
      { text: "MUNDOS", action: () => this.goToWorldSelector() },
      { text: "MENU", action: () => this.goToMainMenu() },
    ];

    options.forEach((opt, index) => {
      const btn = this.add
        .text(buttonX, startY + index * spacing, opt.text, {
          fontSize: "28px",
          fontFamily: "Arial",
          color: "#ffffff",
          backgroundColor: "#34495e",
          padding: { x: 40, y: 12 },
          fixedWidth: 350,
          align: "center",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0);

      // Animação de entrada escalonada.
      this.tweens.add({
        targets: btn,
        alpha: 1,
        y: "-=10",
        duration: 400,
        delay: 200 + index * 100,
        ease: "Back.easeOut",
      });

      // Hover effects.
      btn.on("pointerover", () => {
        btn.setBackgroundColor("#2ecc71");
        this.tweens.add({ targets: btn, scale: 1.05, duration: 200 });
      });

      btn.on("pointerout", () => {
        btn.setBackgroundColor("#34495e");
        this.tweens.add({ targets: btn, scale: 1, duration: 200 });
      });

      btn.on("pointerup", opt.action);
    });

    // Atalhos de teclado (ESC para despausar).
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // Oculta os HUDs enquanto o menu de pausa estiver aberto.
    this.toggleHUDs(false);
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
        } catch (e) {
          // Ignora cenas que já foram paradas.
        }
      }
    });
  }
}
