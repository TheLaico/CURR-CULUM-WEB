import {
  qs,
  on,
  addClass,
  removeClass,
  setAttr,
  throttle,
} from '../utils/domHelper.js';

/* -------------------------------------------------------------
   1. CONSTANTES
------------------------------------------------------------- */
const CLASS_HIDDEN  = 'is-hidden';
const CLASS_VISIBLE = 'is-visible';
const SCROLL_SHOW   = 300;    // px de scroll para mostrar el FAB
const WHATSAPP_BASE = 'https://wa.me/';

/* -------------------------------------------------------------
   2. DEFAULTS
------------------------------------------------------------- */
const DEFAULTS = {
  phone:        '573000000000',  // número con código de país sin +
  message:      '¡Hola Nicolas! Vi tu portfolio y me gustaría contactarte.',
  hideOnSection: '#contacto',    // ocultar cuando esta sección es visible
  showAfter:     SCROLL_SHOW,    // px de scroll para aparecer
};

/* -------------------------------------------------------------
   3. ESTADO INTERNO
------------------------------------------------------------- */
let _fab         = null;
let _config      = {};
let _isVisible   = false;
let _isHidden    = false;    // oculto por sección de contacto

/* -------------------------------------------------------------
   4. INICIALIZACIÓN
------------------------------------------------------------- */

/**
 * Inicializa el FAB de WhatsApp.
 * @param {object} options - opciones de configuración
 */
export const init = (options = {}) => {
  _fab    = qs('.whatsapp-fab');
  _config = { ...DEFAULTS, ...options };

  if (!_fab) {
    console.warn('[WhatsappFab] Elemento .whatsapp-fab no encontrado.');
    return;
  }

  _buildUrl();
  _initScroll();
  _initSectionObserver();
  _initTooltip();
};

/* -------------------------------------------------------------
   5. URL — Construir el link con mensaje predefinido
------------------------------------------------------------- */

/**
 * Construye la URL de WhatsApp con el mensaje codificado
 * y la asigna al href del FAB.
 */
const _buildUrl = () => {
  const phone   = _config.phone.replace(/\D/g, ''); // solo dígitos
  const message = encodeURIComponent(_config.message);
  const url     = `${WHATSAPP_BASE}${phone}?text=${message}`;

  _fab.href = url;
};

/* -------------------------------------------------------------
   6. SCROLL — Mostrar al bajar
------------------------------------------------------------- */

const _initScroll = () => {
  const handler = throttle(_onScroll, 100);
  on(window, 'scroll', handler, { passive: true });
  // Estado inicial
  _onScroll();
};

const _onScroll = () => {
  const scrolled = window.scrollY > _config.showAfter;

  if (scrolled && !_isVisible) {
    _show();
  } else if (!scrolled && _isVisible) {
    _hide();
  }
};

/* -------------------------------------------------------------
   7. VISIBILIDAD — Mostrar y ocultar
------------------------------------------------------------- */

const _show = () => {
  if (_isHidden) return;   // no mostrar si está en sección contacto
  _isVisible = true;
  removeClass(_fab, CLASS_HIDDEN);
  addClass(_fab, CLASS_VISIBLE);
  setAttr(_fab, 'tabindex', '0');
};

const _hide = () => {
  _isVisible = false;
  addClass(_fab, CLASS_HIDDEN);
  removeClass(_fab, CLASS_VISIBLE);
  setAttr(_fab, 'tabindex', '-1');
};

/**
 * Oculta el FAB cuando la sección de contacto es visible.
 * El FAB ya no es necesario si hay tarjetas de contacto visibles.
 */
const _hideForSection = () => {
  _isHidden = true;
  _hide();
};

/**
 * Restaura la visibilidad normal al salir de la sección.
 */
const _showForSection = () => {
  _isHidden = false;
  if (window.scrollY > _config.showAfter) {
    _show();
  }
};

/* -------------------------------------------------------------
   8. SECTION OBSERVER — Ocultar en sección contacto
------------------------------------------------------------- */

const _initSectionObserver = () => {
  const section = qs(_config.hideOnSection);
  if (!section || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          _hideForSection();
        } else {
          _showForSection();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(section);
};

/* -------------------------------------------------------------
   9. TOOLTIP — Accesibilidad del mensaje emergente
------------------------------------------------------------- */

const _initTooltip = () => {
  if (!_fab) return;

  // El tooltip ya está en CSS con ::before
  // Aquí solo manejamos el aria-label dinámico

  on(_fab, 'mouseenter', () => {
    setAttr(_fab, 'aria-label', `WhatsApp: ${_config.message}`);
  });

  on(_fab, 'mouseleave', () => {
    setAttr(_fab, 'aria-label', 'Contactar por WhatsApp');
  });

  // Click — tracking opcional para analytics
  on(_fab, 'click', _onFabClick);
};

/* -------------------------------------------------------------
   10. CLICK — Tracking y analytics
------------------------------------------------------------- */

const _onFabClick = () => {
  // Hook para analytics — reemplaza con tu solución
  // Ejemplos: Google Analytics, Plausible, etc.
  console.info('[WhatsappFab] Click registrado.');

  // Si tienes gtag:
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', 'whatsapp_click', {
  //     event_category: 'contact',
  //     event_label: 'fab',
  //   });
  // }
};

/* -------------------------------------------------------------
   11. BACK TO TOP — Botón compañero del FAB
       Lo manejamos aquí porque comparte lógica de scroll
------------------------------------------------------------- */

/**
 * Inicializa el botón "volver arriba".
 * Lo exportamos separado para que main.js pueda elegir
 * si lo usa o no.
 */
export const initBackToTop = () => {
  const btn = qs('.back-to-top');
  if (!btn) return;

  // Mostrar/ocultar con scroll
  const handler = throttle(() => {
    const show = window.scrollY > 400;
    toggleVisible(btn, show);
  }, 100);

  on(window, 'scroll', handler, { passive: true });

  // Click — scroll al inicio
  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Teclado
  on(btn, 'keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
};

/**
 * Helper local para mostrar/ocultar con clase.
 * @param {HTMLElement} el
 * @param {boolean} show
 */
const toggleVisible = (el, show) => {
  if (show) {
    addClass(el, CLASS_VISIBLE);
    setAttr(el, 'tabindex', '0');
  } else {
    removeClass(el, CLASS_VISIBLE);
    setAttr(el, 'tabindex', '-1');
  }
};

/* -------------------------------------------------------------
   12. EXPORT DEFAULT
------------------------------------------------------------- */
export default { init, initBackToTop };