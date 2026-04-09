/**
 * @fileoverview Ponto de entrada da aplicação.
 * Instancia o `Phaser.Game` e define a configuração do pipeline de renderização.
 */

import Phaser from "phaser";
import { MenuScene } from "./scenes/menus/MenuScene";
import { SettingsScene } from "./scenes/menus/SettingsScene";
import { CieloScene } from "./scenes/maps/CieloScene";
import { CityScene } from "./scenes/maps/CityScene";
import { FarmScene } from "./scenes/maps/FarmScene";
import { BeachScene } from "./scenes/maps/BeachScene";
import { IndustrialScene } from "./scenes/maps/IndustrialScene";
import { CharacterSelectScene } from "./scenes/menus/CharacterSelectScene";
import { NameInputScene } from "./scenes/menus/NameInputScene";
import { EndingScene } from "./scenes/menus/EndingScene";
import { WorldMapScene } from "./scenes/menus/WorldMapScene";
import { NegotiationScene } from "./scenes/negotiation/NegotiationScene";
import { PauseScene } from "./scenes/menus/PauseScene";
import { MobileHudScene } from "./scenes/ui/MobileHudScene";
import { PlayerHudScene } from "./scenes/ui/PlayerHudScene";
import { PreloadScene } from "./core/preloadScene";
import { InventoryScene } from "./scenes/ui/InventoryScene";
import { CielodexScene } from "./scenes/ui/CielodexScene";
import { InteriorScene } from "./scenes/maps/InteriorScene";
import { TutorialOverlayScene } from "./scenes/ui/TutorialOverlayScene";
import { ColorBlind } from "./utils/ColorBlind";

// Sistema de global para chamar o som de clique, quando ocorrer eventos de clique
const start = Phaser.Input.InputPlugin.prototype.start;
Phaser.Input.InputPlugin.prototype.start = function () {
  start.call(this);
  this.on("gameobjectdown", (pointer, gameObject) => {
    if (gameObject.input && gameObject.input.draggable) return;
    try {
      if (this.scene && this.scene.registry && this.scene.sound) {
        const vol = this.scene.registry.get("sfxVolume") ?? 0.7;
        if (this.scene.cache.audio.exists("sfx_click")) {
          this.scene.sound.play("sfx_click", { volume: vol * 0.8 });
        }
      }
    } catch (e) {
      console.error("Erro ao tocar som de clique:", e);
    }
  });
};

// ─── Instâncias de cenas interiores da cidade ───
const ChaveiroScene = new InteriorScene({
  key: "ChaveiroScene",
  mapKey: "chaveiro-map",
  tilesetImageKey: "chaveiro-tiles",
  tilesetName: "chaveiro",
  parentScene: "CityScene",
  returnSpawn: { x: 910, y: 855 },
});
const EstacionamentoScene = new InteriorScene({
  key: "EstacionamentoScene",
  mapKey: "garagem-map",
  tilesetImageKey: "estacionamento-tiles",
  tilesetName: "estacionamento",
  parentScene: "CityScene",
  returnSpawn: { x: 535, y: 175 },
});
const FloriculturaScene = new InteriorScene({
  key: "FloriculturaScene",
  mapKey: "floricultura-map",
  tilesetImageKey: "floricultura-tiles",
  tilesetName: "floricultura",
  parentScene: "CityScene",
  returnSpawn: { x: 860, y: 535 },
});
const MuseuScene = new InteriorScene({
  key: "MuseuScene",
  mapKey: "museus-map",
  tilesetImageKey: "museus-tiles",
  tilesetName: "museus",
  parentScene: "CityScene",
  returnSpawn: { x: 285, y: 535 },
});
const SorveteriaScene = new InteriorScene({
  key: "SorveteriaScene",
  mapKey: "sorveteria-map",
  tilesetImageKey: "sorveteria-tiles",
  tilesetName: "sorveteria",
  parentScene: "CityScene",
  returnSpawn: { x: 800, y: 175 },
});
const TeatroScene = new InteriorScene({
  key: "TeatroScene",
  mapKey: "teatro-map",
  tilesetImageKey: "teatro-tiles",
  tilesetName: "teatro",
  parentScene: "CityScene",
  returnSpawn: { x: 515, y: 535 },
});

// ─── Instâncias de cenas interiores da fazenda ───
const BarScene = new InteriorScene({
  key: "BarScene",
  mapKey: "bar-map",
  tilesetImageKey: "bar-tiles",
  tilesetName: "bar",
  parentScene: "FarmScene",
});
const LojaScene = new InteriorScene({
  key: "LojaScene",
  mapKey: "loja-map",
  tilesetImageKey: "loja-tiles",
  tilesetName: "loja",
  parentScene: "FarmScene",
});
const CasaAmarelaScene = new InteriorScene({
  key: "CasaAmarelaScene",
  mapKey: "casaAmarela-map",
  tilesetImageKey: "casaAmarela1-tiles",
  tilesetName: "casaAmarela1",
  parentScene: "FarmScene",
});
const CasaAmarela2Scene = new InteriorScene({
  key: "CasaAmarela2Scene",
  mapKey: "casaAmarela2-map",
  tilesetImageKey: "casaAmarela2-tiles",
  tilesetName: "casaAmarela2",
  parentScene: "FarmScene",
});
const CeleiroScene = new InteriorScene({
  key: "CeleiroScene",
  mapKey: "celeiro-map",
  tilesetImageKey: "celeiro-tiles",
  tilesetName: "celeiro",
  parentScene: "FarmScene",
});

// ─── Instâncias de cenas interiores da praia ───
const QuiosquePraiaScene = new InteriorScene({
  key: "QuiosquePraiaScene",
  mapKey: "quiosquep-map",
  tilesetImageKey: "quiosquePraia-tiles",
  tilesetName: "quiosquePraia",
  parentScene: "BeachScene",
  returnSpawn: { x: 275, y: 455 },
});
const LojaPraiaScene = new InteriorScene({
  key: "LojaPraiaScene",
  mapKey: "lojap-map",
  tilesetImageKey: "lojapraia-tiles",
  tilesetName: "lojapraia",
  parentScene: "BeachScene",
  returnSpawn: { x: 700, y: 360 },
});
const QuiosDoisPraiaScene = new InteriorScene({
  key: "QuiosDoisPraiaScene",
  mapKey: "quiosquedois-map",
  tilesetImageKey: "quiosquedois-tiles",
  tilesetName: "quiosquedois",
  parentScene: "BeachScene",
  returnSpawn: { x: 280, y: 680 },
});
const QuiosSurfScene = new InteriorScene({
  key: "QuiosSurfScene",
  mapKey: "quiosquesurf-map",
  tilesetImageKey: "lojadiversaop-tiles",
  tilesetName: "lojasurf",
  parentScene: "BeachScene",
  returnSpawn: { x: 680, y: 680 },
});
const QuiosTresScene = new InteriorScene({
  key: "QuiosTresScene",
  mapKey: "quiosquetresp-map",
  tilesetImageKey: "quiosquetresp-tiles",
  tilesetName: "quiosquetresp",
  parentScene: "BeachScene",
  returnSpawn: { x: 680, y: 880 },
});

// ─── Instâncias de cenas interiores da indústria ───
const CentroDePecasScene = new InteriorScene({
  key: "CentroDePecasScene",
  mapKey: "centrodepecas-map",
  tilesetImageKey: "centrodepecas-tiles",
  tilesetName: "centrodepecas",
  parentScene: "IndustrialScene",
  returnSpawn: { x: 360, y: 880 },
});
const CentroMotorScene = new InteriorScene({
  key: "CentroMotorScene",
  mapKey: "centromotor-map",
  tilesetImageKey: "centromotor-tiles",
  tilesetName: "centromotor",
  parentScene: "IndustrialScene",
  returnSpawn: { x: 640, y: 223 },
});
const CentroSuprimentoScene = new InteriorScene({
  key: "CentroSuprimentoScene",
  mapKey: "centrosuprimento-map",
  tilesetImageKey: "centrosuprimento-tiles",
  tilesetName: "centrosuprimento",
  parentScene: "IndustrialScene",
  returnSpawn: { x: 156, y: 440 },
});
const GalpaoMergulhoScene = new InteriorScene({
  key: "GalpaoMergulhoScene",
  mapKey: "galpaomergulho-map",
  tilesetImageKey: "galpaomergulho-tiles",
  tilesetName: "galpaomergulho",
  parentScene: "IndustrialScene",
  returnSpawn: { x: 790, y: 510 },
});
const MecanicaScene = new InteriorScene({
  key: "MecanicaScene",
  mapKey: "mecanica-map",
  tilesetImageKey: "mecanica-tiles",
  tilesetName: "mecanica",
  parentScene: "IndustrialScene",
  returnSpawn: { x: 160, y: 240 },
});
const SecaoHidraulicaScene = new InteriorScene({
  key: "SecaoHidraulicaScene",
  mapKey: "secaohidraulica-map",
  tilesetImageKey: "secaohidraulica-tiles",
  tilesetName: "secaohidraulica",
  parentScene: "IndustrialScene",
  returnSpawn: { x: 156, y: 660 },
});

/**
 * Configuração central do Phaser.
 * Define renderização, física, escalonamento e as cenas do jogo.
 *
 * @type {Phaser.Types.Core.GameConfig}
 */
const config = {
  /** Elemento DOM vindo do index.html, onde o canvas do phaser será renderizado. */
  parent: "game-container",

  type: Phaser.AUTO,

  /** Largura da tela, acoplada à janela do navegador. */
  width: window.innerWidth,

  /** Altura da tela, acoplada à janela do navegador. */
  height: window.innerHeight,

  /** Cor de fundo do canvas. */
  backgroundColor: "#2d2d2d",

  /**
   * Lista de cenas do jogo.
   * A primeira (`PreloadScene`) é iniciada automaticamente para o carregamento dos principais assets do jogo.
   */
  scene: [
    PreloadScene,
    MenuScene,
    SettingsScene,
    NameInputScene,
    EndingScene,
    CieloScene,
    CityScene,
    FarmScene,
    BeachScene,
    IndustrialScene,
    CharacterSelectScene,
    WorldMapScene,
    NegotiationScene,
    MobileHudScene,
    PlayerHudScene,
    InventoryScene,
    CielodexScene,
    PauseScene,
    TutorialOverlayScene,
    // Interiores da Cidade
    ChaveiroScene,
    EstacionamentoScene,
    FloriculturaScene,
    MuseuScene,
    SorveteriaScene,
    TeatroScene,
    // Interiores da Fazenda
    BarScene,
    LojaScene,
    CasaAmarelaScene,
    CasaAmarela2Scene,
    CeleiroScene,
    // Interiores da Praia
    QuiosquePraiaScene,
    LojaPraiaScene,
    QuiosDoisPraiaScene,
    QuiosSurfScene,
    QuiosTresScene,
    // Interiores da Indústria
    CentroDePecasScene,
    CentroMotorScene,
    CentroSuprimentoScene,
    GalpaoMergulhoScene,
    MecanicaScene,
    SecaoHidraulicaScene,
  ],

  /** Escalonamento responsivo que ocupa toda a janela. */
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  /**
   * Configurações de renderização para pixel art.
   */
  render: {
    pixelArt: true,
    roundPixels: true,
  },

  /** Física Arcade */
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  /** Suporte para elementos DOM (necessario para inputs HTML nativos). */
  dom: {
    createContainer: true,
  },
};

/** Inicializa o jogo Phaser com a configuracao definida acima. */
const game = new Phaser.Game(config);

// Inicializa a aba de Filtro de Daltonismo e aplica caso tenha no Registry do cache / LocalStorage
ColorBlind.initFilters();
game.events.once('ready', () => {
  // Como o Phaser.Registry de cada cena é resetado dependendo do ciclo,
  // vamos usar localStorage para persistir de verdade a configuração de Daltonismo.
  const savedFilter = localStorage.getItem("daltonismFilter") || "none";
  ColorBlind.applyFilter(savedFilter);
});
