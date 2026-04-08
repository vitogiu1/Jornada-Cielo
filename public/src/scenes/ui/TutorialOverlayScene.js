/**
 * @fileoverview Cena de sobreposição para exibir o tutorial de controles e objetivos.
 *
 * Renderizada como overlay (camada sobre a cena de jogo pausada), exibe dois slides:
 *  - Slide 1: Guia de controles do teclado.
 *  - Slide 2: Missão e objetivos do jogador.
 *
 * O jogador avança entre slides e fecha o tutorial pressionando qualquer tecla
 * ou clicando/tocando na tela.
 *
 * @module scenes/ui/TutorialOverlayScene
 */

import Phaser from "phaser";

// ─── DADOS DOS SLIDES ────────────────────────────────────────────────────────

/**
 * Lista de controles exibidos no Slide 0 (Guia de Controles).
 * Cada entrada contém a tecla e sua descrição.
 * @constant {Array<{key: string, desc: string}>}
 */
const CONTROLS_LIST = [
  { key: "WASD / Setas", desc: "Movimentação do personagem" },
  { key: "Tab", desc: "Próximos objetivos e metas" },
  { key: "E / Espaço", desc: "Interação e avanço de diálogos" },
  { key: "I", desc: "Abrir Inventário de Itens" },
  { key: "P", desc: "CieloDex (Produtos e Clientes)" },
];

/**
 * Lista de objetivos exibidos no Slide 1 (Sua Missão).
 * Cada entrada contém um título com emoji e uma descrição curta.
 * @constant {Array<{title: string, desc: string}>}
 */
const OBJECTIVES_LIST = [
  {
    title: "📍 CONQUISTE O MERCADO",
    desc: "Encontre comerciantes locais e convença-os a modernizar seus negócios.",
  },
  {
    title: "🤝 SEJA UM CONSULTOR",
    desc: "Ofereça as soluções Cielo ideais para cada tipo de cliente.",
  },
  {
    title: "📈 EVOLUA SUA CARREIRA",
    desc: "Ganhe experiência em cada negociação e suba de nível para desbloquear bônus.",
  },
];

// CENA

/**
 * Cena de tutorial exibida como overlay após a conversa inicial com a Amélia.
 * Apresenta dois slides navegáveis: controles do jogo e objetivos da missão.
 *
 * @extends Phaser.Scene
 */
export class TutorialOverlayScene extends Phaser.Scene {
  constructor() {
    super("TutorialOverlayScene");

    /**
     * Índice do slide atualmente exibido.
     * 0 = Controles | 1 = Objetivos
     * @type {number}
     */
    this.currentSlide = 0;
  }

  /**
   * Recebe os parâmetros da cena e reinicia o estado do slide.
   * Chamado automaticamente pelo Phaser antes de `create()`.
   *
   * @param {object} data               - Dados passados ao iniciar a cena.
   * @param {string} data.returnScene   - Nome da cena a retomar ao fechar o tutorial.
   */
  init(data) {
    this.returnScene = data.returnScene;
    this.currentSlide = 0;
  }

  /**
   * Constrói os elementos base da cena: fundo bloqueador, container de conteúdo
   * e listeners de input para navegação entre slides.
   */
  create() {
    const { width, height } = this.scale;

    // Fundo escuro semitransparente que impede cliques na cena por baixo.
    this.bg = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.85)
      .setOrigin(0)
      .setInteractive(); // Captura cliques para que não "passem" para a cena anterior.

    /**
     * Container reutilizável que é limpo e reconstruído a cada troca de slide.
     * Facilita a remoção de todos os elementos do slide anterior de uma vez só.
     * @type {Phaser.GameObjects.Container}
     */
    this.contentContainer = this.add.container(0, 0);

    // Qualquer tecla ou toque avança o tutorial.
    this.input.keyboard.on("keydown", () => this._nextSlide());
    this.input.on("pointerdown", () => this._nextSlide());

    // Exibe o primeiro slide imediatamente.
    this._showSlide();
  }

  //  RENDERIZAÇÃO DE SLIDES
  /**
   * Limpa o container de conteúdo e renderiza o slide atual.
   * Estrutura comum a todos os slides: card com borda + rodapé pulsante.
   */
  _showSlide() {
    // Remove e destrói todos os elementos do slide anterior.
    this.contentContainer.removeAll(true);

    const { width, height } = this.scale;

    // Dimensões e posição central do card.
    const cardW = Math.min(width * 0.92, 600);
    const cardH = 460;
    const cardX = width / 2;
    const cardY = height / 2;

    // Card de fundo
    const card = this.add.graphics();
    card.fillStyle(0x0a0a1a, 1);
    card.fillRoundedRect(
      cardX - cardW / 2,
      cardY - cardH / 2,
      cardW,
      cardH,
      20,
    );
    card.lineStyle(4, 0x00adef, 1);
    card.strokeRoundedRect(
      cardX - cardW / 2,
      cardY - cardH / 2,
      cardW,
      cardH,
      20,
    );
    this.contentContainer.add(card);

    // Conteúdo específico do slide
    if (this.currentSlide === 0) {
      this._renderControls(cardX, cardY, cardW, cardH);
    } else {
      this._renderObjective(cardX, cardY, cardW, cardH);
    }

    // Rodapé com instrução de navegação
    const footerLabel =
      this.currentSlide === 0
        ? "CLIQUE OU TECLA PARA CONTINUAR ▶"
        : "CLIQUE OU TECLA PARA FINALIZAR ✔";

    const footer = this.add
      .text(cardX, cardY + cardH / 2 - 40, footerLabel, {
        fontSize: "13px",
        fontFamily: "Arial",
        color: "#00adef",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    // Animação pulsante para chamar atenção ao rodapé.
    this.tweens.add({
      targets: footer,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.contentContainer.add(footer);
  }

  /**
   * Renderiza o Slide 1: Guia de Controles.
   * Exibe cada atalho de teclado com um fundo de tecla estilizado e sua descrição.
   *
   * @param {number} cardX - Centro horizontal do card.
   * @param {number} cardY - Centro vertical do card.
   * @param {number} cardW - Largura do card.
   * @param {number} cardH - Altura do card.
   */
  _renderControls(cardX, cardY, cardW, cardH) {
    // Título do slide
    const title = this.add
      .text(cardX, cardY - cardH / 2 + 50, "GUIA DE CONTROLES", {
        fontSize: "28px",
        fontFamily: "Courier New",
        fontWeight: "bold",
        color: "#00adef",
      })
      .setOrigin(0.5);

    this.contentContainer.add(title);

    // Lista de controles
    const startY = cardY - cardH / 2 + 120;
    const spacing = 58;

    CONTROLS_LIST.forEach((item, index) => {
      const y = startY + index * spacing;

      // Fundo da "tecla" — retângulo escuro com borda sutil.
      const keyBg = this.add
        .rectangle(cardX - cardW / 2 + 50, y, 150, 42, 0x1a1a3a, 1)
        .setOrigin(0, 0.5)
        .setStrokeStyle(2, 0x333366);

      // Nome da tecla centralizado dentro do fundo.
      const keyText = this.add
        .text(cardX - cardW / 2 + 125, y, item.key, {
          fontSize: "17px",
          fontFamily: "monospace",
          fontWeight: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      // Descrição da ação, à direita da tecla.
      const descText = this.add
        .text(cardX - cardW / 2 + 220, y, item.desc, {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#cccccc",
        })
        .setOrigin(0, 0.5);

      this.contentContainer.add([keyBg, keyText, descText]);
    });
  }

  /**
   * Renderiza o Slide 2: Sua Missão.
   * Exibe uma introdução narrativa seguida dos três objetivos principais do jogo.
   *
   * @param {number} cardX - Centro horizontal do card.
   * @param {number} cardY - Centro vertical do card.
   * @param {number} cardW - Largura do card.
   * @param {number} cardH - Altura do card.
   */
  _renderObjective(cardX, cardY, cardW, cardH) {
    // Título do slide
    const title = this.add
      .text(cardX, cardY - cardH / 2 + 50, "SUA MISSÃO", {
        fontSize: "28px",
        fontFamily: "Courier New",
        fontWeight: "bold",
        color: "#00adef",
      })
      .setOrigin(0.5);

    this.contentContainer.add(title);

    // Texto introdutório
    const message = this.add
      .text(
        cardX,
        cardY - cardH / 2 + 100,
        "Sua jornada começa agora! Explore a região para expandir o ecossistema Cielo.",
        {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: cardW - 80 },
        },
      )
      .setOrigin(0.5);

    this.contentContainer.add(message);

    // Lista de objetivos
    const startY = cardY - cardH / 2 + 180;
    const spacing = 80;

    OBJECTIVES_LIST.forEach((item, index) => {
      const y = startY + index * spacing;

      // Título do objetivo (emoji + texto em azul Cielo).
      const titleText = this.add
        .text(cardX - cardW / 2 + 40, y - 12, item.title, {
          fontSize: "19px",
          fontFamily: "Arial",
          fontWeight: "bold",
          color: "#00adef",
        })
        .setOrigin(0, 0.5);

      // Descrição curta abaixo do título.
      const descText = this.add
        .text(cardX - cardW / 2 + 40, y + 15, item.desc, {
          fontSize: "15px",
          fontFamily: "Arial",
          color: "#bbbbbb",
          wordWrap: { width: cardW - 100 },
        })
        .setOrigin(0, 0.5);

      this.contentContainer.add([titleText, descText]);
    });
  }

  //  NAVEGAÇÃO
  /**
   * Avança para o próximo slide ou fecha o tutorial se já está no último.
   * Chamado por qualquer evento de teclado ou toque na tela.
   */
  _nextSlide() {
    if (this.currentSlide === 0) {
      // Avança do Slide 0 (Controles) para o Slide 1 (Missão).
      this.currentSlide = 1;
      this._showSlide();
    } else {
      // Último slide: encerra o tutorial.
      this._close();
    }
  }

  /**
   * Encerra a cena de tutorial e retoma a cena de jogo que estava pausada.
   */
  _close() {
    this.scene.stop();

    if (this.returnScene) {
      this.scene.resume(this.returnScene);
    }
  }
}
