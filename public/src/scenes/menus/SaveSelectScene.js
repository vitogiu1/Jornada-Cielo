/**
 * @fileoverview Cena de Seleção de Slots de Save.
 * Permite iniciar Novo Jogo em slots vazios ou Carregar/Deletar jogos existentes.
 * O design segue o padrão Glassmorphism ("moderno e bonito").
 * @module scenes/menus/SaveSelectScene
 */

import Phaser from "phaser";
import { SaveSystem } from "../../utils/SaveSystem";

export class SaveSelectScene extends Phaser.Scene {
  constructor() {
    super("SaveSelectScene");
  }

  create() {
    const { width, height } = this.scale;
    const isMobile = !this.sys.game.device.os.desktop;

    // Fundo base e gradiente
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1a2e, 0x0d1a2e, 0.92);
    bgGfx.fillRect(0, 0, width, height);

    // Efeitos de iluminação (Glows)
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0x0055ff, 0.05);
    glowGfx.fillCircle(width * 0.2, height * 0.2, 180);
    glowGfx.fillStyle(0x00aaff, 0.04);
    glowGfx.fillCircle(width * 0.8, height * 0.8, 220);

    // BOTÃO VOLTAR (TOPO ESQUERDO)
    const backBtnX = isMobile ? 60 : 80;
    const backBtnY = isMobile ? 40 : 50;
    const backBtnW = 100;
    const backBtnH = 40;

    const backGfx = this.add.graphics();
    backGfx.fillStyle(0xffffff, 0.1);
    backGfx.fillRoundedRect(
      backBtnX - backBtnW / 2,
      backBtnY - backBtnH / 2,
      backBtnW,
      backBtnH,
      12,
    );
    backGfx.lineStyle(2, 0xffffff, 0.4);
    backGfx.strokeRoundedRect(
      backBtnX - backBtnW / 2,
      backBtnY - backBtnH / 2,
      backBtnW,
      backBtnH,
      12,
    );

    this.add
      .text(backBtnX, backBtnY, "❮ VOLTAR", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const backHitZone = this.add
      .rectangle(backBtnX, backBtnY, backBtnW, backBtnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    backHitZone.on("pointerover", () => backGfx.setAlpha(0.6));
    backHitZone.on("pointerout", () => backGfx.setAlpha(1));
    backHitZone.on("pointerdown", () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MenuScene");
      });
    });

    // TÍTULO DA CENA
    const titleSize = isMobile ? "28px" : "38px";
    this.add
      .text(width / 2, height * 0.15, "ARQUIVOS DE JOGO", {
        fontFamily: "monospace",
        fontSize: titleSize,
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "rgba(0, 173, 239, 0.6)", 15, true, false);

    // SLOTS DE SAVE
    this.saves = SaveSystem.getSaves();
    const cardSpacing = isMobile ? 160 : 220;
    const startY = height * 0.42;

    this.saves.forEach((slotInfo, index) => {
      this._buildSaveSlotCard(
        width / 2,
        startY + index * cardSpacing,
        slotInfo,
        isMobile,
      );
    });
  }

  /**
   * Constrói visualmente um card de save (Vazio ou Ocupado)
   */
  _buildSaveSlotCard(cx, cy, slotInfo, isMobile) {
    const cardW = isMobile ? this.scale.width * 0.85 : 550;
    const cardH = isMobile ? 120 : 150;

    // Fundo estilo Glassmorphism
    const cardGfx = this.add.graphics();
    const drawCardBg = (alpha, borderAlpha) => {
      cardGfx.clear();
      cardGfx.fillStyle(0xffffff, alpha);
      cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);
      cardGfx.lineStyle(2, 0x00adef, borderAlpha);
      cardGfx.strokeRoundedRect(
        cx - cardW / 2,
        cy - cardH / 2,
        cardW,
        cardH,
        20,
      );
    };
    drawCardBg(0.04, 0.3);

    // SLOT VAZIO
    if (slotInfo.empty) {
      const textNovo = this.add
        .text(cx, cy, "+ NOVO JOGO", {
          fontFamily: "monospace",
          fontSize: isMobile ? "20px" : "24px",
          fontStyle: "bold",
          color: "#2ecc71",
          letterSpacing: 2,
        })
        .setOrigin(0.5);

      // Animação contínua suave (breathing) para incentivar o clique
      this.tweens.add({
        targets: textNovo,
        alpha: 0.7,
        scale: 0.98,
        yoyo: true,
        repeat: -1,
        duration: 1200,
        ease: "Sine.easeInOut",
      });

      const zone = this.add
        .rectangle(cx, cy, cardW, cardH, 0, 0)
        .setInteractive({ useHandCursor: true });

      zone.on("pointerover", () => drawCardBg(0.08, 0.6));
      zone.on("pointerout", () => drawCardBg(0.04, 0.3));
      zone.on("pointerdown", () => {
        SaveSystem.setCurrentSlot(slotInfo.slotIndex);
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("NameInputScene");
        });
      });

      // SLOT OCUPADO
    } else {
      const leftBoundary = cx - cardW / 2;
      const rightBoundary = cx + cardW / 2;

      const avatarX = leftBoundary + (isMobile ? 50 : 65);
      const textX = avatarX + (isMobile ? 40 : 50);
      const btnGroupX = rightBoundary - (isMobile ? 70 : 85);

      const data = slotInfo.data;
      const charName = data.playerName || "Desconhecido";
      const lvl = data.playerLevel || 5;

      // Tradução de mapas usando um Objeto/Dicionário (mais limpo que IFs)
      const mapNames = {
        WorldMapScene: "Mundo",
        CieloScene: "HQ Cielo",
        CityScene: "Centro",
        FarmScene: "Fazenda",
        BeachScene: "Praia",
        IndustrialScene: "Industrial",
        Map: "Mapa",
      };
      const lastMap = mapNames[data.lastScene] || "Mapa";
      const saveDateStr = data.saveDate
        ? new Date(data.saveDate).toLocaleString().slice(0, 16)
        : "";

      // Fundo circular para o Sprite
      this.add.circle(avatarX, cy, 35, 0xffffff, 0.05);

      // Renderiza Sprite do jogador (se existir)
      if (data.playerSprite) {
        try {
          const spr = this.add
            .sprite(avatarX, cy, `${data.playerSprite}-idle`)
            .setScale(1.5);
          spr.play(`${data.playerSprite}-idle-down`);
        } catch (e) {}
      }

      // Textos de Informação
      this.add
        .text(textX, cy - 25, charName.toUpperCase(), {
          fontFamily: "monospace",
          fontSize: "20px",
          color: "#ffffff",
          fontStyle: "bold",
          letterSpacing: 1,
        })
        .setOrigin(0, 0.5);

      this.add
        .text(textX, cy + 4, `Nv. ${lvl} • ${lastMap}`, {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#aaccff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);

      this.add
        .text(textX, cy + 28, `Salvo em: ${saveDateStr}`, {
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          color: "#778899",
        })
        .setOrigin(0, 0.5);

      // Botões Interativos Modulares
      const btnW = isMobile ? 110 : 130;
      const btnH = 36;

      // Botão Carregar
      this._createModernButton(
        btnGroupX,
        cy - 22,
        btnW,
        btnH,
        "CARREGAR",
        0x2ecc71,
        0x27ae60,
        () => this.loadSaveAndStart(slotInfo.slotIndex),
      );

      // Botão Deletar com confirmação
      const delBtn = this._createModernButton(
        btnGroupX,
        cy + 22,
        btnW,
        btnH,
        "DELETAR",
        0xe74c3c,
        0xc0392b,
        () => {
          if (!delBtn.isConfirming) {
            delBtn.isConfirming = true;
            delBtn.txt.setText("CERTEZA?");
            delBtn.draw(0xe67e22); // Muda pra laranja no modo confirmação

            this.time.delayedCall(3000, () => {
              if (delBtn.txt.active) {
                delBtn.isConfirming = false;
                delBtn.txt.setText("DELETAR");
                delBtn.draw(0xe74c3c); // Volta pro vermelho
              }
            });
          } else {
            SaveSystem.deleteSave(slotInfo.slotIndex);

            // Transição de fade para reiniciar a cena suavemente
            this.cameras.main.fadeOut(200, 0, 0, 0);
            this.cameras.main.once("camerafadeoutcomplete", () =>
              this.scene.restart(),
            );
          }
        },
      );
    }
  }

  /**
   * Helper para criar botões arredondados e responsivos
   */
  _createModernButton(
    x,
    y,
    width,
    height,
    text,
    defaultColor,
    hoverColor,
    onClickCallback,
  ) {
    const btnGfx = this.add.graphics();

    const draw = (color) => {
      btnGfx.clear();
      btnGfx.fillStyle(color, 1);
      btnGfx.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    };
    draw(defaultColor);

    const txt = this.add
      .text(x, y, text, {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const zone = this.add
      .rectangle(x, y, width, height, 0, 0)
      .setInteractive({ useHandCursor: true });

    zone.on("pointerover", () => {
      if (!btnObj.isConfirming) draw(hoverColor);
    });
    zone.on("pointerout", () => {
      if (!btnObj.isConfirming) draw(defaultColor);
    });
    zone.on("pointerdown", onClickCallback);

    // Retorna o objeto caso precisemos alterar estado (ex: Botão de Deletar)
    const btnObj = { txt, draw, isConfirming: false };
    return btnObj;
  }

  /**
   * Dispara o carregamento do jogo
   */
  loadSaveAndStart(slotIndex) {
    const data = SaveSystem.loadSave(this.registry, slotIndex);
    if (!data) return;

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      let startScene = data.lastScene || "WorldMapScene";

      if (!this.scene.manager.keys[startScene]) {
        startScene = "WorldMapScene";
      }

      this.scene.start(startScene, {
        character: data.playerSprite,
        loadedSave: true,
      });
    });
  }
}
