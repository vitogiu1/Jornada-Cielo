/**
 * @fileoverview Configurações globais do jogo.
 */

/**
 * @typedef {Object} GameConfiguration
 * @property {number} tileSize - Tamanho de cada tile na tela (px).
 * @property {number} sourceSize - Tamanho original dos frames no spritesheet (px).
 * @property {number} framesPerRow - Número de frames por linha nas animações.
 * @property {number} playerSpeed - Velocidade do jogador em pixels por segundo.
 * @property {number} cameraZoom - Nível de zoom aplicado à câmera.
 * @property {boolean} devMode - Modo de desenvolvimento (libera tudo).
 */

/** Configurações globais centralizadas para facilitar ajustes no jogo. */
export const GameConfig = {
  tileSize: 64,
  sourceSize: 32,
  framesPerRow: 6,
  playerSpeed: 150,
  cameraZoom: 2.5,
  devMode: false,
};
