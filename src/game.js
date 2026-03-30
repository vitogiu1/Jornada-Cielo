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

// ─── Instâncias de cenas interiores da CIDADE ───
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

// ─── Instâncias de cenas interiores da FAZENDA ───
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

// ─── Instâncias de cenas interiores da PRAIA ───
const QuiosquePraiaScene = new InteriorScene({
  key: "QuiosquePraiaScene",
  mapKey: "quiosquep-map",
  tilesetImageKey: "quiosquePraia-tiles",
  tilesetName: "quiosquePraia",
  parentScene: "BeachScene",
});
const LojaPraiaScene = new InteriorScene({
  key: "LojaPraiaScene",
  mapKey: "lojap-map",
  tilesetImageKey: "lojapraia-tiles",
  tilesetName: "lojapraia",
  parentScene: "BeachScene",
});
const QuiosDoisPraiaScene = new InteriorScene({
  key: "QuiosDoisPraiaScene",
  mapKey: "quiosquedois-map",
  tilesetImageKey: "quiosquedois-tiles",
  tilesetName: "quiosquedois",
  parentScene: "BeachScene",
});
const QuiosSurfScene = new InteriorScene({
  key: "QuiosSurfScene",
  mapKey: "quiosquesurf-map",
  tilesetImageKey: "lojadiversaop-tiles",
  tilesetName: "lojadiversaop",
  parentScene: "BeachScene",
});
const QuiosTresScene = new InteriorScene({
  key: "QuiosTresScene",
  mapKey: "quiosquetresp-map",
  tilesetImageKey: "quiosquetresp-tiles",
  tilesetName: "quiosquetresp",
  parentScene: "BeachScene",
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
};

/** Inicializa o jogo Phaser com a configuração definida acima. */
new Phaser.Game(config);
