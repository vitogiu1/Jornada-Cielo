/**
 * Centraliza as informações de todos os mundos do jogo:
 * quais existem, como se conectam e como funciona a transição entre eles.
 * @module managers/WorldManager
 */

import { ProgressManager } from "./ProgressManager";

/**
 * @typedef {Object} WorldNode
 * @property {string} id          - Identificador único do mundo (ex: "city").
 * @property {string} name        - Nome exibido para o jogador.
 * @property {string} sceneKey    - Nome da Scene correspondente no Phaser.
 * @property {string} description - Breve descrição do ambiente.
 * @property {string} icon        - Emoji representativo do mundo.
 * @property {number} color       - Cor em hexadecimal associada ao bioma.
 * @property {number} x           - Posição horizontal no mapa (0 a 1).
 * @property {number} y           - Posição vertical no mapa (0 a 1).
 * @property {string[]} connections - IDs dos mundos vizinhos conectados a este.
 */

/** Lista de todos os mundos disponíveis no jogo. */
const WORLDS = [
  {
    id: "city",
    name: "Centro da Cidade",
    sceneKey: "CityScene",
    description: "O coração urbano. Conecta todas as regiões.",
    icon: "🏙️",
    color: 0xe67e22,
    x: 0.3,
    y: 0.25,
    connections: ["farm"],
  },
  {
    id: "farm",
    name: "Fazenda",
    sceneKey: "FarmScene",
    description: "Campos de soja e produtores rurais.",
    icon: "🌾",
    color: 0x27ae60,
    x: 0.7,
    y: 0.3,
    connections: ["city", "beach"],
  },
  {
    id: "beach",
    name: "Praia",
    sceneKey: "BeachScene",
    description: "Quiosques, areia e o sol do litoral.",
    icon: "🏖️",
    color: 0xf1c40f,
    x: 0.75,
    y: 0.65,
    connections: ["farm", "industrial"],
  },
  {
    id: "industrial",
    name: "Zona Industrial",
    sceneKey: "IndustrialScene",
    description: "Fábricas e grandes operações corporativas.",
    icon: "🏭",
    color: 0x95a5a6,
    x: 0.3,
    y: 0.75,
    connections: ["beach"],
  },
];

/**
 * Gerencia os mundos do jogo: quais estão disponíveis, desbloqueados
 * e como o jogador pode navegar entre eles.
 */
export class WorldManager {
  /**
   * Retorna a lista completa de mundos.
   * @returns {WorldNode[]}
   */
  static getWorlds() {
    return WORLDS;
  }

  /**
   * Busca um mundo pelo ID.
   * @param {string} id
   * @returns {WorldNode|undefined}
   */
  static getWorld(id) {
    return WORLDS.find((w) => w.id === id);
  }

  /**
   * Busca um mundo pelo nome da cena correspondente.
   * @param {string} sceneKey
   * @returns {WorldNode|undefined}
   */
  static getWorldBySceneKey(sceneKey) {
    return WORLDS.find((w) => w.sceneKey === sceneKey);
  }

  /**
   * Verifica se um mundo está desbloqueado.
   * @param {string} id
   * @returns {boolean}
   */
  static isUnlocked(id) {
    return ProgressManager.isWorldUnlocked(id);
  }

  /**
   * Verifica se a missão de um mundo foi concluída.
   * @param {string} id
   * @returns {boolean}
   */
  static isComplete(id) {
    return ProgressManager.isWorldComplete(id);
  }

  /**
   * Retorna os mundos conectados a um dado mundo.
   * @param {string} id
   * @returns {WorldNode[]}
   */
  static getConnections(id) {
    const world = WorldManager.getWorld(id);
    if (!world) return [];
    return world.connections
      .map((cId) => WorldManager.getWorld(cId))
      .filter(Boolean);
  }

  /**
   * Verifica se dois mundos estão diretamente conectados.
   * @param {string} fromId
   * @param {string} toId
   * @returns {boolean}
   */
  static areConnected(fromId, toId) {
    const world = WorldManager.getWorld(fromId);
    return world ? world.connections.includes(toId) : false;
  }

  /**
   * Encontra o caminho mais curto entre dois mundos usando BFS.
   * Retorna um array com os IDs dos mundos a percorrer, ou vazio se não houver rota.
   *
   * @param {string} fromId - Mundo de origem.
   * @param {string} toId   - Mundo de destino.
   * @returns {string[]}
   */
  static findPath(fromId, toId) {
    if (fromId === toId) return [fromId];

    const visited = new Set();
    const queue = [[fromId]];
    visited.add(fromId);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      const world = WorldManager.getWorld(current);
      if (!world) continue;

      for (const neighborId of world.connections) {
        if (visited.has(neighborId)) continue;
        const newPath = [...path, neighborId];
        if (neighborId === toId) return newPath;
        visited.add(neighborId);
        queue.push(newPath);
      }
    }

    return [];
  }

  /**
   * Faz um fadeOut na tela e inicia o mundo indicado.
   * Não faz nada se o mundo não existir ou estiver bloqueado.
   *
   * @param {Phaser.Scene} scene    - A cena atual.
   * @param {string} worldId        - ID do mundo de destino.
   * @param {string} characterKey   - Personagem selecionado pelo jogador.
   */
  static startWorld(scene, worldId, characterKey) {
    const world = WorldManager.getWorld(worldId);
    if (!world) return;

    scene.cameras.main.fadeOut(500, 0, 0, 0);
    scene.cameras.main.once("camerafadeoutcomplete", () => {
      scene.scene.start(world.sceneKey, { character: characterKey });
    });
  }
}
