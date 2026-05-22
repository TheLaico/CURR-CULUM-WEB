

/**
 * @typedef {Object} Technology
 * @property {string} id         - Identificador único
 * @property {string} name       - Nombre para mostrar
 * @property {string} icon       - Emoji o ruta de ícono SVG
 * @property {string} level      - Nivel de dominio en texto
 * @property {number} skillLevel - Nivel numérico 0–1 para la barra
 * @property {string} category   - Agrupación: 'frontend' | 'tools' | 'learning'
 * @property {string} color      - Color hex del ícono (para tint opcional)
 */

/** @type {Technology[]} */
export const technologies = [

  /* -----------------------------------------------------------
     FRONTEND — Core
  ----------------------------------------------------------- */
  {
    id:         'html5',
    name:       'HTML5',
    icon:       '🌐',
    level:      'Avanzado',
    skillLevel: 0.90,
    category:   'frontend',
    color:      '#E34F26',
  },
  {
    id:         'css3',
    name:       'CSS3',
    icon:       '🎨',
    level:      'Avanzado',
    skillLevel: 0.88,
    category:   'frontend',
    color:      '#1572B6',
  },
  {
    id:         'javascript',
    name:       'JavaScript',
    icon:       '⚡',
    level:      'Intermedio',
    skillLevel: 0.78,
    category:   'frontend',
    color:      '#F7DF1E',
  },
  {
    id:         'react',
    name:       'React',
    icon:       '⚛️',
    level:      'Intermedio',
    skillLevel: 0.75,
    category:   'frontend',
    color:      '#61DAFB',
  },
  {
    id:         'angular',
    name:       'Angular',
    icon:       '🔺',
    level:      'Básico',
    skillLevel: 0.55,
    category:   'frontend',
    color:      '#DD0031',
  },
  {
    id:         'tailwind',
    name:       'Tailwind',
    icon:       '💨',
    level:      'Intermedio',
    skillLevel: 0.72,
    category:   'frontend',
    color:      '#06B6D4',
  },
  {
    id:         'bootstrap',
    name:       'Bootstrap',
    icon:       '🅱️',
    level:      'Intermedio',
    skillLevel: 0.70,
    category:   'frontend',
    color:      '#7952B3',
  },

  /* -----------------------------------------------------------
     TOOLS — Herramientas de desarrollo
  ----------------------------------------------------------- */
  {
    id:         'github',
    name:       'GitHub',
    icon:       '🐙',
    level:      'Intermedio',
    skillLevel: 0.72,
    category:   'tools',
    color:      '#181717',
  },
  {
    id:         'git',
    name:       'Git',
    icon:       '🌿',
    level:      'Intermedio',
    skillLevel: 0.70,
    category:   'tools',
    color:      '#F05032',
  },
  {
    id:         'vscode',
    name:       'VS Code',
    icon:       '🖊️',
    level:      'Avanzado',
    skillLevel: 0.88,
    category:   'tools',
    color:      '#007ACC',
  },
  {
    id:         'figma',
    name:       'Figma',
    icon:       '🎭',
    level:      'Básico',
    skillLevel: 0.45,
    category:   'tools',
    color:      '#F24E1E',
  },

  /* -----------------------------------------------------------
     LEARNING — Actualmente aprendiendo
  ----------------------------------------------------------- */
  {
    id:         'vuejs',
    name:       'Vue.js',
    icon:       '💚',
    level:      'Aprendiendo',
    skillLevel: 0.25,
    category:   'learning',
    color:      '#4FC08D',
  },
  {
    id:         'vitest',
    name:       'Vitest',
    icon:       '🧪',
    level:      'Aprendiendo',
    skillLevel: 0.20,
    category:   'learning',
    color:      '#6E9F18',
  },
];

/* -------------------------------------------------------------
   HELPERS — Funciones puras para filtrar los datos
   Principio S: los helpers viven junto a los datos
   porque solo operan sobre ellos
------------------------------------------------------------- */

/**
 * Retorna todas las tecnologías de una categoría.
 * @param {'frontend' | 'tools' | 'learning'} category
 * @returns {Technology[]}
 */
export const getByCategory = (category) =>
  technologies.filter((t) => t.category === category);

/**
 * Retorna una tecnología por su id.
 * @param {string} id
 * @returns {Technology | undefined}
 */
export const getById = (id) =>
  technologies.find((t) => t.id === id);

/**
 * Retorna solo las tecnologías principales para el Hero.
 * @returns {Technology[]}
 */
export const getHeroStack = () =>
  technologies.filter((t) =>
    ['react', 'javascript', 'angular', 'tailwind'].includes(t.id)
  );

/**
 * Retorna las tecnologías agrupadas por categoría.
 * @returns {Record<string, Technology[]>}
 */
export const getGrouped = () =>
  technologies.reduce((groups, tech) => {
    const key = tech.category;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tech);
    return groups;
  }, {});

/* -------------------------------------------------------------
   LABELS — Nombres legibles por categoría
------------------------------------------------------------- */
export const CATEGORY_LABELS = {
  frontend: 'Frontend',
  tools:    'Herramientas',
  learning: 'Aprendiendo',
};