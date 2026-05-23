
import { addClass, qsa } from './domHelper.js';

/* -------------------------------------------------------------
   1. CONSTANTES
------------------------------------------------------------- */
const CLASS_VISIBLE  = 'is-visible';
const CLASS_COUNTING = 'is-counting';
const CLASS_REVEAL   = 'reveal';
const CLASS_REVEAL_L = 'reveal--left';
const CLASS_REVEAL_R = 'reveal--right';
const CLASS_REVEAL_S = 'reveal--scale';
const CLASS_GROUP    = 'reveal-group';
const ATTR_COUNT     = 'data-count';

/* -------------------------------------------------------------
   2. DEFAULTS
------------------------------------------------------------- */
const DEFAULTS = {
  threshold:   0.15,   // fracción del elemento visible para activar
  rootMargin:  '0px',  // margen alrededor del viewport
  once:        true,   // dejar de observar tras la primera vez
};

/* -------------------------------------------------------------
   3. CLASE SCROLL OBSERVER
------------------------------------------------------------- */
export class ScrollObserver {

  /**
   * @param {object} options - Opciones del IntersectionObserver
   */
  constructor(options = {}) {
    this._config    = { ...DEFAULTS, ...options };
    this._observer  = null;
    this._callbacks = new Map(); // elemento → callback personalizado
    this._init();
  }

  /* -----------------------------------------------------------
     4. INICIALIZACIÓN
  ----------------------------------------------------------- */
  _init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: mostrar todo si no hay soporte
      this._fallback();
      return;
    }

    this._observer = new IntersectionObserver(
      (entries) => this._handleEntries(entries),
      {
        threshold:  this._config.threshold,
        rootMargin: this._config.rootMargin,
      }
    );
  }

  /* -----------------------------------------------------------
     5. HANDLER DE ENTRADAS
  ----------------------------------------------------------- */

  /**
   * Procesa cada entrada del IntersectionObserver.
   * @param {IntersectionObserverEntry[]} entries
   */
  _handleEntries(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Agregar clase visible
      addClass(el, CLASS_VISIBLE);

      // Ejecutar callback personalizado si existe
      if (this._callbacks.has(el)) {
        this._callbacks.get(el)(el);
      }

      // Dejar de observar si once: true
      if (this._config.once) {
        this._observer.unobserve(el);
        this._callbacks.delete(el);
      }
    });
  }

  /* -----------------------------------------------------------
     6. API PÚBLICA
  ----------------------------------------------------------- */

  /**
   * Observa un elemento.
   * @param {HTMLElement} el
   * @param {Function}    [callback] - Ejecutar al activarse
   * @returns {ScrollObserver} this
   */
  observe(el, callback) {
    if (!el || !this._observer) return this;
    if (callback) this._callbacks.set(el, callback);
    this._observer.observe(el);
    return this;
  }

  /**
   * Observa múltiples elementos.
   * @param {HTMLElement[]} els
   * @param {Function}      [callback]
   * @returns {ScrollObserver} this
   */
  observeAll(els, callback) {
    els.forEach((el) => this.observe(el, callback));
    return this;
  }

  /**
   * Deja de observar un elemento.
   * @param {HTMLElement} el
   * @returns {ScrollObserver} this
   */
  unobserve(el) {
    this._observer?.unobserve(el);
    this._callbacks.delete(el);
    return this;
  }

  /**
   * Desconecta el observer completamente.
   * Llamar en cleanup para evitar memory leaks.
   */
  disconnect() {
    this._observer?.disconnect();
    this._callbacks.clear();
  }

  /* -----------------------------------------------------------
     7. FALLBACK — Sin soporte de IntersectionObserver
  ----------------------------------------------------------- */
  _fallback() {
    const selectors = [
      `.${CLASS_REVEAL}`,
      `.${CLASS_REVEAL_L}`,
      `.${CLASS_REVEAL_R}`,
      `.${CLASS_REVEAL_S}`,
    ].join(', ');

    qsa(selectors).forEach((el) => addClass(el, CLASS_VISIBLE));
  }
}

/* -------------------------------------------------------------
   8. REVEAL OBSERVER — Para clases .reveal del CSS
      Instancia lista para usar en todo el proyecto
------------------------------------------------------------- */

/**
 * Observa todos los elementos .reveal* del DOM
 * y les agrega .is-visible al hacer scroll.
 *
 * @returns {ScrollObserver}
 */
export const initReveal = () => {
  const observer = new ScrollObserver({ threshold: 0.12 });

  const selectors = [
    `.${CLASS_REVEAL}`,
    `.${CLASS_REVEAL_L}`,
    `.${CLASS_REVEAL_R}`,
    `.${CLASS_REVEAL_S}`,
  ];

  selectors.forEach((sel) => {
    qsa(sel).forEach((el) => observer.observe(el));
  });

  return observer;
};

/* -------------------------------------------------------------
   9. COUNTER OBSERVER — Para stat-cards con data-count
      Anima los números de las estadísticas
------------------------------------------------------------- */

/**
 * Observa elementos con [data-count] y anima el número.
 * @returns {ScrollObserver}
 */
export const initCounters = () => {
  const observer = new ScrollObserver({ threshold: 0.5 });

  qsa(`[${ATTR_COUNT}]`).forEach((el) => {
    observer.observe(el, (target) => {
      const end      = parseInt(target.dataset.count, 10);
      const duration = 1200;
      const start    = 0;
      const step     = (end - start) / (duration / 16);
      let   current  = start;

      addClass(target.closest('.stat-card'), CLASS_COUNTING);

      const tick = () => {
        current += step;
        if (current < end) {
          target.textContent = Math.floor(current);
          requestAnimationFrame(tick);
        } else {
          target.textContent = end;
        }
      };

      requestAnimationFrame(tick);
    });
  });

  return observer;
};

/* -------------------------------------------------------------
   10. PROGRESS OBSERVER — Para barras de progreso
       Anima las skill bars de tech-cards y education
------------------------------------------------------------- */

/**
 * Observa elementos .timeline__progress-fill y tech-card
 * y activa las barras de progreso con CSS.
 * @returns {ScrollObserver}
 */
export const initProgressBars = () => {
  const observer = new ScrollObserver({ threshold: 0.3 });

  // Barras de progreso del timeline
  qsa('.timeline__item').forEach((el) => {
    observer.observe(el, (target) => {
      addClass(target, CLASS_VISIBLE);
    });
  });

  // Skill bars de las tech-cards
  qsa('.tech-card').forEach((el) => {
    observer.observe(el, (target) => {
      addClass(target, CLASS_VISIBLE);
    });
  });

  return observer;
};

/* -------------------------------------------------------------
   11. NAVBAR OBSERVER — Activa el link del navbar
       según la sección visible en el viewport
------------------------------------------------------------- */

/**
 * Observa las secciones y activa el link
 * correspondiente en el navbar.
 *
 * @param {Function} onSectionChange - callback(sectionId: string)
 * @returns {IntersectionObserver}
 */
export const initSectionObserver = (onSectionChange) => {
  const sections = qsa('section[id]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onSectionChange(entry.target.id);
        }
      });
    },
    {
      threshold:  0.4,
      rootMargin: `-${getComputedStyle(document.documentElement)
        .getPropertyValue('--navbar-height')
        .trim()} 0px 0px 0px`,
    }
  );

  sections.forEach((section) => observer.observe(section));
  return observer;
};

/* -------------------------------------------------------------
   12. STAGGER OBSERVER — Para .reveal-group
       Agrega .is-visible a los hijos con delay escalonado
------------------------------------------------------------- */

/**
 * Observa contenedores .reveal-group y activa
 * los hijos uno a uno con stagger.
 *
 * @param {number} [staggerDelay=100] - ms entre cada hijo
 * @returns {ScrollObserver}
 */
export const initStagger = (staggerDelay = 100) => {
  const observer = new ScrollObserver({ threshold: 0.1 });

  qsa(`.${CLASS_GROUP}`).forEach((group) => {
    observer.observe(group, (target) => {
      const children = Array.from(target.children);

      children.forEach((child, i) => {
        setTimeout(() => {
          addClass(child, CLASS_VISIBLE);
        }, i * staggerDelay);
      });
    });
  });

  return observer;
};

/* -------------------------------------------------------------
   13. INIT ALL — Inicializa todos los observers de una vez
       Úsalo en main.js para setup completo
------------------------------------------------------------- */

/**
 * Inicializa todos los observers del proyecto.
 * @param {Function} onSectionChange
 * @returns {object} colección de observers para cleanup
 */
export const initAllObservers = (onSectionChange) => ({
  reveal:   initReveal(),
  counters: initCounters(),
  progress: initProgressBars(),
  stagger:  initStagger(),
  sections: initSectionObserver(onSectionChange),
});