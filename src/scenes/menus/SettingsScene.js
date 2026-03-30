/**
 * @fileoverview Tela de Configurações do Jogo.
 * Permite ajustar o volume global da música
 * por meio de sliders interativos que afetam todos os sons em tempo real.
 * O design dessa cena foi feito com IA.
 * @module scenes/menus/SettingsScene
 */

import Phaser from "phaser";

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

    // Lê valores salvos no registry (preservados entre cenas). Padrão é 30%.
    this.musicVolume = this.registry.get("musicVolume") ?? 0.3;

    // Estado do drag dos sliders.
    this._dragging = null;
  }

  create() {
    this.scene.bringToTop();
    const { width: w, height: h } = this.scale;
    const cx = w / 2;

    this._buildBackground(w, h, cx);
    this._buildTitle(cx, h);
    this._buildCard(w, h, cx);
    this._buildCloseButton(w, h);
    this._setupKeyboard();
  }

  // ── FUNDO ──

  /** Cria o fundo escuro com partículas decorativas. */
  _buildBackground(w, h, cx) {
    // Gradiente escuro de fundo.
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1a2e, 0x0d1a2e, 0.92);
    bgGfx.fillRect(0, 0, w, h);

    // Círculos brilhantes decorativos (efeito glow).
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0x0055ff, 0.06);
    glowGfx.fillCircle(cx * 0.3, h * 0.2, 180);
    glowGfx.fillStyle(0x00aaff, 0.05);
    glowGfx.fillCircle(cx * 1.7, h * 0.8, 220);

    // Linha decorativa no topo.
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(1, 0x00adef, 0.3);
    lineGfx.lineBetween(60, 72, w - 60, 72);
  }

  // ── TÍTULO ──

  /** Constrói o cabeçalho com ícone e título. */
  _buildTitle(cx, h) {
    // Ícone de engrenagem (⚙).
    this.add
      .text(cx, h * 0.1, "⚙", {
        fontSize: "36px",
        color: "#00adef",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, h * 0.1 + 46, "CONFIGURAÇÕES", {
        fontFamily: "monospace",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 6,
      })
      .setOrigin(0.5);

    // Linha divisória abaixo do título.
    const divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0x00adef, 0.5);
    divGfx.lineBetween(cx - 140, h * 0.1 + 70, cx + 140, h * 0.1 + 70);
  }

  // ── CARD PRINCIPAL ──

  /** Constrói o painel central glassmorphism com os controles. */
  _buildCard(w, h, cx) {
    const cardW = Math.min(w - 80, 520);
    const cardH = 180;
    const cardX = cx - cardW / 2;
    const cardY = h * 0.25;

    // Fundo do card.
    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0xffffff, 0.04);
    cardGfx.fillRoundedRect(cardX, cardY, cardW, cardH, 18);
    cardGfx.lineStyle(1, 0x00adef, 0.25);
    cardGfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 18);

    const sliderW = cardW - 80;
    const sliderX = cardX + 40;

    // Slider de Música.
    const musicY = cardY + 70;
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
  }

  // ── SLIDER ──

  /**
   * Constrói uma linha completa com label, slider e valor percentual.
   * @param {number} cx - Centro horizontal da tela.
   * @param {number} x - Posição X do início do slider.
   * @param {number} y - Posição Y central da linha.
   * @param {number} sliderW - Largura do slider.
   * @param {string} label - Texto do label.
   * @param {number} initialVal - Valor inicial (0..1).
   * @param {Function} onChange - Callback com o novo valor (0..1).
   * @param {string} key - Chave única para referenciar este slider.
   */
  _buildSliderRow(cx, x, y, sliderW, label, initialVal, onChange, key) {
    const trackH = 6;
    const thumbR = 11;
    const thumbY = y + 38;
    const trackY = thumbY;

    // Label da linha.
    this.add
      .text(x, y, label, {
        fontFamily: "monospace",
        fontSize: "15px",
        color: "#aaccff",
      })
      .setOrigin(0, 0.5);

    // Texto do percentual atual.
    const pctText = this.add
      .text(x + sliderW, y, `${Math.round(initialVal * 100)}%`, {
        fontFamily: "monospace",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(1, 0.5);

    // Track de fundo (trilha cinza).
    const trackBg = this.add.graphics();
    trackBg.fillStyle(0x2a2a4a, 1);
    trackBg.fillRoundedRect(x, trackY - trackH / 2, sliderW, trackH, 3);

    // Track de progresso (trilha azul).
    const trackFill = this.add.graphics();

    // Thumb (bolinha arrastável).
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
      thumb.fillStyle(0x000000, 0.3);
      thumb.fillCircle(thumbX + 2, thumbY + 2, thumbR);
      // Thumb principal com gradiente manual.
      thumb.fillStyle(0x00adef, 1);
      thumb.fillCircle(thumbX, thumbY, thumbR);
      thumb.fillStyle(0x55ddff, 1);
      thumb.fillCircle(thumbX - 3, thumbY - 3, 4);

      pctText.setText(`${Math.round(clamp * 100)}%`);
    };

    redraw(initialVal);

    // Zona interativa cobrindo o slider inteiro.
    const hitArea = this.add
      .rectangle(
        x + sliderW / 2,
        thumbY,
        sliderW + thumbR * 2,
        thumbR * 3,
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

  // ── BOTÃO FECHAR ──

  /** Constrói o botão de voltar. */
  _buildCloseButton(w, h) {
    const cx = w / 2;
    const btnY = h * 0.87;

    // Fundo do botão.
    const btnGfx = this.add.graphics();
    const btnW = 220;
    const btnH = 48;
    btnGfx.fillStyle(0x0033aa, 0.7);
    btnGfx.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
    btnGfx.lineStyle(1.5, 0x00adef, 0.8);
    btnGfx.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

    const btnText = this.add
      .text(cx, btnY, "← VOLTAR", {
        fontFamily: "monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    // Zona clicável.
    const hitZone = this.add
      .rectangle(cx, btnY, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitZone.on("pointerdown", () => this._goBack());

    // Nota de rodapé.
    this.add
      .text(w / 2, h * 0.95, "As configurações são salvas automaticamente", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#445566",
      })
      .setOrigin(0.5);
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
   * @param {number} val - Volume normalizado (0..1).
   */
  _applyMusicVolume(val) {
    const musicKeys = [
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

  // ── NAVEGAÇÃO ──

  /** Volta à cena anterior (menu ou pausa). */
  _goBack() {
    if (this.scene.isPaused(this.returnScene)) {
      this.scene.stop();
      this.scene.resume(this.returnScene);
    } else if (this.scene.isActive(this.returnScene)) {
      this.scene.stop();
    } else {
      this.scene.start(this.returnScene);
    }
  }
}
