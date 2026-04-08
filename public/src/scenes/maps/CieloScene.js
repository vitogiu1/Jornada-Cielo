/**
 * @fileoverview Cena do escritório Cielo.
 * Funciona como área inicial do jogo, com tutorial, NPCs e saída para a cidade.
 * @module scenes/CieloScene
 */

import Phaser from "phaser";
import { Player } from "../../entities/Player";
import { AnimationManager } from "../../managers/AnimationManager";
import { NPCManager } from "../../managers/NPCManager";
import { cieloHQNPCs } from "../../data/npcs";
import { MarkerManager } from "../../managers/MarkerManager";

/** @extends Phaser.Scene */
export class CieloScene extends Phaser.Scene {
  constructor() {
    super("CieloScene");
    this.player = null;
    this.isTransitioning = false;
    this.mapY = 0;
    this.npcManager = null;
  }

  /** Recebe o personagem escolhido e reseta o estado de transição. */
  init(data) {
    this.isTransitioning = false;
    this.spawnPoint = data || {};
    this.characterKey = this.spawnPoint.character || "amanda";
    this.mapY = 0;
    this.spawnX = Number.isFinite(this.spawnPoint.x) ? this.spawnPoint.x : null;
    this.spawnY = Number.isFinite(this.spawnPoint.y) ? this.spawnPoint.y : null;
    this.fromCity = Boolean(this.spawnPoint.fromCity);
  }

  create(data = this.spawnPoint) {
    // Inicia o HUD do jogador se ainda não estiver ativo.
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
      if (key !== "cielo_music") {
        this.sound.getAll(key).forEach((s) => s.stop());
      }
    });

    // Inicia a música do escritório se não estiver ativa.
    if (!this.sound.get("cielo_music")?.isPlaying) {
      this._playMapMusic();
    } else {
      this.backgroundMusic = this.sound.get("cielo_music");
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

    // Inicia os controles de toque no mobile, se ainda não estiverem ativos.
    if (
      !this.sys.game.device.os.desktop &&
      !this.scene.isActive("MobileHudScene")
    ) {
      this.scene.launch("MobileHudScene");
    }

    // Cria as animações do personagem escolhido.
    AnimationManager.createAnimations(this, this.characterKey);

    // Carrega o tilemap do escritório.
    const map = this.make.tilemap({ key: "mapa" });
    if (!map) {
      console.error('Não foi possível carregar o tilemap "mapa".');
      return;
    }

    // Vincula os tilesets ao mapa.
    const tilesetBase = map.addTilesetImage("rooms", "tiles-image");
    const tilesetProps = map.addTilesetImage("interiors", "interiors-image");
    if (!tilesetBase || !tilesetProps) {
      console.error("Não foi possível vincular os tilesets do mapa interno.");
      return;
    }

    const mapX = 0;
    const mapY = 0;
    this.mapY = mapY;

    // Cria as três camadas visuais do mapa (chão, paredes, decoração).
    const allTilesets = [tilesetBase, tilesetProps];
    const floorLayer = map.createLayer(0, allTilesets, mapX, mapY);
    const wallLayer = map.createLayer(1, allTilesets, mapX, mapY);
    const decorLayer = map.createLayer(2, allTilesets, mapX, mapY);

    if (!floorLayer || !wallLayer) return;

    // Padding extra para evitar gaps visuais entre tiles com zoom fracionário.
    floorLayer.setCullPadding(2, 2);
    wallLayer.setCullPadding(2, 2);
    if (decorLayer) decorLayer.setCullPadding(2, 2);

    // Aplica colisão por propriedade; usa fallback se nenhum tile tiver a propriedade definida.
    const applyLayerCollision = (layer, useFallback = false) => {
      if (!layer) return;
      layer.setCollisionByProperty({ collider: true });
      if (useFallback && layer.layer.collideIndexes.length === 0) {
        layer.setCollisionByExclusion([-1], true);
      }
    };

    applyLayerCollision(wallLayer, true);
    applyLayerCollision(decorLayer, true);

    // Remove colisão dos tiles de tapete (são decorativos, não bloqueiam).
    const rugTileIndexes = [
      190, 191, 192, 206, 207, 208, 222, 223, 224, 238, 239, 240,
    ];
    wallLayer.setCollision(rugTileIndexes, false, true);

    // Remove colisão dos tiles de acesso ao elevador.
    const elevatorAccessNoCollision = [
      334, 335, 350, 351, 418, 419, 434, 435, 715, 716, 731, 732, 747, 748,
    ];
    wallLayer.setCollision(elevatorAccessNoCollision, false, true);
    if (decorLayer)
      decorLayer.setCollision(elevatorAccessNoCollision, false, true);

    // Define a ordem de renderização das camadas.
    floorLayer.setDepth(0);
    wallLayer.setDepth(9);
    if (decorLayer) decorLayer.setDepth(10);

    // Define os limites físicos do mundo pelo tamanho do mapa.
    this.physics.world.setBounds(
      mapX,
      mapY,
      map.widthInPixels,
      map.heightInPixels,
    );

    // Cria o jogador no centro horizontal e próximo da porta de saída (baseado no tilemap).
    const spawnX = map.widthInPixels / 2;
    const spawnY = map.heightInPixels - 200;
    this.player = new Player(this, spawnX, spawnY, this.characterKey);
    this.physics.add.existing(this.player);
    this.player.setFootHitbox(10, 8);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, wallLayer);
    if (decorLayer) this.physics.add.collider(this.player, decorLayer);

    // Bloqueador invisível na parede superior para impedir o jogador de sair pelo topo.
    const topWallBlockHeight = Math.round(map.tileHeight * 1.25);
    const topBlocker = this.add.rectangle(
      mapX + map.widthInPixels / 2,
      mapY + topWallBlockHeight / 2 + 4,
      map.widthInPixels,
      topWallBlockHeight,
      0xff0000,
      0,
    );
    this.physics.add.existing(topBlocker, true);
    this.physics.add.collider(this.player, topBlocker);

    // Bloqueador de entrada: impede o jogador de sair pela porta de entrada da Cielo (lado esquerdo).
    const entryBlockHeight = Math.round(map.tileHeight * 2);
    const entryBlocker = this.add.rectangle(
      mapX - map.tileWidth / 2,
      mapY + map.tileHeight * 6,
      map.tileWidth,
      entryBlockHeight,
      0xff0000,
      0,
    );
    this.physics.add.existing(entryBlocker, true);
    this.physics.add.collider(this.player, entryBlocker);

    // Zona de bloqueio invisível na entrada para prevenir retorno pela porta.
    // Cobre a área da entrada de forma mais ampla.
    const entryBlockZone = this.add.rectangle(
      mapX - 10,
      mapY + map.tileHeight * 5,
      map.tileWidth * 2,
      map.tileHeight * 3,
      0xff0000,
      0,
    );
    this.physics.add.existing(entryBlockZone, true);
    this.physics.add.collider(this.player, entryBlockZone);

    // Configura a câmera para seguir o jogador com zoom.
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setZoom(1.7);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.fadeIn(500);

    // Cria os NPCs do escritório.
    this.npcManager = new NPCManager(this);
    this.npcManager.create(cieloHQNPCs, mapX, mapY, { scale: 3 });
    this.npcManager.setupInteraction(this.player);

    // Trigger de saída: ao tocar, leva o jogador para o seletor de mundos.
    const exitX = mapX + map.tileWidth * 13;
    const exitY = mapY + map.tileHeight * 2;
    const exitTrigger = this.add.rectangle(
      exitX,
      exitY,
      map.tileWidth * 2,
      map.tileHeight,
      0xff0000,
      0,
    );
    this.physics.add.existing(exitTrigger, true);
    this.physics.add.overlap(this.player, exitTrigger, () => {
      if (!this.isTransitioning) this.exitHouse();
    });

    // Marcador visual indicando a saída.
    this.markerManager = new MarkerManager(this);
    this.markerManager.addMarker(exitX, exitY, "Mapa Mundi", {
      hideOnProx: 50,
    });

    // Exibe o tutorial apenas na primeira vez que o jogador entra na cena.
    if (!this.registry.get("tutorialDone")) {
      this.createTutorialHud();
    } else {
      this.hudVisible = false;
    }

    // Configura a tecla ESC para abrir o menu de pausa.
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // Registra evento de resume para garantir que o HUD e marcadores voltem ao normal.
    this.events.on("resume", () => {
      this.checkHUD();
    });

    // Escuta o fim de diálogos para disparar o tutorial da Amélia.
    this.events.on("dialog-closed", (data) => {
      if (data?.npcId === "amelia_cielo") {
        this.scene.pause();
        this.scene.launch("TutorialOverlayScene", {
          returnScene: "CieloScene",
        });
      }
    });
  }

  /** Cria o HUD de tutorial com instruções de movimento. */
  createTutorialHud() {
    const isDesktop = this.sys.game.device.os.desktop;
    const { width, height } = this.scale;

    // Câmera dedicada ao HUD, sem zoom nem bounds, sobreposta à câmera principal.
    this.hudCamera = this.cameras.add(0, 0, width, height);
    this.hudCamera.setScroll(0, 0);

    // Faz a câmera do HUD ignorar todos os objetos do mundo.
    this.children.list.forEach((child) => this.hudCamera.ignore(child));

    this._tutorialElements = [];

    // Adiciona um elemento ao HUD e o esconde da câmera principal.
    const addEl = (el) => {
      el.setDepth(1000000);
      this.cameras.main.ignore(el);
      this._tutorialElements.push(el);
      return el;
    };

    // Dimensões e posição da caixa do tutorial (centralizada na parte inferior).
    const boxWidth = isDesktop ? 320 : 200;
    const boxHeight = isDesktop ? 90 : 70;
    const bx = (width - boxWidth) / 2;
    const by = height - boxHeight - (isDesktop ? 50 : 160);

    // Fundo e borda da caixa.
    addEl(
      this.add
        .rectangle(bx, by, boxWidth, boxHeight, 0x000000, 0.6)
        .setOrigin(0),
    );
    const border = this.add.graphics();
    border.setDepth(1000000);
    this.cameras.main.ignore(border);
    border.lineStyle(2, 0xffffff, 0.3);
    border.strokeRect(bx, by, boxWidth, boxHeight);
    this._tutorialElements.push(border);

    // Mensagem de instrução adaptada para desktop ou mobile.
    const tutorialMessage = isDesktop
      ? "Movimente-se com WASD ou Setas"
      : "Arraste na tela para andar";
    addEl(
      this.add
        .text(bx + (isDesktop ? 10 : boxWidth / 2), by + 15, tutorialMessage, {
          fontSize: isDesktop ? "14px" : "11px",
          fill: "#ffffff",
          fontFamily: "monospace",
          fontWeight: "bold",
        })
        .setOrigin(isDesktop ? 0 : 0.5, 0.5),
    );

    if (isDesktop) {
      // Desenha as teclas WASD e setas direcionais.
      const drawKey = (rx, ry, label) => {
        addEl(
          this.add
            .rectangle(bx + rx, by + ry, 22, 22, 0xffffff, 0.8)
            .setOrigin(0.5),
        );
        addEl(
          this.add
            .text(bx + rx, by + ry, label, {
              fontSize: "12px",
              fill: "#000000",
              fontWeight: "bold",
            })
            .setOrigin(0.5),
        );
      };
      drawKey(45, 45, "W");
      drawKey(45, 70, "S");
      drawKey(70, 70, "D");
      drawKey(20, 70, "A");
      drawKey(155, 45, "▲");
      drawKey(155, 70, "▼");
      drawKey(180, 70, "▶");
      drawKey(130, 70, "◀");
    } else {
      // Ícone de toque para mobile.
      addEl(
        this.add
          .text(bx + boxWidth / 2, by + 45, "👆", { fontSize: "24px" })
          .setOrigin(0.5),
      );
    }

    this.hudVisible = true;
  }

  /** Esconde o tutorial com fade-out e marca como concluído no registro. */
  hideTutorialHud() {
    if (!this.hudVisible) return;
    this.hudVisible = false;
    this.registry.set("tutorialDone", true);

    // Anima o fade-out de cada elemento e os destrói ao terminar.
    if (this._tutorialElements) {
      this._tutorialElements.forEach((el) => {
        this.tweens.add({
          targets: el,
          alpha: 0,
          duration: 1200,
          ease: "Power2.easeOut",
          onComplete: () => el.destroy(),
        });
      });
      this._tutorialElements = [];
    }

    // Remove a câmera do HUD após o fade terminar.
    if (this.hudCamera) {
      this.time.delayedCall(1300, () => {
        if (this.hudCamera) {
          this.cameras.remove(this.hudCamera);
          this.hudCamera = null;
        }
      });
    }
  }

  /** Transição para o seletor de mundos ao sair do escritório. */
  exitHouse() {
    this.isTransitioning = true;
    this.cameras.main.fadeOut(500);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (this.fromCity) {
        this.scene.start("CityScene", {
          character: this.characterKey,
          x: 290,
          y: 175,
        });
        return;
      }

      // Para os HUDs antes de ir ao seletor de mundos.
      if (this.scene.isActive("PlayerHudScene"))
        this.scene.stop("PlayerHudScene");
      if (this.scene.isActive("MobileHudScene"))
        this.scene.stop("MobileHudScene");
      this.scene.start("WorldMapScene", { character: this.characterKey });
    });
  }

  /** Inicia (ou reinicia) a música de fundo do escritório de forma segura. */
  _playMapMusic() {
    const existing = this.sound.get("cielo_music");
    if (existing) existing.destroy();
    const vol = this.registry.get("musicVolume") ?? 0.3;
    this.backgroundMusic = this.sound.add("cielo_music", {
      loop: true,
      volume: vol,
    });
    this.backgroundMusic.play();
  }

  /** Verifica e inicia o HUD se necessário. */
  checkHUD() {
    if (!this.scene.isActive("PlayerHudScene")) {
      this.scene.launch("PlayerHudScene", { character: this.characterKey });
    }
    // Mobile HUD opcional.
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
      this.scene.launch("PauseScene", { returnScene: "CieloScene" });
    }

    if (this.player) {
      const isMoving = this.player.update();

      // Ajusta a profundidade pelo Y para simular perspectiva 2D.
      this.player.setDepth(Math.max(12, 11 + (this.player.y - this.mapY)));

      // Esconde o tutorial ao primeiro movimento do jogador.
      if (!this.isTransitioning && isMoving && this.hudVisible) {
        this.hideTutorialHud();
      }
    }

    if (this.markerManager) this.markerManager.update();
    if (this.npcManager) this.npcManager.update();
  }
}
