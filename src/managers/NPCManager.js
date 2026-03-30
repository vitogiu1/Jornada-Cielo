/**
 * @fileoverview Gerenciador central de interações de NPCs.
 * Popula o mundo com personagens, detecta a proximidade do jogador
 * e abre janelas de diálogo quando ele se aproxima.
 * @module managers/NPCManager
 */

import { NPC } from "../entities/NPC";
import { DialogManager } from "./DialogManager";
import { AnimationManager } from "./AnimationManager";

/**
 * Centraliza o controle dos NPCs da cena.
 * Em vez de cada NPC observar o jogador individualmente,
 * este gerenciador cuida dos cálculos de proximidade e das interações de diálogo.
 */
export class NPCManager {
  /**
   * @param {Phaser.Scene} scene - Cena que vai hospedar os NPCs.
   */
  constructor(scene) {
    this.scene = scene;
    /** @type {NPC[]} */
    this.npcs = [];
    this.dialogUI = new DialogManager(scene);
    this._player = null;
    this._nearestNPC = null;
    this._keyE = null;
    // Guarda o estado anterior da tecla para detectar apenas o momento do aperto.
    this._ePrev = false;
  }

  // ── CRIAÇÃO ──

  /**
   * Instancia os NPCs na cena com base em uma lista de dados,
   * e cria as animações de sprite necessárias.
   *
   * @param {object[]} npcDataList - Lista de dados dos NPCs (posição, sprite, diálogo, etc.).
   * @param {number} mapX - Offset X do mapa.
   * @param {number} mapY - Offset Y do mapa.
   * @param {object} options - Opções extras (ex: escala).
   */
  create(npcDataList, mapX, mapY, options = {}) {
    const animsCreated = new Set();

    for (const data of npcDataList) {
      // Cria as animações do personagem apenas uma vez, mesmo que haja NPCs repetidos.
      if (!animsCreated.has(data.characterKey)) {
        AnimationManager.createAnimations(this.scene, data.characterKey);
        animsCreated.add(data.characterKey);
      }

      this.npcs.push(
        new NPC(
          this.scene,
          mapX + data.x,
          mapY + data.y,
          data.characterKey,
          data,
          options,
        ),
      );
    }
  }

  // ── INTERAÇÃO ──

  /**
   * Vincula o jogador ao sistema de NPCs:
   * registra a tecla E e adiciona colisão física.
   *
   * @param {Phaser.Physics.Arcade.Sprite} player - Sprite do jogador.
   */
  setupInteraction(player) {
    this._player = player;
    this._keyE = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );

    // Impede o jogador de atravessar os NPCs.
    this.scene.physics.add.collider(player, this.npcs);
  }

  // ── LOOP ──

  /**
   * Executado a cada frame. Detecta o NPC mais próximo,
   * verifica a tecla de interação e atualiza a UI.
   */
  update() {
    if (!this._player) return;

    // 1. Encontra o NPC mais próximo dentro do raio de interação.
    this._updateNearest();

    // 2. Verifica se o jogador pressionou E (ou botão mobile) para interagir.
    this._handleKeyE();

    // 3. Atualiza o prompt e o diálogo na tela.
    this._updateUI();
  }

  // ── MÉTODOS PRIVADOS ──

  /**
   * Percorre todos os NPCs e atualiza qual é o mais próximo do jogador,
   * considerando o raio de interação de cada um.
   */
  _updateNearest() {
    let nearest = null;
    let minDist = Infinity;

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this._player.x,
        this._player.y,
        npc.x,
        npc.y,
      );
      if (dist <= npc.interactionRadius && dist < minDist) {
        minDist = dist;
        nearest = npc;
      }
    }

    this._nearestNPC = nearest;
  }

  /**
   * Detecta o aperto da tecla E (ou botão mobile) e abre/avança o diálogo.
   * Usa edge-trigger para reagir apenas no momento em que a tecla é pressionada,
   * evitando disparar múltiplas vezes por frame enquanto ela fica segurada.
   */
  _handleKeyE() {
    if (!this._keyE) return;
    const down = this._keyE.isDown;

    // Lê o botão de interação do mobile e consome a flag para evitar repetição.
    const mob = this.scene.registry.get("mobileButtons") || {};
    const mobileInteract = mob.interact === true;
    if (mobileInteract) mob.interact = false;

    // Dispara apenas na transição de solto → pressionado, ou no toque mobile.
    const triggered = (down && !this._ePrev) || mobileInteract;

    if (triggered) {
      if (this.dialogUI.isOpen) {
        this.dialogUI.advance();
      } else if (this._nearestNPC) {
        this.dialogUI.open(this._nearestNPC);
      }
    }

    this._ePrev = down;
  }

  /**
   * Atualiza o prompt de interação e o diálogo na tela.
   * Se o diálogo estiver aberto, só atualiza a escala.
   * Caso contrário, mostra ou oculta o prompt dependendo da proximidade com um NPC.
   */
  _updateUI() {
    if (this.dialogUI.isOpen) {
      this.dialogUI.hidePrompt();
      this.dialogUI.updateDynamicScaling(this.dialogUI._currentNPC);
      this.scene.registry.set("canInteract", true);
      return;
    }

    if (this._nearestNPC) {
      // Mostra o prompt acima do NPC e sinaliza que a interação está disponível.
      this.dialogUI.showPrompt(this._nearestNPC);
      this.dialogUI.updateDynamicScaling(this._nearestNPC);
      this.scene.registry.set("canInteract", true);
    } else {
      // Nenhum NPC próximo: oculta o prompt.
      this.dialogUI.hidePrompt();
      this.scene.registry.set("canInteract", false);
    }
  }

  /** Destrói todos os NPCs e a UI de diálogo ao encerrar a cena. */
  destroy() {
    for (const npc of this.npcs) npc.destroy();
    this.npcs = [];
    this.dialogUI.destroy();
  }
}
