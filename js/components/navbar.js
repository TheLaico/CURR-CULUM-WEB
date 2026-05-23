

import {
  id,
  qs,
  qsa,
  on,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setAttr,
  throttle,
} from '../utils/domHelper.js';

/* -------------------------------------------------------------
   1. CONSTANTES
------------------------------------------------------------- */
const CLASS_SCROLLED    = 'navbar--scrolled';
const CLASS_TRANSPARENT = 'navbar--transparent';
const CLASS_OPEN        = 'is-open';
const CLASS_ACTIVE      = 'is-active';
const SCROLL_THRESHOLD  = 50;   // px antes de mostrar el fondo
const ATTR_EXPANDED     = 'aria-expanded';
const ATTR_NAV          = 'data-nav';

/* -------------------------------------------------------------
   2. ESTADO INTERNO
------------------------------------------------------------- */
let _navbar      = null;
let _hamburger   = null;
let _navLinks    = null;
let _links       = [];
let _isOpen      = false;
let _activeId    = '';

/* -------------------------------------------------------------
   3. INICIALIZACIÓN
------------------------------------------------------------- */

/**
 * Inicializa el navbar completo.
 * Llama a esta función desde main.js
 */
export const init = () => {
  _navbar    = id('navbar');
  _hamburger = id('hamburger');
  _navLinks  = id('navLinks');
  _links     = qsa('.navbar__link');

  if (!_navbar) {
    console.warn('[Navbar] Elemento #navbar no encontrado.');
    return;
  }

  _initScrollBehavior();
  _initHamburger();
  _initSmoothLinks();
  _initKeyboard();
  _setInitialState();
};

/* -------------------------------------------------------------
   4. SCROLL — Fondo al hacer scroll
------------------------------------------------------------- */

const _initScrollBehavior = () => {
  const handler = throttle(_onScroll, 16);
  on(window, 'scroll', handler, { passive: true });
  // Aplicar estado inicial sin esperar el primer scroll
  _onScroll();
};

const _onScroll = () => {
  const scrolled = window.scrollY > SCROLL_THRESHOLD;

  if (scrolled) {
    addClass(_navbar, CLASS_SCROLLED);
    removeClass(_navbar, CLASS_TRANSPARENT);
  } else {
    removeClass(_navbar, CLASS_SCROLLED);
    addClass(_navbar, CLASS_TRANSPARENT);
  }
};

/* -------------------------------------------------------------
   5. HAMBURGER — Menú móvil
------------------------------------------------------------- */

const _initHamburger = () => {
  if (!_hamburger || !_navLinks) return;

  on(_hamburger, 'click', _toggleMenu);
};

const _toggleMenu = () => {
  _isOpen = !_isOpen;

  toggleClass(_hamburger, CLASS_OPEN, _isOpen);
  toggleClass(_navLinks,  CLASS_OPEN, _isOpen);

  // Accesibilidad
  setAttr(_hamburger, ATTR_EXPANDED, String(_isOpen));
  setAttr(_hamburger, 'aria-label', _isOpen
    ? 'Cerrar menú'
    : 'Abrir menú'
  );

  // Bloquear scroll del body cuando el menú está abierto
  document.body.style.overflow = _isOpen ? 'hidden' : '';
};

const _closeMenu = () => {
  if (!_isOpen) return;
  _isOpen = false;

  removeClass(_hamburger, CLASS_OPEN);
  removeClass(_navLinks,  CLASS_OPEN);

  setAttr(_hamburger, ATTR_EXPANDED, 'false');
  setAttr(_hamburger, 'aria-label', 'Abrir menú');

  document.body.style.overflow = '';
};

/* -------------------------------------------------------------
   6. LINKS — Smooth scroll y cerrar menú al clicar
------------------------------------------------------------- */

const _initSmoothLinks = () => {
  _links.forEach((link) => {
    on(link, 'click', (e) => {
      e.preventDefault();

      const href    = link.getAttribute('href');
      const target  = qs(href);

      if (target) {
        // Cerrar menú móvil primero
        _closeMenu();

        // Scroll suave con offset del navbar
        const navHeight = _navbar?.offsetHeight ?? 64;
        const top = target.getBoundingClientRect().top
          + window.scrollY
          - navHeight;

        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Cerrar menú al hacer clic fuera de él
  on(document, 'click', (e) => {
    if (!_isOpen) return;
    if (!_navLinks?.contains(e.target) && !_hamburger?.contains(e.target)) {
      _closeMenu();
    }
  });
};

/* -------------------------------------------------------------
   7. LINK ACTIVO — Resalta el link de la sección visible
------------------------------------------------------------- */

/**
 * Actualiza el link activo según el id de la sección visible.
 * Este método es llamado desde scrollObserver.js → main.js
 *
 * @param {string} sectionId
 */
export const setActiveLink = (sectionId) => {
  if (_activeId === sectionId) return;
  _activeId = sectionId;

  _links.forEach((link) => {
    const isActive = link.dataset.nav === sectionId;
    toggleClass(link, CLASS_ACTIVE, isActive);
    setAttr(link, 'aria-current', isActive ? 'page' : 'false');
  });
};

/* -------------------------------------------------------------
   8. TECLADO — Accesibilidad
------------------------------------------------------------- */

const _initKeyboard = () => {
  // Escape cierra el menú móvil
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && _isOpen) {
      _closeMenu();
      _hamburger?.focus();
    }
  });

  // Trap focus dentro del menú cuando está abierto
  on(_navLinks, 'keydown', (e) => {
    if (!_isOpen || e.key !== 'Tab') return;
    _trapFocus(e);
  });
};

/**
 * Atrapa el foco dentro del menú abierto.
 * @param {KeyboardEvent} e
 */
const _trapFocus = (e) => {
  const focusable = qsa(
    'a, button, [tabindex]:not([tabindex="-1"])',
    _navLinks
  ).filter((el) => !el.disabled);

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last?.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first?.focus();
  }
};

/* -------------------------------------------------------------
   9. ESTADO INICIAL
------------------------------------------------------------- */

const _setInitialState = () => {
  // Aplicar clase transparente inicial
  addClass(_navbar, CLASS_TRANSPARENT);

  // Aria inicial del hamburger
  if (_hamburger) {
    setAttr(_hamburger, ATTR_EXPANDED, 'false');
    setAttr(_hamburger, 'aria-label', 'Abrir menú');
  }

  // Marcar como activo el primer link si no hay scroll
  if (window.scrollY <= SCROLL_THRESHOLD && _links.length) {
    addClass(_links[0], CLASS_ACTIVE);
    setAttr(_links[0], 'aria-current', 'page');
    _activeId = _links[0].dataset.nav ?? '';
  }
};

/* -------------------------------------------------------------
   10. EXPORT DEFAULT
------------------------------------------------------------- */
export default { init, setActiveLink };