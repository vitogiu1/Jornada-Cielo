/**
 * Gerenciador de progresso do jogador.
 * Rastreia quais mundos estão acessíveis, quantas negociações foram concluídas
 * e o avanço geral do jogador. Usa o `Phaser.Game.registry` para manter
 * o estado entre trocas de cena.
 * @module managers/ProgressManager
 */

/**
 * Ordem sequencial dos mundos. Quando o jogador conclui o mundo N,
 * o sistema desbloqueia o mundo N+1.
 * @constant {string[]}
 */
const WORLD_ORDER = ["city", "farm", "beach", "industrial"];

/**
 * Gerencia o estado global do jogo (mundos desbloqueados, negociações concluídas, etc.).
 * Usa propriedades estáticas para manter consistência durante toda a sessão.
 */
export class ProgressManager {
  /** @type {Phaser.Data.DataManager|null} */
  static _registry = null;

  /**
   * Inicializa os dados no DataManager do Phaser.
   * Se ainda não houver dados salvos, começa com "city" desbloqueado.
   * Deve ser chamado no início do jogo (ex: no Preload).
   *
   * @param {Phaser.Data.DataManager} registry - O DataManager global do Phaser.
   */
  static init(registry) {
    ProgressManager._registry = registry;

    // Inicializa os dados apenas se ainda não existirem.
    if (!registry.has("unlockedWorlds")) {
      registry.set("unlockedWorlds", ["city"]);
    }
    if (!registry.has("completedNegotiations")) {
      registry.set("completedNegotiations", {});
    }
    if (!registry.has("completedWorlds")) {
      registry.set("completedWorlds", []);
    }
  }

  /** @returns {Phaser.Data.DataManager} */
  static get reg() {
    return ProgressManager._registry;
  }

  // ── MUNDOS ────────────────────────────────────────────────────────────

  /**
   * Verifica se um mundo está desbloqueado.
   *
   * @param {string} worldId - ID do mundo (ex: "city", "farm").
   * @returns {boolean}
   */
  static isWorldUnlocked(worldId) {
    if (!ProgressManager.reg) return worldId === "city"; // Fallback inicial
    const unlocked = ProgressManager.reg.get("unlockedWorlds") || [];
    return unlocked.includes(worldId);
  }

  /**
   * Verifica se todas as missões de um mundo foram concluídas.
   *
   * @param {string} worldId - ID do mundo.
   * @returns {boolean}
   */
  static isWorldComplete(worldId) {
    const completed = ProgressManager.reg?.get("completedWorlds") || [];
    return completed.includes(worldId);
  }

  /**
   * Desbloqueia o próximo mundo na sequência.
   *
   * @param {string} currentWorldId - ID do mundo atual.
   */
  static unlockNextWorld(currentWorldId) {
    const idx = WORLD_ORDER.indexOf(currentWorldId);
    if (idx < 0 || idx >= WORLD_ORDER.length - 1) return;

    const nextWorldId = WORLD_ORDER[idx + 1];
    const unlocked = ProgressManager.reg?.get("unlockedWorlds") || [];
    if (!unlocked.includes(nextWorldId)) {
      unlocked.push(nextWorldId);
      ProgressManager.reg?.set("unlockedWorlds", [...unlocked]);
    }
  }

  // ── NEGOCIAÇÕES ──────────────────────────────────────────────────────────

  /**
   * Registra uma negociação como concluída.
   * Cria um novo objeto para disparar o evento changedata na UI.
   *
   * @param {string} worldId - ID do mundo.
   * @param {string} negotiationId - ID da negociação.
   */
  static markNegotiationComplete(worldId, negotiationId) {
    if (!ProgressManager.reg) return;
    const negotiations = ProgressManager.reg.get("completedNegotiations") || {};
    if (!negotiations[worldId]) negotiations[worldId] = [];
    if (!negotiations[worldId].includes(negotiationId)) {
      negotiations[worldId].push(negotiationId);
    }
    // Força um novo objeto para disparar o evento changedata.
    ProgressManager.reg.set("completedNegotiations", { ...negotiations });
  }

  /**
   * Retorna quantas negociações foram concluídas em um mundo.
   * @param {string} worldId
   * @returns {number}
   */
  static getNegotiationCount(worldId) {
    const negotiations =
      ProgressManager.reg?.get("completedNegotiations") || {};
    return (negotiations[worldId] || []).length;
  }

  /**
   * Verifica se uma negociação específica já foi concluída.
   * @param {string} worldId
   * @param {string} negotiationId
   * @returns {boolean}
   */
  static isNegotiationComplete(worldId, negotiationId) {
    const negotiations =
      ProgressManager.reg?.get("completedNegotiations") || {};
    return (negotiations[worldId] || []).includes(negotiationId);
  }

  /**
   * Retorna o número de negociações necessárias para concluir um mundo.
   * @param {string} worldId
   * @returns {number}
   */
  static getRequiredNegotiations(worldId) {
    return 3;
  }

  /**
   * Verifica se o jogador venceu negociações suficientes para concluir o mundo.
   * Retorna true apenas quando o mundo é concluído pela primeira vez.
   *
   * @param {string} worldId - ID do mundo.
   * @returns {boolean}
   */
  static checkWorldCompletion(worldId) {
    if (ProgressManager.isWorldComplete(worldId)) return false;

    const count = ProgressManager.getNegotiationCount(worldId);
    const required = ProgressManager.getRequiredNegotiations(worldId);

    if (count >= required) {
      const completed = ProgressManager.reg.get("completedWorlds") || [];
      completed.push(worldId);
      ProgressManager.reg.set("completedWorlds", [...completed]);
      ProgressManager.unlockNextWorld(worldId);
      return true;
    }
    return false;
  }

  /** Retorna a ordem dos mundos. */
  static getWorldOrder() {
    return WORLD_ORDER;
  }

  /**
   * Converte uma sceneKey (ex: "CityScene") para o worldId correspondente (ex: "city").
   * @param {string} sceneKey
   * @returns {string|null}
   */
  static sceneKeyToWorldId(sceneKey) {
    const map = {
      CityScene: "city",
      FarmScene: "farm",
      BeachScene: "beach",
      IndustrialScene: "industrial",
    };
    return map[sceneKey] || null;
  }

  /**
   * Retorna a lista de todos os alvos de missão de um mundo.
   * @param {string} worldId
   * @returns {object[]}
   */
  static getWorldTargets(worldId) {
    const worldNPCs = {
      city: [
        {
          id: "estacionamento_city_1",
          x: 535,
          y: 135,
          interiorKey: "EstacionamentoScene",
          name: "Estacionamento",
        },
        {
          id: "sorveteria_city_1",
          x: 800,
          y: 135,
          interiorKey: "SorveteriaScene",
          name: "Sorveteria",
        },
        {
          id: "museu_city_1",
          x: 285,
          y: 490,
          interiorKey: "MuseuScene",
          name: "Museu",
        },
        {
          id: "teatro_city_1",
          x: 515,
          y: 490,
          interiorKey: "TeatroScene",
          name: "Teatro",
        },
        {
          id: "floricultura_city_1",
          x: 860,
          y: 490,
          interiorKey: "FloriculturaScene",
          name: "Floricultura",
        },
        {
          id: "chaveiro_city_1",
          x: 910,
          y: 810,
          interiorKey: "ChaveiroScene",
          name: "Chaveiro",
        },
      ],
      farm: [
        {
          id: "celeiro_farm_1",
          x: 266,
          y: 204,
          interiorKey: "CeleiroScene",
          name: "Celeiro",
        },
        {
          id: "casa1_farm_1",
          x: 476,
          y: 204,
          interiorKey: "CasaAmarelaScene",
          name: "Mercearia",
        },
        {
          id: "casa2_farm_1",
          x: 640,
          y: 670,
          interiorKey: "CasaAmarela2Scene",
          name: "Lanchonete",
        },
        {
          id: "loja_farm_1",
          x: 800,
          y: 685,
          interiorKey: "LojaScene",
          name: "Loja",
        },
        {
          id: "bar_farm_1",
          x: 920,
          y: 745,
          interiorKey: "BarScene",
          name: "Bar",
        },
      ],
      beach: [
        {
          id: "carlos_praia_1",
          x: 275,
          y: 375,
          interiorKey: "QuiosquePraiaScene",
          name: "Quiosque do Carlos",
        },
        {
          id: "carlos_praia_2",
          x: 700,
          y: 280,
          interiorKey: "LojaPraiaScene",
          name: "Loja da Marina",
        },
        {
          id: "quiosque2_beach_1",
          x: 280,
          y: 600,
          interiorKey: "QuiosDoisPraiaScene",
          name: "Quiosque do Thiago",
        },
        {
          id: "quiossurf_beach_1",
          x: 680,
          y: 600,
          interiorKey: "QuiosSurfScene",
          name: "Quiosque do Alan",
        },
        {
          id: "quiosque3_beach_1",
          x: 680,
          y: 800,
          interiorKey: "QuiosTresScene",
          name: "Quiosque da Amélia",
        },
      ],
      industrial: [
        {
          id: "mecanica_ind_1",
          x: 160,
          y: 160,
          interiorKey: "MecanicaScene",
          name: "Mecânica",
        },
        {
          id: "centromotor_ind_1",
          x: 640,
          y: 143,
          interiorKey: "CentroMotorScene",
          name: "Centro de Motores",
        },
        {
          id: "centrosuprimento_ind_1",
          x: 156,
          y: 360,
          interiorKey: "CentroSuprimentoScene",
          name: "Centro de Suprimentos",
        },
        {
          id: "centrodepecas_ind_1",
          x: 360,
          y: 800,
          interiorKey: "CentroDePecasScene",
          name: "Centro de Peças",
        },
        {
          id: "galpaomergulho_ind_1",
          x: 790,
          y: 545,
          interiorKey: "GalpaoMergulhoScene",
          name: "Galpão de Mergulho",
        },
        {
          id: "secaohidraulica_ind_1",
          x: 156,
          y: 580,
          interiorKey: "SecaoHidraulicaScene",
          name: "Seção Hidráulica",
        },
      ],
    };
    return worldNPCs[worldId] || [];
  }

  /**
   * Retorna o próximo alvo de missão não concluído de um mundo.
   * Retorna null se o mundo já foi completado.
   * @param {string} worldId
   * @returns {object|null}
   */
  static getCurrentMissionTarget(worldId) {
    if (ProgressManager.isWorldComplete(worldId)) return null;

    const negotiations =
      ProgressManager.reg?.get("completedNegotiations") || {};
    const completed = negotiations[worldId] || [];

    const targets = ProgressManager.getWorldTargets(worldId);
    for (const target of targets) {
      if (!completed.includes(target.id)) {
        return target;
      }
    }
    return null;
  }
}
