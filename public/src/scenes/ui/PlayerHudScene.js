/**
 * @fileoverview Head-Up Display (HUD) do jogador.
 * Exibe avatar, barra de XP e barra de confiança sobre a cena principal, persistindo pelas outras cenas.
 * Esta cena entra em espera durante diálogos e negociações.
 * @module scenes/PlayerHudScene
 */

import Phaser from "phaser";

export class PlayerHudScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayerHudScene", active: false });
  }

  /**
   * Inicializa os dados do jogador recebidos da cena anterior.
   * @param {object} data - Dados passados pelo Scene.launch().
   */
  init(data) {
    // Define a personagem escolhida (padrão: "amanda").
    this.characterKey = data.character || "amanda";

    // Define nível e XP caso ainda não existam no registro global.
    if (
      this.registry.get("playerLevel") == null ||
      this.registry.get("playerXP") == null
    ) {
      this.registry.set("playerLevel", 5);
      this.registry.set("playerXP", 0);
    }

    // Define confiança caso ainda não exista no registro global.
    if (this.registry.get("playerConfidence") == null) {
      this.registry.set("playerConfidence", 50);
    }

    // Define inventário caso ainda não exista no registro global.
    if (this.registry.get("playerInventory") == null) {
      this.registry.set("playerInventory", []);
    }

    if (this.registry.get("cieloProducts") == null) {
      this.registry.set("cieloProducts", ["cielo_lio"]); // Dá a Lio inicial para que o player possa prosseguir
    }

    if (this.registry.get("conqueredCustomers") == null) {
      this.registry.set("conqueredCustomers", []);
    }

    // Lê os valores do registro global para variáveis locais.
    this.playerLevel = this.registry.get("playerLevel");
    this.playerXP = this.registry.get("playerXP");
    this.playerConfidence = this.registry.get("playerConfidence");
    this.playerInventory = this.registry.get("playerInventory");
  }

  create() {
    const { width, height } = this.scale;

    // Verifica se o dispositivo é mobile para ajustar tamanhos.
    const isMobile = !this.sys.game.device.os.desktop;

    const paddingX = isMobile ? 15 : 30;
    const paddingY = isMobile ? 15 : 30;

    // Container principal do HUD (canto superior esquerdo).
    this.hudContainer = this.add.container(paddingX, paddingY);

    const bgWidth = isMobile ? 180 : 240;
    const bgHeight = isMobile ? 65 : 85;

    // Fundo semi-transparente com borda azul.
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.85);
    bg.fillRoundedRect(0, 0, bgWidth, bgHeight, 16);
    bg.lineStyle(2, 0x00adef, 0.9);
    bg.strokeRoundedRect(0, 0, bgWidth, bgHeight, 16);

    // Posição do avatar dentro do container (responsivo para mobile).
    const avatarRadius = isMobile ? 24 : 32;
    const avatarX = avatarRadius + 10;
    const avatarY = bgHeight / 2;

    // Círculo de fundo do avatar.
    const avatarBg = this.add
      .circle(avatarX, avatarY, avatarRadius, 0x1a1a3a)
      .setStrokeStyle(2, 0x00adef);

    // Sprite animado do personagem no avatar.
    const spriteScale = isMobile ? 1.5 : 2;
    this.avatarSprite = this.add
      .sprite(
        avatarX,
        avatarY - (isMobile ? 2 : 5),
        `${this.characterKey}-idle-down`,
      )
      .setScale(spriteScale);

    // Toca a animação idle se ela existir.
    if (this.anims.exists(`${this.characterKey}-idle-down`)) {
      this.avatarSprite.play(`${this.characterKey}-idle-down`);
    }

    // Máscara circular para recortar o sprite no formato do avatar. - Uso de IA para os próximos cálculos
    const shape = this.make.graphics();
    shape.fillCircle(avatarX + paddingX, avatarY + paddingY, avatarRadius - 2);
    const mask = shape.createGeometryMask();
    this.avatarSprite.setMask(mask);

    // Posição X onde os textos à direita do avatar começam.
    const textStartX = avatarX + avatarRadius + 15;

    // Nome do personagem.
    const nameStr = this.registry.get("playerName") || "Jogador";
    const rightSideCentX = textStartX + (bgWidth - textStartX) / 2;

    // Texto com o nome do personagem
    this.add
      .text(rightSideCentX, isMobile ? 28 : 52, nameStr, {
        fontFamily: "Arial",
        fontSize: isMobile ? "16px" : "18px",
        fontWeight: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    // Texto com o nível atual do jogador.
    this.levelText = this.add.text(
      textStartX,
      isMobile ? 30 : 42,
      `Nvl. ${this.playerLevel}`,
      {
        fontFamily: "Courier New",
        fontSize: isMobile ? "12px" : "14px",
        fontWeight: "bold",
        color: "#00adef",
      },
    );

    // Dimensões da barra de XP.
    this.barWidth = isMobile ? 80 : 120;
    const barHeight = isMobile ? 6 : 8;
    const barY = isMobile ? 48 : 62;

    // Fundo cinza da barra de XP.
    const barBg = this.add
      .rectangle(textStartX, barY, this.barWidth, barHeight, 0x333333)
      .setOrigin(0, 0.5);

    // Preenchimento azul da barra de XP (começa com largura 0).
    this.barFill = this.add
      .rectangle(textStartX, barY, 0, barHeight, 0x00adef)
      .setOrigin(0, 0.5);

    // Animação de pulso na barra de XP.
    this.tweens.add({
      targets: this.barFill,
      alpha: 0.6,
      yoyo: true,
      repeat: -1,
      duration: 1500,
      ease: "Sine.easeInOut",
    });

    // Adiciona todos os elementos ao container do HUD.
    this.hudContainer.add([
      bg,
      avatarBg,
      this.avatarSprite,
      this.levelText,
      barBg,
      this.barFill,
    ]);

    // HUD DE CONFIANÇA (canto superior direito)
    const confWidth = isMobile ? 135 : 200;
    const confHeight = isMobile ? 38 : 50;
    const confX = width - confWidth - paddingX;
    const confY = paddingY;

    this.confContainer = this.add.container(confX, confY);

    // Fundo do painel de confiança.
    const confBg = this.add.graphics();
    confBg.fillStyle(0x0a0a1a, 0.85);
    confBg.fillRoundedRect(0, 0, confWidth, confHeight, 16);
    confBg.lineStyle(2, 0x00adef, 0.9);
    confBg.strokeRoundedRect(0, 0, confWidth, confHeight, 16);
    this.confContainer.add(confBg);

    // Círculo de fundo do emoji de confiança.
    const emojiX = isMobile ? 18 : 28;
    const emojiY = confHeight / 2;
    this.confEmojiBg = this.add.circle(
      emojiX,
      emojiY,
      isMobile ? 12 : 18,
      0x00adef,
    );
    this.confContainer.add(this.confEmojiBg);

    // Emoji que representa o estado de confiança do jogador para com os clientes.
    this.confEmojiText = this.add
      .text(emojiX, emojiY, "😄", {
        fontSize: isMobile ? "14px" : "24px",
      })
      .setOrigin(0.5);
    this.confContainer.add(this.confEmojiText);

    // Texto com o percentual de confiança.
    this.confPercentText = this.add.text(
      emojiX + (isMobile ? 18 : 35),
      emojiY - (isMobile ? 10 : 16),
      "100%",
      {
        fontFamily: "Courier New",
        fontSize: isMobile ? "12px" : "18px",
        fontWeight: "bold",
        color: "#ffffff",
      },
    );
    this.confContainer.add(this.confPercentText);

    // Dimensões da barra de confiança.
    const confBarW = isMobile ? 70 : 120;
    const confBarH = isMobile ? 5 : 8;
    const confBarY = emojiY + (isMobile ? 6 : 8);

    // Fundo cinza da barra de confiança.
    this.confBarBg = this.add
      .rectangle(
        emojiX + (isMobile ? 18 : 35),
        confBarY,
        confBarW,
        confBarH,
        0x333333,
      )
      .setOrigin(0, 0.5);
    this.confContainer.add(this.confBarBg);

    // Preenchimento colorido da barra de confiança.
    this.confBarFill = this.add
      .rectangle(
        emojiX + (isMobile ? 18 : 35),
        confBarY,
        confBarW,
        confBarH,
        0x00adef,
      )
      .setOrigin(0, 0.5);
    this.confContainer.add(this.confBarFill);

    // Largura máxima da barra, usada para calcular o preenchimento proporcional.
    this._confBarMaxW = confBarW;

    // Atualiza os elementos visuais com os valores iniciais.
    this.refreshUI();
    this.refreshConfidenceUI();

    // Escuta mudanças no registro global para atualizar o HUD automaticamente.
    this.registry.events.on("changedata", this.onRegistryDataChange, this);

    // Remove o listener ao encerrar a cena para evitar vazamento/sobrecarga de memória.
    this.events.on("shutdown", () => {
      this.registry.events.off("changedata", this.onRegistryDataChange, this);
    });

    this.events.on("wake", () => {
      if (this.objIsOpen) this.refreshObjectives();
    });

    // Tecla 'I' para abrir o inventário...
    this.input.keyboard.on("keydown-I", () => {
      if (this.scene.isActive("InventoryScene")) {
        // Inventário já aberto, não faz nada.
      } else if (
        !this.scene.isActive("NegotiationScene") &&
        !this.scene.isActive("DialogScene")
      ) {
        // Identifica qual cena de fundo está ativa no momento.
        let bgScene = this.scene.manager.scenes.find(
          (s) =>
            s.scene.isActive() &&
            ![
              "PlayerHudScene",
              "MobileHudScene",
              "PauseScene",
              "InventoryScene",
              "CielodexScene",
              "DialogScene",
            ].includes(s.scene.key),
        );

        let activeBgScene = bgScene ? bgScene.scene.key : null;

        // Abre o inventário passando a cena atual para retorno.
        if (activeBgScene) {
          this.scene.run("InventoryScene", { returnScene: activeBgScene });
        }
      }
    });

    // Tecla 'P' para abrir a Cielodex...
    this.input.keyboard.on("keydown-P", () => {
      if (this.scene.isActive("CielodexScene")) {
        // Cielodex já aberta, não faz nada.
      } else if (
        !this.scene.isActive("NegotiationScene") &&
        !this.scene.isActive("DialogScene")
      ) {
        // Identifica qual cena de fundo está ativa no momento.
        let bgScene = this.scene.manager.scenes.find(
          (s) =>
            s.scene.isActive() &&
            ![
              "PlayerHudScene",
              "MobileHudScene",
              "PauseScene",
              "InventoryScene",
              "CielodexScene",
              "DialogScene",
            ].includes(s.scene.key),
        );

        let activeBgScene = bgScene ? bgScene.scene.key : null;

        if (activeBgScene) {
          this.scene.run("CielodexScene", { returnScene: activeBgScene });
        }
      }
    });

    // Constroi o painel de missões e objetivos.
    this._buildObjectivePanel(width, height, isMobile);

    // Escuta redimensionamento da tela.
    this.scale.on("resize", this.resize, this);
  }

  // ── OBJETIVOS HUD ──

  _buildObjectivePanel(w, h, isMobile) {
    this.isMobile = isMobile;
    this.panelW = isMobile ? 220 : 300;
    this.panelH = isMobile ? 230 : 320;
    this.panelXOpen = 0;
    this.panelXClosed = -this.panelW;
    this.objIsOpen = false;

    // Container ancorado no meio da esquerda.
    this.objContainer = this.add
      .container(this.panelXClosed, (h - this.panelH) / 2)
      .setDepth(200);

    // Fundo do painel
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.95);
    bg.fillRoundedRect(0, 0, this.panelW, this.panelH, 16);
    bg.lineStyle(2, 0x00adef, 0.9);
    bg.strokeRoundedRect(0, 0, this.panelW, this.panelH, 16);

    // Para deixar reto no canto esquerdo, desenhamos um retangulo extra escondendo a borda
    bg.fillStyle(0x0a0a1a, 1);
    bg.fillRect(0, 0, 16, this.panelH);
    this.objContainer.add(bg);

    // Aba (Tab) interativa
    const tabRadius = isMobile ? 22 : 30;
    this.tabBtn = this.add.circle(
      this.panelW,
      this.panelH / 2,
      tabRadius,
      0x0a0a1a,
      0.95,
    );
    this.tabBtn.setStrokeStyle(2, 0x00adef, 0.9);
    this.tabBtn.setInteractive({ useHandCursor: true });
    this.tabBtn.on("pointerdown", () => this.toggleObjectivePanel());
    this.objContainer.add(this.tabBtn);

    // Recorta a metade esquerda do botão tab
    const maskRect = this.add.graphics();
    maskRect.fillStyle(0x0a0a1a, 1);
    maskRect.fillRect(
      this.panelW - 2,
      this.panelH / 2 - tabRadius - 2,
      4,
      tabRadius * 2 + 4,
    );
    this.objContainer.add(maskRect);

    this.tabIcon = this.add
      .text(this.panelW + (isMobile ? 10 : 14), this.panelH / 2, "▶", {
        fontSize: isMobile ? "18px" : "22px",
        color: "#00adef",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.objContainer.add(this.tabIcon);

    // Atalho de teclado (TAB)
    this.input.keyboard.on("keydown-TAB", (event) => {
      event.preventDefault();
      this.toggleObjectivePanel();
    });

    // Título
    this.objContainer.add(
      this.add.text(20, 20, "OBJETIVOS", {
        fontSize: isMobile ? "16px" : "20px",
        color: "#00adef",
        fontStyle: "bold",
        fontFamily: "Arial",
      }),
    );

    // Status Text
    this.progressText = this.add.text(20, 50, "Progresso: 0/3", {
      fontSize: isMobile ? "12px" : "14px",
      color: "#ffffff",
      fontFamily: "Arial",
    });
    this.objContainer.add(this.progressText);

    this.recommendedLabel = this.add.text(20, 75, "Próximo Recomendado:", {
      fontSize: isMobile ? "11px" : "13px",
      color: "#aaaaaa",
      fontFamily: "Arial",
    });
    this.objContainer.add(this.recommendedLabel);

    this.targetText = this.add.text(20, 95, "-", {
      fontSize: isMobile ? "13px" : "16px",
      color: "#ffcc00",
      fontStyle: "bold",
      fontFamily: "Arial",
      wordWrap: { width: this.panelW - 40 },
    });
    this.objContainer.add(this.targetText);

    this.objContainer.add(
      this.add.text(20, 130, "Lojas Disponíveis:", {
        fontSize: isMobile ? "12px" : "14px",
        color: "#00adef",
        fontStyle: "bold",
        fontFamily: "Arial",
      }),
    );

    // Container iterável com os clientes da rua
    this.npcsContainer = this.add.container(20, 155);
    this.objContainer.add(this.npcsContainer);

    this.refreshObjectives();
  }

  toggleObjectivePanel() {
    this.objIsOpen = !this.objIsOpen;
    this.tabIcon.setText(this.objIsOpen ? "◀" : "▶");

    if (this.objIsOpen) this.refreshObjectives();

    this.tweens.add({
      targets: this.objContainer,
      x: this.objIsOpen ? this.panelXOpen : this.panelXClosed,
      duration: 350,
      ease: "Cubic.easeOut",
    });
  }

  refreshObjectives() {
    if (!this.objContainer) return;

    let bgScene = this.scene.manager.scenes.find(
      (s) =>
        s.scene.isActive() &&
        ![
          "PlayerHudScene",
          "MobileHudScene",
          "PauseScene",
          "InventoryScene",
          "DialogScene",
          "NegotiationScene",
        ].includes(s.scene.key),
    );
    if (!bgScene) return;

    // Carrega o ProgressManager de forma lazy se necessário
    const pm =
      bgScene.sys.game.scene.getScene("CityScene")?.sys?.game?.registry;
    import("../../managers/ProgressManager").then(({ ProgressManager }) => {
      let worldId = ProgressManager.sceneKeyToWorldId(bgScene.scene.key);
      if (!worldId && bgScene.cfg && bgScene.cfg.parentScene) {
        worldId = ProgressManager.sceneKeyToWorldId(bgScene.cfg.parentScene);
      }

      if (!worldId) return;

      const required = ProgressManager.getRequiredNegotiations(worldId);
      const count = ProgressManager.getNegotiationCount(worldId);

      this.progressText.setText(
        `Clientes conquistados: ${Math.min(count, required)} / ${required}`,
      );

      const target = ProgressManager.getCurrentMissionTarget(worldId);
      this.targetText.setText(
        target ? target.name : "Missão Concluída! Vá para o elevador.",
      );

      const allTargets = ProgressManager.getWorldTargets(worldId);
      const completed =
        ProgressManager.reg?.get("completedNegotiations")?.[worldId] || [];

      this.npcsContainer.removeAll(true);

      allTargets.forEach((t, i) => {
        const isDone = completed.includes(t.id);
        const icon = isDone ? "✅" : "⭕";
        const color = isDone ? "#66ff66" : "#cccccc";
        const spacing = this.isMobile ? 18 : 22;

        // marca os nomes completos, destaca os faltantes
        this.npcsContainer.add(
          this.add.text(0, i * spacing, `${icon} ${t.name}`, {
            fontSize: this.isMobile ? "11px" : "13px",
            fontFamily: "Arial",
            color: color,
            fontStyle: isDone ? "italic" : "bold",
          }),
        );
      });
    });
  }

  // Chamado ao redimensionar a janela (reservado para ajustes futuros, no momento servindo só como um call para o this.scale).
  resize(gameSize) {
    if (this.objContainer) {
      this.objContainer.setY((gameSize.height - this.panelH) / 2);
    }
  }

  /**
   * Atualiza as variáveis locais quando o registro global muda.
   * @param {object} parent - Referência ao registry.
   * @param {string} key - Chave que foi alterada.
   * @param {*} data - Novo valor.
   */
  //Ainda estamos analisando a possibilidade de salvar essas informações em um cookie ou um json local.
  onRegistryDataChange(parent, key, data) {
    if (key === "playerLevel") {
      this.playerLevel = data;
      this.refreshUI();
    } else if (key === "playerXP") {
      this.playerXP = data;
      this.refreshUI();
    } else if (key === "playerConfidence") {
      this.playerConfidence = data;
      this.refreshConfidenceUI();
    } else if (key === "playerInventory") {
      this.playerInventory = data;
    }
  }

  /**
   * Atualiza o texto de nível e a barra de XP.
   * O XP atualmente é calculado em ciclos de 150 por nível (usando módulo) (ainda não está 100% definido).
   * No nível máximo (9), a barra fica cheia.
   */
  refreshUI() {
    if (!this.levelText) return;

    this.levelText.setText(`Nvl. ${this.playerLevel}`);

    let xpRatio = 0;
    if (this.playerLevel >= 9) {
      // Nível máximo: barra completamente cheia.
      xpRatio = 1;
    } else {
      // Proporção do XP dentro do nível atual (cada salto requer 500 XP).
      xpRatio = (this.playerXP % 500) / 500;
    }

    // Anima a barra até a largura correspondente ao XP atual.
    this.tweens.add({
      targets: this.barFill,
      width: this.barWidth * xpRatio,
      duration: 800,
      ease: "Cubic.easeOut",
    });
  }

  /**
   * Atualiza o percentual de confiança, a cor e o emoji da barra de confiança.
   * - Até 39%: vermelho + 😢
   * - Até 79%: amarelo + 😐
   * - Acima de 79%: azul + 😄
   */
  refreshConfidenceUI() {
    if (!this.confPercentText) return;

    // Garante que o valor fique entre 0 e 100.
    let conf = Phaser.Math.Clamp(this.playerConfidence, 0, 100);
    this.confPercentText.setText(`${Math.floor(conf)}%`);

    // Define cor e emoji de acordo com o nível de confiança.
    let color = 0x00adef;
    let emoji = "😄";

    if (conf <= 39) {
      color = 0xff0000;
      emoji = "😢";
    } else if (conf <= 79) {
      color = 0xffff00;
      emoji = "😐";
    }

    // Aplica a cor ao emoji e à barra.
    this.confEmojiBg.setFillStyle(color);
    this.confEmojiText.setText(emoji);
    this.confBarFill.setFillStyle(color);

    // Anima a barra até a largura proporcional à confiança atual.
    this.tweens.add({
      targets: this.confBarFill,
      width: this._confBarMaxW * (conf / 100),
      duration: 500,
      ease: "Cubic.easeOut",
    });
  }
}
