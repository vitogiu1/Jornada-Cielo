/**
 * @fileoverview Cena da Fazenda.
 * Área rural que conecta o Centro da Cidade à Praia.
 * @module scenes/FarmScene
 */

import Phaser from "phaser";
import { Player } from "../../entities/Player";
import { GameConfig } from "../../core/config";
import { NPCManager } from "../../managers/NPCManager";
import { farmNPCs } from "../../data/npcs";
import { MarkerManager } from "../../managers/MarkerManager";
import { ProgressManager } from "../../managers/ProgressManager";

/** @extends Phaser.Scene */
export class FarmScene extends Phaser.Scene {
  constructor() {
    super("FarmScene");
    this.player = null;
    this.characterKey = "amanda";
    this.isTransitioning = false;
    this.mapY = 0;
    this.npcManager = null;
  }

  /** Recebe o personagem e os dados de spawn vindos de outra cena. */
  init(data) {
    this.characterKey = data.character || "amanda";
    this.isTransitioning = false;
    this.mapY = 0;
    this.spawnFromCentro = Boolean(data.spawnFromCentro);
    this.spawnFromPraia = Boolean(data.spawnFromPraia);
  }

  create() {
    // Verifica, inicia e coloca o HUD no topo.
    this.checkHUD();

    // Carrega o tilemap da fazenda.
    const map = this.make.tilemap({ key: "farm-map" });
    if (!map) {
      console.error('Não foi possível carregar o tilemap "farm-map".');
      return;
    }

    // Vincula o tileset ao mapa (tenta dois nomes possíveis).
    const tileset = map.addTilesetImage("nova farm", "farm-tiles-image");
    if (!tileset) {
      console.error("Não foi possível vincular o tileset da fazenda.");
      return;
    }

    const mapX = 0;
    const mapY = 0;
    this.mapY = mapY;

    // Cria a camada visual do chão.
    const floorLayer = map.createLayer(
      "Camada de Blocos 1",
      tileset,
      mapX,
      mapY,
    );
    if (!floorLayer) {
      console.error("Não foi possível criar a camada base da fazenda.");
      return;
    }

    floorLayer.setDepth(0);

    // Define os limites físicos do mundo pelo tamanho do mapa.
    this.physics.world.setBounds(
      mapX,
      mapY,
      map.widthInPixels,
      map.heightInPixels,
    );

    // Ponto de spawn padrão (centro do mapa, agora na estrada).
    const defaultSpawnX = mapX + 305;
    const defaultSpawnY = mapY + 550;
    const topRoadY = mapY + map.tileHeight * 3;

    // Spawn ao vir do Centro: posição segura longe da borda.
    const centroRoadY = mapY + map.tileHeight * 33;
    const centroSpawnX = mapX + map.tileWidth * 16;
    const centroSpawnY = centroRoadY + map.tileHeight;

    // Spawn ao voltar da Praia: longe do trigger de ida para evitar loop.
    const praiaReturnSpawnX = mapX + map.tileWidth * 20;
    const praiaReturnSpawnY = topRoadY + map.tileHeight * 4;

    // Escolhe o ponto de spawn conforme a cena de origem.
    const spawnX = this.spawnFromCentro
      ? centroSpawnX
      : this.spawnFromPraia
        ? praiaReturnSpawnX
        : defaultSpawnX;
    const spawnY = this.spawnFromCentro
      ? centroSpawnY
      : this.spawnFromPraia
        ? praiaReturnSpawnY
        : defaultSpawnY;

    // Cria o jogador no ponto de spawn.
    this.player = new Player(this, spawnX, spawnY, this.characterKey, {
      scale: 2,
    });
    this.physics.add.existing(this.player);
    this.player.setFootHitbox(10, 8);
    this.player.setCollideWorldBounds(true);

    // Cria um retângulo invisível de colisão.
    const addCollisionRect = (x, y, width, height) => {
      const colliderRect = this.add.rectangle(x, y, width, height, 0x00ff00, 0);
      this.physics.add.existing(colliderRect, true);
      this.physics.add.collider(this.player, colliderRect);
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

    // Lê os objetos de colisão definidos no Tiled e os adiciona à física.
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
        "Nenhuma object layer de colisão encontrada no mapa da fazenda.",
      );
    }

    let collisionCount = 0;
    if (collisionLayer?.objects?.length) {
      collisionLayer.objects.forEach((obj) => {
        if (!obj.width || !obj.height) return;
        addCollisionRect(
          mapX + obj.x + obj.width / 2,
          mapY + obj.y + obj.height / 2,
          obj.width,
          obj.height,
        );
        collisionCount += 1;
      });
    }

    if (collisionCount === 0) {
      const cachedObjects = collectCollisionObjectsFromCache("farm-map");
      cachedObjects.forEach((obj) => {
        if (obj.width == null || obj.height == null) return;
        addCollisionRect(
          mapX + obj.x + obj.width / 2,
          mapY + obj.y + obj.height / 2,
          obj.width,
          obj.height,
        );
        collisionCount += 1;
      });
    }

    if (collisionCount === 0) {
      console.error("Falha ao criar hitboxes de colisão no mapa da fazenda.");
    }

    // Configura a câmera para seguir o jogador.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setZoom(GameConfig.cameraZoom);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.fadeIn(500);

    // Cria os NPCs da fazenda.
    this.npcManager = new NPCManager(this);
    this.npcManager.create(farmNPCs, mapX, mapY);
    this.npcManager.setupInteraction(this.player);

    // Marcadores de missão: indica qual o próximo NPC de negociação obrigatória.
    this.markerManager = new MarkerManager(this);
    this.updateMissionMarker();

    // Registra o evento de 'resume' para atualizar o marcador quando voltar de uma negociação.
    this.events.on("resume", () => {
      this.updateMissionMarker();
      this.checkHUD();
    });

    // Configura a tecla ESC para abrir o menu de pausa.
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // ─── Triggers de entrada nos interiores ───
    const addEntryTrigger = (x, y, w, h, targetScene) => {
      const trigger = this.add.rectangle(x, y, w, h, 0x00ff00, 0);
      this.physics.add.existing(trigger, true);
      this.physics.add.overlap(this.player, trigger, () => {
        if (!this.isTransitioning) {
          this.isTransitioning = true;
          this.cameras.main.fadeOut(400);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.sleep();
            let targetSceneObj = this.scene.manager.getScene(targetScene);
            if (targetSceneObj.scene.isSleeping()) {
              this.scene.wake(targetScene, { character: this.characterKey });
            } else {
              this.scene.run(targetScene, { character: this.characterKey });
            }
          });
        }
      });
    };

    // Coordenadas baseadas nos gaps reais colisão mapa (JSON parsed) e ajustados para a soleira
    addEntryTrigger(mapX + 266, mapY + 204, 64, 64, "CeleiroScene");
    addEntryTrigger(mapX + 476, mapY + 204, 64, 64, "CasaAmarelaScene");
    addEntryTrigger(mapX + 640, mapY + 670, 64, 64, "CasaAmarela2Scene");
    addEntryTrigger(mapX + 800, mapY + 685, 64, 64, "LojaScene");
    addEntryTrigger(mapX + 920, mapY + 745, 64, 64, "BarScene");

    // Lida com o retorno da cena interior
    this.events.on("wake", () => {
      this.isTransitioning = false;
      this.player.y += 40; // Afasta o jogador consideravelmente da porta
      this.cameras.main.fadeIn(500);
      this.checkHUD();
      this.updateMissionMarker();
    });
  }

  /**
   * Atualiza o marcador de objetivo para apontar para o próximo NPC de negociação.
   */
  updateMissionMarker() {
    if (!this.markerManager) return;
    this.markerManager.clear();

    const worldId = ProgressManager.sceneKeyToWorldId(this.scene.key);
    const target = ProgressManager.getCurrentMissionTarget(worldId);

    if (target) {
      this.markerManager.addMarker(
        target.x,
        target.y,
        `Negociação: ${target.name}`,
        {
          hideOnProx: 60,
        },
      );
    }
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
    // Verifica se a tecla ESC foi pressionada para pausar o jogo.
    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: "FarmScene" });
    }

    if (!this.player) return;

    this.player.update();

    // Ajusta a profundidade pelo Y para simular perspectiva 2D.
    this.player.setDepth(Math.max(10, 9 + (this.player.y - this.mapY)));

    if (this.npcManager) this.npcManager.update();
    if (this.markerManager) this.markerManager.update();
  }
}
