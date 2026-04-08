/**
 * @fileoverview Cena base genérica para interiores reutilizáveis.
 * Qualquer estabelecimento fechado (loja, casa, celeiro) pode ser criado
 * passando apenas um objeto de configuração — sem precisar de uma cena dedicada.
 * @module scenes/InteriorScene
 */

import Phaser from "phaser";
import { Player } from "../../entities/Player";
import { NPCManager } from "../../managers/NPCManager";
import { MarkerManager } from "../../managers/MarkerManager";
import { interiorNPCs } from "../../data/npcs";
import { ProgressManager } from "../../managers/ProgressManager";

/**
 * Cena genérica de interior.
 * Monta tilemap, colisões, porta de saída, câmera, NPCs e HUD
 * a partir de um único objeto de configuração.
 * @extends Phaser.Scene
 */
export class InteriorScene extends Phaser.Scene {
  /**
   * @param {object}  cfg                  - Configuração completa do interior.
   * @param {string}  cfg.key              - Chave única da cena (ex.: "ChaveiroScene").
   * @param {string}  cfg.mapKey           - Chave do tilemap JSON carregado no preload.
   * @param {string}  cfg.tilesetImageKey  - Chave da imagem do tileset no cache.
   * @param {string}  cfg.tilesetName      - Nome do tileset conforme definido no Tiled.
   * @param {string}  cfg.parentScene      - Cena para onde o jogador retorna ao sair.
   * @param {object}  [cfg.parentData]     - Dados extras repassados à cena pai na saída.
   * @param {object}  [cfg.returnSpawn]    - Coordenadas de spawn ao retornar à cena pai.
   */
  constructor(cfg) {
    super(cfg.key);
    this.cfg = cfg;
    this.player = null;
    this.characterKey = "amanda";
    this.isTransitioning = false; // Evita disparar a saída mais de uma vez
  }

  /**
   * Inicializa os dados de spawn recebidos ao abrir a cena.
   * As coordenadas são validadas — valores não-finitos são descartados.
   * @param {object} data - Dados passados via `scene.start` ou `scene.wake`.
   */
  init(data) {
    this.spawnPoint = data || {};
    this.characterKey = this.spawnPoint.character || "amanda";
    this.spawnX = Number.isFinite(this.spawnPoint.x) ? this.spawnPoint.x : null;
    this.spawnY = Number.isFinite(this.spawnPoint.y) ? this.spawnPoint.y : null;
    this.isTransitioning = false;
  }

  /** @param {object} [data] - Dados de spawn (fallback para `this.spawnPoint`). */
  create(data = this.spawnPoint) {
    this.checkHUD();

    // ── Tilemap ──────────────────────────────────────────────────────────
    const map = this.make.tilemap({ key: this.cfg.mapKey });
    if (!map) {
      console.error(
        `Não foi possível carregar o tilemap "${this.cfg.mapKey}".`,
      );
      return;
    }

    const tileset = map.addTilesetImage(
      this.cfg.tilesetName,
      this.cfg.tilesetImageKey,
    );
    if (!tileset) {
      console.error(
        `Não foi possível vincular o tileset "${this.cfg.tilesetName}" ` +
          `com a imagem "${this.cfg.tilesetImageKey}".`,
      );
      return;
    }

    const mapX = 0;
    const mapY = 0;

    // ── Camada de piso ───────────────────────────────────────────────────
    // Tenta os dois nomes mais comuns; se falhar, usa a primeira camada tile disponível.
    let floorLayer =
      map.createLayer("Camada de Blocos 1", tileset, mapX, mapY) ||
      map.createLayer("chao", tileset, mapX, mapY);

    if (!floorLayer) {
      const tileLayers = map.layers.filter(
        (l) => l.type === "tilelayer" || l.type === "TileLayer",
      );
      if (tileLayers.length > 0) {
        floorLayer = map.createLayer(tileLayers[0].name, tileset, mapX, mapY);
        console.warn(
          `InteriorScene [${this.cfg.key}]: usando camada fallback "${tileLayers[0].name}".`,
        );
      }
    }

    if (!floorLayer) {
      console.error(
        `Não foi possível criar a camada base para "${this.cfg.key}". ` +
          `Camadas encontradas: ${map.layers.map((l) => `${l.name} (${l.type})`).join(", ")}`,
      );
      return;
    }

    const mapScale = 1.0;
    floorLayer.setDepth(0).setScale(mapScale);

    // ── Mundo físico ─────────────────────────────────────────────────────
    this.physics.world.setBounds(
      mapX,
      mapY,
      map.widthInPixels * mapScale,
      map.heightInPixels * mapScale,
    );

    // ── Jogador ──────────────────────────────────────────────────────────
    // Posição padrão: centro horizontal, próximo da borda inferior (porta de saída).
    const spawnX = map.widthInPixels / 2;
    const spawnY = map.heightInPixels - 200;

    this.player = new Player(this, spawnX, spawnY, this.characterKey, {
      scale: 3,
    });
    this.physics.add.existing(this.player);
    this.player.setPosition(spawnX, spawnY);
    this.player.setFootHitbox(10, 8);
    this.player.setCollideWorldBounds(true);

    // ── Colisões ─────────────────────────────────────────────────────────

    /**
     * Cria um retângulo de colisão estático invisível e registra o collider com o jogador.
     * @param {number} x      - Centro X do retângulo (em pixels de mundo).
     * @param {number} y      - Centro Y do retângulo.
     * @param {number} width  - Largura em pixels.
     * @param {number} height - Altura em pixels.
     */
    const addCollisionRect = (x, y, width, height) => {
      const rect = this.add.rectangle(x, y, width, height, 0x00ff00, 0);
      this.physics.add.existing(rect, true);
      this.physics.add.collider(this.player, rect);
    };

    /**
     * Lê os objetos de colisão diretamente do JSON cacheado do tilemap.
     * Prioriza camadas com nomes convencionais; usa qualquer objectgroup como fallback.
     * @param {string} tilemapKey - Chave do tilemap no cache do Phaser.
     * @returns {object[]} Lista de objetos de colisão do Tiled.
     */
    const collectCollisionObjectsFromCache = (tilemapKey) => {
      const rawMap = this.cache.tilemap.get(tilemapKey)?.data;
      if (!rawMap?.layers?.length) return [];

      const preferredNames = new Set([
        "Camada de Objetos 1",
        "Collision",
        "Collisions",
        "collision",
        "collisions",
      ]);

      const preferred = [];
      const fallback = [];

      // Percorre camadas recursivamente (suporta grupos de camadas do Tiled)
      const walkLayers = (layers) => {
        layers.forEach((layer) => {
          if (layer.type === "group" && Array.isArray(layer.layers)) {
            walkLayers(layer.layers);
            return;
          }
          if (layer.type !== "objectgroup" || !Array.isArray(layer.objects))
            return;
          if (preferredNames.has(layer.name)) preferred.push(...layer.objects);
          else fallback.push(...layer.objects);
        });
      };

      walkLayers(rawMap.layers);
      return preferred.length ? preferred : fallback;
    };

    // Obtém a camada de colisão pelo Phaser primeiro, depois pelo cache JSON
    const collisionLayer =
      map.getObjectLayer("Camada de Objetos 1") ||
      map.getObjectLayer("Collision") ||
      map.getObjectLayer("Collisions") ||
      map.getObjectLayer("collision") ||
      map.getObjectLayer("collisions") ||
      map.objects?.find(
        (layer) => Array.isArray(layer.objects) && layer.objects.length,
      ) ||
      null;

    if (!collisionLayer) {
      console.warn(
        `Nenhuma camada de colisão encontrada em "${this.cfg.key}".`,
      );
    }

    // ── Detecção automática da porta ─────────────────────────────────────

    const mapArea = map.widthInPixels * map.heightInPixels;

    /**
     * Retorna `true` se o objeto cobre mais de 50% da área do mapa.
     * Esses retângulos gigantes são bordas de fundo do Tiled e devem ser ignorados.
     * @param {{ width: number, height: number }} obj
     */
    const isHugeRect = (obj) => obj.width * obj.height > mapArea * 0.5;

    // Reúne os objetos brutos, prioriza o que veio via Phaser e remove os gigantes
    const worldWidth = map.widthInPixels * mapScale;
    const worldHeight = map.heightInPixels * mapScale;

    let rawObjects = collisionLayer?.objects?.length
      ? collisionLayer.objects
      : collectCollisionObjectsFromCache(this.cfg.mapKey);

    rawObjects = rawObjects.filter(
      (obj) => obj.width && obj.height && !isHugeRect(obj),
    );

    /**
     * Mescla intervalos sobrepostos em um array ordenado de [start, end].
     * Usado para encontrar os "buracos" (gaps) na parede inferior — onde fica a porta.
     * @param {[number, number][]} intervals
     * @returns {[number, number][]}
     */
    const mergeIntervals = (intervals) => {
      const sorted = intervals
        .map(([s, e]) => [Math.max(0, s), Math.min(worldWidth, e)])
        .filter(([s, e]) => e > s)
        .sort((a, b) => a[0] - b[0]);

      const merged = [];
      sorted.forEach(([s, e]) => {
        if (!merged.length || s > merged.at(-1)[1]) {
          merged.push([s, e]);
        } else {
          merged.at(-1)[1] = Math.max(merged.at(-1)[1], e);
        }
      });
      return merged;
    };

    /**
     * Retorna os espaços livres (gaps) em uma fatia horizontal do mapa na altura `sampleY`.
     * Esses gaps indicam onde não há objetos de colisão — i.e., onde pode estar a porta.
     * @param {number} sampleY - Coordenada Y a ser amostrada (em pixels de mundo).
     * @returns {[number, number][]} Lista de intervalos [inicio, fim] dos gaps.
     */
    const buildGapsAtY = (sampleY) => {
      const blocked = rawObjects
        .filter(
          (obj) =>
            sampleY >= obj.y * mapScale &&
            sampleY < (obj.y + obj.height) * mapScale,
        )
        .map((obj) => [obj.x * mapScale, (obj.x + obj.width) * mapScale]);

      const merged = mergeIntervals(blocked);
      const gaps = [];
      let cursor = 0;

      merged.forEach(([start, end]) => {
        if (start > cursor) gaps.push([cursor, start]);
        cursor = Math.max(cursor, end);
      });

      if (cursor < worldWidth) gaps.push([cursor, worldWidth]);
      return gaps;
    };

    // Amostra as últimas fileiras de tiles para encontrar o gap consistente da porta
    let doorCandidates = [];
    const minDoorWidth = map.tileWidth * mapScale * 2;

    for (let i = 2; i <= 6; i++) {
      const testY = mapY + worldHeight - map.tileHeight * mapScale * i;
      doorCandidates = buildGapsAtY(testY).filter(([start, end]) => {
        const width = end - start;
        if (width < minDoorWidth) return false;
        // Gap que cobre o mapa inteiro ainda não tem parede — aceitar
        if (start <= 10 && end >= worldWidth - 10) return true;
        // Gaps colados na borda esquerda/direita são resquícios de parede incompleta
        if (start <= 10 || end >= worldWidth - 10) return false;
        return true;
      });
      if (doorCandidates.length > 0) break;
    }

    // Escolhe o gap mais próximo do centro; usa coordenadas fixas se não encontrar nenhum
    const centerX = mapX + worldWidth / 2;
    let selectedDoor = doorCandidates.sort((a, b) => {
      const aC = mapX + (a[0] + a[1]) / 2;
      const bC = mapX + (b[0] + b[1]) / 2;
      return Math.abs(aC - centerX) - Math.abs(bC - centerX);
    })[0] || [map.tileWidth * mapScale * 24, map.tileWidth * mapScale * 40];

    // Cenas com planta horizontal estreita recebem porta fixada ao centro
    const forceCenterScenes = [
      "TeatroScene",
      "CeleiroScene",
      "CasaAmarelaScene",
      "CasaAmarela2Scene",
      "BarScene",
      "LojaScene",
    ];
    if (
      this.cfg.parentScene === "IndustrialScene" ||
      forceCenterScenes.includes(this.cfg.key)
    ) {
      selectedDoor = [
        map.tileWidth * mapScale * 22,
        map.tileWidth * mapScale * 42,
      ];
    }

    const safeDoorX = mapX + selectedDoor[0];
    const safeDoorWidth = selectedDoor[1] - selectedDoor[0];
    const maxExitWidth = map.tileWidth * mapScale * 12; // Limita a largura máxima da área de saída

    // ── Adiciona colisões, excluindo o buraco da porta ───────────────────
    let collisionCount = 0;
    const doorCheckY = mapY + worldHeight - map.tileHeight * mapScale * 8; // Últimos 8 tiles

    rawObjects.forEach((obj) => {
      const objGlobalX = mapX + obj.x * mapScale;
      const objGlobalY = mapY + obj.y * mapScale;
      const objGlobalW = obj.width * mapScale;
      const objGlobalH = obj.height * mapScale;

      const objCenterX = objGlobalX + objGlobalW / 2;
      const objBottom = objGlobalY + objGlobalH;

      // Ignora objetos dentro da área da porta na borda inferior (bloquearia a saída)
      const inDoorHorizontal =
        objCenterX >= safeDoorX && objCenterX <= safeDoorX + safeDoorWidth;
      const atBottom = objBottom > doorCheckY;

      if (inDoorHorizontal && atBottom) return;

      addCollisionRect(
        objGlobalX + objGlobalW / 2,
        objGlobalY + objGlobalH / 2,
        objGlobalW,
        objGlobalH,
      );
      collisionCount++;
    });

    // Fallback: se nenhuma colisão foi criada, gera 4 paredes nas bordas manualmente
    if (collisionCount === 0) {
      const ww = worldWidth;
      const wh = worldHeight;
      const wallThick = map.tileWidth * mapScale * 3;

      // Topo, esquerda e direita
      addCollisionRect(mapX + ww / 2, mapY + wallThick / 2, ww, wallThick);
      addCollisionRect(mapX + wallThick / 2, mapY + wh / 2, wallThick, wh);
      addCollisionRect(mapX + ww - wallThick / 2, mapY + wh / 2, wallThick, wh);

      // Parede inferior dividida em dois blocos, com o gap da porta no meio
      const dlWidth = safeDoorX - mapX;
      if (dlWidth > 0) {
        addCollisionRect(
          mapX + dlWidth / 2,
          mapY + wh - wallThick / 2,
          dlWidth,
          wallThick,
        );
      }

      const drStart = safeDoorX + safeDoorWidth;
      const drWidth = mapX + ww - drStart;
      if (drWidth > 0) {
        addCollisionRect(
          drStart + drWidth / 2,
          mapY + wh - wallThick / 2,
          drWidth,
          wallThick,
        );
      }
    }

    // ── Trigger de saída ─────────────────────────────────────────────────
    // Retângulo invisível posicionado na porta; ao ser tocado, aciona a saída.
    const exitCenterX = safeDoorX + safeDoorWidth / 2;
    let exitWidth = Math.max(
      map.tileWidth * mapScale * 2,
      Math.min(safeDoorWidth, maxExitWidth),
    );
    let exitHeight = map.tileHeight * mapScale * 5;

    // Cenas de planta curta precisam de um trigger mais alto para evitar que o jogador
    // trompe nas pontas das paredes espessas ao sair
    if (
      this.cfg.parentScene === "IndustrialScene" ||
      forceCenterScenes.includes(this.cfg.key)
    ) {
      exitHeight = map.tileHeight * mapScale * 7;
    }

    const exitY = mapY + worldHeight - exitHeight / 2; // Colado na borda inferior

    const exitTrigger = this.add.rectangle(
      exitCenterX,
      exitY,
      exitWidth,
      exitHeight,
      0xff0000,
      0,
    );
    this.physics.add.existing(exitTrigger, true);
    this.physics.add.overlap(this.player, exitTrigger, () => {
      if (!this.isTransitioning) this.exitInterior();
    });

    // ── Câmera ───────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 1, 1);

    // Sorveteria e Estacionamento usam zoom maior por terem layouts mais compactos
    const zoomLevel =
      this.scene.key === "SorveteriaScene" ||
      this.scene.key === "EstacionamentoScene"
        ? 1.8
        : 1.5;

    this.cameras.main
      .setZoom(zoomLevel)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .centerOn(spawnX, spawnY)
      .fadeIn(500);

    // ── NPCs ─────────────────────────────────────────────────────────────
    this.npcManager = new NPCManager(this);
    const sceneNPCs = interiorNPCs[this.cfg.key] || [];
    const defNpcX = (map.widthInPixels * mapScale) / 2;
    const defNpcY = map.heightInPixels * mapScale * 0.65; // Abaixo dos balcões/prateleiras

    // Aplica posição padrão aos NPCs que não tiverem coordenadas definidas
    sceneNPCs.forEach((npc) => {
      npc.x = npc.x || defNpcX;
      npc.y = npc.y || defNpcY;
    });

    try {
      // interactionRadius de 110px permite interação por cima de balcões largos
      this.npcManager.create(sceneNPCs, mapX, mapY, {
        scale: 2.5,
        interactionRadius: 110,
      });
      this.npcManager.setupInteraction(this.player);
    } catch (err) {
      console.error("Erro ao criar NPCs no InteriorScene", err);
    }

    // ── Marcador de missão ───────────────────────────────────────────────
    this.markerManager = new MarkerManager(this);
    this.updateMissionMarker();

    // ── Eventos e input ──────────────────────────────────────────────────
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // Atualiza HUD e marcadores ao retomar do pause
    this.events.on("resume", () => {
      this.checkHUD();
      this.updateMissionMarker();
    });

    // Reposiciona o jogador quando a cena é "acordada" após ter ficado dormente
    this.events.on("wake", (_sys, wakeData) => {
      this.isTransitioning = false;
      const targetX = Number.isFinite(wakeData?.x) ? wakeData.x : spawnX;
      const targetY = Number.isFinite(wakeData?.y) ? wakeData.y : spawnY;
      this.player.setPosition(targetX, targetY);

      if (
        wakeData?.character &&
        this.player.characterKey !== wakeData.character
      ) {
        this.player.changeCharacter(wakeData.character);
        this.characterKey = wakeData.character;
      }

      this.cameras.main.fadeIn(500);
      this.checkHUD();
      this.updateMissionMarker();
    });
  }

  /**
   * Retorna à cena pai com um fadeOut.
   * Usa `wake` se a cena pai já existir adormecida; caso contrário, usa `run`.
   */
  exitInterior() {
    this.isTransitioning = true;
    this.cameras.main.fadeOut(400);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.sleep();

      const parentSceneObj = this.scene.manager.getScene(this.cfg.parentScene);
      const returnData = {
        character: this.characterKey,
        ...(this.cfg.parentData || {}),
        ...(this.cfg.returnSpawn || {}),
      };

      if (parentSceneObj?.scene.isSleeping()) {
        this.scene.wake(this.cfg.parentScene, returnData);
      } else {
        this.scene.run(this.cfg.parentScene, returnData);
      }
    });
  }

  /**
   * Garante que o HUD principal (e o HUD mobile, se necessário) estejam ativos e no topo.
   */
  checkHUD() {
    this.scene.run("PlayerHudScene", { character: this.characterKey });
    this.scene.bringToTop("PlayerHudScene");

    if (!this.sys.game.device.os.desktop) {
      this.scene.run("MobileHudScene");
      this.scene.bringToTop("MobileHudScene");
    }
  }

  /** Processa input, atualiza o jogador e os NPCs a cada frame. */
  update() {
    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: this.scene.key });
    }

    if (this.player) {
      this.player.update();
      // Depth dinâmica: o jogador aparece na frente de objetos com Y menor que o seu
      this.player.setDepth(Math.max(10, 9 + this.player.y));
    }

    if (this.npcManager) this.npcManager.update();
  }

  /**
   * Atualiza o marcador flutuante que aponta para o NPC da missão atual.
   * O marcador só aparece se a missão vigente estiver dentro deste interior.
   */
  updateMissionMarker() {
    if (!this.markerManager) return;
    this.markerManager.clear();

    const worldId = ProgressManager.sceneKeyToWorldId(this.cfg.parentScene);
    const target = ProgressManager.getCurrentMissionTarget(worldId);

    if (target?.interiorKey === this.scene.key && this.npcManager) {
      const npcSprite = this.npcManager.npcs.find((n) => n.id === target.id);
      if (npcSprite) {
        this.markerManager.addMarker(
          npcSprite.x,
          npcSprite.y - 40,
          `Negociação: ${target.name}`,
          { hideOnProx: 50 }, // Some quando o jogador chega perto
        );
      }
    }
  }
}
