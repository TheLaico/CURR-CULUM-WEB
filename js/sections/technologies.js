

import {
  getGrouped,
  getByCategory,
  CATEGORY_LABELS,
} from '../data/technologies.js';

import {
  qs,
  qsa,
  id,
  createFromHTML,
  replaceChildren,
  appendAll,
  addClass,
  on,
  escapeHTML,
} from '../utils/domHelper.js';

/* -------------------------------------------------------------
   1. CONSTANTES
------------------------------------------------------------- */
const GRID_ID        = 'techGrid';
const CLASS_SKELETON = 'tech-card--skeleton';
const CLASS_VISIBLE  = 'is-visible';
const STAGGER_DELAY  = 80;   // ms entre cada tarjeta

/* -------------------------------------------------------------
   2. INICIALIZACIÓN
------------------------------------------------------------- */

/**
 * Inicializa la sección de tecnologías.
 * Renderiza el grid y conecta los observers.
 */
export const init = () => {
  const grid = id(GRID_ID);
  if (!grid) {
    console.warn('[Technologies] Grid #techGrid no encontrado.');
    return;
  }

  _renderSkeletons(grid);
  // Simula carga asíncrona — reemplaza con fetch si traes datos de una API
  requestAnimationFrame(() => {
    _renderGrid(grid);
    _initHoverEffects();
  });
};

/* -------------------------------------------------------------
   3. SKELETONS — Placeholder mientras renderiza
------------------------------------------------------------- */

/**
 * Rellena el grid con tarjetas skeleton.
 * @param {HTMLElement} grid
 */
const _renderSkeletons = (grid) => {
  const skeletons = Array.from({ length: 8 }, () =>
    createFromHTML(`
      <div class="tech-card tech-card--skeleton" aria-hidden="true">
        <div class="tech-card__icon"></div>
        <div class="tech-card__name"></div>
        <div class="tech-card__level"></div>
      </div>
    `)
  );
  replaceChildren(grid, skeletons);
};

/* -------------------------------------------------------------
   4. RENDER GRID — Renderiza las tarjetas reales
------------------------------------------------------------- */

/**
 * Renderiza el grid completo de tecnologías.
 * Agrupa por categoría y renderiza cada grupo.
 * @param {HTMLElement} grid
 */
const _renderGrid = (grid) => {
  const grouped  = getGrouped();
  const fragment = document.createDocumentFragment();

  // Renderizar solo frontend y tools en el grid principal
  const mainCategories = ['frontend', 'tools'];

  mainCategories.forEach((category) => {
    const techs = grouped[category] ?? [];
    techs.forEach((tech, index) => {
      const card = _createTechCard(tech, index);
      fragment.appendChild(card);
    });
  });

  // Limpiar skeletons y agregar tarjetas reales
  grid.innerHTML = '';
  grid.appendChild(fragment);

  // Animar entrada escalonada
  _animateIn(qsa('.tech-card:not(.tech-card--skeleton)', grid));
};

/* -------------------------------------------------------------
   5. TECH CARD — Crear una tarjeta individual
------------------------------------------------------------- */

/**
 * Crea el HTML de una tarjeta de tecnología.
 * @param {import('../data/technologies.js').Technology} tech
 * @param {number} index - Para el delay de animación
 * @returns {HTMLElement}
 */
const _createTechCard = (tech, index) => {
  const card = createFromHTML(`
    <div
      class="tech-card reveal"
      data-tech-id="${escapeHTML(tech.id)}"
      data-category="${escapeHTML(tech.category)}"
      style="--stagger: ${index}"
      role="listitem"
      aria-label="${escapeHTML(tech.name)}: ${escapeHTML(tech.level)}"
    >
      <div class="tech-card__icon" aria-hidden="true">
        ${escapeHTML(tech.icon)}
      </div>

      <span class="tech-card__name">${escapeHTML(tech.name)}</span>

      <span class="tech-card__level">${escapeHTML(tech.level)}</span>

      <div
        class="tech-card__bar-wrapper"
        role="progressbar"
        aria-valuenow="${Math.round(tech.skillLevel * 100)}"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Nivel de ${escapeHTML(tech.name)}"
      >
        <div
          class="tech-card__bar"
          style="--skill-level: ${tech.skillLevel}"
        ></div>
      </div>
    </div>
  `);

  return card;
};

/* -------------------------------------------------------------
   6. ANIMACIÓN DE ENTRADA — Stagger al renderizar
------------------------------------------------------------- */

/**
 * Anima la entrada de las tarjetas con stagger.
 * @param {HTMLElement[]} cards
 */
const _animateIn = (cards) => {
  cards.forEach((card, index) => {
    setTimeout(() => {
      addClass(card, CLASS_VISIBLE);
    }, index * STAGGER_DELAY);
  });
};

/* -------------------------------------------------------------
   7. HOVER EFFECTS — Tooltip y skill bar
------------------------------------------------------------- */

const _initHoverEffects = () => {
  const grid = id(GRID_ID);
  if (!grid) return;

  // Event delegation — un solo listener para todas las tarjetas
  on(grid, 'mouseenter', (e) => {
    const card = e.target.closest('.tech-card');
    if (!card) return;
    _showTooltip(card);
    _activateBar(card);
  }, true);

  on(grid, 'mouseleave', (e) => {
    const card = e.target.closest('.tech-card');
    if (!card) return;
    _hideTooltip(card);
  }, true);
};

/* -------------------------------------------------------------
   8. TOOLTIP — Mostrar nombre completo al hover
------------------------------------------------------------- */

/**
 * Agrega un tooltip a la tarjeta si no existe.
 * @param {HTMLElement} card
 */
const _showTooltip = (card) => {
  if (card.querySelector('.tech-tooltip')) return;

  const techId = card.dataset.techId;
  const techs  = getByCategory('frontend')
    .concat(getByCategory('tools'))
    .concat(getByCategory('learning'));

  const tech = techs.find((t) => t.id === techId);
  if (!tech) return;

  const tooltip = createFromHTML(`
    <div class="tech-tooltip" role="tooltip" aria-live="polite">
      ${escapeHTML(tech.name)} · ${escapeHTML(tech.level)}
    </div>
  `);

  card.style.position = 'relative';
  card.appendChild(tooltip);
};

/**
 * Elimina el tooltip de la tarjeta.
 * @param {HTMLElement} card
 */
const _hideTooltip = (card) => {
  card.querySelector('.tech-tooltip')?.remove();
};

/* -------------------------------------------------------------
   9. SKILL BAR — Activar barra de progreso al hover
------------------------------------------------------------- */

/**
 * Activa la animación de la skill bar.
 * @param {HTMLElement} card
 */
const _activateBar = (card) => {
  addClass(card, CLASS_VISIBLE);
};

/* -------------------------------------------------------------
   10. CATEGORÍAS — Render por grupos con título
       Versión alternativa al grid plano.
       Úsala si prefieres separar Frontend / Herramientas.
------------------------------------------------------------- */

/**
 * Renderiza el grid agrupado por categoría con títulos.
 * Alternativa a _renderGrid() — más visual y organizado.
 * @param {HTMLElement} container
 */
export const renderGrouped = (container) => {
  if (!container) return;

  const grouped = getGrouped();
  const fragment = document.createDocumentFragment();

  Object.entries(grouped).forEach(([category, techs]) => {
    if (category === 'learning') return; // learning va en su propia sección

    const group = createFromHTML(`
      <div class="tech-category reveal">
        <p class="tech-category__title">
          ${escapeHTML(CATEGORY_LABELS[category] ?? category)}
        </p>
        <div
          class="technologies__grid reveal-group"
          role="list"
          aria-label="Tecnologías de ${escapeHTML(CATEGORY_LABELS[category] ?? category)}"
        ></div>
      </div>
    `);

    const grid = qs('.technologies__grid', group);

    techs.forEach((tech, index) => {
      grid.appendChild(_createTechCard(tech, index));
    });

    fragment.appendChild(group);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
};

/* -------------------------------------------------------------
   11. LEARNING BADGES — Renderizar "Actualmente aprendiendo"
------------------------------------------------------------- */

/**
 * Actualiza los badges de la sección "aprendiendo"
 * con datos de data/technologies.js en lugar de HTML estático.
 */
export const renderLearning = () => {
  const container = qs('.technologies__learning-badges');
  if (!container) return;

  const learning = getByCategory('learning');
  if (!learning.length) return;

  const badges = learning.map((tech) =>
    createFromHTML(`
      <span class="badge badge--learning">
        <span aria-hidden="true">${escapeHTML(tech.icon)}</span>
        ${escapeHTML(tech.name)}
      </span>
    `)
  );

  replaceChildren(container, badges);
};

/* -------------------------------------------------------------
   12. EXPORT DEFAULT
------------------------------------------------------------- */
export default { init, renderGrouped, renderLearning };