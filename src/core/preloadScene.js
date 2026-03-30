/**
 * @fileoverview Cena de carregamento de assets.
 * Exibe uma barra de progresso enquanto carrega todos os recursos do jogo.
 * @module utils/PreloadScene
 */

import Phaser from "phaser";
import { GameConfig } from "./config";

/**
 * Cena inicial que carrega todas as imagens, mapas e spritesheets antes de abrir o menu.
 * @extends Phaser.Scene
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fundo cinza da barra de carregamento.
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x222222, 0.8);
    bgBar.fillRect(width / 4, height / 2, width / 2, 20);

    // Barra branca que cresce conforme os assets são carregados.
    const progressBar = this.add.graphics();
    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4, height / 2, (width / 2) * value, 20);
    });

    // Loga no console se algum asset falhar ao carregar.
    this.load.on("loaderror", (file) => {
      console.warn(`Erro ao carregar o recurso: ${file.src}`);
    });

    // Imagem de fundo do menu principal.
    this.load.image("menu_bg", "assets/background.png");
    this.load.spritesheet("clouds", "assets/tilesets/cloud_tiles.png", {
      frameWidth: 128,
      frameHeight: 128,
      margin: 0,
      spacing: 0,
    });
    this.load.image("world_map_bg", "assets/world_map_bg.png");

    // Tilesets do escritório Cielo.
    this.load.image("tiles-image", "assets/tilesets/cielo_rooms.png");
    this.load.image("interiors-image", "assets/tilesets/cielo_interiors.png");
    this.load.spritesheet("tiles", "assets/tilesets/cielo_rooms.png", {
      frameWidth: GameConfig.sourceSize,
      frameHeight: GameConfig.sourceSize,
    });
    this.load.spritesheet("interiors", "assets/tilesets/cielo_interiors.png", {
      frameWidth: GameConfig.sourceSize,
      frameHeight: GameConfig.sourceSize,
    });

    // Mapas e tilesets de cada cena.
    this.load.tilemapTiledJSON(
      "interior-map",
      "assets/maps/cielo_interior.json",
    );
    this.load.tilemapTiledJSON("mapa", "assets/maps/cielo.json");
    this.load.tilemapTiledJSON("centro-cidade-map", "assets/maps/city.json");
    this.load.image("mapa-residencial-image", "assets/tilesets/city_tiles.png");
    this.load.tilemapTiledJSON("farm-map", "assets/maps/farms.json");
    this.load.image("farm-tiles-image", "assets/tilesets/farm.png");
    this.load.tilemapTiledJSON("praia-map", "assets/maps/beach.json");
    this.load.image("praia-tiles-image", "assets/tilesets/beach_tiles.png");
    this.load.tilemapTiledJSON("industrial-map", "assets/maps/industrial.json");
    this.load.image(
      "industrial-tiles-image",
      "assets/tilesets/industrial_tiles.png",
    );

    // ─── Mapas interiores da CIDADE ───
    this.load.tilemapTiledJSON(
      "chaveiro-map",
      "assets/interiors/json/chaveiro.json",
    );
    this.load.image("chaveiro-tiles", "assets/interiors/pngs/chaveiro.jpeg");

    this.load.tilemapTiledJSON(
      "garagem-map",
      "assets/interiors/json/garagem.json",
    );
    this.load.image(
      "estacionamento-tiles",
      "assets/interiors/pngs/estacionamento.jpeg",
    );

    this.load.tilemapTiledJSON(
      "floricultura-map",
      "assets/interiors/json/floricultura.json",
    );
    this.load.image(
      "floricultura-tiles",
      "assets/interiors/pngs/floricultura.jpeg",
    );

    this.load.tilemapTiledJSON(
      "museus-map",
      "assets/interiors/json/museus.json",
    );
    this.load.image("museus-tiles", "assets/interiors/pngs/museus.png");

    this.load.tilemapTiledJSON(
      "sorveteria-map",
      "assets/interiors/json/sorveteria.json",
    );
    this.load.image("sorveteria-tiles", "assets/interiors/pngs/sorveteria.png");

    this.load.tilemapTiledJSON(
      "teatro-map",
      "assets/interiors/json/teatro.json",
    );
    this.load.image("teatro-tiles", "assets/interiors/pngs/teatro.jpeg");

    // ─── Mapas interiores da FAZENDA ───
    this.load.tilemapTiledJSON("bar-map", "assets/interiors/json/bar.json");
    this.load.image("bar-tiles", "assets/interiors/pngs/bar.jpeg");

    this.load.tilemapTiledJSON("loja-map", "assets/interiors/json/loja.json");
    this.load.image("loja-tiles", "assets/interiors/pngs/loja.jpeg");

    this.load.tilemapTiledJSON(
      "casaAmarela-map",
      "assets/interiors/json/casaAmarela.json",
    );
    this.load.image(
      "casaAmarela1-tiles",
      "assets/interiors/pngs/casaAmarela1.jpeg",
    );

    this.load.tilemapTiledJSON(
      "casaAmarela2-map",
      "assets/interiors/json/casaAmarela2.json",
    );
    this.load.image(
      "casaAmarela2-tiles",
      "assets/interiors/pngs/casaAmarela2.jpeg",
    );

    this.load.tilemapTiledJSON(
      "celeiro-map",
      "assets/interiors/json/celeiro.json",
    );
    this.load.image("celeiro-tiles", "assets/interiors/pngs/celeiro.jpeg");

    // ─── Mapas interiores da PRAIA ───
    this.load.tilemapTiledJSON(
      "quiosquep-map",
      "assets/interiors/json/quiosquep.json",
    );
    this.load.image(
      "quiosquePraia-tiles",
      "assets/interiors/pngs/quiosquePraia.png",
    );

    this.load.tilemapTiledJSON("lojap-map", "assets/interiors/json/lojap.json");
    this.load.image("lojapraia-tiles", "assets/interiors/pngs/lojapraia.png");

    this.load.tilemapTiledJSON(
      "quiosquedois-map",
      "assets/interiors/json/quiosquedois.json",
    );
    this.load.image(
      "quiosquedois-tiles",
      "assets/interiors/pngs/quiosquedois.png",
    );

    this.load.tilemapTiledJSON(
      "quiosquesurf-map",
      "assets/interiors/json/quiosquesurf.json",
    );
    this.load.image(
      "lojadiversaop-tiles",
      "assets/interiors/pngs/lojadiversaop.png",
    );

    this.load.tilemapTiledJSON(
      "quiosquetresp-map",
      "assets/interiors/json/quiosquetresp.json",
    );
    this.load.image(
      "quiosquetresp-tiles",
      "assets/interiors/pngs/quiosquetresp.png",
    );

    // Músicas de fundo.
    this.load.audio("music_menu", "assets/sounds/mainMenu.mp3");
    this.load.audio("music_negotiation", "assets/sounds/negotiation.mp3");

    // Músicas de fundo dos mapas.
    this.load.audio("beach_music", "assets/sounds/beachMap.mp3");
    this.load.audio("cielo_music", "assets/sounds/cieloMap.mp3");
    this.load.audio("city_music", "assets/sounds/cityMap.mp3");
    this.load.audio("industrial_music", "assets/sounds/industryMap.mp3");

    // Spritesheets de corrida e idle de cada personagem (frames de 16x32px).
    const characters = ["alan", "amanda", "amelia", "thiago", "ingrid"];
    characters.forEach((char) => {
      this.load.spritesheet(`${char}-run`, `assets/players/${char}_run.png`, {
        frameWidth: 16,
        frameHeight: 32,
      });
      this.load.spritesheet(`${char}-idle`, `assets/players/${char}_idle.png`, {
        frameWidth: 16,
        frameHeight: 32,
      });
    });
  }

  // Abre o menu principal ao terminar o carregamento.
  create() {
    // Inicializa as configurações de áudio no registry caso não existam.
    if (this.registry.get("musicVolume") === undefined) {
      this.registry.set("musicVolume", 0.3);
    }
    if (this.registry.get("sfxVolume") === undefined) {
      this.registry.set("sfxVolume", 0.7);
    }

    this.scene.start("MenuScene");
  }
}
