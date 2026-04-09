/**
 * @fileoverview Cena do Centro da Cidade.
 * Mapa principal externo que conecta as outras zonas do jogo (Fazenda, Praia, Indústria).
 * @module scenes/CityScene
 */

import Phaser from "phaser";
import { Player } from "../../entities/Player";
import { AnimationManager } from "../../managers/AnimationManager";
import { GameConfig } from "../../core/config";
import { NPCManager } from "../../managers/NPCManager";
import { cityNPCs } from "../../data/npcs";
import { MarkerManager } from "../../managers/MarkerManager";
import { ProgressManager } from "../../managers/ProgressManager";

/** @extends Phaser.Scene */
export class CityScene extends Phaser.Scene {
  constructor() {
    super("CityScene");
    this.player = null;
    this.characterKey = "amanda";
    this.isTransitioning = false;
    this.canTeleport = true;
    this.mapY = 0;
    this.npcManager = null;
  }

  /** Recebe o personagem e os dados de spawn vindos de outra cena. */
  init(data) {
    this.spawnPoint = data || {};
    this.characterKey =
      this.spawnPoint.character || this.registry.get("playerSprite") || "amanda";
    this.isTransitioning = false;
    this.canTeleport = true;
    this.mapY = 0;
    this.spawnAtCieloDoor = Boolean(this.spawnPoint.spawnAtCieloDoor);
    this.spawnFromFarm = Boolean(this.spawnPoint.spawnFromFarm);
  }

  create(data = this.spawnPoint) {
    // Persiste estado de localização
    this.registry.set("lastScene", "CityScene");
    this.registry.set("lastWorldId", "city");
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
      if (key !== "city_music") {
        this.sound.getAll(key).forEach((s) => s.stop());
      }
    });

    // Inicia a música da cidade se não estiver ativa.
    if (!this.sound.get("city_music")?.isPlaying) {
      this._playMapMusic();
    } else {
      this.backgroundMusic = this.sound.get("city_music");
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

    // Verifica, inicia e coloca o HUD no topo.
    this.checkHUD();

    // Carrega o tilemap da cidade.
    const map = this.make.tilemap({ key: "centro-cidade-map" });
    if (!map) {
      console.error('Não foi possível carregar o tilemap "centro-cidade-map".');
      return;
    }

    // Vincula o tileset ao mapa (tenta dois nomes possíveis).
    const tileset =
      map.addTilesetImage("mapa_novoo", "mapa-residencial-image") ||
      map.addTilesetImage("city_tiles", "mapa-residencial-image");
    if (!tileset) {
      console.error("Não foi possível vincular o tileset do centro da cidade.");
      return;
    }

    const mapX = 0;
    const mapY = 0;
    this.mapY = mapY;

    // Cria as camadas visuais do mapa (tenta dois nomes possíveis para o chão).
    const floorLayer =
      map.createLayer("chao", tileset, mapX, mapY) ||
      map.createLayer("Camada de Blocos 1", tileset, mapX, mapY);
    const buildingLayer = map.createLayer("predio", tileset, mapX, mapY);

    if (!floorLayer) {
      console.error("Não foi possível criar a camada base da cidade.");
      return;
    }

    floorLayer.setDepth(0);
    if (buildingLayer) buildingLayer.setDepth(8);

    // Intervalos de índice dos tiles de fios/cabos elétricos.
    const wireTileRanges = [
      [3863, 4134],
      [3952, 4096],
    ];

    // Verifica se um tile pertence ao grupo de fios.
    const isWireTile = (index) =>
      wireTileRanges.some(([start, end]) => index >= start && index <= end);

    // Cria uma camada separada para os fios, para que fiquem sempre acima do jogador.
    const wireLayer = buildingLayer
      ? map.createBlankLayer(
          "fios-overhead",
          tileset,
          mapX,
          mapY,
          map.width,
          map.height,
          map.tileWidth,
          map.tileHeight,
        )
      : null;

    if (wireLayer && buildingLayer) {
      // Move os tiles de fio da camada de prédios para a camada de fios.
      buildingLayer.forEachTile((tile) => {
        if (!tile || tile.index <= 0 || !isWireTile(tile.index)) return;
        wireLayer.putTileAt(tile.index, tile.x, tile.y);
        buildingLayer.putTileAt(-1, tile.x, tile.y);
      });

      // Fios ficam acima de tudo, incluindo o jogador.
      wireLayer.setDepth(2000);
    }

    if (buildingLayer) {
      // Remove colisão dos tiles de fio (são apenas visuais).
      const wireIndexes = [];
      wireTileRanges.forEach(([start, end]) => {
        for (let i = start; i <= end; i++) wireIndexes.push(i);
      });
      buildingLayer.setCollision(wireIndexes, false, true);

      // Aplica colisão em todos os outros tiles da camada de prédios.
      buildingLayer.setCollisionByExclusion([-1, 0], true);
    }

    // Define os limites físicos do mundo pelo tamanho do mapa.
    this.physics.world.setBounds(
      mapX,
      mapY,
      map.widthInPixels,
      map.heightInPixels,
    );

    // Pontos de spawn conforme a cena de origem.
    const defaultSpawnX = mapX + map.widthInPixels / 2;
    const defaultSpawnY = mapY + map.heightInPixels / 2;
    const cieloSpawnX = mapX + 13 * map.tileWidth + 88;
    const cieloSpawnY = mapY + 11 * map.tileHeight;
    const farmRoadY = mapY + map.tileHeight * 33;
    const farmSpawnX = mapX + map.widthInPixels - map.tileWidth * 6;
    const farmSpawnY = farmRoadY;

    // Escolhe o ponto de spawn conforme a cena de origem.
    const spawnX = this.spawnAtCieloDoor
        ? cieloSpawnX
        : this.spawnFromFarm
          ? farmSpawnX
          : defaultSpawnX;
    const spawnY = this.spawnAtCieloDoor
        ? cieloSpawnY
        : this.spawnFromFarm
          ? farmSpawnY
          : defaultSpawnY;

    // Registra animações se necessário
    AnimationManager.createAnimations(this, this.characterKey);

    // Cria o jogador no ponto de spawn.
    this.player = new Player(this, spawnX, spawnY, this.characterKey, {
      scale: 2,
    });
    this.physics.add.existing(this.player);
    this.player.setFootHitbox(10, 8);
    this.player.setCollideWorldBounds(true);
    if (buildingLayer) this.physics.add.collider(this.player, buildingLayer);

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
        "Nenhuma object layer de colisão encontrada no mapa da cidade.",
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
      const cachedObjects =
        collectCollisionObjectsFromCache("centro-cidade-map");
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
      console.error("Falha ao criar hitboxes de colisão no mapa da cidade.");
    }

    // Configura a câmera para seguir o jogador.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setZoom(GameConfig.cameraZoom);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.fadeIn(500);

    // Cria os NPCs da cidade.
    this.npcManager = new NPCManager(this);
    this.npcManager.create(cityNPCs, mapX, mapY);
    this.npcManager.setupInteraction(this.player);

    // Marcador de missão: indica qual o próximo NPC de negociação obrigatória.
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
    this.cursors = this.input.keyboard.createCursorKeys();

    const portas = [
      {
        x: 290,
        y: 135,
        w: 40,
        h: 20,
        target: "CieloScene",
        inX: 400,
        inY: 500,
      },
      {
        x: 535,
        y: 135,
        w: 60,
        h: 20,
        target: "EstacionamentoScene",
        inX: 400,
        inY: 500,
      },
      {
        x: 800,
        y: 135,
        w: 40,
        h: 20,
        target: "SorveteriaScene",
        inX: 400,
        inY: 500,
      },
      {
        x: 285,
        y: 490,
        w: 40,
        h: 20,
        target: "MuseuScene",
        inX: 400,
        inY: 500,
      },
      {
        x: 515,
        y: 490,
        w: 60,
        h: 20,
        target: "TeatroScene",
        inX: 400,
        inY: 500,
      },
      {
        x: 860,
        y: 490,
        w: 40,
        h: 20,
        target: "FloriculturaScene",
        inX: 400,
        inY: 500,
      },
      {
        x: 910,
        y: 810,
        w: 60,
        h: 20,
        target: "ChaveiroScene",
        inX: 400,
        inY: 500,
      },
    ];

    portas.forEach((p) => {
      const zone = this.add.zone(p.x, p.y, p.w, p.h).setOrigin(0, 0);
      this.physics.add.existing(zone, true);
      zone.body.setSize(p.w, p.h);
      this.physics.add.overlap(this.player, zone, () => {
        console.log("Detectou colisao com:", p.target);

        const mob = this.registry.get("mobileButtons") || {};
        const isUpPressed =
          this.cursors?.up?.isDown ||
          this.player?.wasd?.up?.isDown ||
          mob.up ||
          (mob.forceY && mob.forceY < -0.5);

        if (isUpPressed) {
          console.log("Apertou UP, iniciando cena:", p.target);
        }

        if (!isUpPressed || this.isTransitioning) return;
        this.isTransitioning = true;

        // Coloca a cidade em sleep e inicia o interior preservando a música.
        this.cameras.main.fadeOut(400);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.sleep();
          const targetSceneObj = this.scene.manager.getScene(p.target);
          // Verifica se a cena do interior existe e está dormindo.
          if (targetSceneObj && targetSceneObj.scene.isSleeping()) {
            this.scene.wake(p.target, {
              x: p.inX,
              y: p.inY,
              character: this.characterKey,
              fromCity: p.target === "CieloScene",
            });
          } else {
            // Inicia ou reinicia a cena do interior.
            this.scene.run(p.target, {
              x: p.inX,
              y: p.inY,
              character: this.characterKey,
              fromCity: p.target === "CieloScene",
            });
          }
        });
      });
    });

    // Lida com o retorno da cena interior
    this.events.on("wake", (_sys, data) => {
      this.isTransitioning = false;
      this.canTeleport = true;
      if (Number.isFinite(data?.x) && Number.isFinite(data?.y)) {
        this.player.setPosition(data.x, data.y);
      }
      this.cameras.main.fadeIn(500);
      this.checkHUD();
      this.updateMissionMarker();
      // Retoma a música ao acordar do sleep (ex: retorno de interior).
      this._playMapMusic();
    });
  }

  /** Inicia (ou reinicia) a música de fundo da cidade de forma segura. */
  _playMapMusic() {
    const existing = this.sound.get("city_music");
    if (existing) existing.destroy();
    const vol = this.registry.get("musicVolume") ?? 0.3;
    this.backgroundMusic = this.sound.add("city_music", {
      loop: true,
      volume: vol,
    });
    this.backgroundMusic.play();
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

  /** Atualiza o jogador e NPCs a cada frame. */
  update() {
    // Verifica se a tecla ESC foi pressionada para pausar o jogo.
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: "CityScene" });
    }

    if (!this.player) return;

    this.player.update();

    // Ajusta a profundidade pelo Y para simular perspectiva 2D.
    this.player.setDepth(Math.max(10, 9 + (this.player.y - this.mapY)));

    if (this.npcManager) this.npcManager.update();
  }
}
