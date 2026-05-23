/**
 * @typedef {Object} Project
 * @property {string}   id          - Identificador único
 * @property {string}   number      - Número decorativo "01", "02"...
 * @property {string}   title       - Nombre del proyecto
 * @property {string}   description - Descripción corta (max 2 líneas)
 * @property {string}   image       - Ruta relativa a assets/images/projects/
 * @property {string}   emoji       - Emoji fallback si no hay imagen
 * @property {string[]} stack       - Tecnologías usadas (ids de technologies.js)
 * @property {string}   demo        - URL del demo en vivo ('' si no tiene)
 * @property {string}   github      - URL del repositorio en GitHub
 * @property {boolean}  featured    - Si es proyecto destacado
 * @property {string}   status      - 'live' | 'wip' | 'archived'
 * @property {string[]} categories  - Para los filtros: ['react','css',...]
 */

/** @type {Project[]} */
export const projects = [

  /* -----------------------------------------------------------
     PROYECTO 1
  ----------------------------------------------------------- */
  {
    id:          'proyecto-1',
    number:      '01',
    title:       'Nombre del Proyecto',
    description:
      'Descripción corta del proyecto. Qué problema resuelve, '  +
      'qué tecnologías usa y qué aprendiste construyéndolo.',
    image:       'assets/images/projects/proyecto-1.jpg',
    emoji:       '🚀',
    stack:       ['react', 'tailwind', 'javascript'],
    demo:        'https://proyecto-1-demo.netlify.app',
    github:      'https://github.com/nicolas-vargas/proyecto-1',
    featured:    true,
    status:      'live',
    categories:  ['react', 'tailwind'],
  },

  /* -----------------------------------------------------------
     PROYECTO 2
  ----------------------------------------------------------- */
  {
    id:          'proyecto-2',
    number:      '02',
    title:       'Nombre del Proyecto',
    description:
      'Descripción corta del proyecto. Qué problema resuelve, ' +
      'qué tecnologías usa y qué aprendiste construyéndolo.',
    image:       'assets/images/projects/proyecto-2.jpg',
    emoji:       '🎨',
    stack:       ['javascript', 'css3', 'html5'],
    demo:        'https://proyecto-2-demo.netlify.app',
    github:      'https://github.com/nicolas-vargas/proyecto-2',
    featured:    false,
    status:      'live',
    categories:  ['javascript', 'css'],
  },

  /* -----------------------------------------------------------
     PROYECTO 3
  ----------------------------------------------------------- */
  {
    id:          'proyecto-3',
    number:      '03',
    title:       'Nombre del Proyecto',
    description:
      'Descripción corta del proyecto. Qué problema resuelve, ' +
      'qué tecnologías usa y qué aprendiste construyéndolo.',
    image:       'assets/images/projects/proyecto-3.jpg',
    emoji:       '⚡',
    stack:       ['angular', 'bootstrap', 'javascript'],
    demo:        '',
    github:      'https://github.com/nicolas-vargas/proyecto-3',
    featured:    false,
    status:      'wip',
    categories:  ['angular', 'bootstrap'],
  },
];

/* -------------------------------------------------------------
   HELPERS — Funciones puras para filtrar los datos
------------------------------------------------------------- */

/**
 * Retorna todos los proyectos ordenados: featured primero.
 * @returns {Project[]}
 */
export const getSorted = () =>
  [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));

/**
 * Retorna solo los proyectos destacados.
 * @returns {Project[]}
 */
export const getFeatured = () =>
  projects.filter((p) => p.featured);

/**
 * Retorna proyectos filtrados por categoría/tecnología.
 * @param {string} category
 * @returns {Project[]}
 */
export const getByCategory = (category) =>
  category === 'all'
    ? getSorted()
    : projects.filter((p) => p.categories.includes(category));

/**
 * Retorna todos los filtros únicos disponibles
 * extraídos de las categorías de los proyectos.
 * @returns {string[]}
 */
export const getFilters = () => {
  const all = projects.flatMap((p) => p.categories);
  return ['all', ...new Set(all)];
};

/**
 * Retorna un proyecto por su id.
 * @param {string} id
 * @returns {Project | undefined}
 */
export const getById = (id) =>
  projects.find((p) => p.id === id);

/* -------------------------------------------------------------
   LABELS — Nombres legibles para los filtros
------------------------------------------------------------- */
export const FILTER_LABELS = {
  all:        'Todos',
  react:      'React',
  angular:    'Angular',
  javascript: 'JavaScript',
  tailwind:   'Tailwind',
  bootstrap:  'Bootstrap',
  css:        'CSS',
};

/* -------------------------------------------------------------
   STATUS LABELS — Para el badge de estado del proyecto
------------------------------------------------------------- */
export const STATUS_CONFIG = {
  live: {
    label: 'En vivo',
    emoji: '🟢',
    class: 'badge--success',
  },
  wip: {
    label: 'En progreso',
    emoji: '🟡',
    class: 'badge--warning',
  },
  archived: {
    label: 'Archivado',
    emoji: '⚫',
    class: 'badge--default',
  },
};