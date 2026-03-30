/**
 * @fileoverview Gerenciador de animações de personagens.
 * Cria e registra no cache do Phaser as animações de corrida (run)
 * e repouso (idle) de cada personagem.
 * @module managers/AnimationManager
 */

import Phaser from "phaser";

/**
 * Gera as animações de um personagem a partir do spritesheet,
 * evitando recriar animações que já estão no cache.
 */
export class AnimationManager {
  /**
   * Cria as animações de corrida e idle para todas as direções de um personagem.
   * Se as animações já existirem no cache, não faz nada.
   *
   * @param {Phaser.Scene} scene - Cena onde as animações serão registradas.
   * @param {string} characterKey - Identificador do personagem (ex: "amanda").
   */
  static createAnimations(scene, characterKey) {
    // Cada direção corresponde a uma linha no spritesheet.
    const directions = [
      { key: "side", row: 0 },
      { key: "up", row: 1 },
      { key: "down", row: 3 },
    ];

    directions.forEach((dir) => {
      const runKey = `${characterKey}-run-${dir.key}`;
      const idleKey = `${characterKey}-idle-${dir.key}`;

      // Verifica antes de criar a animação para evitar duplicatas no cache.
      if (!scene.anims.exists(runKey)) {
        scene.anims.create({
          key: runKey,
          // Cada direção ocupa 6 frames na linha correspondente.
          frames: scene.anims.generateFrameNumbers(`${characterKey}-run`, {
            start: dir.row * 6,
            end: dir.row * 6 + 5,
          }),
          frameRate: 12,
          repeat: -1,
        });
      }

      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          // Idle usa 4 frames por direção.
          frames: scene.anims.generateFrameNumbers(`${characterKey}-idle`, {
            start: dir.row * 6,
            end: dir.row * 6 + 3,
          }),
          frameRate: 6,
          repeat: -1,
        });
      }
    });
  }
}
