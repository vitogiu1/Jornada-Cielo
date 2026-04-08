/**
 * @fileoverview Entidade NPC (personagem não jogável).
 * Sprite estático com colisão que aguarda no mapa para interagir com o jogador.
 * @module entities/NPC
 */

import Phaser from "phaser";

/**
 * NPC parado no mapa que o jogador pode se aproximar e conversar.
 * @extends Phaser.Physics.Arcade.Sprite
 */
export class NPC extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} characterKey - Ex: "alan", "amelia", "thiago", "ingrid".
   * @param {object} npcData - Dados do NPC: { id, name, dialogs[] }.
   * @param {object} options - Opções opcionais: { scale, interactionRadius }.
   */
  constructor(scene, x, y, characterKey, npcData, options = {}) {
    super(scene, x, y, `${characterKey}-idle`);

    this.characterKey = characterKey;
    this.npcData = npcData;

    // Distância máxima para o jogador poder interagir com este NPC.
    this.interactionRadius = options.interactionRadius ?? 50;

    scene.add.existing(this);

    // Corpo estático: o NPC não se move nem é empurrado pelo jogador.
    scene.physics.add.existing(this, true);

    this.setScale(options.scale ?? 2).setDepth(10);
    this._applyFootHitbox();

    // Inicia a animação idle imediatamente se ela já existir no cache.
    const idleKey = `${characterKey}-idle-down`;
    if (scene.anims.exists(idleKey)) this.play(idleKey, true);
  }

  // ── PRIVADO ──

  /** Ajusta a hitbox para cobrir apenas os pés do NPC, levando em conta a escala. */
  _applyFootHitbox() {
    if (!this.body) return;

    const scale = Math.abs(this.scaleX) || 1;

    // Hitbox cobre 70% da largura e 55% da altura do sprite escalado.
    const bw = Math.round(this.width * scale * 0.7);
    const bh = Math.round(this.height * scale * 0.55);
    this.body.setSize(bw, bh);

    // Centraliza horizontalmente e alinha ao terço inferior do sprite.
    this.body.setOffset(
      (this.width - bw / scale) / 2,
      this.height - bh / scale,
    );
  }

  // ── API PÚBLICA ──

  /** Retorna true se o jogador está dentro do raio de interação do NPC. */
  isPlayerNear(player) {
    return (
      Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) <=
      this.interactionRadius
    );
  }
}
