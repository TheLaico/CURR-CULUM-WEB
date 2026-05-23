

import { id, on, setAttr, getAttr } from './domHelper.js';

/* -------------------------------------------------------------
   1. CONSTANTES
------------------------------------------------------------- */
const STORAGE_KEY   = 'theme';
const THEME_LIGHT   = 'light';
const THEME_DARK    = 'dark';
const ATTR_THEME    = 'data-theme';
const CLASS_TRANS   = 'theme-transitioning';

/* -------------------------------------------------------------
   2. ESTADO INTERNO
------------------------------------------------------------- */
let _current = THEME_LIGHT;
let _listeners = [];

/* -------------------------------------------------------------
   3. HELPERS PRIVADOS
------------------------------------------------------------- */

/**
 * Lee la preferencia del sistema operativo.
 * @returns {'dark' | 'light'}
 */
const getSystemPreference = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_DARK
    : THEME_LIGHT;

/**
 * Lee el tema guardado en localStorage.
 * @returns {'dark' | 'light' | null}
 */
const getSaved = () => localStorage.getItem(STORAGE_KEY);

/**
 * Guarda el tema en localStorage.
 * @param {string} theme
 */
const save = (theme) => localStorage.setItem(STORAGE_KEY, theme);

/**
 * Aplica el tema al elemento <html> sin transición.
 * @param {string} theme
 */
const applyInstant = (theme) => {
  setAttr(document.documentElement, ATTR_THEME, theme);
  _current = theme;
};

/**
 * Aplica el tema con transición suave.
 * @param {string} theme
 */
const applyWithTransition = (theme) => {
  document.documentElement.classList.add(CLASS_TRANS);

  requestAnimationFrame(() => {
    applyInstant(theme);

    // Espera a que termine la transición CSS
    setTimeout(() => {
      document.documentElement.classList.remove(CLASS_TRANS);
    }, 300);
  });
};

/**
 * Notifica a todos los listeners registrados.
 * @param {string} theme
 */
const notify = (theme) =>
  _listeners.forEach((fn) => fn(theme));

/* -------------------------------------------------------------
   4. API PÚBLICA
------------------------------------------------------------- */

/**
 * Inicializa el tema al cargar la página.
 * Prioridad: localStorage → preferencia del SO → light
 * Nota: el <script> inline en index.html ya aplica el tema
 * antes del primer render para evitar flash. Este init
 * solo conecta el botón toggle y los listeners.
 */
export const init = () => {
  const saved   = getSaved();
  const initial = saved || getSystemPreference();

  applyInstant(initial);
  _connectToggle();
  _watchSystemPreference();
};

/**
 * Alterna entre claro y oscuro.
 */
export const toggle = () => {
  const next = _current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
  set(next);
};

/**
 * Establece un tema específico.
 * @param {'light' | 'dark'} theme
 */
export const set = (theme) => {
  if (theme === _current) return;
  applyWithTransition(theme);
  save(theme);
  notify(theme);
};

/**
 * Retorna el tema activo.
 * @returns {'light' | 'dark'}
 */
export const getCurrent = () => _current;

/**
 * Verifica si el tema activo es oscuro.
 * @returns {boolean}
 */
export const isDark = () => _current === THEME_DARK;

/**
 * Registra un callback que se ejecuta al cambiar el tema.
 * Retorna una función para cancelar la suscripción.
 *
 * @param {Function} fn
 * @returns {Function} unsubscribe
 *
 * @example
 * const unsub = themeManager.onChange((theme) => {
 *   console.log('Nuevo tema:', theme);
 * });
 * unsub(); // cancela
 */
export const onChange = (fn) => {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
};

/* -------------------------------------------------------------
   5. CONEXIÓN CON EL BOTÓN — Privado
------------------------------------------------------------- */

/**
 * Conecta el botón #themeToggle con la lógica de toggle.
 * Actualiza aria-label según el tema activo.
 */
const _connectToggle = () => {
  const btn = id('themeToggle');
  if (!btn) return;

  // Click
  on(btn, 'click', () => {
    toggle();
    _updateToggleLabel(btn);
  });

  // Teclado — Enter y Space ya disparan click en <button>
  // pero agregamos soporte para accesibilidad extra
  on(btn, 'keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
      _updateToggleLabel(btn);
    }
  });

  // Estado inicial del label
  _updateToggleLabel(btn);

  // Actualiza el label cuando el tema cambia desde afuera
  onChange(() => _updateToggleLabel(btn));
};

/**
 * Actualiza el aria-label del botón según el tema actual.
 * @param {HTMLElement} btn
 */
const _updateToggleLabel = (btn) => {
  const label = isDark()
    ? 'Cambiar a modo claro'
    : 'Cambiar a modo oscuro';
  setAttr(btn, 'aria-label', label);
  setAttr(btn, 'title', label);
};

/* -------------------------------------------------------------
   6. OBSERVER — Cambios en la preferencia del sistema
------------------------------------------------------------- */

/**
 * Escucha cambios en la preferencia del SO.
 * Solo actualiza si el usuario no tiene preferencia guardada.
 */
const _watchSystemPreference = () => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  on(mq, 'change', (e) => {
    // Si el usuario eligió manualmente, no sobreescribir
    if (getSaved()) return;

    const next = e.matches ? THEME_DARK : THEME_LIGHT;
    set(next);
  });
};

/* -------------------------------------------------------------
   7. EXPORT DEFAULT — Objeto con toda la API
      Permite importar como: import themeManager from '...'
      o desestructurado: import { init, toggle } from '...'
------------------------------------------------------------- */
export default {
  init,
  toggle,
  set,
  getCurrent,
  isDark,
  onChange,
};