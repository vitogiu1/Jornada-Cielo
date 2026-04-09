/**
 * @fileoverview Sistema de Gerenciamento de Saves via LocalStorage
 * Suporta 2 slots de salvamento, auto-save e recuperação de progresso global.
 */

import { ProgressManager } from "../managers/ProgressManager";

export class SaveSystem {
  static SLOT_KEYS = ["save_slot_0", "save_slot_1"];
  static currentSlot = 0; // Temporário durante o jogo carregado

  /**
   * Retorna os estados atuais dos dois slots.
   */
  static getSaves() {
    return this.SLOT_KEYS.map((key, index) => {
      const dataStr = localStorage.getItem(key);
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          return { slotIndex: index, empty: false, data };
        } catch (e) {
          console.error(`Erro ao tentar ler o slot ${index}:`, e);
          return { slotIndex: index, empty: true, data: null };
        }
      }
      return { slotIndex: index, empty: true, data: null };
    });
  }

  /**
   * Salva o estado atual do jogo no slot atual.
   * Pode ser chamado a partir de qualquer cena (preferencialmente enviando a cena principal de mapa ou HUD).
   * @param {Phaser.Scene} scene - Referência à cena atual para acessar o registry e a lista de cenas ativas.
   */
  static saveCurrentState(scene) {
    if (!scene || !scene.registry) return;

    const registry = scene.registry;

    const keysToSave = [
      "playerName",
      "playerSprite",
      "playerLevel",
      "playerXP",
      "playerConfidence",
      "playerInventory",
      "cieloProducts",
      "conqueredCustomers",
      "unlockedWorlds",
      "completedNegotiations",
      "completedWorlds",
      "tutorialDone",
      "lastWorldId",
    ];

    const dataToSave = {};
    keysToSave.forEach((k) => {
      const val = registry.get(k);
      if (val !== undefined) dataToSave[k] = val;
    });

    // Detecta o mapa e posição atual, baseando-se nas cenas ativas
    let lastScene = registry.get("lastScene") || "WorldMapScene";
    let lastX = registry.get("lastX") || null;
    let lastY = registry.get("lastY") || null;

    const allActive = scene.scene.manager.getScenes(true);
    // Procura por alguma cena (excluindo HUDs/Menus) que contenha player e esteja ativa
    for (const sc of allActive) {
      if (
        sc.scene.isActive() &&
        sc.scene.isVisible() &&
        sc.scene.key !== "PlayerHudScene" &&
        sc.scene.key !== "MobileHudScene" &&
        sc.scene.key !== "PauseScene" &&
        sc.scene.key !== "NegotiationScene"
      ) {
        if (sc.player && sc.player.x !== undefined) {
          lastScene = sc.scene.key;
          lastX = sc.player.x;
          lastY = sc.player.y;
          // Memoriza no registro também
          registry.set("lastScene", lastScene);
          registry.set("lastX", lastX);
          registry.set("lastY", lastY);
          break;
        } else if (sc.scene.key === "WorldMapScene") {
          lastScene = "WorldMapScene";
        }
      }
    }

    dataToSave["saveDate"] = new Date().toISOString();
    dataToSave["lastScene"] = lastScene;
    dataToSave["lastX"] = lastX;
    dataToSave["lastY"] = lastY;

    localStorage.setItem(
      this.SLOT_KEYS[this.currentSlot],
      JSON.stringify(dataToSave),
    );
    console.log(
      `[SaveSystem] Jogo salvo no slot ${this.currentSlot}`,
      dataToSave,
    );
  }

  /**
   * Define o slot atual (necessário no momento de criar "Novo Jogo")
   */
  static setCurrentSlot(slotIndex) {
    this.currentSlot = slotIndex;
  }

  /**
   * Carrega os dados de um slot para o Registry e devolve as meta-informações (mapa, etc).
   * @param {Phaser.Data.DataManager} registry - Instância do Game Registry.
   * @param {number} slotIndex - Índice do slot a carregar.
   * @returns {object|null} - Retorna o objeto com lastScene, lastX, lastY, etc. ou null se erro/vazio.
   */
  static loadSave(registry, slotIndex) {
    this.currentSlot = slotIndex;
    const dataStr = localStorage.getItem(this.SLOT_KEYS[slotIndex]);
    if (!dataStr) return null;

    try {
      const data = JSON.parse(dataStr);
      Object.keys(data).forEach((key) => {
        if (
          key !== "saveDate" &&
          key !== "lastScene" &&
          key !== "lastX" &&
          key !== "lastY"
        ) {
          registry.set(key, data[key]);
        }
      });
      // Set variables needed on Registry side
      registry.set("lastScene", data.lastScene);
      registry.set("lastX", data.lastX);
      registry.set("lastY", data.lastY);

      console.log(`[SaveSystem] Slot ${slotIndex} carregado com sucesso.`);
      // Inicializa os managers que dependem do registry
      ProgressManager.init(registry);

      return data;
    } catch (e) {
      console.error("[SaveSystem] Falha ao carregar slot:", e);
      return null;
    }
  }

  /**
   * Deleta os dados de um slot do LocalStorage.
   * @param {number} slotIndex
   */
  static deleteSave(slotIndex) {
    localStorage.removeItem(this.SLOT_KEYS[slotIndex]);
  }
}
