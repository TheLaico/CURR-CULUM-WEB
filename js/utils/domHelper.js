
/* -------------------------------------------------------------
   1. SELECTORES — Encontrar elementos
------------------------------------------------------------- */

/**
 * Selecciona un elemento del DOM.
 * Wrapper de querySelector con manejo de null.
 * @param {string} selector
 * @param {HTMLElement | Document} [parent=document]
 * @returns {HTMLElement | null}
 */
export const qs = (selector, parent = document) =>
  parent.querySelector(selector);

/**
 * Selecciona múltiples elementos del DOM.
 * Retorna Array, no NodeList, para poder usar .map/.filter.
 * @param {string} selector
 * @param {HTMLElement | Document} [parent=document]
 * @returns {HTMLElement[]}
 */
export const qsa = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

/**
 * Selecciona por id.
 * @param {string} id
 * @returns {HTMLElement | null}
 */
export const id = (id) => document.getElementById(id);

/* -------------------------------------------------------------
   2. CREAR ELEMENTOS — Construir nodos del DOM
------------------------------------------------------------- */

/**
 * Crea un elemento HTML con atributos y contenido opcionales.
 *
 * @param {string} tag               - Tag HTML: 'div', 'span', 'a'...
 * @param {Object} [attrs={}]        - Atributos: class, href, aria-label...
 * @param {string} [innerHTML='']    - Contenido HTML interno
 * @returns {HTMLElement}
 *
 * @example
 * const btn = createElement('button', {
 *   class: 'btn btn--primary',
 *   type: 'button',
 * }, 'Ver proyectos');
 */
export const createElement = (tag, attrs = {}, innerHTML = '') => {
  const el = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') {
      el.className = value;
    } else if (key.startsWith('data-')) {
      el.dataset[key.slice(5)] = value;
    } else if (key.startsWith('aria-')) {
      el.setAttribute(key, value);
    } else {
      el[key] = value;
    }
  });

  if (innerHTML) el.innerHTML = innerHTML;
  return el;
};

/**
 * Crea un elemento a partir de un string HTML.
 * Útil para templates con estructura compleja.
 *
 * @param {string} html
 * @returns {HTMLElement}
 *
 * @example
 * const card = createFromHTML(`
 *   <div class="card">
 *     <h3>Título</h3>
 *   </div>
 * `);
 */
export const createFromHTML = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
};

/* -------------------------------------------------------------
   3. INSERTAR ELEMENTOS — Agregar al DOM
------------------------------------------------------------- */

/**
 * Agrega un elemento al final de un contenedor.
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 */
export const append = (parent, child) => parent.appendChild(child);

/**
 * Agrega múltiples elementos al final de un contenedor.
 * Usa DocumentFragment para una sola operación de reflow.
 * @param {HTMLElement} parent
 * @param {HTMLElement[]} children
 */
export const appendAll = (parent, children) => {
  const fragment = document.createDocumentFragment();
  children.forEach((child) => fragment.appendChild(child));
  parent.appendChild(fragment);
};

/**
 * Reemplaza todo el contenido de un contenedor.
 * @param {HTMLElement} parent
 * @param {HTMLElement[]} children
 */
export const replaceChildren = (parent, children) => {
  parent.innerHTML = '';
  appendAll(parent, children);
};

/* -------------------------------------------------------------
   4. CLASES — Manipular classList
------------------------------------------------------------- */

/**
 * Agrega una o más clases a un elemento.
 * @param {HTMLElement} el
 * @param {...string} classes
 */
export const addClass = (el, ...classes) =>
  el?.classList.add(...classes);

/**
 * Elimina una o más clases de un elemento.
 * @param {HTMLElement} el
 * @param {...string} classes
 */
export const removeClass = (el, ...classes) =>
  el?.classList.remove(...classes);

/**
 * Alterna una clase en un elemento.
 * @param {HTMLElement} el
 * @param {string} className
 * @param {boolean} [force]
 * @returns {boolean}
 */
export const toggleClass = (el, className, force) =>
  el?.classList.toggle(className, force);

/**
 * Verifica si un elemento tiene una clase.
 * @param {HTMLElement} el
 * @param {string} className
 * @returns {boolean}
 */
export const hasClass = (el, className) =>
  el?.classList.contains(className) ?? false;

/* -------------------------------------------------------------
   5. ATRIBUTOS — Leer y escribir atributos
------------------------------------------------------------- */

/**
 * Obtiene el valor de un atributo.
 * @param {HTMLElement} el
 * @param {string} attr
 * @returns {string | null}
 */
export const getAttr = (el, attr) => el?.getAttribute(attr) ?? null;

/**
 * Establece el valor de un atributo.
 * @param {HTMLElement} el
 * @param {string} attr
 * @param {string} value
 */
export const setAttr = (el, attr, value) =>
  el?.setAttribute(attr, value);

/**
 * Elimina un atributo de un elemento.
 * @param {HTMLElement} el
 * @param {string} attr
 */
export const removeAttr = (el, attr) => el?.removeAttribute(attr);

/**
 * Establece múltiples atributos de una vez.
 * @param {HTMLElement} el
 * @param {Record<string, string>} attrs
 */
export const setAttrs = (el, attrs) =>
  Object.entries(attrs).forEach(([key, val]) => setAttr(el, key, val));

/* -------------------------------------------------------------
   6. EVENTOS — Agregar y remover listeners
------------------------------------------------------------- */

/**
 * Agrega un event listener a un elemento.
 * @param {HTMLElement | Window | Document} el
 * @param {string} event
 * @param {Function} handler
 * @param {object | boolean} [options]
 */
export const on = (el, event, handler, options) =>
  el?.addEventListener(event, handler, options);

/**
 * Elimina un event listener de un elemento.
 * @param {HTMLElement | Window | Document} el
 * @param {string} event
 * @param {Function} handler
 */
export const off = (el, event, handler) =>
  el?.removeEventListener(event, handler);

/**
 * Agrega un event listener que se ejecuta una sola vez.
 * @param {HTMLElement | Window | Document} el
 * @param {string} event
 * @param {Function} handler
 */
export const once = (el, event, handler) =>
  el?.addEventListener(event, handler, { once: true });

/**
 * Delega un evento a un selector hijo dentro de un padre.
 * Evita agregar listeners a cada elemento hijo.
 *
 * @param {HTMLElement} parent
 * @param {string} event
 * @param {string} selector
 * @param {Function} handler
 *
 * @example
 * delegate(navLinks, 'click', '.navbar__link', (e, target) => {
 *   console.log(target.href);
 * });
 */
export const delegate = (parent, event, selector, handler) => {
  on(parent, event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
};

/* -------------------------------------------------------------
   7. SCROLL — Utilidades de scroll
------------------------------------------------------------- */

/**
 * Hace scroll suave hasta un elemento.
 * @param {HTMLElement | string} target - Elemento o selector CSS
 * @param {number} [offset=0]           - Offset adicional en px
 */
export const scrollTo = (target, offset = 0) => {
  const el = typeof target === 'string' ? qs(target) : target;
  if (!el) return;

  const top = el.getBoundingClientRect().top
    + window.scrollY
    - offset;

  window.scrollTo({ top, behavior: 'smooth' });
};

/**
 * Retorna la posición de scroll actual.
 * @returns {{ x: number, y: number }}
 */
export const getScroll = () => ({
  x: window.scrollX,
  y: window.scrollY,
});

/**
 * Verifica si un elemento está visible en el viewport.
 * @param {HTMLElement} el
 * @param {number} [threshold=0.1] - Fracción visible requerida
 * @returns {boolean}
 */
export const isInViewport = (el, threshold = 0.1) => {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  return rect.top <= windowHeight * (1 - threshold)
    && rect.bottom >= windowHeight * threshold;
};

/* -------------------------------------------------------------
   8. TEMPLATES — Funciones de template string para HTML
      Principio S: los templates viven en sus secciones,
      pero los helpers de escape sí van aquí
------------------------------------------------------------- */

/**
 * Escapa caracteres HTML para evitar XSS.
 * Úsalo siempre que insertes datos del usuario en el DOM.
 * @param {string} str
 * @returns {string}
 */
export const escapeHTML = (str) =>
  String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');

/**
 * Convierte un string a kebab-case.
 * Útil para generar ids desde nombres.
 * @param {string} str
 * @returns {string}
 *
 * @example
 * toKebab('Frontend Developer') // 'frontend-developer'
 */
export const toKebab = (str) =>
  str.toLowerCase().trim().replace(/\s+/g, '-');

/* -------------------------------------------------------------
   9. MISCELÁNEOS
------------------------------------------------------------- */

/**
 * Ejecuta un callback cuando el DOM está listo.
 * Equivalente a $(document).ready() de jQuery.
 * @param {Function} callback
 */
export const onReady = (callback) => {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  }
};

/**
 * Limita la frecuencia de ejecución de una función.
 * Ideal para eventos scroll y resize.
 * @param {Function} fn
 * @param {number} [delay=16]  - ms entre ejecuciones (~60fps)
 * @returns {Function}
 */
export const throttle = (fn, delay = 16) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
};

/**
 * Retrasa la ejecución hasta que paren los eventos.
 * Ideal para eventos de escritura o resize final.
 * @param {Function} fn
 * @param {number} [delay=300]
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};