/**
 * @fileoverview Menu principal do jogo.
 * Exibe o título, botões de jogar e configurações.
 * @module scenes/MenuScene
 */

import Phaser from "phaser";

/**
 * Cena do menu principal.
 * Navega para a seleção de personagem ou para as configurações.
 * @extends Phaser.Scene
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;
    // detecta mobile para ajustar layout.
    const isMobile = !this.sys.game.device.os.desktop;

    // fundo de tela.
    const bg = this.add.image(width / 2, height / 2, "menu_bg");
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale).setScrollFactor(0).setDepth(-2);

    // camada escura para dar contraste.
    this.add.rectangle(0, 0, width, height, 0x000000, 0.2).setOrigin(0);

    // titulo adaptativo para desktop e mobile.
    const titleSize = isMobile ? "48px" : "80px";
    const titleY = height * 0.35;

    const title = this.add
      .text(width / 2, titleY, "JORNADA CIELO", {
        fontSize: titleSize,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10);

    title.setStroke("#ffffff", 1);
    title.setShadow(0, 0, "rgba(255, 255, 255, 0.5)", 10, true, false);

    // linha decorativa abaixo do titulo.
    const lineWidth = isMobile ? 180 : 300;
    const line = this.add
      .rectangle(
        width / 2,
        titleY + (isMobile ? 35 : 60),
        lineWidth,
        2,
        0x00adef,
      )
      .setAlpha(0)
      .setDepth(10);

    // animacao de entrada.
    this.tweens.add({
      targets: [title, line],
      alpha: 1,
      y: "-=30",
      duration: 2000,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: [title, line],
          y: "+=8",
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      },
    });

    // botoes de navegacao.
    const btnWidth = isMobile ? width * 0.8 : 350;
    const buttonStyle = {
      fontSize: isMobile ? "24px" : "32px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center",
      fixedWidth: btnWidth,
      padding: { x: 0, y: 15 },
    };

    const mapScenes = [
      "CityScene",
      "CieloScene",
      "FarmScene",
      "BeachScene",
      "IndustrialScene",
    ];
    const pausedSceneKey = mapScenes.find((key) => this.scene.isPaused(key));

    const buttonYStart = height * 0.6;
    const buttonSpacing = isMobile ? 70 : 90;

    if (pausedSceneKey) {
      const retomarBtn = this.add
        .text(width / 2, buttonYStart, "RETOMAR", {
          ...buttonStyle,
          backgroundColor: "#2ecc71",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          const sc = this.scene.get(pausedSceneKey);
          if (sc) {
            sc.scene.setVisible(true);
            sc.scene.resume();
          }
          this.scene.stop();
        });

      const novoJogoBtn = this.add
        .text(width / 2, buttonYStart + buttonSpacing, "NOVO JOGO", {
          ...buttonStyle,
          backgroundColor: "#e67e22",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.scene.stop(pausedSceneKey);
          this.scene.start("CharacterSelectScene");
        });

      const settingsBtn = this.add
        .text(width / 2, buttonYStart + buttonSpacing * 2, "CONFIGURAÇÕES", {
          ...buttonStyle,
          backgroundColor: "#3498db",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () =>
          this.scene.start("SettingsScene", { returnScene: "MenuScene" }),
        );

      [retomarBtn, novoJogoBtn, settingsBtn].forEach((btn) => {
        btn.on("pointerover", () => btn.setAlpha(0.9));
        btn.on("pointerout", () => btn.setAlpha(1));
        btn.setDepth(10);
      });
    } else {
      const playButton = this.add
        .text(width / 2, buttonYStart, "JOGAR", {
          ...buttonStyle,
          backgroundColor: "#2ecc71",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.scene.start("CharacterSelectScene");
        });

      const settingsButton = this.add
        .text(width / 2, playButton.y + buttonSpacing, "CONFIGURAÇÕES", {
          ...buttonStyle,
          backgroundColor: "#3498db",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () =>
          this.scene.start("SettingsScene", { returnScene: "MenuScene" }),
        );

      [playButton, settingsButton].forEach((btn) => {
        btn.on("pointerover", () => btn.setAlpha(0.9));
        btn.on("pointerout", () => btn.setAlpha(1));
        btn.setDepth(10);
      });
    }

    // SISTEMA DE NUVENS
    this.cloudsList = [];
    this.validCloudFrames = [0, 1, 7, 8];
    const cloudCount = 6;

    for (let i = 0; i < cloudCount; i++) {
      const frameIndex =
        this.validCloudFrames[
          Math.floor(Math.random() * this.validCloudFrames.length)
        ];
      const cloudSprite = this.add
        .sprite(0, 0, "clouds")
        .setFrame(frameIndex)
        .setAlpha(0.5)
        .setDepth(0);
      cloudSprite.setScale((width / 1280) * (0.8 + Math.random() * 0.4));

      const cloudData = {
        sprite: cloudSprite,
        id: i, // Identificador para filtrarmos o console.log (somente ID 0)
      };

      this.cloudsList.push(cloudData);

      // Posição inicial espalhada apenas na criação (para o menu não ficar vazio)
      const startX = Math.random() * width;
      const startY = Math.random() * height * 0.45;

      this.sortMovement(cloudData, startX, startY);
    }

    // Música do menu em loop.
    const startMenuMusic = () => {
      // Destrói instância anterior se existir
      const existing = this.sound.get("music_menu");
      if (existing) existing.destroy();

      // Recupera o volume configurado nas Settings
      const vol = this.registry.get("musicVolume") ?? 0.35;

      this.menuMusic = this.sound.add("music_menu", {
        loop: true,
        volume: vol,
      });
      this.menuMusic.play();
    };

    // Se o áudio já está liberado (voltou de Settings, Pause, etc.), toca direto.
    // Se ainda está bloqueado (primeira abertura), Phaser dispara 'unlocked' na 1ª interação.
    if (this.sound.locked) {
      this.sound.once("unlocked", startMenuMusic, this);
    } else {
      startMenuMusic();
    }

    // Para a música ao sair desta cena.
    this.events.once("shutdown", () => {
      if (this.menuMusic) this.menuMusic.stop();
    });
  }

  /**
   * Sorteia os parâmetros de destino da nuvem e chama a função obrigatória.
   */
  sortMovement(cloudData, forceX = null, forceY = null) {
    const { width, height } = this.scale;

    // Se forceX e forceY foram passados (no início), usa eles.
    // Caso contrário, a nuvem continua exatamente da posição onde o ciclo anterior terminou.
    const xi = forceX !== null ? forceX : cloudData.sprite.x;
    const yi = forceY !== null ? forceY : cloudData.sprite.y;

    // Deslocamento X sempre para a direita
    const xf = xi + width * 0.4 + Math.random() * (width * 0.3);
    // Deslocamento Y sorteado na metade de cima da tela
    const yf = Math.random() * height * 0.45;
    const duracaoT = 4 + Math.random() * 4; // Entre 4 e 8 segundos

    // Chamada da função obrigatória passando os parâmetros exigidos pela rubrica
    const calc = this.calcCinematics(
      cloudData.sprite,
      xi,
      yi,
      xf,
      yf,
      duracaoT,
    );

    // Armazena os cálculos na nuvem para uso no update
    Object.assign(cloudData, calc);
  }

  /**
   * Função implementada para cumprir a rubrica de cinemática bidimensional.
   * @param {Phaser.GameObjects.Sprite} cloudSprite
   * @param {number} xi - Posição inicial X
   * @param {number} yi - Posição inicial Y
   * @param {number} xf - Posição final X
   * @param {number} yf - Posição final Y
   * @param {number} T - Duração total (tempo) em segundos
   */
  calcCinematics(cloudSprite, xi, yi, xf, yf, T) {
    // 1. Posiciona o elemento na origem do movimento
    cloudSprite.x = xi;
    cloudSprite.y = yi;

    // 2. Eixo X (Movimento Uniforme - MU)
    const vx = (xf - xi) / T;

    // 3. Eixo Y (Movimento Uniformemente Variado - MUV com v0y = 0)
    const ay = (2 * (yf - yi)) / (T * T);

    return { xi, yi, xf, yf, T, vx, ay, t: 0 };
  }

  update(time, delta) {
    const dt = delta / 1000; // converte ms → s
    const { width } = this.scale;

    this.cloudsList.forEach((c) => {
      // Acumula o tempo de animação deste ciclo
      c.t += dt;
      const t = c.t < c.T ? c.t : c.T;

      // EIXO X: Movimento Uniforme (MU)
      // Equação: x(t) = xi + vx * t
      const x = c.xi + c.vx * t;
      c.sprite.x = x;

      // EIXO Y: Movimento Uniformemente Variado (MUV)
      // Velocidade inicial nula (v0y = 0)
      // Equações: vy(t) = ay * t  |  y(t) = yi + 0.5 * ay * t²
      const vy = c.ay * t;
      const y = c.yi + 0.5 * c.ay * (t * t);
      c.sprite.y = y;

      if (c.id === 0) {
        console.log(
          `[Nuvem 0 - MU | X] t = ${t.toFixed(3)}s | vx = ${c.vx.toFixed(2)} px/s | Posição (x) = ${x.toFixed(2)} px`,
        );
        console.log(
          `[Nuvem 0 - MUV | Y] t = ${t.toFixed(3)}s | ay = ${c.ay.toFixed(2)} px/s² | vy = ${vy.toFixed(2)} px/s | Posição (y) = ${y.toFixed(2)} px`,
        );
      }

      // Se a nuvem cumpriu a duração total deste ciclo
      if (t >= c.T) {
        if (c.id === 0) {
          console.log("-> Nuvem 0 atingiu o alvo! Sorteando novo ciclo...");
        }

        // Verifica se saiu da tela pela direita
        const margin = c.sprite.displayWidth / 2;
        if (c.sprite.x > width + margin) {
          c.sprite.x = -margin;
        }

        this.sortMovement(c);
      }
    });
  }
}
