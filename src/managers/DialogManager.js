/**
 * @fileoverview Gerenciador de diálogos e interações com NPCs.
 * Controla o prompt flutuante acima dos NPCs e a caixa de diálogo
 * fixa na parte inferior da tela.
 * @module managers/DialogManager
 */
import { ProgressManager } from "./ProgressManager";

/**
 * Gerencia a UI de diálogo: exibe o prompt de interação,
 * abre/fecha a caixa de texto e avança as falas dos NPCs.
 */
export class DialogManager {
  /**
   * Cria os elementos visuais do diálogo antecipadamente para evitar
   * recriações a cada interação.
   *
   * @param {Phaser.Scene} scene - Cena onde os diálogos serão exibidos.
   */
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this._currentNPC = null;
    this._dialogIndex = 0;
    this._isMobile = !scene.sys.game.device.os.desktop;

    this._buildPrompt();
    this._buildDialogBox();
  }

  // ── CRIAÇÃO DOS COMPONENTES VISUAIS ──

  /**
   * Cria o prompt flutuante que aparece acima do NPC
   * sugerindo que o jogador pode interagir.
   */
  _buildPrompt() {
    const label = this._isMobile ? "Toque 💬" : "[ E ] Falar";
    this._promptText = this.scene.add
      .text(0, 0, label, {
        fontSize: "15px",
        fontFamily: "monospace",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5, 0)
      .setDepth(50000)
      .setVisible(false);
  }

  /**
   * Cria a caixa de diálogo fixada na parte inferior da tela.
   * Usa `setScrollFactor(0)` para não ser afetada pelo scroll da câmera.
   */
  _buildDialogBox() {
    // Container fixo na tela, não afetado pelo scroll da câmera.
    this._container = this.scene.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(100000)
      .setVisible(false);

    this._bg = this.scene.add.graphics();
    this._line = this.scene.add.graphics();

    // Nome do NPC em destaque.
    this._nameText = this.scene.add.text(18, 12, "", {
      fontSize: "16px",
      fontFamily: "monospace",
      color: "#8899ff",
      fontStyle: "bold",
    });

    // Texto do diálogo com espaçamento entre linhas.
    this._dialogText = this.scene.add.text(18, 42, "", {
      fontSize: "15px",
      fontFamily: "monospace",
      color: "#e8e8ff",
      lineSpacing: 4,
    });

    // Indicador de continuar/fechar no canto inferior direito.
    const contLabel = this._isMobile ? "Toque ▼" : "[ E ] continuar ▼";
    this._continueText = this.scene.add
      .text(0, 0, contLabel, {
        fontSize: "12px",
        fontFamily: "monospace",
        color: "#5566ff",
      })
      .setOrigin(1, 1);

    // No mobile, toque em qualquer lugar da tela avança o diálogo.
    if (this._isMobile) {
      this.scene.input.on("pointerdown", () => {
        if (this.isOpen) this.advance();
      });
    }

    // Animação de piscar no indicador de continuar.
    this.scene.tweens.add({
      targets: this._continueText,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this._container.add([
      this._bg,
      this._nameText,
      this._line,
      this._dialogText,
      this._continueText,
    ]);

    this._lastScreenWidth = 0;
    this._lastScreenHeight = 0;
    this._refreshBoxSizes();
  }

  /** Redesenha o fundo e reposiciona os elementos se o tamanho da tela mudou. */
  _refreshBoxSizes() {
    const { width, height } = this.scene.scale;

    // Só redesenha se o tamanho da tela mudou de fato.
    if (this._lastScreenWidth === width && this._lastScreenHeight === height)
      return;
    this._lastScreenWidth = width;
    this._lastScreenHeight = height;

    this.boxH = 100;
    this.boxW = Math.min(width - 40, 700);
    this.boxMarginBottom = 20;

    // Fundo e borda arredondados da caixa.
    this._bg.clear();
    this._bg.fillStyle(0x0d0d1a, 0.88);
    this._bg.fillRoundedRect(0, 0, this.boxW, this.boxH, 10);
    this._bg.lineStyle(2, 0x5566ff, 0.9);
    this._bg.strokeRoundedRect(0, 0, this.boxW, this.boxH, 10);

    // Linha divisória entre o nome e o texto do diálogo.
    this._line.clear();
    this._line.lineStyle(1, 0x5566ff, 0.4);
    this._line.lineBetween(14, 34, this.boxW - 14, 34);

    this._dialogText.setWordWrapWidth(this.boxW - 36);
    this._continueText.setPosition(this.boxW - 18, this.boxH - 14);
  }

  // ── API PÚBLICA ──

  /**
   * Exibe o prompt acima do NPC indicando que é possível interagir.
   *
   * @param {NPC} npc - NPC sobre o qual o prompt será exibido.
   */
  showPrompt(npc) {
    if (this.isOpen) return;
    this._promptText.setVisible(true);
    this.updateDynamicScaling(npc);
  }

  /**
   * Oculta o prompt de interação.
   */
  hidePrompt() {
    this._promptText.setVisible(false);
  }

  /**
   * Abre a caixa de diálogo para um NPC e pausa o HUD.
   *
   * @param {NPC} npc - NPC com o qual o jogador está interagindo.
   */
  open(npc) {
    if (this.isOpen) return;
    this._currentNPC = npc;
    this._dialogIndex = 0;
    this.isOpen = true;
    this._container.setVisible(true);
    this.hidePrompt();
    this._showDialog();
    this.updateDynamicScaling(npc);

    // Suspende o HUD e os controles mobile durante o diálogo.
    if (this.scene.scene.isActive("MobileHudScene"))
      this.scene.scene.sleep("MobileHudScene");
    if (this.scene.scene.isActive("PlayerHudScene"))
      this.scene.scene.sleep("PlayerHudScene");
  }

  /**
   * Avança para a próxima fala. Se o diálogo acabou, fecha a caixa
   * ou inicia uma negociação, dependendo dos dados do NPC.
   */
  advance() {
    if (!this.isOpen) return;
    this._dialogIndex++;

    const data = this._currentNPC?.npcData;
    const dialogs = data?.dialogs ?? [];

    if (this._dialogIndex >= dialogs.length) {
      if (data?.negotiationId) {
        // Fecha o diálogo e inicia a negociação sem acordar o HUD (a negociação fará isso).
        const negotiationId = data.negotiationId;
        const currentSceneKey = this.scene.scene.key;

        // Identifica o mundo atual verificando a cena pai (ex: FarmScene) ou a cena atual.
        let worldId = ProgressManager.sceneKeyToWorldId(currentSceneKey);
        if (!worldId && this.scene.cfg && this.scene.cfg.parentScene) {
          worldId = ProgressManager.sceneKeyToWorldId(
            this.scene.cfg.parentScene,
          );
        }

        this.close(true);

        this.scene.scene.pause();
        this.scene.scene.launch("NegotiationScene", {
          negotiationId,
          worldId,
          returnScene: currentSceneKey,
          playerKey: this.scene.player.characterKey,
        });

        // Traz a cena de negociação para frente de todas as outras (evita renderizar 'atrás' da loja).
        this.scene.scene.bringToTop("NegotiationScene");
      } else {
        // Sem negociação: fecha o diálogo normalmente.
        this.close();
      }
    } else {
      this._showDialog();
    }
  }

  /**
   * Fecha a caixa de diálogo e reativa o HUD.
   *
   * @param {boolean} skipWake - Se true, não reativa o HUD (ex: quando uma negociação vai abrir em seguida).
   */
  close(skipWake = false) {
    this.isOpen = false;
    this._container.setVisible(false);
    const data = this._currentNPC?.npcData;
    this._currentNPC = null;
    this._dialogIndex = 0;

    if (!skipWake && this.scene.scene.isSleeping("PlayerHudScene")) {
      this.scene.scene.wake("PlayerHudScene");
    }

    // Emite um evento global na cena para que ela possa reagir ao fim do diálogo.
    this.scene.events.emit("dialog-closed", {
      npcId: data?.id,
      npcName: data?.name,
      npcData: data,
    });
  }

  // ── INTERNO ──

  /** Atualiza o nome e o texto da fala atual na caixa de diálogo. */
  _showDialog() {
    const npc = this._currentNPC;
    if (!npc) return;

    const dialogs = npc.npcData.dialogs ?? [];
    this._nameText.setText(npc.npcData.name ?? npc.characterKey);
    this._dialogText.setText(dialogs[this._dialogIndex] ?? "...");

    // Muda o texto do indicador na última fala.
    const isLast = this._dialogIndex >= dialogs.length - 1;
    this._continueText.setText(
      this._isMobile
        ? isLast
          ? "Toque para fechar ▼"
          : "Toque ▼"
        : isLast
          ? "[ E ] fechar ▼"
          : "[ E ] continuar ▼",
    );
  }

  /**
   * Reposiciona o prompt acima do NPC e a caixa de diálogo na tela,
   * compensando o zoom da câmera para que não fiquem distorcidos.
   * @param {NPC} npc - NPC de referência para posicionar o prompt.
   */
  updateDynamicScaling(npc) {
    const cam = this.scene.cameras.main;
    const z = cam.zoom;

    // Posiciona o prompt logo abaixo do sprite do NPC no mundo.
    if (this._promptText.visible && npc) {
      this._promptText.setPosition(npc.x, npc.y + npc.displayHeight / 2 + 6);
      // Divide pela escala do zoom para manter o tamanho visual constante.
      this._promptText.setScale(1 / z);
    }

    // Reposiciona a caixa de diálogo centralizada na parte inferior da tela.
    if (this.isOpen) {
      this._refreshBoxSizes();
      const { width, height } = this.scene.scale;

      const screenX = (width - this.boxW) / 2;
      const screenY = height - this.boxH - this.boxMarginBottom;

      // Converte coordenadas de tela para coordenadas do mundo, revertendo o zoom.
      const cx = cam.centerX;
      const cy = cam.centerY;
      const targetX = (screenX - cx) / z + cx;
      const targetY = (screenY - cy) / z + cy;

      this._container.setPosition(targetX, targetY);
      this._container.setScale(1 / z);
    }
  }

  /** Destrói os elementos visuais do gerenciador ao encerrar a cena. */
  destroy() {
    this._promptText?.destroy();
    this._container?.destroy();
  }
}
