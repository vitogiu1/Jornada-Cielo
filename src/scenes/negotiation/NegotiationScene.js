/**
 * @fileoverview Cena de negociação por argumentação.
 * Gerencia os turnos de negociação entre o jogador e um NPC,
 * com barras de confiança, argumentos, itens e recompensas.
 * @module scenes/NegotiationScene
 */

/**
 * Para um melhor gerenciamento das funções, as funções começadas em _, são para indicar que elas são
 * de uso privado, ou seja, somente desta classe (como por exemplo: this._function).
 */

import Phaser from "phaser";
import { negotiations } from "../../data/negotiations";
import { ProgressManager } from "../../managers/ProgressManager";
import { cieloCatalog } from "../ui/CielodexScene";

/** @extends Phaser.Scene */
export class NegotiationScene extends Phaser.Scene {
  constructor() {
    super("NegotiationScene");
  }

  /**
   * Recebe os dados da negociação e inicializa o estado inicial.
   * @param {object} data - negotiationId, returnScene e playerKey.
   */
  init(data) {
    this.negotiationData = negotiations[data.negotiationId];
    this.returnScene = data.returnScene || "CityScene";
    this.playerKey = data.playerKey || "amanda";
    this.negotiationId = data.negotiationId;
    this.worldId = data.worldId || null;
    this._won = false;

    if (!this.negotiationData) {
      console.error(
        "ID de negociação não encontrado ou importado incorretamente:",
        data.negotiationId,
      );
      console.error("Verifique data/negotiations.js");
      return; // Previne que o resto do init() execute
    }

    // Vida inicial do inimigo e confiança inicial do jogador.
    this.enemyRes = this.negotiationData.enemyMaxResistance;
    this.playerConf = this.negotiationData.playerMaxConfidence;

    // Estado inicial da máquina de turnos.
    this.state = "INTRO";
    this.selectedOption = 0;
    this.canInput = false;

    // Guarda os IDs dos argumentos já usados para penalizar repetição.
    this.usedArguments = new Set();

    // Controle de ajuda do S.O.S Cielo
    this.helpUsed = false;

    // Callback para avançar o diálogo com E/Espaço
    this._advanceCallback = null;
  }

  create() {
    if (!this.negotiationData) {
      console.error(
        "NegotiationScene.create() cancelado por falta de negotiationData válido.",
      );
      this._endNegotiation();
      return;
    }

    const { width: w, height: h } = this.scale;
    this._isMobile = !this.sys.game.device.os.desktop;

    // Oculta o joystick e o HUD durante a negociação.
    if (this.scene.isActive("MobileHudScene"))
      this.scene.sleep("MobileHudScene");
    if (this.scene.isActive("PlayerHudScene"))
      this.scene.sleep("PlayerHudScene");

    // Fundo escuro semi-transparente.
    this.add.rectangle(0, 0, w, h, 0x000000, 0.85).setOrigin(0);

    // Barra decorativa no topo com o título da negociação.
    const headerH = this._isMobile ? 30 : 40;
    this.add.rectangle(0, 0, w, headerH, 0x0055ff, 0.4).setOrigin(0);
    this.add.text(12, headerH * 0.2, "NEGOCIAÇÃO CIELO", {
      fontFamily: "monospace",
      fontSize: this._isMobile ? "13px" : "18px",
      fontStyle: "bold",
      color: "#ffffff",
    });

    // Cria os elementos visuais da negociação.
    this._createAvatars(w, h);
    this._createBars(w, h);
    this._createDialogBox(w, h);
    this._createOptionMenu(w, h);
    this._setupInput();

    // Garante que todas as músicas de mapa e do menu parem para a negociação.
    [
      "beach_music",
      "cielo_music",
      "city_music",
      "industrial_music",
      "music_menu",
    ].forEach((key) => {
      if (this.sound.get(key)?.isPlaying) this.sound.get(key).stop();
    });

    // Inicia a música da negociação em loop com fade-in suave.
    this.negotiationMusic = this.sound.add("music_negotiation", {
      loop: true,
      volume: 0,
    });
    this.negotiationMusic.play();

    // Respeita o volume configurado nas Settings.
    const targetVol = this.registry.get("musicVolume") ?? 0.3;

    this.tweens.add({
      targets: this.negotiationMusic,
      volume: targetVol,
      duration: 1000,
    });

    // Para a música imediatamente ao encerrar a cena.
    this.events.once("shutdown", () => {
      if (this.negotiationMusic) this.negotiationMusic.stop();
    });

    // Exibe o texto de introdução e aguarda o jogador pressionar E/Espaço.
    this.time.delayedCall(500, () => {
      this._setDialog(this.negotiationData.introText);
      this._waitForAdvance(() => this._startPlayerTurn());
    });
  }

  // ── CRIAÇÃO DA UI ──

  /** Cria os sprites do jogador e do inimigo com seus nomes abaixo. */
  _createAvatars(w, h) {
    const scale = this._isMobile ? 2.5 : 4;
    const avatarY = this._isMobile ? h * 0.38 : h * 0.5;
    const labelOffset = this._isMobile ? 55 : 80;
    const labelSize = this._isMobile ? "12px" : "16px";

    // Sprite do jogador
    this.playerSprite = this.add
      .sprite(w * 0.25, avatarY, `${this.playerKey}-idle-down`)
      .setScale(scale)
      .setFlipX(true);
    if (this.anims.exists(`${this.playerKey}-idle-down`)) {
      this.playerSprite.play(`${this.playerKey}-idle-down`);
    }

    // Sprite do inimigo.
    const eKey = this.negotiationData.enemyKey;
    this.enemySprite = this.add
      .sprite(w * 0.75, avatarY, `${eKey}-idle-down`)
      .setScale(scale);
    if (this.anims.exists(`${eKey}-idle-down`)) {
      this.enemySprite.play(`${eKey}-idle-down`);
    }

    // Labels com os nomes dos personagens.
    this.add
      .text(w * 0.25, avatarY + labelOffset, "Você", {
        fontFamily: "monospace",
        fontSize: labelSize,
        color: "#ddd",
      })
      .setOrigin(0.5);
    this.add
      .text(w * 0.75, avatarY + labelOffset, this.negotiationData.enemyName, {
        fontFamily: "monospace",
        fontSize: labelSize,
        color: "#ddd",
      })
      .setOrigin(0.5);
  }

  /** Cria as barras de confiança do jogador e de resistência do inimigo. */
  _createBars(w, h) {
    const barW = Math.min(w * 0.35, 200);
    const barY = this._isMobile ? 55 : 100;
    const labelY = barY - 28;
    const labelSize = this._isMobile ? "11px" : "14px";

    // Barra do jogador (azul Cielo, à esquerda).
    this.add.text(w * 0.08, labelY, "Sua Confiança", {
      fontFamily: "monospace",
      fontSize: labelSize,
      color: "#aaa",
    });
    this.playerBarBg = this.add
      .rectangle(w * 0.08, barY, barW, 12, 0x444444)
      .setOrigin(0, 0.5);
    this.playerBar = this.add
      .rectangle(w * 0.08, barY, barW, 12, 0x00adef)
      .setOrigin(0, 0.5);
    this._barW = barW;

    // Barra do inimigo (verde, à direita, representa o nível de convencimento).
    this.add
      .text(w * 0.92, labelY, "Confiança do Cliente", {
        fontFamily: "monospace",
        fontSize: labelSize,
        color: "#aaa",
      })
      .setOrigin(1, 0);
    this.enemyBarBg = this.add
      .rectangle(w * 0.92, barY, barW, 12, 0x444444)
      .setOrigin(1, 0.5);
    this.enemyBar = this.add
      .rectangle(w * 0.92 - barW, barY, 0, 12, 0x44ff44)
      .setOrigin(0, 0.5);
  }

  /** Cria a caixa de diálogo na parte inferior da tela. */
  _createDialogBox(w, h) {
    const boxH = this._isMobile ? 90 : 120;
    const boxMargin = this._isMobile ? 10 : 20;
    const boxY = h - boxH - boxMargin;
    this._dialogBoxY = boxY;

    // Fundo e borda da caixa de diálogo.
    this.dialogBg = this.add.graphics();
    this.dialogBg.fillStyle(0x0d0d1a, 0.9);
    this.dialogBg.fillRoundedRect(boxMargin, boxY, w - boxMargin * 2, boxH, 10);
    this.dialogBg.lineStyle(2, 0xffffff, 0.8);
    this.dialogBg.strokeRoundedRect(
      boxMargin,
      boxY,
      w - boxMargin * 2,
      boxH,
      10,
    );

    // Texto exibido dentro da caixa.
    this.dialogText = this.add.text(boxMargin + 16, boxY + 16, "", {
      fontSize: this._isMobile ? "12px" : "16px",
      fontFamily: "monospace",
      color: "#ffffff",
      wordWrap: { width: w - boxMargin * 2 - 32 },
      lineSpacing: 4,
    });

    // Indicador de avanço de diálogo ("Pressione E ou ESPAÇO").
    const indicatorText = this._isMobile
      ? "▼ [E] ou [ESPAÇO] para continuar"
      : "▼  Pressione  [E]  ou  [ESPAÇO]  para continuar  ▼";
    this.dialogAdvanceIndicator = this.add
      .text(w / 2, h - boxMargin - 10, indicatorText, {
        fontSize: this._isMobile ? "10px" : "13px",
        fontFamily: "monospace",
        color: "#00adef",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setVisible(false);

    // Animação pulsante no indicador
    this.tweens.add({
      targets: this.dialogAdvanceIndicator,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: "Sine.easeInOut",
    });
  }

  /** Cria o container do menu de opções (inicialmente oculto). */
  _createOptionMenu(w, h) {
    this.optionContainer = this.add.container(0, 0);
    this.optionContainer.setVisible(false);

    this.menuBg = this.add.graphics();
    this.optionContainer.add(this.menuBg);

    this.optionTexts = [];

    // Cursor triangular que indica a opção selecionada.
    this.cursor = this.add.text(10, 14, "▶", {
      fontSize: this._isMobile ? "13px" : "15px",
      color: "#00adef", // Cor Cielo para o cursor ficar estiloso
    });
    this.optionContainer.add(this.cursor);
  }

  /** Renderiza as opções do menu e configura o clique em cada uma. */
  _renderMenuOptions(options) {
    // Remove textos antigos antes de criar os novos.
    if (this.optionTexts) this.optionTexts.forEach((txt) => txt.destroy());
    this.optionTexts = [];

    const menuW = this._isMobile
      ? this.scale.width - 20
      : Math.min(this.scale.width * 0.7, 480); // Escala maior para as respostas completas
    const fontSize = this._isMobile ? "13px" : "15px";

    let currentY = 16;

    options.forEach((opt, index) => {
      const name = typeof opt === "string" ? opt : opt.name;

      // Define a cor da opção
      let optColor = "#8888aa";
      if (typeof opt !== "string") {
        if (opt.disabled) optColor = "#444455";
        else if (opt.isItem)
          optColor = opt.type === "heal" ? "#88ff88" : "#ffff88";
      }

      const txt = this.add.text(32, currentY, name, {
        fontSize,
        fontFamily: "monospace",
        color: optColor,
        wordWrap: { width: menuW - 50 },
        lineSpacing: 5,
      });
      txt.targetY = currentY; // Salva o topo lógico da opção

      // Ao clicar na opção, confirma a seleção se o input estiver habilitado.
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () => {
        if (!this.canInput || !this.state.startsWith("PLAYER_TURN")) return;
        this.selectedOption = index;
        this._confirmSelection();
      });

      this.optionTexts.push(txt);
      this.optionContainer.add(txt);

      // Espaçamento dinâmico baseado no tamanho real do texto renderizado
      currentY += txt.height + 18;
    });

    const menuH = currentY + 5;

    // Redesenha o fundo do menu com altura exata de todos os elementos
    this.menuBg.clear();
    this.menuBg.fillStyle(0x1a1a2e, 0.95);
    this.menuBg.fillRoundedRect(0, 0, menuW, menuH, 10);
    this.menuBg.lineStyle(2, 0x00adef, 0.9); // Borda Cielo
    this.menuBg.strokeRoundedRect(0, 0, menuW, menuH, 10);

    // Posiciona o menu logo acima da caixa de diálogo.
    const menuX = this._isMobile ? 10 : this.scale.width - menuW - 20;
    this.optionContainer.setX(menuX);
    this.optionContainer.setY(this._dialogBoxY - menuH - 15);

    this.selectedOption = 0;
    this._updateMenuSelection(options);
  }

  // ── INPUT ──

  /** Configura as teclas do teclado para navegar e confirmar opções. */
  _setupInput() {
    this.input.keyboard.on("keydown-UP", () => {
      if (!this.canInput || !this.state.startsWith("PLAYER_TURN")) return;
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      this._updateMenuSelection(this.currentOptions);
    });

    this.input.keyboard.on("keydown-DOWN", () => {
      if (!this.canInput || !this.state.startsWith("PLAYER_TURN")) return;
      this.selectedOption = Math.min(
        this.currentOptions.length - 1,
        this.selectedOption + 1,
      );
      this._updateMenuSelection(this.currentOptions);
    });

    // Confirma com Enter, Espaço ou seta direita.
    this.input.keyboard.on("keydown-ENTER", () => this._confirmSelection());
    this.input.keyboard.on("keydown-SPACE", () => {
      // Primeiro verifica se há diálogo aguardando avanço, depois confirma seleção
      if (this._advanceCallback) {
        const cb = this._advanceCallback;
        this._advanceCallback = null;
        this.dialogAdvanceIndicator.setVisible(false);
        cb();
      } else {
        this._confirmSelection();
      }
    });
    this.input.keyboard.on("keydown-RIGHT", () => this._confirmSelection());

    // Tecla E para avançar diálogos
    this.input.keyboard.on("keydown-E", () => {
      if (this._advanceCallback) {
        const cb = this._advanceCallback;
        this._advanceCallback = null;
        this.dialogAdvanceIndicator.setVisible(false);
        cb();
      }
    });

    // Cancela com ESC ou seta esquerda.
    this.input.keyboard.on("keydown-ESC", () => this._cancelSelection());
    this.input.keyboard.on("keydown-LEFT", () => this._cancelSelection());
  }

  /** Atualiza o visual do menu destacando a opção atualmente selecionada. */
  _updateMenuSelection(options) {
    if (!options || !this.optionTexts) return;

    this.optionTexts.forEach((txt, i) => {
      const opt = options[i];
      let optColor = "#8888aa";

      if (typeof opt !== "string") {
        if (opt.isVoltar) optColor = "#ff5555";
        else if (opt.disabled) optColor = "#444455";
        else if (opt.isItem)
          optColor = opt.type === "heal" ? "#88ff88" : "#ffff88";
        // Argumento já usado fica acinzentado.
        if (opt.id && this.usedArguments.has(opt.id)) optColor = "#444455";
      }

      if (i === this.selectedOption) {
        txt.setColor("#ffffff");
        txt.setFontStyle("bold");

        // Centraliza verticalmente o cursor para apontar no meio do bloco de texto
        this.cursor.setY(txt.targetY + txt.height / 2 - 8);
      } else {
        txt.setColor(optColor);
        txt.setFontStyle("normal");
      }
    });
  }

  // ── LÓGICA DE TURNOS ──

  /** Processa a confirmação da opção selecionada pelo jogador. */
  _confirmSelection() {
    if (!this.canInput || !this.state.startsWith("PLAYER_TURN")) return;

    if (this.state === "PLAYER_TURN_MAIN") {
      const optChoice = this.currentOptions[this.selectedOption];

      if (optChoice === "Argumentos") {
        // Submenu de Argumentos: bloqueia por Nível e por Produtos Cielo faltando.
        this.currentOptions = this.negotiationData.playerArguments.map(
          (arg) => {
            const currentLevel = this.registry.get("playerLevel") || 5;
            const isLevelLocked =
              arg.requiredLevel && arg.requiredLevel > currentLevel;

            const ownedProducts = this.registry.get("cieloProducts") || [];
            // O produto não está bloqueado se o jogador já tiver OU se acabou de aprender no SOS desta negociação.
            const isProductLocked =
              arg.requiredProduct &&
              !ownedProducts.includes(arg.requiredProduct) &&
              this.taughtProduct !== arg.requiredProduct;

            let lockedName = arg.name;
            if (isLevelLocked)
              lockedName = `[Nível ${arg.requiredLevel} Necessário]`;
            else if (isProductLocked) {
              const dict = {
                cielo_lio: "Cielo Lio",
                cielo_tap: "Cielo Tap",
                cielo_farol: "Cielo Farol",
                cielo_zip: "Cielo ZIP",
                cielo_ante: "Antecipação",
                cielo_qr: "QR Code Pay",
                cielo_link: "Link de Pagamento",
                cielo_ecomm: "API E-Commerce",
                cielo_promo: "Cielo Promo",
                cielo_gestao: "Cielo Gestão",
                cielo_conver: "Conversor",
              };
              lockedName = `[Requer ${dict[arg.requiredProduct] || arg.requiredProduct}]`;
            }

            return {
              ...arg,
              isItem: false,
              name: lockedName,
              disabled: isLevelLocked || isProductLocked,
            };
          },
        );
      } else if (optChoice === "Itens") {
        // Submenu de Itens: lê o inventário atual do registro.
        const globalItems = this.registry.get("playerInventory") || [];
        this.currentOptions = globalItems.map((item, idx) => ({
          ...item,
          isItem: true,
          invIndex: idx,
        }));
        if (this.currentOptions.length === 0) {
          this.currentOptions = [{ name: "Inventário Vazio", disabled: true }];
        }
      } else if (optChoice === "S.O.S Cielo") {
        this._triggerHelp();
        return;
      } else if (optChoice === "Cancelar Negociação") {
        // Cancelar a negociação.
        this._cancelNegotiation();
        return;
      }

      // Adiciona botão de voltar ao submenu.
      this.currentOptions.push({
        id: "back_btn",
        name: "⬅ Voltar",
        isVoltar: true,
      });
      this.state = "PLAYER_TURN_SUB";
      this._renderMenuOptions(this.currentOptions);
      this._setDialog("Selecione qual utilizar (<- voltar):");
    } else if (this.state === "PLAYER_TURN_SUB") {
      const opt = this.currentOptions[this.selectedOption];
      if (opt.disabled) return;
      this._executePlayerAttack(opt);
    } else if (this.state === "PLAYER_TURN_RHETORIC") {
      const opt = this.currentOptions[this.selectedOption];
      this.canInput = false;
      this.optionContainer.setVisible(false);

      // Se não há texto customizado, dá um feedback padrão
      const fallbackMsg =
        opt.type === "invalid"
          ? "Você hesitou na resposta..."
          : "Você respondeu com propriedade!";
      this._setDialog(opt.textPlayer || fallbackMsg);
      this._waitForAdvance(() => {
        this._finalizePlayerAttack(this.activeArg, opt.type);
      });
    } else if (this.state === "PLAYER_TURN_HELP") {
      const opt = this.currentOptions[this.selectedOption];
      this.canInput = false;
      this.optionContainer.setVisible(false);

      if (opt.isCorrect) {
        let msg =
          "Central Cielo:\n'Exatamente! Lembre-se do seu treinamento. Você consegue!'\n(+30% Confiança Global Restaurada)";

        // Se foi uma ajuda de produto, libera o produto para esta negociação.
        if (this.activeHelpProduct) {
          this.taughtProduct = this.activeHelpProduct;
          const pName = cieloCatalog[this.taughtProduct]?.name || "produto";
          msg = `Central Cielo:\n'Perfeitamente! Agora você sabe como oferecer ${pName}. Vá lá e venda!'`;
        }

        this._setDialog(msg);
        const curConf = this.registry.get("playerConfidence") ?? 0;
        this.registry.set("playerConfidence", Math.min(100, curConf + 30));
        this.playerSprite.setTint(0x00adef);
        this.time.delayedCall(500, () => this.playerSprite.clearTint());

        this._waitForAdvance(() => {
          this._startPlayerTurn(); // Devolve o turno pro jogador
        });
      } else {
        this._setDialog(
          "Central Cielo:\n'Não foi isso que te ensinamos... Respire e concentre-se.'",
        );
        this._waitForAdvance(() => {
          this._startEnemyTurn(); // Perde o turno se errar
        });
      }
    }
  }

  /** Volta para o menu principal ao pressionar ESC ou seta esquerda. */
  _cancelSelection() {
    if (!this.canInput || this.state !== "PLAYER_TURN_SUB") return;
    this._startPlayerTurn();
  }

  /** Encerra a negociação quando o jogador escolhe cancelar a negociação. */
  _cancelNegotiation() {
    this.state = "END";
    this.canInput = false;
    this.optionContainer.setVisible(false);
    this._setDialog("Você cancelou a negociação e deu as costas ao cliente.");
    this.time.delayedCall(2000, () => this._endNegotiation());
  }

  /** Atualiza o texto da caixa de diálogo. */
  _setDialog(text) {
    this.dialogText.setText(text);
  }

  /**
   * Exibe o indicador de avanço e aguarda o jogador pressionar E ou Espaço.
   * Suporta toque na caixa de diálogo em mobile.
   * @param {function} callback - Função chamada quando o jogador avança.
   */
  _waitForAdvance(callback) {
    this._advanceCallback = callback;
    if (this.dialogAdvanceIndicator) {
      this.dialogAdvanceIndicator.setVisible(true);
    }
    // Suporte a clique/toque na caixa de diálogo para avançar
    if (!this._dialogTapSetup) {
      this._dialogTapSetup = true;
      this.input.on("pointerdown", (pointer) => {
        if (!this._advanceCallback) return;
        // Verifica se o toque foi na área da caixa de diálogo
        const boxMargin = this._isMobile ? 10 : 20;
        const boxH = this._isMobile ? 90 : 120;
        const boxY = this.scale.height - boxH - boxMargin;
        if (pointer.y >= boxY) {
          const cb = this._advanceCallback;
          this._advanceCallback = null;
          if (this.dialogAdvanceIndicator)
            this.dialogAdvanceIndicator.setVisible(false);
          cb();
        }
      });
    }
  }

  /** Redimensiona as barras de vida/confiança conforme os valores atuais. */
  _updateBars() {
    const barW = this._barW;
    const pRatio = Math.min(
      1,
      Math.max(0, this.playerConf) / this.negotiationData.playerMaxConfidence,
    );
    this.playerBar.width = barW * pRatio;

    // O Cliente começa resistindo. Quando resistência cai, a barra de confiança dele enche.
    const eTrust = Math.max(
      0,
      this.negotiationData.enemyMaxResistance - this.enemyRes,
    );
    const eRatio = Math.min(
      1,
      eTrust / this.negotiationData.enemyMaxResistance,
    );
    this.enemyBar.width = barW * eRatio;
  }

  /** Inicia o turno do jogador exibindo o menu principal de ações. */
  _startPlayerTurn() {
    this.state = "PLAYER_TURN_MAIN";
    this.currentOptions = ["Argumentos", "Itens"];

    // Verifica se há produto faltando para os argumentos desta negociação
    const ownedProducts = this.registry.get("cieloProducts") || [];
    const hasMissingProduct = this.negotiationData.playerArguments.some(
      (arg) =>
        arg.requiredProduct &&
        !ownedProducts.includes(arg.requiredProduct) &&
        this.taughtProduct !== arg.requiredProduct,
    );

    // Mostra SOS se a confiança estiver baixa OU se precisar aprender sobre um produto faltante
    const globalConf = this.registry.get("playerConfidence") ?? 50;
    if ((globalConf <= 39 || hasMissingProduct) && !this.helpUsed) {
      this.currentOptions.push("S.O.S Cielo");
    }

    this.currentOptions.push("Cancelar Negociação");

    this._setDialog("O que você vai fazer?");
    this.optionContainer.setVisible(true);
    this._renderMenuOptions(this.currentOptions);
    // Pequeno delay para evitar input acidental ao trocar de turno.
    this.time.delayedCall(200, () => {
      this.canInput = true;
    });
  }

  /** Aciona a ajuda S.O.S da central da Cielo */
  _triggerHelp() {
    if (this.helpUsed) return;
    this.helpUsed = true;
    this.canInput = false;
    this.optionContainer.setVisible(false);

    const ownedProducts = this.registry.get("cieloProducts") || [];
    const missingProducts = this.negotiationData.playerArguments
      .filter(
        (arg) =>
          arg.requiredProduct &&
          !ownedProducts.includes(arg.requiredProduct) &&
          this.taughtProduct !== arg.requiredProduct,
      )
      .map((arg) => arg.requiredProduct);

    // Banco de questões por produto
    const productQuestions = {
      cielo_lio: {
        q: "Central: 'Qual o maior benefício da Cielo Lio para o lojista?'",
        options: [
          {
            textOption: "Gestão de estoque e apps fiscais integrados.",
            isCorrect: true,
          },
          { textOption: "Ela é a mais leve do mercado.", isCorrect: false },
          { textOption: "Funciona sem bateria.", isCorrect: false },
        ],
      },
      cielo_tap: {
        q: "Central: 'Como funciona o Cielo Tap na prática?'",
        options: [
          {
            textOption: "Transforma o smartphone em maquininha via NFC.",
            isCorrect: true,
          },
          { textOption: "É uma pulseira de pagamento.", isCorrect: false },
          {
            textOption: "É um cabo para ligar no computador.",
            isCorrect: false,
          },
        ],
      },
      cielo_farol: {
        q: "Central: 'O que o Cielo Farol entrega de inteligência?'",
        options: [
          {
            textOption: "Comparação de vendas com negócios similares.",
            isCorrect: true,
          },
          {
            textOption: "Previsão do tempo para vendas externas.",
            isCorrect: false,
          },
          { textOption: "Um GPS para encontrar clientes.", isCorrect: false },
        ],
      },
      cielo_zip: {
        q: "Central: 'Quem é o público idealizado para a Cielo ZIP?'",
        options: [
          {
            textOption:
              "Microempreendedores que buscam mobilidade e agilidade.",
            isCorrect: true,
          },
          { textOption: "Grandes redes de supermercado.", isCorrect: false },
          { textOption: "Bancos internacionais.", isCorrect: false },
        ],
      },
      cielo_ante: {
        q: "Central: 'O que é a Antecipação de Recebíveis?'",
        options: [
          {
            textOption: "Receber hoje o valor de vendas a prazo/parceladas.",
            isCorrect: true,
          },
          {
            textOption: "Pagar as contas do mês antes do vencimento.",
            isCorrect: false,
          },
          {
            textOption: "Ganhar um desconto na compra de bobinas.",
            isCorrect: false,
          },
        ],
      },
      cielo_link: {
        q: "Central: 'Como o Link de Pagamento ajuda no WhatsApp?'",
        options: [
          {
            textOption: "Permite cobrar à distância com total segurança.",
            isCorrect: true,
          },
          {
            textOption: "Serve para enviar fotos dos produtos.",
            isCorrect: false,
          },
          { textOption: "É um link para o site da Cielo.", isCorrect: false },
        ],
      },
      cielo_gestao: {
        q: "Central: 'Para que serve a plataforma Cielo Gestão?'",
        options: [
          {
            textOption: "Acompanhar vendas e fluxo de caixa em tempo real.",
            isCorrect: true,
          },
          { textOption: "Pedir manutenção da maquininha.", isCorrect: false },
          { textOption: "Assistir vídeos de treinamento.", isCorrect: false },
        ],
      },
    };

    let hq;
    this.activeHelpProduct = null;

    if (missingProducts.length > 0) {
      // Prioriza ensinar um dos produtos que o jogador precisa nesta negociação
      const targetId = missingProducts[0];
      hq = productQuestions[targetId] || {
        q: `Central: 'Você precisa saber sobre ${targetId}. Qual a função principal?'`,
        options: [
          {
            textOption: "Facilitar a vida do lojista com tecnologia.",
            isCorrect: true,
          },
          {
            textOption: "Substituir o uso de dinheiro em espécie.",
            isCorrect: true,
          },
          { textOption: "Aumentar as taxas cobradas.", isCorrect: false },
        ],
      };
      this.activeHelpProduct = targetId;
    } else {
      // Pergunta genérica se for apenas por confiança baixa
      const genericQuestions = [
        {
          q: "Central: 'Qual é o nosso principal diferencial frente à concorrência?'",
          options: [
            {
              textOption: "Ecossistema completo de gestão e pagamentos.",
              isCorrect: true,
            },
            { textOption: "A maquininha é mais bonita.", isCorrect: false },
            {
              textOption: "Nós damos taxa zero pra todo mundo.",
              isCorrect: false,
            },
          ],
        },
        {
          q: "Central: 'O cliente não quer pagar aluguel. O que nós oferecemos?'",
          options: [
            {
              textOption: "Despedida, pois só trabalhamos com aluguel.",
              isCorrect: false,
            },
            {
              textOption:
                "Cielo ZIP e políticas de isenção de aluguel por faturamento.",
              isCorrect: true,
            },
            {
              textOption: "Dar o equipamento de graça e perder dinheiro.",
              isCorrect: false,
            },
          ],
        },
      ];
      hq =
        genericQuestions[Phaser.Math.Between(0, genericQuestions.length - 1)];
    }

    this._setDialog(`Ligando para a Central Cielo...\n...`);
    this.time.delayedCall(2000, () => {
      this._setDialog(hq.q);
      this.time.delayedCall(2500, () => {
        this.state = "PLAYER_TURN_HELP";
        this.activeHelpData = hq;
        this.currentOptions = hq.options.map((o) => ({
          name: o.textOption,
          isCorrect: o.isCorrect,
        }));
        this._renderMenuOptions(this.currentOptions);
        this.optionContainer.setVisible(true);
        this.canInput = true;
      });
    });
  }

  /** Executa o ataque/ação e avalia possíveis retóricas do cliente. */
  _executePlayerAttack(arg) {
    if (arg.isVoltar) {
      this._cancelSelection();
      return;
    }

    this.canInput = false;
    this.state = "PLAYER_ATTACK";
    this.optionContainer.setVisible(false);
    this.activeArg = arg;

    const isRepeated = this.usedArguments.has(arg.id);

    if (!arg.isItem && !isRepeated) {
      if (arg.type === "invalid") {
        // Falha instantânea na argumentação
        this._setDialog(
          arg.text ||
            `O cliente não se importou... seu argumento foi inválido.`,
        );
        this._waitForAdvance(() => this._finalizePlayerAttack(arg, "invalid"));
        return;
      }
      if (arg.rhetoric && arg.rhetoric.responses) {
        // Inicia o processo de retórica do cliente (perguntas)
        this._setDialog(arg.text || `Você usou ${arg.name}...`);
        this._waitForAdvance(() => {
          this._setDialog(`O cliente questiona: "${arg.rhetoric.question}"`);
          this._waitForAdvance(() => {
            this._showRhetoricOptions(arg, arg.rhetoric.responses);
          });
        });
        return;
      }
    }

    this._finalizePlayerAttack(arg, arg.type || "normal");
  }

  /** Exibe o menu de escolhas de retórica sem botão de voltar. */
  _showRhetoricOptions(arg, responses) {
    this.state = "PLAYER_TURN_RHETORIC";
    this.currentOptions = responses.map((r) => ({
      name: r.textOption,
      type: r.type || "normal",
      textPlayer: r.textPlayer,
    }));
    // Voltar não é permitido (isVoltar = false), obriga resposta
    this._renderMenuOptions(this.currentOptions);
    this.optionContainer.setVisible(true);
    this.time.delayedCall(200, () => {
      this.canInput = true;
    });
  }

  /** Finaliza o ataque do jogador (dano, super efetivo, erro ou item) */
  _finalizePlayerAttack(arg, resolutionType = "normal") {
    const isRepeated = this.usedArguments.has(arg.id);

    if (resolutionType === "invalid" && !isRepeated) {
      this._setDialog(
        `Seu argumento falhou criticamente! O cliente perdeu a paciência.`,
      );
      this.usedArguments.add(arg.id);

      this.playerConf -= 20;
      this._updateBars();

      this.time.delayedCall(500, () =>
        this._showFloatingText(
          this.playerSprite,
          `- 20 Sua Confiança`,
          "#ff4444",
        ),
      );

      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0,
        yoyo: true,
        repeat: 2,
        duration: 150,
      });
      this.time.delayedCall(1500, () => {
        if (this.playerConf <= 0) this._lose();
        else this._startEnemyTurn();
      });
      return;
    }

    if (isRepeated) {
      if (arg.isItem) {
        this._setDialog(
          `Você tentou usar "${arg.name}" de novo, mas acabou! O cliente está confuso.`,
        );
      } else {
        this._setDialog(
          `Você já tentou o argumento "${arg.name}"! O cliente percebeu sua falta de repertório e perdeu a confiança em você.`,
        );
      }
    } else {
      if (arg.isItem && arg.type === "heal") {
        arg.computedPower = arg.power;
        this.time.delayedCall(500, () =>
          this._showFloatingText(
            this.playerSprite,
            `+ ${arg.power} Recuperação`,
            "#00ff00",
          ),
        );
      } else {
        const globalConf = this.registry.get("playerConfidence");
        const confValue = globalConf !== undefined ? globalConf : 50;

        let confMult = 1.0;
        if (confValue < 30) confMult = 0.25 + (confValue / 30) * 0.25;
        else if (confValue > 70) confMult = 1.2 + ((confValue - 70) / 30) * 0.8;
        else confMult = 0.5 + ((confValue - 30) / 40) * 0.7;

        if (resolutionType === "super") {
          confMult *= 1.8; // Super efetivo boost
          this.time.delayedCall(200, () =>
            this._showFloatingText(
              this.enemySprite,
              "SUPER EFETIVO!",
              "#ffff00",
            ),
          );
        } else if (resolutionType === "weak") {
          confMult *= 0.5;
          this.time.delayedCall(200, () =>
            this._showFloatingText(
              this.enemySprite,
              "POUCO EFETIVO...",
              "#ffaa00",
            ),
          );
        }

        const rng = Phaser.Math.FloatBetween(0.85, 1.15);
        const finalDamage = Math.round(arg.power * confMult * rng);

        arg.computedPower = finalDamage;
        this.time.delayedCall(800, () =>
          this._showFloatingText(
            this.enemySprite,
            `+ ${finalDamage} Confiança do Cliente`,
            "#44ff44",
          ),
        );
      }

      if (!arg.rhetoric || isRepeated) {
        this._setDialog(arg.text || `Você usou ${arg.name}!`);
      }
      this.usedArguments.add(arg.id);

      if (arg.isItem && arg.invIndex !== undefined) {
        const globalItems = this.registry.get("playerInventory") || [];
        globalItems.splice(arg.invIndex, 1);
        this.registry.set("playerInventory", globalItems);
      }
    }

    // Animação de avanço do sprite do jogador.
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 20,
      yoyo: true,
      duration: 150,
    });

    this._waitForAdvance(() => {
      if (isRepeated) {
        this.playerConf -= 25;
        this._updateBars();
        this.tweens.add({
          targets: this.playerSprite,
          alpha: 0,
          yoyo: true,
          repeat: 2,
          duration: 150,
        });
        this.time.delayedCall(800, () => {
          if (this.playerConf <= 0) this._lose();
          else this._startEnemyTurn();
        });
      } else {
        if (arg.isItem && arg.type === "heal") {
          this.playerConf = Math.min(
            this.negotiationData.playerMaxConfidence,
            this.playerConf + (arg.computedPower || arg.power),
          );
          this._updateBars();
          this.playerSprite.setTint(0x00adef);
          this.time.delayedCall(500, () => this.playerSprite.clearTint());
          this.time.delayedCall(800, () => this._startEnemyTurn());
        } else {
          this.enemyRes -= arg.computedPower || arg.power;
          this._updateBars();
          this.tweens.add({
            targets: this.enemySprite,
            alpha: 0,
            yoyo: true,
            repeat: 2,
            duration: 150,
          });
          this.time.delayedCall(800, () => {
            if (this.enemyRes <= 0) this._win();
            else this._startEnemyTurn();
          });
        }
      }
    });
  }

  /** Executa o turno do inimigo escolhendo um counter aleatório. */
  _startEnemyTurn() {
    this.state = "ENEMY_TURN";

    // Escolhe um counter aleatório da lista do inimigo.
    const counters = this.negotiationData.enemyCounters;
    const counter = counters[Math.floor(Math.random() * counters.length)];

    const globalConf = this.registry.get("playerConfidence");
    const confValue = globalConf !== undefined ? globalConf : 50;

    // Quanto menor a confiança global do jogador, mais destruidoras são as dúvidas do cliente.
    let confMult = 1.0;
    if (confValue < 30) {
      // Cliente tem dúvidas que afetam o jogador duramente (2.5x a 1.5x)
      confMult = 2.5 - (confValue / 30) * 1.0;
    } else if (confValue > 70) {
      // Cliente quase não afeta a confiança de um jogador muito seguro (0.5x a 0.25x)
      confMult = 0.5 - ((confValue - 70) / 30) * 0.25;
    } else {
      // Progessão gradual de 1.5x a 0.5x
      confMult = 1.5 - ((confValue - 30) / 40) * 1.0;
    }

    const rng = Phaser.Math.FloatBetween(0.85, 1.15);
    const finalDamage = Math.round(counter.power * confMult * rng);

    this._setDialog(counter.text);
    this.time.delayedCall(800, () =>
      this._showFloatingText(
        this.playerSprite,
        `- ${finalDamage} Sua Confiança`,
        "#ff4444",
      ),
    );

    // Animação de avanço do inimigo.
    this.tweens.add({
      targets: this.enemySprite,
      x: this.enemySprite.x - 20,
      yoyo: true,
      duration: 150,
    });

    // Aguarda o jogador pressionar E/Espaço para continuar.
    this._waitForAdvance(() => {
      this.playerConf -= finalDamage;
      this._updateBars();
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0,
        yoyo: true,
        repeat: 2,
        duration: 150,
      });
      this.time.delayedCall(1000, () => {
        if (this.playerConf <= 0) this._lose();
        else this._startPlayerTurn();
      });
    });
  }

  /** Processa a vitória: concede XP, confiança, verifica level up e sorteia item. */
  _win() {
    this.state = "END";
    this._won = true;

    // Registra a negociação como vencida no ProgressManager.
    if (this.worldId && this.negotiationId) {
      ProgressManager.markNegotiationComplete(this.worldId, this.negotiationId);
    }

    // Calcula a Taxa de Satisfação do Cliente e salva na Cielodex
    const remainingRatio =
      Math.max(0, this.playerConf) / this.negotiationData.playerMaxConfidence;
    const satisfactionRate = Math.round(50 + remainingRatio * 50);
    if (!this.registry.has("conqueredCustomers"))
      this.registry.set("conqueredCustomers", []);
    const conquered = this.registry.get("conqueredCustomers");
    const existingIndex = conquered.findIndex(
      (c) => c.id === this.negotiationData.id,
    );
    if (existingIndex >= 0) {
      conquered[existingIndex].satisfactionRate = Math.max(
        conquered[existingIndex].satisfactionRate,
        satisfactionRate,
      );
    } else {
      conquered.push({
        id: this.negotiationData.id,
        name: this.negotiationData.enemyName,
        satisfactionRate: satisfactionRate,
      });
    }
    this.registry.set("conqueredCustomers", conquered);

    // Reconhecimento permanente de produto aprendido via S.O.S
    this.learnedSomething = false;
    if (this.taughtProduct) {
      const owned = this.registry.get("cieloProducts") || [];
      if (!owned.includes(this.taughtProduct)) {
        this.registry.set("cieloProducts", [...owned, this.taughtProduct]);
        this.learnedSomething = true;
      }
    }

    // Ganha entre 70 e 120 XP.
    const gainedXP = Phaser.Math.Between(70, 120);
    const currentLevel = this.registry.get("playerLevel") || 5;
    const currentXP = this.registry.get("playerXP") || 0;

    // Ganha confiança global baseada no seu desempenho na negociação.
    // É muito mais difícil ganhar confiança global agora, exigindo um bom desempenho
    const gainedConf = Math.round(2 + remainingRatio * 6); // Ganha de apenas 2% a 8%

    const baselineConf = this.registry.get("playerConfidence") ?? 50;
    this.registry.set(
      "playerConfidence",
      Math.min(100, baselineConf + gainedConf),
    );

    const newXP = currentXP + gainedXP;

    // Verifica se passou de um múltiplo de 500 XP (sobe 2 níveis).
    const oldThreshold = Math.floor(currentXP / 500);
    const newThreshold = Math.floor(newXP / 500);
    let leveledUp = false;
    let finalLevel = currentLevel;
    let rewardsNames = [];

    if (newThreshold > oldThreshold && currentLevel < 9) {
      finalLevel = Math.min(9, currentLevel + 2);
      leveledUp = true;
      this.registry.set("playerLevel", finalLevel);

      // Recompensa de Nível: Ganha 3 itens da Cielo que o jogador ainda não tenha
      const owned = this.registry.get("cieloProducts") || [];
      const allKeys = Object.keys(cieloCatalog);
      const available = allKeys.filter((k) => !owned.includes(k));
      const shuffled = available.sort(() => 0.5 - Math.random());
      const rewards = shuffled.slice(0, 3);

      if (rewards.length > 0) {
        this.registry.set("cieloProducts", [...owned, ...rewards]);
        rewardsNames = rewards.map((k) => cieloCatalog[k].name);
      }
    }
    this.registry.set("playerXP", newXP);

    // Pool de itens que podem ser sorteados como recompensa.
    const itemPool = [
      {
        id: "cafe_expresso",
        name: "Café Expresso",
        text: "Você tomou um Café Expresso e focou na venda! Confiança restaurada.",
        type: "heal",
        power: 35,
      },
      {
        id: "agua_coco",
        name: "Água de Coco",
        text: "Uma água de coco gelada para hidratar! Confiança revitalizada.",
        type: "heal",
        power: 45,
      },
      {
        id: "relatorio_vendas",
        name: "Relatório Cielo Farol",
        text: "Mostrou um relatório provando o aumento de vendas da concorrência!",
        type: "attack",
        power: 50,
      },
      {
        id: "energetico",
        name: "Energético",
        text: "Você virou um energético! Confiança recuperada.",
        type: "heal",
        power: 30,
      },
      {
        id: "tablet_demo",
        name: "Tablet Demo",
        text: "Fez uma demonstração ao vivo da maquininha funcionando na hora!",
        type: "attack",
        power: 40,
      },
    ];

    // Sorteia um item aleatório e adiciona ao inventário.
    const wonItem = itemPool[Math.floor(Math.random() * itemPool.length)];
    const inv = this.registry.get("playerInventory") || [];
    inv.push(wonItem);
    this.registry.set("playerInventory", inv);

    let winMsg = `Incrível! O ${this.negotiationData.enemyName} fechou negócio!\n+ ${gainedXP} XP | +${gainedConf}% de Confiança global\n+ Item Ganho: ${wonItem.name}`;

    if (this.learnedSomething) {
      const pName = cieloCatalog[this.taughtProduct]?.name || "produto";
      winMsg += `\n✨ Você dominou o conhecimento de: ${pName}! (Salvo na Cielo Dex)`;
    }

    if (leveledUp) {
      let lvlMsg = `Incrível! O ${this.negotiationData.enemyName} fechou negócio!\nVocê subiu para o Nível ${finalLevel}!\n\n(+${gainedConf}% de Confiança global)\n+ Item Ganho: ${wonItem.name}`;
      if (rewardsNames.length > 0) {
        lvlMsg += `\n📦 Bônus de Nível (Dex): ${rewardsNames.join(", ")}`;
      }
      this._setDialog(lvlMsg);
      this._showLevelUpEffect(finalLevel);
    } else {
      this._setDialog(winMsg);
    }

    this.time.delayedCall(4500, () => this._endNegotiation());
  }

  /** Exibe um texto flutuante animado sobre um sprite (dano ou cura). */
  _showFloatingText(targetSprite, text, color) {
    const isEnemy = targetSprite === this.enemySprite;
    const offset = isEnemy ? -30 : 30;

    const floatText = this.add
      .text(targetSprite.x + offset, targetSprite.y, text, {
        fontFamily: "Arial",
        fontSize: this._isMobile ? "16px" : "22px",
        fontWeight: "900",
        color,
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(200);

    // Sobe e desaparece gradualmente.
    this.tweens.add({
      targets: floatText,
      y: floatText.y - 80,
      alpha: { from: 1, to: 0 },
      duration: 2500,
      ease: "Power2",
      onComplete: () => floatText.destroy(),
    });
  }

  /** Exibe o efeito visual de level up no centro da tela. */
  _showLevelUpEffect(level) {
    const { width: w, height: h } = this.scale;

    const levelUpText = this.add
      .text(w / 2, h / 2 - 40, "SUBIU DE NÍVEL!", {
        fontFamily: "Arial",
        fontSize: this._isMobile ? "40px" : "60px",
        fontWeight: "bold",
        color: "#ffd700",
        stroke: "#ff8c00",
        strokeThickness: 8,
        shadow: { blur: 15, color: "#ffaa00", fill: true },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.5);

    const levelDesc = this.add
      .text(w / 2, h / 2 + 20, `Nível ${level} Alcançado`, {
        fontFamily: "monospace",
        fontSize: this._isMobile ? "18px" : "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Animação de entrada e saída do texto de level up.
    this.tweens.add({
      targets: [levelUpText, levelDesc],
      alpha: 1,
      scale: 1,
      y: "-=20",
      duration: 800,
      ease: "Back.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: [levelUpText, levelDesc],
          alpha: 0,
          y: "-=20",
          delay: 2000,
          duration: 500,
        });
      },
    });
  }

  /** Processa a derrota: reduz a confiança global e encerra a negociação. */
  _lose() {
    this.state = "END";

    // Perda de confiança global bate forte caso não convença o cliente nem um pouco
    const eTrustRatio =
      Math.max(0, this.negotiationData.enemyMaxResistance - this.enemyRes) /
      this.negotiationData.enemyMaxResistance;
    const lostConf = Math.round(35 - eTrustRatio * 20); // Perde de 15% a 35% de uma vez

    const baselineConf = this.registry.get("playerConfidence") ?? 50;
    this.registry.set("playerConfidence", Math.max(0, baselineConf - lostConf));

    this._setDialog(
      `Faltou confiança... O ${this.negotiationData.enemyName} não fechou negócio.\n(-${lostConf}% de Confiança global)`,
    );
    this.time.delayedCall(4000, () => this._endNegotiation());
  }

  /** Reexibe o HUD, retoma a cena anterior e encerra a negociação. */
  _endNegotiation() {
    // Verifica se o mundo foi concluído (2 negociações concluídas).
    if (this._won && this.worldId) {
      const justCompleted = ProgressManager.checkWorldCompletion(this.worldId);
      if (justCompleted) {
        this._showMissionComplete();
        return;
      }
    }

    // Retorno normal: volta ao mapa.
    if (this.scene.isSleeping("MobileHudScene"))
      this.scene.wake("MobileHudScene");
    if (this.scene.isSleeping("PlayerHudScene"))
      this.scene.wake("PlayerHudScene");

    this.scene.resume(this.returnScene);
    this.scene.stop();
  }

  /** Exibe a tela de missão concluída e volta ao seletor de mundos. */
  _showMissionComplete() {
    const { width: w, height: h } = this.scale;

    // Overlay verde
    const overlay = this.add
      .rectangle(0, 0, w, h, 0x00aa44, 0)
      .setOrigin(0)
      .setDepth(500000);

    const title = this.add
      .text(w / 2, h / 2 - 40, "✅ MISSÃO CONCLUÍDA!", {
        fontSize: this._isMobile ? "28px" : "48px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#006600",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(500001)
      .setAlpha(0)
      .setScale(0.5);

    const subtitle = this.add
      .text(w / 2, h / 2 + 20, "Novo destino desbloqueado!", {
        fontSize: this._isMobile ? "14px" : "20px",
        fontFamily: "Arial",
        color: "#ccffcc",
      })
      .setOrigin(0.5)
      .setDepth(500001)
      .setAlpha(0);

    // Animação de entrada
    this.tweens.add({
      targets: overlay,
      alpha: 0.85,
      duration: 500,
    });

    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      scale: 1,
      duration: 800,
      ease: "Back.easeOut",
      delay: 300,
    });

    // Após alguns segundos, volta ao seletor de mundos
    this.time.delayedCall(3500, () => {
      // Para TUDO e vai ao seletor
      const scenesToStop = [
        this.returnScene,
        "PlayerHudScene",
        "MobileHudScene",
      ];
      scenesToStop.forEach((key) => {
        try {
          if (
            this.scene.isActive(key) ||
            this.scene.isPaused(key) ||
            this.scene.isSleeping(key)
          ) {
            this.scene.stop(key);
          }
        } catch (e) {}
      });

      this.scene.start("WorldMapScene", { character: this.playerKey });
    });
  }
}
