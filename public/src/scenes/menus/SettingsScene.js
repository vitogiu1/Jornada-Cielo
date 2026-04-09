/**
 * @fileoverview Tela de Configurações do Jogo.
 * Permite ajustar o volume global da música
 * por meio de sliders interativos que afetam todos os sons em tempo real.
 * O design segue o padrão Glassmorphism da interface principal.
 * @module scenes/menus/SettingsScene
 */

import Phaser from "phaser";
import { ColorBlind } from "../../utils/ColorBlind";

/**
 * Cena de configurações com sliders interativos de volume.
 * Lida com música de fundo e efeitos sonoros separadamente.
 * @extends Phaser.Scene
 */
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
  }

  /**
   * Recebe a cena para a qual deve retornar ao fechar.
   * @param {object} data - { returnScene: string }
   */
  init(data) {
    this.returnScene = data?.returnScene || "MenuScene";

    // Lê valores salvos no registry (preservados entre cenas). Padrão é 30% e 70%.
    this.musicVolume = this.registry.get("musicVolume") ?? 0.3;
    this.sfxVolume = this.registry.get("sfxVolume") ?? 0.7;

    // Lê e prepara o filtro de daltonismo
    this.daltonismFilter = localStorage.getItem("daltonismFilter") || "none";

    // Estado do drag dos sliders.
    this._dragging = null;
  }

  create() {
    this.scene.bringToTop();
    const { width: w, height: h } = this.scale;
    const cx = w / 2;
    const isMobile = !this.sys.game.device.os.desktop;

    this._buildBackground(w, h, cx);
    this._buildTopBackButton(isMobile);
    this._buildTitle(cx, h, isMobile);
    this._buildCard(w, h, cx, isMobile);
    this._setupKeyboard();

    // Nota de rodapé suave
    this.add
      .text(cx, h * 0.95, "As configurações são salvas automaticamente", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#556677",
      })
      .setOrigin(0.5);
  }

  // ── FUNDO E BOTÃO VOLTAR ──

  /** Cria o fundo escuro com partículas decorativas. */
  _buildBackground(w, h, cx) {
    // Gradiente escuro de fundo.
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1a2e, 0x0d1a2e, 0.92);
    bgGfx.fillRect(0, 0, w, h);

    // Círculos brilhantes decorativos (efeito glow).
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0x0055ff, 0.05);
    glowGfx.fillCircle(cx * 0.2, h * 0.2, 180);
    glowGfx.fillStyle(0x00aaff, 0.04);
    glowGfx.fillCircle(cx * 1.8, h * 0.8, 220);
  }

  /** Constrói o botão de voltar padrão no topo esquerdo. */
  _buildTopBackButton(isMobile) {
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
    backHitZone.on("pointerdown", () => this._goBack());
  }

  // ── TÍTULO ──

  /** Constrói o cabeçalho. */
  _buildTitle(cx, h, isMobile) {
    const titleSize = isMobile ? "28px" : "38px";

    // Título Principal
    this.add
      .text(cx, h * 0.15, "CONFIGURAÇÕES", {
        fontFamily: "monospace",
        fontSize: titleSize,
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "rgba(0, 173, 239, 0.6)", 15, true, false);
  }

  // ── CARD PRINCIPAL ──

  /** Constrói o painel central glassmorphism com os controles. */
  _buildCard(w, h, cx, isMobile) {
    const cardW = isMobile ? w * 0.85 : Math.min(w - 80, 520);
    const cardH = 260;
    const cardX = cx - cardW / 2;
    const cardY = h * 0.45 - cardH / 2; // Centralizado verticalmente considerando o título

    // Fundo do card (Glassmorphism).
    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0xffffff, 0.04);
    cardGfx.fillRoundedRect(cardX, cardY, cardW, cardH, 20);
    cardGfx.lineStyle(2, 0x00adef, 0.3);
    cardGfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 20);

    const sliderW = cardW - 80;
    const sliderX = cardX + 40;

    // Slider de Música.
    const musicY = cardY + 50;
    this._buildSliderRow(
      cx,
      sliderX,
      musicY,
      sliderW,
      "🎵  Música",
      this.musicVolume,
      (val) => {
        this.musicVolume = val;
        this.registry.set("musicVolume", val);
        this._applyMusicVolume(val);
      },
      "musicSlider",
    );

    // Slider de SFX.
    const sfxY = cardY + 130;
    this._buildSliderRow(
      cx,
      sliderX,
      sfxY,
      sliderW,
      "🔊  Efeitos",
      this.sfxVolume,
      (val) => {
        this.sfxVolume = val;
        this.registry.set("sfxVolume", val);
        this._applySfxVolume(val);
      },
      "sfxSlider",
    );

    // Seletor de Daltonismo
    const daltonY = cardY + 210;
    const colorOptions = [
      { name: "Nenhum", value: "none" },
      { name: "Protanopia", value: "protanopia" },
      { name: "Deuteranopia", value: "deuteranopia" },
      { name: "Tritanopia", value: "tritanopia" },
      { name: "Monocromático", value: "achromatopsia" },
    ];
    const initialIndex =
      colorOptions.findIndex((o) => o.value === this.daltonismFilter) || 0;

    this._buildCycleRow(
      cx,
      sliderX,
      daltonY,
      sliderW,
      "👁  Filtro de Cor",
      colorOptions,
      Math.max(0, initialIndex),
      (val) => {
        this.daltonismFilter = val;
        localStorage.setItem("daltonismFilter", val);
        ColorBlind.applyFilter(val);
      },
    );
  }

  // ── CONTROLES ──

  /**
   * Constrói uma linha completa com label, slider e valor percentual.
   */
  _buildSliderRow(cx, x, y, sliderW, label, initialVal, onChange, key) {
    const trackH = 6;
    const thumbR = 10;
    const thumbY = y + 34;
    const trackY = thumbY;

    // Label da linha.
    this.add
      .text(x, y, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#aaccff",
      })
      .setOrigin(0, 0.5);

    // Texto do percentual atual.
    const pctText = this.add
      .text(x + sliderW, y, `${Math.round(initialVal * 100)}%`, {
        fontFamily: "monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(1, 0.5);

    // Track de fundo (trilha cinza).
    const trackBg = this.add.graphics();
    trackBg.fillStyle(0x2a2a4a, 1);
    trackBg.fillRoundedRect(x, trackY - trackH / 2, sliderW, trackH, 3);

    // Track de progresso e Thumb
    const trackFill = this.add.graphics();
    const thumb = this.add.graphics();

    // Função que redesenha o slider com base num valor (0..1).
    const redraw = (val) => {
      const clamp = Math.max(0, Math.min(1, val));
      const fillW = sliderW * clamp;
      const thumbX = x + fillW;

      trackFill.clear();
      // Gradiente azul Cielo para o progresso.
      trackFill.fillStyle(0x00adef, 1);
      trackFill.fillRoundedRect(x, trackY - trackH / 2, fillW, trackH, 3);
      // Ponto brilhante no fim.
      trackFill.fillStyle(0x55ddff, 1);
      trackFill.fillCircle(x + fillW, trackY, 3);

      thumb.clear();
      // Sombra do thumb.
      thumb.fillStyle(0x000000, 0.4);
      thumb.fillCircle(thumbX + 2, thumbY + 2, thumbR);
      // Thumb principal com gradiente manual.
      thumb.fillStyle(0x00adef, 1);
      thumb.fillCircle(thumbX, thumbY, thumbR);
      thumb.fillStyle(0x55ddff, 1);
      thumb.fillCircle(thumbX - 2, thumbY - 2, 4);

      pctText.setText(`${Math.round(clamp * 100)}%`);
    };

    redraw(initialVal);

    // Zona interativa cobrindo o slider inteiro.
    const hitArea = this.add
      .rectangle(
        x + sliderW / 2,
        thumbY,
        sliderW + thumbR * 2,
        thumbR * 4,
        0x000000,
        0,
      )
      .setInteractive({ useHandCursor: true });

    // Calcula o valor (0..1) a partir da posição X do ponteiro.
    const valFromPointer = (pointer) => {
      const local = Phaser.Math.Clamp(pointer.x - x, 0, sliderW);
      return local / sliderW;
    };

    hitArea.on("pointerdown", (pointer) => {
      this._dragging = key;
      const val = valFromPointer(pointer);
      redraw(val);
      onChange(val);
    });

    this.input.on("pointermove", (pointer) => {
      if (this._dragging !== key) return;
      if (!pointer.isDown) {
        this._dragging = null;
        return;
      }
      const val = valFromPointer(pointer);
      redraw(val);
      onChange(val);
    });

    this.input.on("pointerup", () => {
      if (this._dragging === key) this._dragging = null;
    });
  }

  /**
   * Constrói uma linha com seletor de ciclo para opções textuais.
   */
  _buildCycleRow(cx, x, y, width, label, options, initialIndex, onChange) {
    this.add
      .text(x, y, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#aaccff",
      })
      .setOrigin(0, 0.5);

    let currentIndex = initialIndex;
    const controlCenterX = x + width - 95;

    // Fundo do seletor visual
    const selectBg = this.add.graphics();
    selectBg.fillStyle(0x1a1a2e, 0.8);
    selectBg.fillRoundedRect(controlCenterX - 75, y - 16, 150, 32, 6);
    selectBg.lineStyle(1, 0x00adef, 0.4);
    selectBg.strokeRoundedRect(controlCenterX - 75, y - 16, 150, 32, 6);

    // Label central da opção
    const optText = this.add
      .text(controlCenterX, y, options[currentIndex].name, {
        fontFamily: "monospace",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    // Botões de ciclo
    const btnStyle = { fontSize: "18px", color: "#00adef" };

    const btnLeft = this.add
      .text(controlCenterX - 60, y, "◀", btnStyle)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    const btnRight = this.add
      .text(controlCenterX + 60, y, "▶", btnStyle)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    [btnLeft, btnRight].forEach((b) => {
      b.on("pointerover", () => {
        b.setColor("#ffffff");
        b.setScale(1.2);
      });
      b.on("pointerout", () => {
        b.setColor("#00adef");
        b.setScale(1);
      });
    });

    const updateDisplay = () => {
      optText.setText(options[currentIndex].name);
      onChange(options[currentIndex].value);
    };

    btnLeft.on("pointerdown", () => {
      currentIndex--;
      if (currentIndex < 0) currentIndex = options.length - 1;
      updateDisplay();
    });

    btnRight.on("pointerdown", () => {
      currentIndex++;
      if (currentIndex >= options.length) currentIndex = 0;
      updateDisplay();
    });
  }

  // ── TECLADO ──

  /** Registra tecla ESC para fechar as configurações. */
  _setupKeyboard() {
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this._goBack();
    }
  }

  // ── LÓGICA DE VOLUME ──

  /**
   * Aplica o volume de música a todos os sons de mapa/menu ativos.
   */
  _applyMusicVolume(val) {
    const musicKeys = [
      "farm_music",
      "beach_music",
      "cielo_music",
      "city_music",
      "industrial_music",
      "music_menu",
      "music_negotiation",
    ];
    musicKeys.forEach((key) => {
      const snd = this.sound.get(key);
      if (snd) snd.setVolume(val);
    });
  }

  /**
   * Aplica o volume de efeitos sonoros a todos os sons sfx ativos (se houver).
   */
  _applySfxVolume(val) {
    const sfxKeys = ["sfx_levelup"];
    sfxKeys.forEach((key) => {
      const snd = this.sound.get(key);
      if (snd) snd.setVolume(val);
    });
  }

  // ── NAVEGAÇÃO ──

  /** Volta à cena anterior (menu ou pausa). */
  _goBack() {
    if (this.scene.isPaused(this.returnScene)) {
      this.scene.stop();
      this.scene.resume(this.returnScene);
    } else if (this.scene.isActive(this.returnScene)) {
      this.scene.stop();
    } else {
      // Se voltando para o Menu principal, dá um fade suave (opcional para polimento)
      if (this.returnScene === "MenuScene") {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start(this.returnScene);
        });
      } else {
        this.scene.start(this.returnScene);
      }
    }
  }
}
