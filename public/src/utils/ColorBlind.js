/**
 * @fileoverview Utilitário de Filtros de Daltonismo Universais.
 * Injeta via DOM as matrizes matemáticas de correção de cores e aplica ao Canvas.
 * @module utils/ColorBlind
 */

//SVG criado com IA

export class ColorBlind {
  /**
   * Injeta o elemento SVG com todos os filtros no HTML body caso ainda não exista.
   */
  static initFilters() {
    if (document.getElementById("daltonism-filters")) return;

    // Matrizes de correção / adaptação (Daltonização / Shift de contraste para legibilidade)
    const svgCode = `
      <svg id="daltonism-filters" style="display: none;" width="0" height="0">
        <defs>
          <!-- Correção para Protanopia: melhora a distinção de vermelhos deslocando espectros -->
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="
               0.625, 0.375, 0.000, 0, 0
               0.700, 0.300, 0.000, 0, 0
               0.000, 0.300, 0.700, 0, 0
               0.000, 0.000, 0.000, 1, 0" />
          </filter>
          
          <!-- Correção para Deuteranopia: melhora a distinção de verdes -->
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="
               0.800, 0.200, 0.000, 0, 0
               0.258, 0.742, 0.000, 0, 0
               0.000, 0.142, 0.858, 0, 0
               0.000, 0.000, 0.000, 1, 0" />
          </filter>

          <!-- Correção para Tritanopia: melhora a distinção entre azul e amarelo -->
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="
               0.950, 0.050, 0.000, 0, 0
               0.000, 0.433, 0.567, 0, 0
               0.000, 0.475, 0.525, 0, 0
               0.000, 0.000, 0.000, 1, 0" />
          </filter>

          <!-- Acromatopsia / Monocromático (Escala de Cinza baseada em luminância) -->
          <filter id="achromatopsia">
            <feColorMatrix type="matrix" values="
               0.299, 0.587, 0.114, 0, 0
               0.299, 0.587, 0.114, 0, 0
               0.299, 0.587, 0.114, 0, 0
               0.000, 0.000, 0.000, 1, 0" />
          </filter>
        </defs>
      </svg>
    `;

    document.body.insertAdjacentHTML("beforeend", svgCode);
  }

  /**
   * Aplica o filtro CSS no contêiner do Canvas do jogo.
   * @param {string} filterType - "none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"
   */
  static applyFilter(filterType) {
    // Aplica o filtro no game-container inteiro ao invés do canvas.
    // Isso evita que o `<canvas>` ganhe um z-index superior próprio e
    // cubra/engula os elementos DOM `<input>` nativos gerados por cima dele.
    const container = document.querySelector("#game-container");
    if (!container) return;

    if (filterType && filterType !== "none") {
      container.style.filter = `url(#${filterType})`;
    } else {
      container.style.filter = "none";
    }
  }
}
