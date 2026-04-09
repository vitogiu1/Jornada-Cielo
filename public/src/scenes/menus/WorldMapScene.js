/**
 * @fileoverview Cena do mapa de seleção de mundos, no estilo Super Mario World.
 * O jogador vê um mapa com nós conectados por caminhos pontilhados.
 * Um sprite do personagem caminha entre os nós ao navegar.
 * @module scenes/menus/WorldMapScene
 */

import Phaser from "phaser";
import { WorldManager } from "../../managers/WorldManager";
import { ProgressManager } from "../../managers/ProgressManager";
import { AnimationManager } from "../../managers/AnimationManager";
import { GameConfig } from "../../core/config";

/**
 * Cena do mapa-múndi para seleção de fase.
 * Gerencia navegação entre mundos, animação do personagem e exibição de progresso.
 * @extends Phaser.Scene
 */
export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("WorldMapScene");
  }

  /**
   * Recebe dados da cena anterior (personagem escolhido).
   * @param {{ character?: string }} data - Dados passados via `scene.start`.
   */
  init(data) {
    // Busca a personagem preferencialmente no registro caso o data esteja vazio
    this.characterKey =
      data?.character || this.registry.get("playerSprite") || "amanda";
    this.isAnimating = false;

    // Tenta carregar o último mundo visitado do registro
    const lastWorld = this.registry.get("lastWorldId") || "city";
    this.lastWorld = lastWorld;
  }

  create() {
    const { width, height } = this.scale;
    this.worlds = WorldManager.getWorlds();

    // Inicializa o ProgressManager caso ainda não esteja pronto
    if (!ProgressManager.reg) {
      ProgressManager.init(this.registry);
    }

    // Define o índice baseado no último mundo
    this.selectedIndex = Math.max(
      0,
      this.worlds.findIndex((w) => w.id === this.lastWorld),
    );

    // Registra esta cena como a última ativa
    this.registry.set("lastScene", "WorldMapScene");
    this.registry.set("lastWorldId", this.worlds[this.selectedIndex].id);

    // ── Fundo ────────────────────────────────────────────────────────────
    // Imagem de fundo redimensionada para cobrir toda a tela (cover)
    const bg = this.add.image(width / 2, height / 2, "world_map_bg");
    const bgScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(bgScale).setDepth(-2);

    // Overlay escuro semi-transparente para melhorar a legibilidade dos elementos
    this.add
      .rectangle(0, 0, width, height, 0x0a0e27, 0.55)
      .setOrigin(0)
      .setDepth(-1);

    // ── Estrelas decorativas ─────────────────────────────────────────────
    this.createStars(width, height);

    // ── Título ───────────────────────────────────────────────────────────
    const isMobile = !this.sys.game.device.os.desktop;
    const title = this.add
      .text(width / 2, isMobile ? 30 : 50, "SELECIONE O DESTINO", {
        fontSize: isMobile ? "20px" : "32px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(100);
    title.setStroke("#000000", 4);

    // ── Nós e caminhos ───────────────────────────────────────────────────
    this.nodePositions = []; // Coordenadas (x, y) de cada nó na tela
    this.nodeSprites = []; // Referências aos objetos visuais de cada nó

    // Margens e área disponível para distribuir os nós
    const margin = isMobile ? 40 : 80;
    const areaW = width - margin * 2;
    const areaH = height - margin * 2 - (isMobile ? 80 : 120);
    const offsetY = isMobile ? 70 : 100;

    // Converte posições normalizadas (0–1) dos mundos em pixels reais
    this.worlds.forEach((world) => {
      this.nodePositions.push({
        x: margin + world.x * areaW,
        y: offsetY + world.y * areaH,
      });
    });

    this.drawPaths(width, height);

    this.worlds.forEach((world, i) => {
      this.createNode(world, i, isMobile);
    });

    // ── Sprite do personagem ─────────────────────────────────────────────
    AnimationManager.createAnimations(this, this.characterKey);

    const startPos = this.nodePositions[this.selectedIndex];
    this.playerSprite = this.add
      .sprite(
        startPos.x,
        startPos.y - (isMobile ? 28 : 38), // Posiciona acima do centro do nó
        `${this.characterKey}-idle`,
      )
      .setScale(isMobile ? 2.5 : 3)
      .setDepth(200);
    this.playerSprite.play(`${this.characterKey}-idle-down`);

    // ── HUD inferior ─────────────────────────────────────────────────────
    this.createInfoHud(width, height, isMobile);

    // ── Controles ────────────────────────────────────────────────────────
    this.setupInput(isMobile);

    this.highlightNode(this.selectedIndex);

    this.cameras.main.fadeIn(500);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  HELPERS VISUAIS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Cria 50 estrelas piscantes espalhadas aleatoriamente pelo fundo.
   * @param {number} w - Largura da tela.
   * @param {number} h - Altura da tela.
   */
  createStars(w, h) {
    for (let i = 0; i < 50; i++) {
      const star = this.add
        .circle(
          Math.random() * w,
          Math.random() * h,
          1 + Math.random() * 1.5,
          0xffffff,
          0.4 + Math.random() * 0.4,
        )
        .setDepth(0);

      // Tween de piscar: a estrela vai de alpha alto até quase invisível e volta
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: 1500 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: Math.random() * 2000,
      });
    }
  }

  /**
   * Desenha os caminhos pontilhados entre nós conectados.
   * Cada aresta é desenhada apenas uma vez, evitando duplicatas.
   */
  drawPaths() {
    const gfx = this.add.graphics().setDepth(5);
    const drawn = new Set(); // Controla arestas já desenhadas

    this.worlds.forEach((world, i) => {
      world.connections.forEach((connId) => {
        const j = this.worlds.findIndex((w) => w.id === connId);
        if (j < 0) return;

        // Chave única para o par (i, j), independente da ordem
        const edgeKey = [Math.min(i, j), Math.max(i, j)].join("-");
        if (drawn.has(edgeKey)) return;
        drawn.add(edgeKey);

        const a = this.nodePositions[i];
        const b = this.nodePositions[j];

        // Distribui pontos ao longo da aresta com espaçamento fixo de ~12px
        const dist = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
        const dots = Math.floor(dist / 12);
        for (let d = 0; d <= dots; d++) {
          const t = d / dots;
          gfx.fillStyle(0xffffff, 0.35);
          gfx.fillCircle(
            Phaser.Math.Linear(a.x, b.x, t),
            Phaser.Math.Linear(a.y, b.y, t),
            2,
          );
        }
      });
    });
  }

  /**
   * Cria um nó visual para um mundo: círculo, ícone, rótulo, cadeado/check e contador.
   * @param {object} world  - Dados do mundo (id, color, icon, name, etc.).
   * @param {number} index  - Índice do mundo na lista.
   * @param {boolean} isMobile - Se o dispositivo é mobile (ajusta tamanhos).
   */
  createNode(world, index, isMobile) {
    const pos = this.nodePositions[index];
    const radius = isMobile ? 22 : 30;
    const unlocked = GameConfig.devMode || WorldManager.isUnlocked(world.id);
    const complete = WorldManager.isComplete(world.id);

    // Sombra do nó (círculo ligeiramente deslocado)
    this.add.circle(pos.x + 2, pos.y + 2, radius, 0x000000, 0.4).setDepth(9);

    // Círculo principal do nó
    const circle = this.add
      .circle(pos.x, pos.y, radius, world.color, unlocked ? 1 : 0.3)
      .setDepth(10)
      .setStrokeStyle(3, 0xffffff, unlocked ? 0.9 : 0.2);

    // Ícone emoji centralizado no nó
    const icon = this.add
      .text(pos.x, pos.y, world.icon, { fontSize: isMobile ? "18px" : "24px" })
      .setOrigin(0.5)
      .setDepth(11)
      .setAlpha(unlocked ? 1 : 0.3);

    // Nome do mundo exibido abaixo do círculo
    const label = this.add
      .text(pos.x, pos.y + radius + (isMobile ? 8 : 12), world.name, {
        fontSize: isMobile ? "10px" : "13px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(11)
      .setAlpha(unlocked ? 0.85 : 0.3);
    label.setStroke("#000000", 3);

    // Indicador de estado: cadeado (bloqueado) ou checkmark (concluído)
    if (!unlocked) {
      this.add
        .text(pos.x, pos.y, "🔒", { fontSize: isMobile ? "14px" : "18px" })
        .setOrigin(0.5)
        .setDepth(12);
    } else if (complete) {
      this.add
        .text(pos.x + radius - 4, pos.y - radius + 4, "✅", {
          fontSize: isMobile ? "12px" : "16px",
        })
        .setOrigin(0.5)
        .setDepth(12);
    }

    // Progresso de negociações vencidas (ex.: "⚔ 2/3")
    if (unlocked && !complete) {
      const count = ProgressManager.getNegotiationCount(world.id);
      const required = ProgressManager.getRequiredNegotiations
        ? ProgressManager.getRequiredNegotiations(world.id)
        : 3;
      this.add
        .text(
          pos.x,
          pos.y + radius + (isMobile ? 20 : 28),
          `⚔ ${count}/${required}`,
          {
            fontSize: isMobile ? "9px" : "11px",
            fontFamily: "Arial",
            color: "#ffcc00",
          },
        )
        .setOrigin(0.5)
        .setDepth(11);
    }

    // Habilita clique no nó: se já estiver selecionado confirma entrada, senão navega até ele
    if (unlocked) {
      circle.setInteractive({ useHandCursor: true });
      circle.on("pointerdown", () => {
        if (this.isAnimating) return;
        if (index === this.selectedIndex) {
          this.confirmSelection();
        } else {
          this.navigateTo(index);
        }
      });
    }

    // Anel de glow ao redor do nó, visível apenas quando selecionado
    const glow = this.add
      .circle(pos.x, pos.y, radius + 6, world.color, 0)
      .setDepth(8);

    this.nodeSprites.push({ circle, icon, label, glow });
  }

  /**
   * Cria o painel inferior com nome e descrição do mundo selecionado.
   * @param {number} w        - Largura da tela.
   * @param {number} h        - Altura da tela.
   * @param {boolean} isMobile - Ajusta tamanhos de fonte e posicionamento.
   */
  createInfoHud(w, h, isMobile) {
    const panelH = isMobile ? 60 : 80;
    const panelY = h - panelH;

    // Fundo do painel
    this.infoPanel = this.add
      .rectangle(0, panelY, w, panelH, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(300);

    const world = this.worlds[this.selectedIndex];

    // Nome do mundo (destaque)
    this.infoName = this.add
      .text(w / 2, panelY + (isMobile ? 14 : 20), world.name, {
        fontSize: isMobile ? "16px" : "22px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(301);
    this.infoName.setStroke("#000000", 2);

    // Descrição curta do mundo
    this.infoDesc = this.add
      .text(w / 2, panelY + (isMobile ? 34 : 48), world.description, {
        fontSize: isMobile ? "11px" : "14px",
        fontFamily: "Arial",
        color: "#cccccc",
      })
      .setOrigin(0.5)
      .setDepth(301);

    // Dica de como entrar no mundo
    const hintText = isMobile
      ? "Toque duas vezes para entrar"
      : "ENTER para entrar";
    this.infoHint = this.add
      .text(w - 15, panelY + panelH / 2, hintText, {
        fontSize: isMobile ? "9px" : "12px",
        fontFamily: "Arial",
        color: "#888888",
        fontStyle: "italic",
      })
      .setOrigin(1, 0.5)
      .setDepth(301);
  }

  /**
   * Atualiza o texto do HUD inferior para refletir o mundo atualmente selecionado.
   */
  updateInfoHud() {
    const world = this.worlds[this.selectedIndex];
    this.infoName.setText(world.name);
    this.infoDesc.setText(world.description);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  CONTROLES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Registra os eventos de teclado para navegação e confirmação.
   * No mobile, a interação ocorre apenas via toque direto nos nós.
   * @param {boolean} isMobile - Se falso, registra os listeners de teclado.
   */
  setupInput(isMobile) {
    if (!isMobile) {
      this.input.keyboard.on("keydown-LEFT", () => this.navigateAdjacent(-1));
      this.input.keyboard.on("keydown-RIGHT", () => this.navigateAdjacent(1));
      this.input.keyboard.on("keydown-UP", () => this.navigateAdjacent(-1));
      this.input.keyboard.on("keydown-DOWN", () => this.navigateAdjacent(1));
      this.input.keyboard.on("keydown-ENTER", () => this.confirmSelection());
      this.input.keyboard.on("keydown-SPACE", () => this.confirmSelection());
      this.input.keyboard.on("keydown-ESC", () => {
        this.scene.start("MenuScene");
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  NAVEGAÇÃO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Move o cursor para o próximo ou anterior nó conectado ao atual.
   * Cicla pelos vizinhos em ordem, ignorando os que estão bloqueados.
   * @param {number} dir - Direção: `1` para próximo, `-1` para anterior.
   */
  navigateAdjacent(dir) {
    if (this.isAnimating) return;

    const currentWorld = this.worlds[this.selectedIndex];
    const connections = currentWorld.connections;
    if (!connections.length) return;

    // Avança ou recua no array de conexões do nó atual
    const currentConnIdx = this._lastConnDirection || 0;
    let nextConnIdx = currentConnIdx + (dir > 0 ? 1 : -1);
    if (nextConnIdx < 0) nextConnIdx = connections.length - 1;
    if (nextConnIdx >= connections.length) nextConnIdx = 0;
    this._lastConnDirection = nextConnIdx;

    const neighborId = connections[nextConnIdx];
    const neighborIdx = this.worlds.findIndex((w) => w.id === neighborId);
    if (neighborIdx < 0) return;

    const isNeighborUnlocked =
      GameConfig.devMode ||
      WorldManager.isUnlocked(this.worlds[neighborIdx].id);
    if (!isNeighborUnlocked) return;

    this.navigateTo(neighborIdx);
    // Persiste o mundo selecionado
    this.registry.set("lastWorldId", this.worlds[neighborIdx].id);
  }

  /**
   * Anima o personagem percorrendo o caminho até o nó de destino.
   * Busca o caminho via `WorldManager.findPath` e move segmento a segmento.
   * @param {number} targetIndex - Índice do nó de destino.
   */
  navigateTo(targetIndex) {
    if (this.isAnimating) return;
    if (targetIndex === this.selectedIndex) return;

    const targetWorld = this.worlds[targetIndex];
    const isTargetUnlocked =
      GameConfig.devMode || WorldManager.isUnlocked(targetWorld.id);
    if (!isTargetUnlocked) return;

    const fromId = this.worlds[this.selectedIndex].id;
    const toId = targetWorld.id;
    const path = WorldManager.findPath(fromId, toId);
    if (path.length < 2) return;

    this.isAnimating = true;
    this.unhighlightNode(this.selectedIndex);

    // Converte os IDs do caminho em coordenadas de tela
    const waypoints = path.map((id) => {
      const idx = this.worlds.findIndex((w) => w.id === id);
      return this.nodePositions[idx];
    });

    const isMobile = !this.sys.game.device.os.desktop;
    const charYOffset = isMobile ? 28 : 38;

    this.playerSprite.play(`${this.characterKey}-run-down`);

    let currentWP = 1;

    /**
     * Função recursiva que move o personagem segmento a segmento ao longo do caminho.
     * A duração de cada segmento é proporcional à distância percorrida.
     */
    const moveNext = () => {
      if (currentWP >= waypoints.length) {
        // Chegou ao destino: restaura idle e atualiza estado
        this.playerSprite.play(`${this.characterKey}-idle-down`);
        this.selectedIndex = targetIndex;
        this._lastConnDirection = 0;
        this.highlightNode(this.selectedIndex);
        this.updateInfoHud();
        this.isAnimating = false;
        return;
      }

      const wp = waypoints[currentWP];
      const dist = Phaser.Math.Distance.Between(
        this.playerSprite.x,
        this.playerSprite.y,
        wp.x,
        wp.y - charYOffset,
      );
      const duration = Math.max(200, dist * 2.5);

      // Escolhe a animação de corrida de acordo com a direção predominante do movimento
      const dx = wp.x - this.playerSprite.x;
      const dy = wp.y - charYOffset - this.playerSprite.y;
      let runDir = "down";
      if (Math.abs(dx) > Math.abs(dy)) {
        runDir = dx > 0 ? "right" : "left";
      } else {
        runDir = dy > 0 ? "down" : "up";
      }

      // "left" é simulado espelhando a animação "right"
      this.playerSprite.setFlipX(false);
      if (runDir === "left") {
        this.playerSprite.play(`${this.characterKey}-run-right`);
        this.playerSprite.setFlipX(true);
      } else {
        this.playerSprite.play(`${this.characterKey}-run-${runDir}`);
      }

      this.tweens.add({
        targets: this.playerSprite,
        x: wp.x,
        y: wp.y - charYOffset,
        duration,
        ease: "Sine.easeInOut",
        onComplete: () => {
          currentWP++;
          moveNext();
        },
      });
    };

    moveNext();
  }

  /**
   * Ativa o efeito visual de seleção em um nó: glow pulsante e leve zoom.
   * @param {number} index - Índice do nó a destacar.
   */
  highlightNode(index) {
    const node = this.nodeSprites[index];
    if (!node) return;

    // Tween de pulsação do anel de glow
    node.glow.setAlpha(0.35);
    this.tweens.add({
      targets: node.glow,
      alpha: 0.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Zoom suave no círculo e ícone
    this.tweens.add({
      targets: [node.circle, node.icon],
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  /**
   * Remove o destaque visual de um nó, restaurando sua escala e ocultando o glow.
   * @param {number} index - Índice do nó a remover o destaque.
   */
  unhighlightNode(index) {
    const node = this.nodeSprites[index];
    if (!node) return;

    this.tweens.killTweensOf(node.glow);
    node.glow.setAlpha(0);

    this.tweens.add({
      targets: [node.circle, node.icon],
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: "Sine.easeOut",
    });
  }

  /**
   * Confirma a entrada no mundo selecionado.
   * Executa uma animação de "pulso" no nó e então inicia o mundo via `WorldManager`.
   */
  confirmSelection() {
    if (this.isAnimating) return;

    const world = this.worlds[this.selectedIndex];
    const isWorldUnlocked =
      GameConfig.devMode || WorldManager.isUnlocked(world.id);
    if (!isWorldUnlocked) return;

    this.isAnimating = true;
    this.input.enabled = false; // Desabilita input durante a transição

    const node = this.nodeSprites[this.selectedIndex];
    this.tweens.add({
      targets: [node.circle, node.icon],
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0.6,
      duration: 300,
      ease: "Cubic.easeOut",
      onComplete: () => {
        WorldManager.startWorld(this, world.id, this.characterKey);
      },
    });
  }
}
