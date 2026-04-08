/**
 * @fileoverview HUD para dispositivos móveis.
 * Exibe um joystick virtual e botões de ação para telas touch.
 * Gráficos e lógica do Joystick e Botões gerados por IA.
 * @module scenes/MobileHudScene
 */

import Phaser from "phaser";

/**
 * Cena persistente que captura o input de toque e salva o estado
 * dos botões no registry global, para que outras cenas possam lê-lo.
 *
 * @extends Phaser.Scene
 */
export class MobileHudScene extends Phaser.Scene {
  constructor() {
    super({ key: "MobileHudScene", active: false });
  }

  create() {
    // Estado inicial dos botões, compartilhado via registry global.
    this.buttons = {
      up: false,
      down: false,
      left: false,
      right: false,
      forceX: 0,
      forceY: 0,
      interact: false,
    };
    this.registry.set("mobileButtons", this.buttons);

    const { width, height } = this.scale;

    // ── Joystick ──
    const baseRadius = 60;
    const thumbRadius = 25;
    const margin = 30;

    // Posição do joystick no canto inferior esquerdo.
    const baseX = margin + baseRadius;
    const baseY = height - margin - baseRadius;

    // Círculo de fundo do joystick.
    this.joyBase = this.add
      .circle(baseX, baseY, baseRadius, 0x0a0a1a, 0.85)
      .setStrokeStyle(3, 0x00adef, 0.9)
      .setDepth(99999);

    // Círculo menor arrastável (thumb) do joystick.
    this.joyThumb = this.add
      .circle(baseX, baseY, thumbRadius, 0x00adef, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.8)
      .setDepth(100000)
      .setInteractive({ draggable: true });

    // Posição central do joystick, usada como referência para calcular a direção.
    this.joyOrigin = { x: baseX, y: baseY };

    // Distância máxima que o thumb pode se afastar do centro.
    this.maxDist = baseRadius - thumbRadius * 0.5;

    // Ao arrastar o thumb, limita o movimento ao raio do joystick.
    this.input.on("drag", (_pointer, _obj, dragX, dragY) => {
      const dx = dragX - this.joyOrigin.x;
      const dy = dragY - this.joyOrigin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > this.maxDist) {
        // Mantém o thumb na borda do joystick caso passe do limite.
        const angle = Math.atan2(dy, dx);
        this.joyThumb.x = this.joyOrigin.x + Math.cos(angle) * this.maxDist;
        this.joyThumb.y = this.joyOrigin.y + Math.sin(angle) * this.maxDist;
      } else {
        this.joyThumb.x = dragX;
        this.joyThumb.y = dragY;
      }

      this._updateButtons();
    });

    // Ao soltar o thumb, anima de volta ao centro e reseta os botões.
    this.input.on("dragend", () => {
      this.tweens.add({
        targets: this.joyThumb,
        x: this.joyOrigin.x,
        y: this.joyOrigin.y,
        duration: 100,
        ease: "Power2",
      });
      this._resetButtons();
    });

    // ── Botão de Interação ──
    const btnRadius = 35;
    const btnX = width - margin - btnRadius;
    const btnY = height - margin - btnRadius;

    // Círculo do botão de interação (canto inferior direito).
    this.interactBase = this.add
      .circle(btnX, btnY, btnRadius, 0x3366ff, 0.5)
      .setStrokeStyle(3, 0xffffff, 0.7)
      .setDepth(99999)
      .setInteractive();

    // Ícone do botão de interação.
    this.interactLabel = this.add
      .text(btnX, btnY, "💬", { fontSize: "28px" })
      .setOrigin(0.5)
      .setDepth(100000);

    // Começa oculto e só aparece quando há um NPC próximo para interagir.
    this.interactBase.setVisible(false);
    this.interactLabel.setVisible(false);

    // Ao pressionar, ativa o flag de interação e aumenta o botão levemente.
    this.interactBase.on("pointerdown", () => {
      this.buttons.interact = true;
      this.interactBase.setAlpha(0.9);
      this.interactBase.setScale(1.15);
      this.interactLabel.setScale(1.15);
    });

    // Ao soltar ou sair do botão, volta ao visual padrão.
    const releaseInteract = () => {
      this.interactBase.setAlpha(0.5);
      this.interactBase.setScale(1.0);
      this.interactLabel.setScale(1.0);
      // O flag `interact` permanece true por 1 frame para que o NPCManager consiga lê-lo.
    };

    this.interactBase.on("pointerup", releaseInteract);
    this.interactBase.on("pointerout", releaseInteract);

    // ── Botão de Inventário ──
    const invBtnRadius = 26;
    const invBtnX = width - invBtnRadius - margin;
    const invBtnY = height / 2; // Posicionado no meio da alturada tela à direita.

    // Círculo do botão de inventário.
    this.invBase = this.add
      .circle(invBtnX, invBtnY, invBtnRadius, 0x0a0a1a, 0.85)
      .setStrokeStyle(3, 0x00adef, 0.9)
      .setDepth(99999)
      .setInteractive({ useHandCursor: true });

    // Ícone do botão de inventário.
    this.invLabel = this.add
      .text(invBtnX, invBtnY - 2, "🎒", { fontSize: "26px" })
      .setOrigin(0.5)
      .setDepth(100000);

    // Ao pressionar, abre o inventário se não estiver em negociação ou diálogo.
    this.invBase.on("pointerdown", () => {
      this.invBase.setAlpha(1);
      this.invBase.setScale(1.15);
      this.invLabel.setScale(1.15);

      if (
        !this.scene.isActive("InventoryScene") &&
        !this.scene.isActive("NegotiationScene") &&
        !this.scene.isActive("DialogScene")
      ) {
        // Encontra qual cena de mapa está ativa para passar como retorno.
        const scenes = [
          "CityScene",
          "FarmScene",
          "CieloScene",
          "BeachScene",
          "IndustrialScene",
        ];
        let activeBgScene = scenes.find((key) =>
          this.scene.manager.isActive(key),
        );
        if (activeBgScene) {
          this.scene.launch("InventoryScene", { returnScene: activeBgScene });
        }
      }
    });

    // Ao soltar o botão, volta ao visual padrão.
    const releaseInv = () => {
      this.invBase.setAlpha(0.8);
      this.invBase.setScale(1.0);
      this.invLabel.setScale(1.0);
    };

    this.invBase.on("pointerup", releaseInv);
    this.invBase.on("pointerout", releaseInv);

    // Escuta mudanças no registry global (ex: quando um NPC fica próximo).
    this.registry.events.on("changedata", this._onRegistryChange, this);

    // Remove o listener ao encerrar a cena para evitar vazamento/sobrecarga de memória.
    this.events.on("shutdown", () => {
      this.registry.events.off("changedata", this._onRegistryChange, this);
    });
  }

  /**
   * Reage a mudanças no registry global.
   * Exibe ou oculta o botão de interação conforme o flag `canInteract`.
   * @param {any} parent - Quem emitiu o evento (o registry).
   * @param {string} key - Chave que foi alterada.
   * @param {any} data - Novo valor da chave.
   */
  _onRegistryChange(parent, key, data) {
    if (key === "canInteract") {
      if (data) {
        // Mostra o botão com fade-in se estava oculto.
        if (!this.interactBase.visible) {
          this.interactBase.setVisible(true).setAlpha(0);
          this.interactLabel.setVisible(true).setAlpha(0);
          this.tweens.add({
            targets: [this.interactBase, this.interactLabel],
            alpha: { from: 0, to: 1 },
            duration: 250,
          });
          this.interactBase.setAlpha(0.5);
        }
      } else {
        // Oculta o botão quando não há interação disponível.
        this.interactBase.setVisible(false);
        this.interactLabel.setVisible(false);
      }
    }
  }

  /**
   * Converte a posição do thumb em direção e força do movimento.
   * Usa uma dead zone central para tentar evitar movimentos acidentais.
   */
  _updateButtons() {
    const dx = this.joyThumb.x - this.joyOrigin.x;
    const dy = this.joyThumb.y - this.joyOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Ignora movimentos pequenos dentro da dead zone.
    const deadZone = this.maxDist * 0.2;
    if (dist < deadZone) {
      this._resetButtons();
      return;
    }

    // Calcula a força proporcional à distância (entre 0 e 1).
    const force = Math.min(dist / this.maxDist, 1);

    // Normaliza a direção dividindo pelo tamanho do vetor.
    const nx = dx / dist;
    const ny = dy / dist;

    // Salva a força e direção nos botões para passar para o registry global.
    this.buttons.forceX = nx * force;
    this.buttons.forceY = ny * force;
    this.buttons.left = nx < -0.3;
    this.buttons.right = nx > 0.3;
    this.buttons.up = ny < -0.3;
    this.buttons.down = ny > 0.3;
  }

  /** Reseta todos os estados direcionais do joystick. */
  _resetButtons() {
    this.buttons.up = false;
    this.buttons.down = false;
    this.buttons.left = false;
    this.buttons.right = false;
    this.buttons.forceX = 0;
    this.buttons.forceY = 0;
  }
}
