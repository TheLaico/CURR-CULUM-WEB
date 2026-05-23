import {
  getSorted,
  getByCategory,
  getFilters,
  STATUS_CONFIG,
  FILTER_LABELS,
} from '../data/projects.js';

import { getById as getTechById } from '../data/technologies.js';

import {
  qs,
  qsa,
  id,
  on,
  createFromHTML,
  replaceChildren,
  addClass,
  removeClass,
  toggleClass,
  escapeHTML,
} from '../utils/domHelper.js';

/* -------------------------------------------------------------
   1. CONSTANTES
------------------------------------------------------------- */
const GRID_ID         = 'projectsGrid';
const FILTERS_ID      = 'projectsFilters';
const CLASS_HIDDEN    = 'is-hidden';
const CLASS_ENTERING  = 'is-entering';
const CLASS_ACTIVE    = 'is-active';
const CLASS_SKELETON  = 'project-card--skeleton';
const STAGGER_DELAY   = 100;
const FILTER_ALL      = 'all';

/* -------------------------------------------------------------
   2. ESTADO INTERNO
------------------------------------------------------------- */
let _currentFilter = FILTER_ALL;
let _grid          = null;
let _filtersEl     = null;

/* -------------------------------------------------------------
   3. INICIALIZACIÓN
------------------------------------------------------------- */

/**
 * Inicializa la sección de proyectos.
 * Renderiza filtros, skeletons y luego las tarjetas reales.
 */
export const init = () => {
  _grid      = id(GRID_ID);
  _filtersEl = id(FILTERS_ID);

  if (!_grid) {
    console.warn('[Projects] Grid #projectsGrid no encontrado.');
    return;
  }

  _renderSkeletons(_grid);
  _renderFilters();

  requestAnimationFrame(() => {
    _renderProjects(getSorted());
    _renderCTA();
  });
};

/* -------------------------------------------------------------
   4. SKELETONS
------------------------------------------------------------- */

/**
 * Rellena el grid con tarjetas skeleton.
 * @param {HTMLElement} grid
 */
const _renderSkeletons = (grid) => {
  const skeletons = Array.from({ length: 3 }, () =>
    createFromHTML(`
      <article class="project-card project-card--skeleton" aria-hidden="true">
        <div class="project-card__image-wrapper"></div>
        <div class="project-card__body">
          <div class="project-card__number"></div>
          <div class="project-card__title"></div>
          <div class="project-card__description"></div>
        </div>
      </article>
    `)
  );
  replaceChildren(grid, skeletons);
};

/* -------------------------------------------------------------
   5. FILTROS — Botones de filtrado por tecnología
------------------------------------------------------------- */

/**
 * Renderiza los botones de filtro.
 */
const _renderFilters = () => {
  if (!_filtersEl) return;

  const filters  = getFilters();
  const fragment = document.createDocumentFragment();

  filters.forEach((filter) => {
    const label = FILTER_LABELS[filter] ?? filter;
    const count = filter === FILTER_ALL
      ? getSorted().length
      : getByCategory(filter).length;

    const btn = createFromHTML(`
      <button
        class="projects__filter-btn ${filter === _currentFilter ? CLASS_ACTIVE : ''}"
        data-filter="${escapeHTML(filter)}"
        aria-pressed="${filter === _currentFilter}"
        aria-label="Filtrar por ${escapeHTML(label)}: ${count} proyectos"
      >
        ${escapeHTML(label)}
        <span class="projects__filter-count"
              aria-hidden="true">${count}</span>
      </button>
    `);

    fragment.appendChild(btn);
  });

  _filtersEl.innerHTML = '';
  _filtersEl.appendChild(fragment);

  // Event delegation — un solo listener para todos los filtros
  on(_filtersEl, 'click', (e) => {
    const btn = e.target.closest('.projects__filter-btn');
    if (!btn) return;
    _applyFilter(btn.dataset.filter);
  });
};

/* -------------------------------------------------------------
   6. APLICAR FILTRO
------------------------------------------------------------- */

/**
 * Filtra los proyectos por categoría.
 * @param {string} filter
 */
const _applyFilter = (filter) => {
  if (filter === _currentFilter) return;
  _currentFilter = filter;

  // Actualizar botones activos
  qsa('.projects__filter-btn', _filtersEl).forEach((btn) => {
    const isActive = btn.dataset.filter === filter;
    toggleClass(btn, CLASS_ACTIVE, isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  // Filtrar y re-renderizar
  const filtered = getByCategory(filter);
  _renderProjects(filtered);
};

/* -------------------------------------------------------------
   7. RENDER PROYECTOS
------------------------------------------------------------- */

/**
 * Renderiza el array de proyectos en el grid.
 * @param {import('../data/projects.js').Project[]} projects
 */
const _renderProjects = (projects) => {
  if (!_grid) return;

  if (!projects.length) {
    _renderEmpty();
    return;
  }

  const fragment = document.createDocumentFragment();

  projects.forEach((project, index) => {
    const card = _createProjectCard(project, index);
    fragment.appendChild(card);
  });

  _grid.innerHTML = '';
  _grid.appendChild(fragment);

  // Animar entrada escalonada
  _animateIn(qsa('.project-card', _grid));
};

/* -------------------------------------------------------------
   8. PROJECT CARD — Crear una tarjeta individual
------------------------------------------------------------- */

/**
 * Crea el HTML completo de una tarjeta de proyecto.
 * @param {import('../data/projects.js').Project} project
 * @param {number} index
 * @returns {HTMLElement}
 */
const _createProjectCard = (project, index) => {
  const status   = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.live;
  const stackBadges = _createStackBadges(project.stack);
  const isFeatured  = project.featured ? 'project-card--featured' : '';

  const card = createFromHTML(`
    <article
      class="project-card ${isFeatured} reveal"
      data-project-id="${escapeHTML(project.id)}"
      data-categories="${escapeHTML(project.categories.join(','))}"
      style="--stagger: ${index}"
    >
      ${_createImageHTML(project)}

      <div class="project-card__body">

        <div class="project-card__header">
          <div class="project-card__meta">
            <p class="project-card__number">
              ${escapeHTML(project.number)}
            </p>
            <h3 class="project-card__title">
              ${escapeHTML(project.title)}
            </h3>
          </div>
          <span class="badge ${escapeHTML(status.class)}"
                aria-label="Estado: ${escapeHTML(status.label)}">
            ${escapeHTML(status.emoji)} ${escapeHTML(status.label)}
          </span>
        </div>

        <p class="project-card__description">
          ${escapeHTML(project.description)}
        </p>

        <div class="project-card__stack"
             aria-label="Tecnologías usadas">
          ${stackBadges}
        </div>

        <div class="project-card__buttons">
          ${_createButtonsHTML(project)}
        </div>

      </div>
    </article>
  `);

  return card;
};

/* -------------------------------------------------------------
   9. HELPERS DE TEMPLATE
------------------------------------------------------------- */

/**
 * Crea el HTML de la imagen o placeholder.
 * @param {import('../data/projects.js').Project} project
 * @returns {string}
 */
const _createImageHTML = (project) => `
  <div class="project-card__image-wrapper">
    ${project.image
      ? `<img
           src="${escapeHTML(project.image)}"
           alt="Captura de ${escapeHTML(project.title)}"
           class="project-card__image"
           loading="lazy"
           width="280"
           height="220"
         />`
      : `<div class="project-card__image-placeholder"
              aria-hidden="true">
           ${escapeHTML(project.emoji)}
         </div>`
    }
    <div class="project-card__preview-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8
                 a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </div>
  </div>
`;

/**
 * Crea los badges del stack de tecnologías.
 * Enriquece con el nombre completo desde technologies.js
 * @param {string[]} stack
 * @returns {string}
 */
const _createStackBadges = (stack) =>
  stack.map((techId) => {
    const tech  = getTechById(techId);
    const label = tech?.name ?? techId;
    const icon  = tech?.icon ?? '';
    return `
      <span class="badge badge--tech"
            title="${escapeHTML(label)}">
        ${icon ? `<span aria-hidden="true">${escapeHTML(icon)}</span>` : ''}
        ${escapeHTML(label)}
      </span>
    `;
  }).join('');

/**
 * Crea los botones de Demo y GitHub.
 * @param {import('../data/projects.js').Project} project
 * @returns {string}
 */
const _createButtonsHTML = (project) => {
  const demoBtn = project.demo
    ? `
         href="${escapeHTML(project.demo)}"
         class="btn btn--demo"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Ver demo de ${escapeHTML(project.title)}"
       >
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" aria-hidden="true">
           <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8
                    a2 2 0 0 1 2-2h6"/>
           <polyline points="15 3 21 3 21 9"/>
           <line x1="10" y1="14" x2="21" y2="3"/>
         </svg>
         Demo
       </a>`
    : `<span class="btn btn--demo"
             style="opacity:0.4; cursor:not-allowed;"
             aria-label="Demo no disponible">
         Sin demo
       </span>`;

  const githubBtn = `
    
      href="${escapeHTML(project.github)}"
      class="btn btn--github"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver código de ${escapeHTML(project.title)} en GitHub"
    >
      <svg width="14" height="14" viewBox="0 0 24 24"
           fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438
                 9.8 8.207 11.387.599.111.793-.261.793-.577
                 v-2.234c-3.338.726-4.033-1.416-4.033-1.416
                 -.546-1.387-1.333-1.756-1.333-1.756-1.089
                 -.745.083-.729.083-.729 1.205.084 1.839
                 1.237 1.839 1.237 1.07 1.834 2.807 1.304
                 3.492.997.107-.775.418-1.305.762-1.604
                 -2.665-.305-5.467-1.334-5.467-5.931
                 0-1.311.469-2.381 1.236-3.221-.124-.303
                 -.535-1.524.117-3.176 0 0 1.008-.322
                 3.301 1.23A11.509 11.509 0 0 1 12 5.803
                 c1.02.005 2.047.138 3.006.404 2.291-1.552
                 3.297-1.23 3.297-1.23.653 1.653.242 2.874
                 .118 3.176.77.84 1.235 1.911 1.235 3.221
                 0 4.609-2.807 5.624-5.479 5.921.43.372
                 .823 1.102.823 2.222v3.293c0 .319.192.694
                 .801.576C20.566 21.797 24 17.3 24 12
                 c0-6.627-5.373-12-12-12z"/>
      </svg>
      GitHub
    </a>
  `;

  return `${demoBtn}${githubBtn}`;
};

/* -------------------------------------------------------------
   10. EMPTY STATE
------------------------------------------------------------- */

const _renderEmpty = () => {
  if (!_grid) return;
  _grid.innerHTML = `
    <div class="projects__empty">
      <span class="projects__empty-icon" aria-hidden="true">🔍</span>
      <p class="projects__empty-title">
        No hay proyectos con este filtro
      </p>
      <p class="text-small">
        Prueba con otro filtro o
        <button
          class="btn btn--ghost btn--sm"
          onclick="document.querySelector('[data-filter=all]')?.click()"
        >
          ver todos
        </button>
      </p>
    </div>
  `;
};

/* -------------------------------------------------------------
   11. CTA FINAL — "Ver más en GitHub"
------------------------------------------------------------- */

const _renderCTA = () => {
  if (!_grid) return;

  // No duplicar si ya existe
  if (qs('.projects__cta')) return;

  const cta = createFromHTML(`
    <div class="projects__cta reveal">
      <p class="projects__cta-text">
        Estos son mis proyectos más destacados.
        Hay más trabajo en mi GitHub.
      </p>
      
        href="https://github.com/nicolas-vargas"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn--ghost"
        aria-label="Ver todos los proyectos en GitHub"
      >
        <svg width="16" height="16" viewBox="0 0 24 24"
             fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302
                   3.438 9.8 8.207 11.387.599.111.793
                   -.261.793-.577v-2.234c-3.338.726-4.033
                   -1.416-4.033-1.416-.546-1.387-1.333
                   -1.756-1.333-1.756-1.089-.745.083-.729
                   .083-.729 1.205.084 1.839 1.237 1.839
                   1.237 1.07 1.834 2.807 1.304 3.492.997
                   .107-.775.418-1.305.762-1.604-2.665
                   -.305-5.467-1.334-5.467-5.931 0-1.311
                   .469-2.381 1.236-3.221-.124-.303-.535
                   -1.524.117-3.176 0 0 1.008-.322 3.301
                   1.23A11.509 11.509 0 0 1 12 5.803c1.02
                   .005 2.047.138 3.006.404 2.291-1.552
                   3.297-1.23 3.297-1.23.653 1.653.242
                   2.874.118 3.176.77.84 1.235 1.911 1.235
                   3.221 0 4.609-2.807 5.624-5.479 5.921
                   .43.372.823 1.102.823 2.222v3.293c0
                   .319.192.694.801.576C20.566 21.797 24
                   17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
        Ver todos en GitHub
      </a>
    </div>
  `);

  _grid.parentElement?.appendChild(cta);

  // Activar reveal
  setTimeout(() => addClass(cta, 'is-visible'), 300);
};

/* -------------------------------------------------------------
   12. ANIMACIÓN DE ENTRADA
------------------------------------------------------------- */

/**
 * Anima la entrada de las tarjetas con stagger.
 * @param {HTMLElement[]} cards
 */
const _animateIn = (cards) => {
  cards.forEach((card, index) => {
    addClass(card, CLASS_ENTERING);
    setTimeout(() => {
      addClass(card, 'is-visible');
      removeClass(card, CLASS_ENTERING);
    }, index * STAGGER_DELAY);
  });
};

/* -------------------------------------------------------------
   13. EXPORT DEFAULT
------------------------------------------------------------- */
export default { init };