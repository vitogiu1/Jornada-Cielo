/**
 * @fileoverview Cena de seleção de mundos no estilo Super Mario World.
 * Exibe um mapa com nós conectados por caminhos e uma miniatura do
 * personagem selecionado que "caminha" entre os nós.
 * @module scenes/menus/WorldMapScene
 */

import Phaser from "phaser";
import { WorldManager } from "../../managers/WorldManager";
import { ProgressManager } from "../../managers/ProgressManager";
import { AnimationManager } from "../../managers/AnimationManager";

/**
 * Cena do mapa-múndi para seleção de fase.
 * @extends Phaser.Scene
 */
export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("WorldMapScene");
  }

  /** Recebe o personagem escolhido na tela anterior. */
  init(data) {
    this.characterKey = data.character || "amanda";
    this.selectedIndex = 0;
    this.isAnimating = false;
  }

  create() {
    const { width, height } = this.scale;
    this.worlds = WorldManager.getWorlds();

    // Garante que o ProgressManager esteja inicializado.
    if (!ProgressManager.reg) {
      ProgressManager.init(this.registry);
    }

    // ── Fundo ────────────────────────────────────────────────────────────
    const bg = this.add.image(width / 2, height / 2, "world_map_bg");
    const bgScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(bgScale).setDepth(-2);

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
    this.nodePositions = [];
    this.nodeSprites = [];

    const margin = isMobile ? 40 : 80;
    const areaW = width - margin * 2;
    const areaH = height - margin * 2 - (isMobile ? 80 : 120);
    const offsetY = isMobile ? 70 : 100;

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

    // ── Miniatura do personagem ──────────────────────────────────────────
    AnimationManager.createAnimations(this, this.characterKey);

    const startPos = this.nodePositions[this.selectedIndex];
    this.playerSprite = this.add
      .sprite(
        startPos.x,
        startPos.y - (isMobile ? 28 : 38),
        `${this.characterKey}-idle`,
      )
      .setScale(isMobile ? 2.5 : 3)
      .setDepth(200);
    this.playerSprite.play(`${this.characterKey}-idle-down`);

    // ── HUD inferior ─────────────────────────────────────────────────────
    this.createInfoHud(width, height, isMobile);

    // ── Inputs ───────────────────────────────────────────────────────────
    this.setupInput(isMobile);

    this.highlightNode(this.selectedIndex);

    this.cameras.main.fadeIn(500);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  VISUAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════

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

  drawPaths() {
    const gfx = this.add.graphics().setDepth(5);
    const drawn = new Set();

    this.worlds.forEach((world, i) => {
      world.connections.forEach((connId) => {
        const j = this.worlds.findIndex((w) => w.id === connId);
        if (j < 0) return;
        const edgeKey = [Math.min(i, j), Math.max(i, j)].join("-");
        if (drawn.has(edgeKey)) return;
        drawn.add(edgeKey);

        const a = this.nodePositions[i];
        const b = this.nodePositions[j];
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

  createNode(world, index, isMobile) {
    const pos = this.nodePositions[index];
    const radius = isMobile ? 22 : 30;
    const unlocked = WorldManager.isUnlocked(world.id);
    const complete = WorldManager.isComplete(world.id);

    // Sombra
    this.add.circle(pos.x + 2, pos.y + 2, radius, 0x000000, 0.4).setDepth(9);

    // Círculo
    const circle = this.add
      .circle(pos.x, pos.y, radius, world.color, unlocked ? 1 : 0.3)
      .setDepth(10)
      .setStrokeStyle(3, 0xffffff, unlocked ? 0.9 : 0.2);

    // Ícone
    const icon = this.add
      .text(pos.x, pos.y, world.icon, { fontSize: isMobile ? "18px" : "24px" })
      .setOrigin(0.5)
      .setDepth(11)
      .setAlpha(unlocked ? 1 : 0.3);

    // Rótulo
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

    // Cadeado ou checkmark
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

    // Contador de negociações vencidas
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

    // Interação
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

    // Glow ring
    const glow = this.add
      .circle(pos.x, pos.y, radius + 6, world.color, 0)
      .setDepth(8);

    this.nodeSprites.push({ circle, icon, label, glow });
  }

  createInfoHud(w, h, isMobile) {
    const panelH = isMobile ? 60 : 80;
    const panelY = h - panelH;

    this.infoPanel = this.add
      .rectangle(0, panelY, w, panelH, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(300);

    const world = this.worlds[this.selectedIndex];

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

    this.infoDesc = this.add
      .text(w / 2, panelY + (isMobile ? 34 : 48), world.description, {
        fontSize: isMobile ? "11px" : "14px",
        fontFamily: "Arial",
        color: "#cccccc",
      })
      .setOrigin(0.5)
      .setDepth(301);

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

  updateInfoHud() {
    const world = this.worlds[this.selectedIndex];
    this.infoName.setText(world.name);
    this.infoDesc.setText(world.description);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  INPUT
  // ═══════════════════════════════════════════════════════════════════════

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
  //  NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════

  navigateAdjacent(dir) {
    if (this.isAnimating) return;

    const currentWorld = this.worlds[this.selectedIndex];
    const connections = currentWorld.connections;
    if (!connections.length) return;

    const currentConnIdx = this._lastConnDirection || 0;
    let nextConnIdx = currentConnIdx + (dir > 0 ? 1 : -1);
    if (nextConnIdx < 0) nextConnIdx = connections.length - 1;
    if (nextConnIdx >= connections.length) nextConnIdx = 0;
    this._lastConnDirection = nextConnIdx;

    const neighborId = connections[nextConnIdx];
    const neighborIdx = this.worlds.findIndex((w) => w.id === neighborId);
    if (neighborIdx < 0) return;

    // Só navega para mundos desbloqueados
    if (!WorldManager.isUnlocked(this.worlds[neighborIdx].id)) return;

    this.navigateTo(neighborIdx);
  }

  navigateTo(targetIndex) {
    if (this.isAnimating) return;
    if (targetIndex === this.selectedIndex) return;

    const targetWorld = this.worlds[targetIndex];
    if (!WorldManager.isUnlocked(targetWorld.id)) return;

    const fromId = this.worlds[this.selectedIndex].id;
    const toId = targetWorld.id;
    const path = WorldManager.findPath(fromId, toId);
    if (path.length < 2) return;

    this.isAnimating = true;
    this.unhighlightNode(this.selectedIndex);

    const waypoints = path.map((id) => {
      const idx = this.worlds.findIndex((w) => w.id === id);
      return this.nodePositions[idx];
    });

    const isMobile = !this.sys.game.device.os.desktop;
    const charYOffset = isMobile ? 28 : 38;

    this.playerSprite.play(`${this.characterKey}-run-down`);

    let currentWP = 1;
    const moveNext = () => {
      if (currentWP >= waypoints.length) {
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

      const dx = wp.x - this.playerSprite.x;
      const dy = wp.y - charYOffset - this.playerSprite.y;
      let runDir = "down";
      if (Math.abs(dx) > Math.abs(dy)) {
        runDir = dx > 0 ? "right" : "left";
      } else {
        runDir = dy > 0 ? "down" : "up";
      }
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

  highlightNode(index) {
    const node = this.nodeSprites[index];
    if (!node) return;

    node.glow.setAlpha(0.35);
    this.tweens.add({
      targets: node.glow,
      alpha: 0.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: [node.circle, node.icon],
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

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

  confirmSelection() {
    if (this.isAnimating) return;

    const world = this.worlds[this.selectedIndex];
    if (!WorldManager.isUnlocked(world.id)) return;

    this.isAnimating = true;
    this.input.enabled = false;

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
