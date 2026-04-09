/**
 * @fileoverview Tela de seleção de personagem.
 * Exibe um grid com os personagens disponíveis e inicia o jogo com o escolhido.
 * @module scenes/CharacterSelectScene
 */

import Phaser from "phaser";
import { AnimationManager } from "../../managers/AnimationManager";
import { SaveSystem } from "../../utils/SaveSystem";

/**
 * Cena de seleção de personagem.
 * @extends Phaser.Scene
 */
export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super("CharacterSelectScene");
  }

  create() {
    const { width, height } = this.scale;

    // Verifica se é mobile para ajustar o layout.
    const isMobile = !this.sys.game.device.os.desktop;

    // Fundo escuro para destacar os personagens.
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Título da tela, adaptado para mobile.
    const titleText = "ESCOLHA SEU VISUAL";
    this.add
      .text(width / 2, isMobile ? 50 : 80, titleText, {
        fontSize: isMobile ? "24px" : "32px",
        fill: "#ffffff",
        fontFamily: "Arial",
        fontWeight: "bold",
      })
      .setOrigin(0.5);

    // Lista de personagens disponíveis.
    const characters = [
      { key: "amanda", name: "Amanda" },
      { key: "amelia", name: "Amélia" },
      { key: "thiago", name: "Thiago" },
      { key: "alan", name: "Alan" },
      { key: "ingrid", name: "Ingrid" },
    ];

    // Mobile mostra 2 colunas; desktop mostra todos na mesma linha.
    const cols = isMobile ? 2 : characters.length;
    const cellWidth = width / (cols + 1);
    const cellHeight = isMobile ? 160 : 0;
    const startY = isMobile ? height * 0.3 : height / 2;

    characters.forEach((char, index) => {
      // Calcula a posição do card no grid.
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = cellWidth * (col + 1);
      const y = startY + row * cellHeight;

      // Cria as animações do personagem antes de exibir o sprite.
      AnimationManager.createAnimations(this, char.key);

      const baseScale = isMobile ? 3.5 : 4;

      // Sprite do personagem, clicável.
      const charSprite = this.add
        .sprite(x, y, `${char.key}-idle`)
        .setScale(baseScale)
        .setInteractive({ useHandCursor: true });

      charSprite.play(`${char.key}-idle-down`);

      // Ao clicar, aplica um tint azul e inicia a transição.
      charSprite.on("pointerdown", () => {
        charSprite.setTint(0x00adef);
        this.handleSelection(char.key);
      });

      // Hover só no desktop: aumenta o sprite e troca para animação de corrida.
      if (!isMobile) {
        charSprite.on("pointerover", () => {
          charSprite.setScale(baseScale + 1);
          charSprite.play(`${char.key}-run-down`);
        });

        charSprite.on("pointerout", () => {
          charSprite.setScale(baseScale);
          charSprite.play(`${char.key}-idle-down`);
        });
      }
    });
  }

  /** Inicia a transição para o jogo com o personagem escolhido. */
  handleSelection(charKey) {
    // Desativa o input para evitar cliques duplos durante a transição.
    this.input.enabled = false;

    const { width, height } = this.scale;

    // Overlay azul para o efeito de flash na transição.
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x00adef)
      .setOrigin(0)
      .setDepth(2000000)
      .setAlpha(0);

    // Anima o overlay e depois faz o fade-out da câmera antes de trocar de cena.
    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 300,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          // Salva a escolha de personagem no registry e grava o primeiro save
          this.registry.set("playerSprite", charKey);
          SaveSystem.saveCurrentState(this);
          this.scene.start("CieloScene", { character: charKey });
        });
      },
    });
  }
}
