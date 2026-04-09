/**
 * @fileoverview Entidade do jogador.
 * Controla movimento, animações e colisão do personagem principal.
 * @module entities/Player
 */

import Phaser from "phaser";
import { GameConfig } from "../core/config";

/**
 * Sprite do jogador com física Arcade e suporte a teclado e joystick mobile.
 * @extends Phaser.Physics.Arcade.Sprite
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene - Cena onde o jogador será criado.
   * @param {number} x - Posição X inicial.
   * @param {number} y - Posição Y inicial.
   * @param {string} characterKey - Chave do personagem (padrão: "amanda").
   * @param {object} options - Opções extras (ex: scale).
   */
  constructor(scene, x, y, characterKey = "amanda", options = {}) {
    super(scene, x, y, `${characterKey}-idle`);

    this.scene = scene;
    this.characterKey = characterKey;

    // Guarda a última direção para manter o idle correto ao parar.
    this.lastDir = "down";

    // Adiciona o jogador à cena e à física.
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const playerScale = options.scale ?? 3;
    this.setScale(playerScale).setDepth(10);

    // Hitbox pequena nos pés para colisão mais natural com o cenário.
    this.setFootHitbox(10, 8);

    // Registra as teclas de seta e WASD.
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Toca a animação idle inicial.
    this.play(`${this.characterKey}-idle-down`);

    // Prepara o som de caminhada
    if (scene.sound.get("sfx_walk") === null && scene.cache.audio.exists("sfx_walk")) {
      // Garantir que a key existe apenas como teste preventivo
    }
    
    // Configura o áudio para loop, deixando em pausa de inicio
    this.walkSound = scene.sound.add("sfx_walk", { loop: true });

    // Evita som fantasma/vazamento quando a cena for pausada ou colocada para dormir
    scene.events.on("pause", () => {
      if (this.walkSound && this.walkSound.isPlaying) this.walkSound.pause();
    });
    scene.events.on("sleep", () => {
      if (this.walkSound && this.walkSound.isPlaying) this.walkSound.pause();
    });

    // Limpa o som para evitar vazamento de memória e sobreposição
    // quando o player/cena for destruído (ex: trocar de mapa).
    this.on("destroy", () => {
      if (this.walkSound) {
        this.walkSound.stop();
        this.walkSound.destroy();
      }
    });
  }

  /** Troca o sprite do personagem para outro characterKey. */
  changeCharacter(newKey) {
    this.characterKey = newKey;
    this.setTexture(`${newKey}-idle`);
  }

  /**
   * Ajusta a hitbox para cobrir apenas os pés do jogador.
   * @param {number} bodyWidth - Largura da hitbox.
   * @param {number} bodyHeight - Altura da hitbox.
   */
  setFootHitbox(bodyWidth = 10, bodyHeight = 8) {
    if (!this.body) return;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset((this.width - bodyWidth) / 2, this.height - bodyHeight);
  }

  /**
   * Atualiza movimento e animação a cada frame.
   * @returns {boolean} true se o jogador está em movimento.
   */
  update() {
    if (!this.body) return false;

    this.setVelocity(0);
    let moving = false;

    // Velocidade ajustada proporcionalmente à escala do sprite.
    const speed = GameConfig.playerSpeed * (Math.abs(this.scaleX) / 2);

    // Lê os botões do joystick mobile do registry global.
    const mob = this.scene.registry.get("mobileButtons") || {};

    // Verifica se o joystick está sendo usado com valores analógicos.
    const hasJoystick =
      mob.forceX !== undefined && (mob.forceX !== 0 || mob.forceY !== 0);

    if (hasJoystick) {
      // Movimento analógico: aplica a força do joystick diretamente na velocidade.
      this.setVelocityX(mob.forceX * speed);
      this.setVelocityY(mob.forceY * speed);
      moving = true;

      // Define a direção da animação pela componente dominante do joystick.
      const ax = Math.abs(mob.forceX);
      const ay = Math.abs(mob.forceY);
      if (ax > ay) {
        this.lastDir = "side";
        this.setFlipX(mob.forceX < 0); // Espelha o sprite ao mover para a esquerda.
      } else if (mob.forceY < 0) {
        this.lastDir = "up";
      } else {
        this.lastDir = "down";
      }
    } else {
      // Movimento por teclado (setas ou WASD) ou botões booleanos do mobile.
      const left =
        this.cursors.left.isDown || mob.left || this.wasd.left.isDown;
      const right =
        this.cursors.right.isDown || mob.right || this.wasd.right.isDown;
      const up = this.cursors.up.isDown || mob.up || this.wasd.up.isDown;
      const down =
        this.cursors.down.isDown || mob.down || this.wasd.down.isDown;

      if (left) {
        this.setVelocityX(-speed);
        this.lastDir = "side";
        this.setFlipX(true);
        moving = true;
      } else if (right) {
        this.setVelocityX(speed);
        this.lastDir = "side";
        this.setFlipX(false);
        moving = true;
      }

      if (up) {
        this.setVelocityY(-speed);
        if (!moving) this.lastDir = "up";
        moving = true;
      } else if (down) {
        this.setVelocityY(speed);
        if (!moving) this.lastDir = "down";
        moving = true;
      }
    }

    if (hasJoystick) {
      // O joystick já é normalizado radialmente; limita ao máximo de velocidade.
      const vel = this.body.velocity;
      if (vel.length() > speed) vel.normalize().scale(speed);
    } else {
      // Normaliza o vetor de velocidade para evitar que a diagonal seja 41% mais rápida.
      this.body.velocity.normalize().scale(speed);
    }

    // Toca a animação de corrida ou idle na direção atual.
    const animState = moving ? "run" : "idle";
    this.play(`${this.characterKey}-${animState}-${this.lastDir}`, true);

    // Sincroniza o som de andar com o movimento
    const sfxVolume = this.scene.registry.get("sfxVolume") ?? 0.7;
    // O som de pé é geralmente alto, então podemos atenuar pouca coisa do volume global
    this.walkSound.setVolume(sfxVolume * 0.8);

    if (moving) {
      if (!this.walkSound.isPlaying) {
        this.walkSound.play();
      }
    } else {
      if (this.walkSound.isPlaying) {
        this.walkSound.pause();
      }
    }

    return moving;
  }
}
