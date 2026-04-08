/**
 * @fileoverview Cena da Zona Industrial.
 * Área ao sul do mapa, acessível pela Praia.
 * @module scenes/IndustrialScene
 */

import Phaser from "phaser";
import { Player } from "../../entities/Player";
import { GameConfig } from "../../core/config";
import { NPCManager } from "../../managers/NPCManager";
import { industrialNPCs } from "../../data/npcs";
import { MarkerManager } from "../../managers/MarkerManager";
import { ProgressManager } from "../../managers/ProgressManager";

/** @extends Phaser.Scene */
export class IndustrialScene extends Phaser.Scene {
  constructor() {
    super("IndustrialScene");
    this.player = null;
    this.characterKey = "amanda";
    this.isTransitioning = false;
    this.mapY = 0;
    this.npcManager = null;
  }

  /** Recebe o personagem e verifica se o spawn vem da Praia. */
  init(data) {
    this.characterKey = data.character || "amanda";
    this.isTransitioning = false;
    this.mapY = 0;
    this.spawnFromPraia = Boolean(data.spawnFromPraia);
  }

  create() {
    if (!this.scene.isActive("PlayerHudScene")) {
      this.scene.launch("PlayerHudScene", { character: this.characterKey });
    }

    // Gerenciamento da trilha sonora: se uma música de mapa já estiver tocando, ela é parada para o início da nova.
    const mapMusics = [
      "farm_music",
      "beach_music",
      "cielo_music",
      "city_music",
      "industrial_music",
      "music_menu",
    ];
    mapMusics.forEach((key) => {
      if (key !== "industrial_music") {
        this.sound.getAll(key).forEach((s) => s.stop());
      }
    });

    // Inicia a música industrial se não estiver ativa.
    if (!this.sound.get("industrial_music")?.isPlaying) {
      this._playMapMusic();
    } else {
      this.backgroundMusic = this.sound.get("industrial_music");
    }

    // Registra evento de shutdown para parar a música ao fechar a cena (não afeta sleep).
    this.events.once("shutdown", () => {
      if (this.backgroundMusic) this.backgroundMusic.stop();
    });

    // Se a cena for pausada (por menu ou negociação), para a música.
    this.events.on("pause", () => {
      if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
        this.backgroundMusic.stop();
      }
    });

    // Se a cena for retomada, reinicia a música.
    this.events.on("resume", () => {
      this._playMapMusic();
    });

    // Carrega o tilemap da industrial.
    const map = this.make.tilemap({ key: "industrial-map" });
    if (!map) {
      console.error('Não foi possível carregar o tilemap "industrial-map".');
      return;
    }

    // Vincula o tileset ao mapa (tenta dois nomes possíveis).
    const tileset =
      map.addTilesetImage("industria", "industrial-tiles-image") ||
      map.addTilesetImage("industrial_tiles", "industrial-tiles-image");
    if (!tileset) {
      console.error("Não foi possível vincular o tileset industrial.");
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
      console.error("Não foi possível criar a camada base industrial.");
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

    // Ponto de spawn padrão (centro do mapa).
    const defaultSpawnX = mapX + map.widthInPixels / 2;
    const defaultSpawnY = mapY + map.heightInPixels / 2;

    // Spawn ao vir da Praia: próximo à borda superior.
    const topRoadY = mapY + map.tileHeight * 3;
    const praiaSpawnX = mapX + map.widthInPixels / 2;
    const praiaSpawnY = topRoadY + map.tileHeight * 4;

    // Escolhe o ponto de spawn conforme a cena de origem.
    const spawnX = this.spawnFromPraia ? praiaSpawnX : defaultSpawnX;
    const spawnY = this.spawnFromPraia ? praiaSpawnY : defaultSpawnY;

    // Cria o jogador no ponto de spawn.
    this.player = new Player(this, spawnX, spawnY, this.characterKey, {
      scale: 2,
    });
    this.physics.add.existing(this.player);
    this.player.setFootHitbox(10, 8);
    this.player.setCollideWorldBounds(true);

    // Cria um retângulo invisível de colisão com tamanho mínimo seguro.
    const addCollisionRect = (x, y, width, height) => {
      const safeWidth = Math.max(2, Math.abs(width));
      const safeHeight = Math.max(2, Math.abs(height));
      const colliderRect = this.add.rectangle(
        x,
        y,
        safeWidth,
        safeHeight,
        0x00ff00,
        0,
      );
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
        "Nenhuma object layer de colisão encontrada no mapa industrial.",
      );
    }

    let collisionCount = 0;
    if (collisionLayer?.objects?.length) {
      collisionLayer.objects.forEach((obj) => {
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
      const cachedObjects = collectCollisionObjectsFromCache("industrial-map");
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
      console.error("Falha ao criar hitboxes de colisão no mapa industrial.");
    }

    // Configura a câmera para seguir o jogador.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setZoom(GameConfig.cameraZoom);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.fadeIn(500);

    // Cria os NPCs da industrial.
    this.npcManager = new NPCManager(this);
    this.npcManager.create(industrialNPCs, mapX, mapY);
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
            if (targetSceneObj && targetSceneObj.scene.isSleeping()) {
              this.scene.wake(targetScene, { character: this.characterKey });
            } else {
              this.scene.run(targetScene, { character: this.characterKey });
            }
          });
        }
      });
    };

    // Coordenadas baseadas nos gaps reais colisão mapa (JSON parsed) e ajustados para a soleira
    addEntryTrigger(mapX + 160, mapY + 200, 64, 64, "MecanicaScene");
    addEntryTrigger(mapX + 640, mapY + 183, 64, 64, "CentroMotorScene"); // Sem colisão
    addEntryTrigger(mapX + 156, mapY + 400, 64, 64, "CentroSuprimentoScene");
    addEntryTrigger(mapX + 360, mapY + 840, 64, 64, "CentroDePecasScene");
    addEntryTrigger(mapX + 790, mapY + 585, 64, 64, "GalpaoMergulhoScene");
    addEntryTrigger(mapX + 156, mapY + 620, 64, 64, "SecaoHidraulicaScene");

    // Lida com o retorno da cena interior
    this.events.on("wake", (_sys, data) => {
      this.isTransitioning = false;
      if (Number.isFinite(data?.x) && Number.isFinite(data?.y)) {
        this.player.setPosition(data.x, data.y);
      } else {
        this.player.y += 40;
      }
      this.cameras.main.fadeIn(500);
      this.checkHUD();
      this.updateMissionMarker();
      // Retoma a música ao acordar do sleep (ex: retorno de interior).
      this._playMapMusic();
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

  /** Inicia (ou reinicia) a música de fundo da zona industrial de forma segura. */
  _playMapMusic() {
    const vol = this.registry.get("musicVolume") ?? 0.3;
    let existing = this.sound.get("industrial_music");

    // Recicla se já existe a música em cache
    if (existing) {
      this.backgroundMusic = existing;
    } else {
      this.backgroundMusic = this.sound.add("industrial_music", {
        loop: true,
      });
    }

    this.backgroundMusic.setVolume(vol);

    // Evita sobreposição iniciando música que já está tocando
    if (!this.backgroundMusic.isPlaying) {
      this.backgroundMusic.play();
    }
  }

  /** Verifica e inicia o HUD se necessário. */
  checkHUD() {
    if (!this.scene.isActive("PlayerHudScene")) {
      this.scene.launch("PlayerHudScene", { character: this.characterKey });
    }
    const isMobile = !this.sys.game.device.os.desktop;
    if (isMobile && !this.scene.isActive("MobileHudScene")) {
      this.scene.launch("MobileHudScene");
    }
  }

  /** Atualiza o jogador, NPCs e marcadores a cada frame. */
  update() {
    // Verifica se a tecla ESC foi pressionada para pausar o jogo.
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: "IndustrialScene" });
    }

    if (!this.player) return;

    this.player.update();

    // Ajusta a profundidade pelo Y para simular perspectiva 2D.
    this.player.setDepth(Math.max(10, 9 + (this.player.y - this.mapY)));

    if (this.npcManager) this.npcManager.update();
    if (this.markerManager) this.markerManager.update();
  }
}
