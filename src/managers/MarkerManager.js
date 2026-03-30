/**
 * @fileoverview Gerenciador de marcadores de navegação.
 * Desenha waypoints no mundo e exibe uma seta de bússola
 * quando o alvo está fora do campo de visão da câmera.
 * @module managers/MarkerManager
 */

import Phaser from "phaser";

/**
 * Gerencia os marcadores de missão e a seta de bússola.
 */
export class MarkerManager {
  /**
   * @param {Phaser.Scene} scene - Cena onde os marcadores serão criados.
   */
  constructor(scene) {
    this.scene = scene;
    this.markers = [];

    // Registra o update no loop da cena e remove ao encerrar.
    this.scene.events.on("update", this.update, this);
    this.scene.events.once("shutdown", () => {
      this.scene.events.off("update", this.update, this);
    });
  }

  /**
   * Adiciona um marcador de missão no mundo.
   * Quando o jogador chega perto o suficiente, o marcador é destruído automaticamente.
   *
   * @param {number} x - Posição X no mundo.
   * @param {number} y - Posição Y no mundo.
   * @param {string} label - Texto exibido acima do marcador (opcional).
   * @param {object} options - Opções extras. `hideOnProx` define o raio de proximidade para destruição.
   * @returns {object} Referência ao marcador criado.
   */
  addMarker(x, y, label = "", options = { hideOnProx: 80 }) {
    // Container que agrupa o losango e o label no mundo.
    const container = this.scene.add.container(x, y);

    // Losango amarelo pulsante que indica o ponto de interesse.
    const shape = this.scene.add.graphics();
    shape.fillStyle(0xffff00, 0.7);
    shape.lineStyle(1, 0x000000, 0.5);
    shape.beginPath();
    shape.moveTo(0, -8);
    shape.lineTo(6, 0);
    shape.lineTo(0, 8);
    shape.lineTo(-6, 0);
    shape.closePath();
    shape.fillPath();
    shape.strokePath();
    container.add(shape);

    // Label opcional acima do marcador.
    if (label) {
      const text = this.scene.add
        .text(0, -18, label, {
          fontSize: "10px",
          fontFamily: "monospace",
          backgroundColor: "#00000066",
          padding: { x: 3, y: 1 },
          color: "#ffff00",
        })
        .setOrigin(0.5);
      container.add(text);
    }

    // Seta de bússola exibida na borda da tela quando o alvo está fora do campo de visão.
    const offScreenIndicator = this.scene.add
      .container(0, 0)
      .setDepth(200000)
      .setVisible(false);

    const arrow = this.scene.add.graphics();
    arrow.fillStyle(0xffff00, 1);
    arrow.lineStyle(2, 0x000000, 1);
    arrow.fillTriangle(-10, 10, 10, 10, 0, -10);
    arrow.strokeTriangle(-10, 10, 10, 10, 0, -10);
    offScreenIndicator.add(arrow);

    // Animação de pulso na bússola.
    this.scene.tweens.add({
      targets: offScreenIndicator,
      scale: 1.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Animação de pulso no marcador do mundo.
    this.scene.tweens.add({
      targets: container,
      scale: 1.2,
      alpha: 0.6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    container.setDepth(9999);

    const markerObj = {
      container,
      offScreenIndicator,
      targetX: x,
      targetY: y,
      options: { hideOnProx: 80, ...options },
      destroyed: false,
    };

    this.markers.push(markerObj);
    return markerObj;
  }

  /**
   * Executado a cada frame. Remove marcadores alcançados e atualiza
   * a posição e visibilidade da bússola para os demais.
   */
  update() {
    const cam = this.scene.cameras.main;
    const player = this.scene.player;
    if (!cam) return;

    // Remove marcadores destruídos e atualiza os restantes.
    this.markers = this.markers.filter((m) => {
      if (m.destroyed) return false;

      if (player) {
        const dist = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          m.targetX,
          m.targetY,
        );

        // Destrói o marcador quando o jogador chega perto o suficiente.
        if (dist < m.options.hideOnProx) {
          this.destroyMarker(m);
          if (m.options.onReached) m.options.onReached();
          return false;
        }

        // Verifica se o alvo está dentro do campo de visão da câmera.
        const isOffScreen =
          m.targetX < cam.worldView.x ||
          m.targetX > cam.worldView.right ||
          m.targetY < cam.worldView.y ||
          m.targetY > cam.worldView.bottom;

        if (!isOffScreen) {
          // Alvo visível: exibe o marcador no mundo e oculta a bússola.
          m.offScreenIndicator.setVisible(false);
          m.container.setVisible(true);
          // Compensa o zoom para manter o tamanho constante na tela.
          m.container.setScale(1 / cam.zoom);
        } else {
          // Alvo fora da tela: oculta o marcador e exibe a bússola ao redor do jogador.
          m.container.setVisible(false);
          m.offScreenIndicator.setVisible(true);

          // Calcula o ângulo entre o jogador e o alvo para posicionar a seta.
          const angle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            m.targetX,
            m.targetY,
          );
          const orbitRadius = 45;
          const centerY = player.y - 8;

          // Posiciona a seta em órbita ao redor do jogador apontando para o alvo.
          m.offScreenIndicator.setPosition(
            player.x + Math.cos(angle) * orbitRadius,
            centerY + Math.sin(angle) * orbitRadius,
          );

          // Rotaciona a seta na direção do alvo (+90° para corrigir o pivot do sprite).
          m.offScreenIndicator.setRotation(angle + Math.PI / 2);
          m.offScreenIndicator.setScale(1 / cam.zoom);
        }
      }
      return true;
    });
  }

  /**
   * Destrói um marcador específico, removendo seus objetos visuais da cena.
   *
   * @param {object} marker - Marcador retornado por `addMarker`.
   */
  destroyMarker(marker) {
    if (marker.container) marker.container.destroy();
    if (marker.offScreenIndicator) marker.offScreenIndicator.destroy();
    marker.destroyed = true;
  }

  /**
   * Destrói todos os marcadores ativos. Útil ao trocar de cena.
   */
  clear() {
    this.markers.forEach((m) => this.destroyMarker(m));
    this.markers = [];
  }
}
