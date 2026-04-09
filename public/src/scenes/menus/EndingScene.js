/**
 * @fileoverview Tela de conclusão do jogo (Ending Scene).
 * Exibida após a conclusão do último mapa principal (IndustrialScene).
 * Parabeniza o jogador e o encoraja a continuar explorando.
 * @module scenes/menus/EndingScene
 */

import Phaser from "phaser";

/**
 * Cena de vitória e fim da jornada principal.
 * @extends Phaser.Scene
 */
export class EndingScene extends Phaser.Scene {
  constructor() {
    super("EndingScene");
  }

  init(data) {
    this.playerName = this.registry.get("playerName") || "Jogador";
  }

  create() {
    const { width, height } = this.scale;
    const isMobile = !this.sys.game.device.os.desktop;
    const cx = width / 2;
    const cy = height / 2;

    // Pausar músicas anteriores
    this.sound.pauseAll();

    // Podemos tocar um som de vitória ou continuar e voltar a música
    const sfxVolume = this.registry.get("sfxVolume") ?? 0.7;
    const victorySound = this.sound.add("sfx_levelup", { volume: sfxVolume });
    victorySound.play();

    // ── BACKGROUND ESTILIZADO ──
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x051020, 0x051020, 0.98);
    bgGfx.fillRect(0, 0, width, height);

    // Efeito de brilho circular no centro
    const glow = this.add.graphics();
    glow.fillStyle(0x00adef, 0.15);
    glow.fillCircle(cx, cy, 300); // Removido o offset de -50 para centralizar o brilho

    // ── CARD GLASSMORPHISM ──
    const cardW = Math.min(width - 60, 650);
    const cardH = 400; // Tamanho unificado para garantir que nada fique espremido
    const cardX = cx - cardW / 2;
    const cardY = (height - cardH) / 2; // Centralização perfeita na tela

    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0xffffff, 0.05);
    cardGfx.fillRoundedRect(cardX, cardY, cardW, cardH, 20);
    cardGfx.lineStyle(2, 0x00adef, 0.6);
    cardGfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 20);

    // ── TÍTULO ──
    const title = this.add
      .text(cx, cardY + 60, "JORNADA CONCLUÍDA!", {
        fontFamily: "Arial",
        fontSize: isMobile ? "28px" : "42px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#00adef",
        strokeThickness: 6,
        shadow: { blur: 15, color: "#00adef", fill: true },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.5);

    const msgLines = [
      `Parabéns, ${this.playerName}!`,
      "Você dominou a arte da negociação e espalhou as soluções",
      "da Cielo por toda a região! A jornada principal terminou,",
      "mas o mercado está sempre em movimento.",
      "Ainda há diversos clientes esperando por você em todos os mapas.",
    ];

    // Confiança do jogador
    const message = this.add
      .text(cx, cardY + 170, msgLines.join("\n"), {
        fontFamily: "Arial",
        fontSize: isMobile ? "14px" : "18px",
        color: "#d0f0ff",
        lineSpacing: 8,
        align: "center",
        wordWrap: { width: cardW - 60 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const conf = this.registry.get("playerConfidence") ?? 50;
    const confText = this.add
      .text(
        cx,
        cardY + 270,
        `🏅 Sua Confiança como Vendedor: ${Math.floor(conf)}%`,
        {
          fontFamily: "Courier New",
          fontSize: isMobile ? "14px" : "18px",
          fontStyle: "bold",
          color: "#ffcc00",
        },
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // ── BOTÃO "CONTINUAR EXPLORANDO" ──
    const btnW = isMobile ? 240 : 280;
    const btnH = 50;
    const btnY = cardY + 350;

    const btnContainer = this.add.container(cx, btnY).setAlpha(0);

    const btnGfxSolid = this.add.graphics();
    btnGfxSolid.fillStyle(0x00adef, 0.9);
    btnGfxSolid.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
    btnGfxSolid.lineStyle(2, 0x55ddff, 1);
    btnGfxSolid.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);

    const btnText = this.add
      .text(0, 0, "CONTINUAR EXPLORANDO", {
        fontFamily: "Arial",
        fontSize: isMobile ? "14px" : "16px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    btnContainer.add([btnGfxSolid, btnText]);

    const hitZone = this.add
      .rectangle(0, 0, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    btnContainer.add(hitZone);

    hitZone.on("pointerdown", () => {
      this.sound.resumeAll();
      this.scene.start("WorldMapScene");
    });
    hitZone.on("pointerover", () => btnContainer.setScale(1.05));
    hitZone.on("pointerout", () => btnContainer.setScale(1));

    // ── ANIMAÇÃO DE ENTRADA ──
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 800,
      ease: "Back.easeOut",
      onComplete: () => {
        this.tweens.add({
          // Essa animação move os elementos -10px no eixo Y
          targets: [message, confText, btnContainer],
          alpha: 1,
          y: "-=10",
          duration: 1000,
          ease: "Cubic.easeOut",
        });
      },
    });

    // Partículas subindo para criar efeito heroico
    for (let i = 0; i < 20; i++) {
      let p = this.add.circle(
        Phaser.Math.Between(cx - 300, cx + 300),
        height + 50,
        Phaser.Math.Between(2, 5),
        0x00adef,
        Math.random(),
      );

      this.tweens.add({
        targets: p,
        y: -50,
        x: p.x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }
}
