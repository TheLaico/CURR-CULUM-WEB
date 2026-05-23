

import {
  qs,
  qsa,
  createFromHTML,
  addClass,
  on,
  escapeHTML,
} from '../utils/domHelper.js';

/* -------------------------------------------------------------
   1. DATOS — Educación e hitos
   Principio D: los datos están separados del renderizador.
   En un proyecto más grande irían en data/education.js
------------------------------------------------------------- */

/**
 * @typedef {Object} Course
 * @property {string} name  - Nombre del curso
 * @property {string} [tag] - Categoría: 'frontend' | 'programming' | 'data'
 */

/**
 * @typedef {Object} Achievement
 * @property {string} text - Descripción del logro
 */

/**
 * @typedef {Object} EducationItem
 * @property {string}        id           - Identificador único
 * @property {string}        institution  - Nombre de la institución
 * @property {string}        degree       - Carrera o programa
 * @property {string}        period       - Período: '2022 — Presente'
 * @property {string}        location     - Ciudad, País
 * @property {string}        semester     - Semestre actual
 * @property {string}        icon         - Emoji del punto del timeline
 * @property {number}        progress     - Avance 0–1 para la barra
 * @property {boolean}       active       - Si es la institución actual
 * @property {Course[]}      courses      - Cursos relevantes
 * @property {Achievement[]} achievements - Logros destacados
 */

/** @type {EducationItem[]} */
const EDUCATION_DATA = [
  {
    id:          'udecaldas',
    institution: 'Universidad de Caldas',
    degree:      'Ingeniería de Sistemas y Computación',
    period:      '2022 — Presente',
    location:    'Manizales, Colombia',
    semester:    'Semestre 5',
    icon:        '🎓',
    progress:    0.5,
    active:      true,
    courses: [
      { name: 'Desarrollo Frontend',           tag: 'frontend'     },
      { name: 'Técnicas de Programación',      tag: 'programming'  },
      { name: 'Programación Orientada a Objetos', tag: 'programming' },
      { name: 'Estructuras de Datos',          tag: 'programming'  },
      { name: 'Bases de Datos Relacionales',   tag: 'data'         },
      { name: 'Bases de Datos No Relacionales',tag: 'data'         },
      { name: 'Arquitectura de Computadores',  tag: 'programming'  },
      { name: 'Matemática Discreta',           tag: 'programming'  },
    ],
    achievements: [
      { text: 'Proyecto destacado en Desarrollo Frontend' },
      { text: 'Participación en hackathon universitario'  },
      { text: 'Monitor en Técnicas de Programación'      },
    ],
  },
];

/* -------------------------------------------------------------
   2. CONSTANTES
------------------------------------------------------------- */
const CLASS_VISIBLE  = 'is-visible';
const STAGGER_DELAY  = 120;

/* -------------------------------------------------------------
   3. INICIALIZACIÓN
------------------------------------------------------------- */

/**
 * Inicializa la sección de educación.
 * Renderiza el timeline y conecta las animaciones.
 */
export const init = () => {
  const timeline = qs('.timeline');
  if (!timeline) {
    console.warn('[Education] Elemento .timeline no encontrado.');
    return;
  }

  _renderTimeline(timeline);
  _initProgressObserver();
  _initCourseFilter();
};

/* -------------------------------------------------------------
   4. RENDER TIMELINE
------------------------------------------------------------- */

/**
 * Renderiza todos los items del timeline.
 * @param {HTMLElement} timeline
 */
const _renderTimeline = (timeline) => {
  const fragment = document.createDocumentFragment();

  EDUCATION_DATA.forEach((item, index) => {
    const el = _createTimelineItem(item, index);
    fragment.appendChild(el);
  });

  // Preservar la línea vertical si existe
  const line = qs('.timeline__line', timeline);
  timeline.innerHTML = '';
  if (line) timeline.appendChild(line);
  timeline.appendChild(fragment);
};

/* -------------------------------------------------------------
   5. TIMELINE ITEM — Crear un item completo
------------------------------------------------------------- */

/**
 * Crea el HTML de un item del timeline.
 * @param {EducationItem} item
 * @param {number}        index
 * @returns {HTMLElement}
 */
const _createTimelineItem = (item, index) => {
  const el = createFromHTML(`
    <article
      class="timeline__item reveal"
      id="edu-${escapeHTML(item.id)}"
      style="--stagger: ${index}"
      aria-label="${escapeHTML(item.institution)}"
    >
      <!-- Punto del timeline -->
      <div
        class="timeline__dot ${item.active ? 'timeline__dot--active' : ''}"
        aria-hidden="true"
      >
        <span class="timeline__dot-icon">${escapeHTML(item.icon)}</span>
      </div>

      <!-- Card principal -->
      <div class="timeline__card">

        <!-- Header -->
        <div class="timeline__header">
          <div>
            <h3 class="timeline__institution">
              ${escapeHTML(item.institution)}
            </h3>
            <p class="timeline__degree">
              ${escapeHTML(item.degree)}
            </p>
            <p class="timeline__period">
              📍 ${escapeHTML(item.location)}
            </p>
            <p class="timeline__period">
              ${escapeHTML(item.period)}
            </p>
          </div>
          <span
            class="badge badge--period"
            aria-label="Semestre actual: ${escapeHTML(item.semester)}"
          >
            ${escapeHTML(item.semester)}
          </span>
        </div>

        <!-- Barra de progreso -->
        ${_createProgressHTML(item)}

        <!-- Cursos relevantes -->
        ${_createCoursesHTML(item.courses)}

        <!-- Logros -->
        ${item.achievements?.length
          ? _createAchievementsHTML(item.achievements)
          : ''
        }

      </div>

      <!-- Conector entre items (si no es el último) -->
      ${index < EDUCATION_DATA.length - 1
        ? _createConnectorHTML()
        : ''
      }

    </article>
  `);

  return el;
};

/* -------------------------------------------------------------
   6. HELPERS DE TEMPLATE
------------------------------------------------------------- */

/**
 * Crea el HTML de la barra de progreso de carrera.
 * @param {EducationItem} item
 * @returns {string}
 */
const _createProgressHTML = (item) => `
  <div class="timeline__progress">
    <div class="timeline__progress-header">
      <span class="timeline__progress-label">
        Progreso de carrera
      </span>
      <span class="timeline__progress-value">
        ${Math.round(item.progress * 100)}%
      </span>
    </div>
    <div
      class="timeline__progress-bar"
      role="progressbar"
      aria-valuenow="${Math.round(item.progress * 100)}"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Progreso: ${Math.round(item.progress * 100)}% de la carrera"
    >
      <div
        class="timeline__progress-fill"
        style="--progress: ${item.progress}"
      ></div>
    </div>
  </div>
`;

/**
 * Crea los badges de cursos relevantes.
 * @param {Course[]} courses
 * @returns {string}
 */
const _createCoursesHTML = (courses) => `
  <div class="timeline__courses-section">
    <span
      class="timeline__courses-label text-label"
      id="courses-label"
    >
      Cursos relevantes para frontend
    </span>
    <div
      class="timeline__courses reveal-group"
      role="list"
      aria-labelledby="courses-label"
    >
      ${courses.map((course) => `
        <span
          class="badge badge--course"
          role="listitem"
          data-course-tag="${escapeHTML(course.tag ?? '')}"
          aria-label="${escapeHTML(course.name)}"
        >
          ${escapeHTML(course.name)}
        </span>
      `).join('')}
    </div>
  </div>
`;

/**
 * Crea la lista de logros con checks decorativos.
 * @param {Achievement[]} achievements
 * @returns {string}
 */
const _createAchievementsHTML = (achievements) => `
  <div
    class="timeline__achievements"
    aria-label="Logros destacados"
  >
    ${achievements.map((a) => `
      <p class="timeline__achievement">
        ${escapeHTML(a.text)}
      </p>
    `).join('')}
  </div>
`;

/**
 * Crea el conector animado entre items.
 * @returns {string}
 */
const _createConnectorHTML = () => `
  <div class="timeline__connector" aria-hidden="true">
    <span class="timeline__connector-dot"></span>
    <span class="timeline__connector-dot"></span>
    <span class="timeline__connector-dot"></span>
  </div>
`;

/* -------------------------------------------------------------
   7. PROGRESS OBSERVER — Animar barra al hacer scroll
------------------------------------------------------------- */

/**
 * Observa los items del timeline y activa la barra
 * de progreso cuando entran al viewport.
 */
const _initProgressObserver = () => {
  if (!('IntersectionObserver' in window)) {
    // Fallback: activar todo inmediatamente
    qsa('.timeline__item').forEach((el) =>
      addClass(el, CLASS_VISIBLE)
    );
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        addClass(entry.target, CLASS_VISIBLE);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  qsa('.timeline__item').forEach((el) => observer.observe(el));
};

/* -------------------------------------------------------------
   8. COURSE FILTER — Filtrar cursos por categoría
      Interacción opcional — hover sobre el badge de semestre
      filtra los cursos por relevancia
------------------------------------------------------------- */

/**
 * Inicializa el filtro de cursos por tag.
 * Al pasar el cursor sobre el semestre, resalta los
 * cursos de frontend. Al salir, muestra todos.
 */
const _initCourseFilter = () => {
  const semesterBadge = qs('.badge--period');
  const courses       = qsa('[data-course-tag]');

  if (!semesterBadge || !courses.length) return;

  on(semesterBadge, 'mouseenter', () => {
    _highlightCourses(courses, 'frontend');
  });

  on(semesterBadge, 'mouseleave', () => {
    _resetCourses(courses);
  });

  // Teclado
  on(semesterBadge, 'focus', () => {
    _highlightCourses(courses, 'frontend');
  });

  on(semesterBadge, 'blur', () => {
    _resetCourses(courses);
  });
};

/**
 * Resalta los cursos de un tag y dimea los demás.
 * @param {HTMLElement[]} courses
 * @param {string}        tag
 */
const _highlightCourses = (courses, tag) => {
  courses.forEach((course) => {
    const isMatch = course.dataset.courseTag === tag;
    course.style.opacity   = isMatch ? '1'    : '0.35';
    course.style.transform = isMatch ? 'scale(1.05)' : 'scale(1)';

    if (isMatch) {
      course.style.borderColor    = 'var(--color-accent-border)';
      course.style.backgroundColor = 'var(--color-accent-subtle)';
      course.style.color           = 'var(--color-accent)';
    }
  });
};

/**
 * Restaura el estado normal de todos los cursos.
 * @param {HTMLElement[]} courses
 */
const _resetCourses = (courses) => {
  courses.forEach((course) => {
    course.style.opacity         = '';
    course.style.transform       = '';
    course.style.borderColor     = '';
    course.style.backgroundColor = '';
    course.style.color           = '';
  });
};

/* -------------------------------------------------------------
   9. AGREGAR ITEM — API para agregar educación dinámicamente
      Útil cuando termines más semestres o cursos
------------------------------------------------------------- */

/**
 * Agrega un nuevo item al timeline sin re-renderizar todo.
 * @param {EducationItem} item
 */
export const addItem = (item) => {
  const timeline = qs('.timeline');
  if (!timeline) return;

  const index = EDUCATION_DATA.length;
  EDUCATION_DATA.push(item);

  const el = _createTimelineItem(item, index);
  timeline.appendChild(el);

  // Animar entrada
  requestAnimationFrame(() => {
    setTimeout(() => addClass(el, CLASS_VISIBLE), 100);
  });
};

/* -------------------------------------------------------------
   10. EXPORT DEFAULT
------------------------------------------------------------- */
export default { init, addItem };