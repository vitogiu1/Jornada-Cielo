/**
 * @fileoverview Cena base para interiores reutilizáveis.
 * Carrega qualquer estabelecimento fechado (lojas, casas, celeiros)
 * a partir de parâmetros de configuração, sem precisar criar uma cena separada para cada um.
 * @module scenes/InteriorScene
 */

import Phaser from "phaser";
import { Player } from "../../entities/Player";
import { NPCManager } from "../../managers/NPCManager";
import { MarkerManager } from "../../managers/MarkerManager";
import { interiorNPCs } from "../../data/npcs";
import { ProgressManager } from "../../managers/ProgressManager";

/**
 * Cena genérica de interior reutilizável.
 * Em vez de criar uma cena separada para cada estabelecimento,
 * esta classe recebe os dados do mapa via configuração e monta tudo automaticamente.
 * @extends Phaser.Scene
 */
export class InteriorScene extends Phaser.Scene {
  /**
   * @param {Object} cfg - Configuração do interior.
   * @param {string} cfg.key - Chave da cena (ex: "ChaveiroScene").
   * @param {string} cfg.mapKey - Chave do tilemap carregado no preload (JSON).
   * @param {string} cfg.tilesetImageKey - Chave da imagem do tileset.
   * @param {string} cfg.tilesetName - Nome do tileset conforme definido no Tiled.
   * @param {string} cfg.parentScene - Cena para onde o jogador volta ao sair.
   * @param {Object} [cfg.parentData] - Dados extras passados de volta à cena pai.
   */
  constructor(cfg) {
    super(cfg.key);
    this.cfg = cfg; //Recebe um objeto com as configurações da cena.
    this.player = null;
    this.characterKey = "amanda";
    this.isTransitioning = false;
  }

  /**
   * Recebe os dados de spawn passados ao iniciar a cena.
   */
  init(data) {
    this.spawnPoint = data || {};
    this.characterKey = this.spawnPoint.character || "amanda";
    this.spawnX = Number.isFinite(this.spawnPoint.x) ? this.spawnPoint.x : null;
    this.spawnY = Number.isFinite(this.spawnPoint.y) ? this.spawnPoint.y : null;
    this.isTransitioning = false;
  }

  create(data = this.spawnPoint) {
    // Verifica, inicia e coloca o HUD no topo.
    this.checkHUD();

    // Carrega o tilemap do interior.
    const map = this.make.tilemap({ key: this.cfg.mapKey });
    if (!map) {
      console.error(
        `Não foi possível carregar o tilemap "${this.cfg.mapKey}".`,
      );
      return;
    }

    // Vincula o tileset ao mapa.
    const tileset = map.addTilesetImage(
      this.cfg.tilesetName,
      this.cfg.tilesetImageKey,
    );
    if (!tileset) {
      console.error(
        `Não foi possível vincular o tileset "${this.cfg.tilesetName}" com imagem "${this.cfg.tilesetImageKey}".`,
      );
      return;
    }

    const mapX = 0;
    const mapY = 0;

    // Cria a camada visual (tenta nomes comuns do Tiled).
    const floorLayer =
      map.createLayer("Camada de Blocos 1", tileset, mapX, mapY) ||
      map.createLayer("chao", tileset, mapX, mapY);

    if (!floorLayer) {
      console.error(
        `Não foi possível criar a camada base para "${this.cfg.key}".`,
      );
      return;
    }
    const mapScale = 1.0;
    floorLayer.setDepth(0);
    floorLayer.setScale(mapScale);

    // Define os limites físicos do mundo.
    this.physics.world.setBounds(
      mapX,
      mapY,
      map.widthInPixels * mapScale,
      map.heightInPixels * mapScale,
    );

    // Spawn do jogador no centro horizontal e próximo da porta de saída (baseado no tilemap).
    const spawnX = map.widthInPixels / 2;
    const spawnY = map.heightInPixels - 200;

    this.player = new Player(this, spawnX, spawnY, this.characterKey, {
      scale: 3,
    });
    this.physics.add.existing(this.player);
    this.player.setPosition(spawnX, spawnY);
    this.player.setFootHitbox(10, 8);
    this.player.setCollideWorldBounds(true);

    // Cria retângulos de colisão invisíveis.
    const addCollisionRect = (x, y, width, height) => {
      const rect = this.add.rectangle(x, y, width, height, 0x00ff00, 0);
      this.physics.add.existing(rect, true);
      this.physics.add.collider(this.player, rect);
    };

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

    // Lê os objetos de colisão do Tiled.
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
      console.warn(`Nenhuma layer de colisão encontrada em "${this.cfg.key}".`);
    }

    let collisionCount = 0;
    if (collisionLayer?.objects?.length) {
      collisionLayer.objects.forEach((obj) => {
        if (!obj.width || !obj.height) return;
        addCollisionRect(
          mapX + obj.x * mapScale + (obj.width * mapScale) / 2,
          mapY + obj.y * mapScale + (obj.height * mapScale) / 2,
          obj.width * mapScale,
          obj.height * mapScale,
        );
        collisionCount += 1;
      });
    }

    if (collisionCount === 0) {
      const cachedObjects = collectCollisionObjectsFromCache(this.cfg.mapKey);
      cachedObjects.forEach((obj) => {
        if (obj.width == null || obj.height == null) return;
        addCollisionRect(
          mapX + obj.x * mapScale + (obj.width * mapScale) / 2,
          mapY + obj.y * mapScale + (obj.height * mapScale) / 2,
          obj.width * mapScale,
          obj.height * mapScale,
        );
        collisionCount += 1;
      });
    }

    if (collisionCount === 0) {
      console.error(`Falha ao criar hitboxes de colisão em "${this.cfg.key}".`);
    }

    const worldWidth = map.widthInPixels * mapScale;
    const worldHeight = map.heightInPixels * mapScale;
    const objects = (collisionLayer?.objects || []).filter(
      (obj) => obj.width && obj.height,
    );

    const mergeIntervals = (intervals) => {
      const sorted = intervals
        .map(([start, end]) => [Math.max(0, start), Math.min(worldWidth, end)])
        .filter(([start, end]) => end > start)
        .sort((a, b) => a[0] - b[0]);

      const merged = [];
      sorted.forEach(([start, end]) => {
        if (!merged.length || start > merged[merged.length - 1][1]) {
          merged.push([start, end]);
        } else {
          merged[merged.length - 1][1] = Math.max(
            merged[merged.length - 1][1],
            end,
          );
        }
      });
      return merged;
    };

    const buildGapsAtY = (sampleY) => {
      const blocked = objects
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

    const sampleY = mapY + worldHeight - map.tileHeight * mapScale * 4;
    const minDoorWidth = map.tileWidth * mapScale * 2;
    const doorCandidates = buildGapsAtY(sampleY).filter(
      ([start, end]) => end - start >= minDoorWidth,
    );

    const centerX = mapX + worldWidth / 2;
    const selectedDoor = doorCandidates.sort((a, b) => {
      const aCenter = mapX + (a[0] + a[1]) / 2;
      const bCenter = mapX + (b[0] + b[1]) / 2;
      return Math.abs(aCenter - centerX) - Math.abs(bCenter - centerX);
    })[0] || [map.tileWidth * mapScale * 24, map.tileWidth * mapScale * 40];

    const exitCenterX = mapX + (selectedDoor[0] + selectedDoor[1]) / 2;
    const exitWidth = Math.max(
      map.tileWidth * mapScale * 2,
      Math.min(selectedDoor[1] - selectedDoor[0], map.tileWidth * mapScale * 8),
    );
    const exitHeight = map.tileHeight * mapScale * 2;
    const exitY = mapY + worldHeight - map.tileHeight * mapScale * 7;

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
      if (!this.isTransitioning) {
        this.exitInterior();
      }
    });

    // Câmera.
    this.cameras.main.startFollow(this.player, true, 1, 1);
    // Define zoom diferenciado por cena: Sorveteria e Estacionamento (1.8), outros (1.5).
    let zoomLevel = 1.5;
    if (
      this.scene.key === "SorveteriaScene" ||
      this.scene.key === "EstacionamentoScene"
    ) {
      zoomLevel = 1.8;
    }
    this.cameras.main.setZoom(zoomLevel);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.fadeIn(500);

    // Cria os NPCs do interior.
    this.npcManager = new NPCManager(this);
    const sceneNPCs = interiorNPCs[this.cfg.key] || [];
    const defNpcX = (map.widthInPixels * mapScale) / 2;
    // Centraliza o NPC um pouco abaixo do meio para desviar das paredes de fundo.
    const defNpcY = (map.heightInPixels * mapScale) / 2 - 20;

    sceneNPCs.forEach((npc) => {
      npc.x = npc.x || defNpcX;
      npc.y = npc.y || defNpcY;
    });
    try {
      // interactionRadius aumentado para 110 para permitir interação sobre balcões grandes.
      this.npcManager.create(sceneNPCs, mapX, mapY, {
        scale: 2.5,
        interactionRadius: 110,
      });
      this.npcManager.setupInteraction(this.player);
    } catch (err) {
      console.error("Erro ao criar NPCs no InteriorScene", err);
    }

    // Marcador de missão indicando o NPC da negociação atual.
    this.markerManager = new MarkerManager(this);
    this.updateMissionMarker();

    // ESC para pausar.
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // Resume handler para HUD e marcadores.
    this.events.on("resume", () => {
      this.checkHUD();
      this.updateMissionMarker();
    });

    // Reposiciona o jogador ao re-entrar no interior.
    this.events.on("wake", (_sys, data) => {
      this.isTransitioning = false;
      const targetX = Number.isFinite(data?.x) ? data.x : spawnX;
      const targetY = Number.isFinite(data?.y) ? data.y : spawnY;
      this.player.setPosition(targetX, targetY);
      if (data?.character && this.player.characterKey !== data.character) {
        this.player.changeCharacter(data.character);
        this.characterKey = data.character;
      }
      this.cameras.main.fadeIn(500);
      this.checkHUD();
      this.updateMissionMarker();
    });
  }

  /** Volta para a cena pai com fadeOut. */
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

      if (parentSceneObj && parentSceneObj.scene.isSleeping()) {
        this.scene.wake(this.cfg.parentScene, returnData);
      } else {
        this.scene.run(this.cfg.parentScene, returnData);
      }
    });
  }

  /** Verifica e inicia o HUD se necessário. */
  checkHUD() {
    this.scene.run("PlayerHudScene", { character: this.characterKey });
    this.scene.bringToTop("PlayerHudScene");

    const isMobile = !this.sys.game.device.os.desktop;
    if (isMobile) {
      this.scene.run("MobileHudScene");
      this.scene.bringToTop("MobileHudScene");
    }
  }

  /** Atualiza o jogador, NPCs e marcadores a cada frame. */
  update() {
    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: this.scene.key });
    }

    if (this.player) {
      this.player.update();
      this.player.setDepth(Math.max(10, 9 + this.player.y));
    }
    if (this.npcManager) this.npcManager.update();
  }

  /**
   * Atualiza o marcador da missão atual para o NPC dentro desse interior.
   */
  updateMissionMarker() {
    if (!this.markerManager) return;
    this.markerManager.clear();

    const worldId = ProgressManager.sceneKeyToWorldId(this.cfg.parentScene);
    const target = ProgressManager.getCurrentMissionTarget(worldId);

    // Exibe o marcador apenas se a missão atual estiver dentro desta cena.
    if (target && target.interiorKey === this.scene.key && this.npcManager) {
      const npcSprite = this.npcManager.npcs.find((n) => n.id === target.id);
      if (npcSprite) {
        this.markerManager.addMarker(
          npcSprite.x,
          npcSprite.y - 40,
          `Negociação: ${target.name}`,
          {
            hideOnProx: 50,
          },
        );
      }
    }
  }
}
