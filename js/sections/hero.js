

import { createTypewriter, PRESETS  } from '../utils/typewriter.js';
import { createParticles, PARTICLE_PRESETS } from '../utils/particles.js';
import { qs, on, addClass, throttle } from '../utils/domHelper.js';
import themeManager from '../utils/themeManager.js';

/* -------------------------------------------------------------
   1. CONSTANTES
------------------------------------------------------------- */
const TYPEWRITER_WORDS = [
  'Frontend Developer',
  'React Developer',
  'UI Enthusiast',
  'Clean Code Lover',
];

const MOBILE_BREAKPOINT = 768;

/* -------------------------------------------------------------
   2. ESTADO INTERNO
------------------------------------------------------------- */
let _typewriter = null;
let _particles  = null;

/* -------------------------------------------------------------
   3. INICIALIZACIÓN PRINCIPAL
------------------------------------------------------------- */

/**
 * Inicializa todos los elementos del hero.
 * Llamar desde main.js después de que el DOM esté listo.
 */
export const init = () => {
  _initTypewriter();
  _initParticles();
  _initScrollHint();
  _initImageReveal();
  _initCodeTags();
};

/* -------------------------------------------------------------
   4. TYPEWRITER
------------------------------------------------------------- */

const _initTypewriter = () => {
  const el = qs('#typewriterText');
  if (!el) return;

  _typewriter = createTypewriter('#typewriterText', {
    ...PRESETS.human,
    words: TYPEWRITER_WORDS,
  });

  // Pequeño delay para que la entrada del hero se vea primero
  setTimeout(() => _typewriter.start(), 800);
};

/* -------------------------------------------------------------
   5. PARTÍCULAS
------------------------------------------------------------- */

const _initParticles = () => {
  const canvas = qs('#particlesCanvas');
  if (!canvas) return;

  // Reducir partículas en móvil para performance
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  const preset   = isMobile
    ? PARTICLE_PRESETS.mobile
    : PARTICLE_PRESETS.default;

  _particles = createParticles('particlesCanvas', preset);

  if (!_particles) return;

  // Sincronizar con el tema actual
  _particles.setDark(themeManager.isDark());

  // Actualizar cuando cambia el tema
  themeManager.onChange((theme) => {
    _particles.setDark(theme === 'dark');
  });

  // Pausar cuando el hero sale del viewport — ahorra CPU
  _initParticleVisibility();

  // Ajustar preset al cambiar tamaño de ventana
  _initParticleResize();
};

/**
 * Pausa las partículas cuando el hero no está visible.
 * Mejora performance en secciones inferiores.
 */
const _initParticleVisibility = () => {
  if (!('IntersectionObserver' in window)) return;

  const hero = qs('.hero');
  if (!hero || !_particles) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          _particles.resume();
        } else {
          _particles.pause();
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(hero);
};

/**
 * Cambia el preset de partículas al redimensionar la ventana.
 */
const _initParticleResize = () => {
  let wasMobile = window.innerWidth < MOBILE_BREAKPOINT;

  const handler = throttle(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile === wasMobile) return;

    wasMobile = isMobile;
    _particles?.setCount(
      isMobile
        ? PARTICLE_PRESETS.mobile.count
        : PARTICLE_PRESETS.default.count
    );
  }, 300);

  on(window, 'resize', handler);
};

/* -------------------------------------------------------------
   6. SCROLL HINT — Ocultar al hacer scroll
------------------------------------------------------------- */

const _initScrollHint = () => {
  const hint = qs('.hero__scroll-hint');
  if (!hint) return;

  const handler = throttle(() => {
    const hidden = window.scrollY > 80;
    hint.style.opacity   = hidden ? '0' : '1';
    hint.style.transform = hidden
      ? 'translateX(-50%) translateY(10px)'
      : 'translateX(-50%) translateY(0)';
  }, 50);

  on(window, 'scroll', handler, { passive: true });

  // Click — scroll a la siguiente sección
  on(hint, 'click', () => {
    const next = qs('#contacto') ?? qs('section:nth-of-type(2)');
    next?.scrollIntoView({ behavior: 'smooth' });
  });
};

/* -------------------------------------------------------------
   7. IMAGE REVEAL — Animación de la foto al cargar
------------------------------------------------------------- */

const _initImageReveal = () => {
  const wrapper = qs('.hero__image-wrapper');
  const img     = qs('.hero__image');
  if (!wrapper || !img) return;

  // Si la imagen ya está cargada (caché)
  if (img.complete) {
    addClass(wrapper, 'is-loaded');
    return;
  }

  // Esperar a que cargue
  on(img, 'load', () => addClass(wrapper, 'is-loaded'));

  // Fallback si la imagen falla
  on(img, 'error', () => {
    img.style.display = 'none';
    const placeholder = qs('.hero__image-placeholder');
    if (placeholder) placeholder.style.display = 'flex';
  });
};

/* -------------------------------------------------------------
   8. CODE TAGS — Inyectar etiquetas decorativas de código
------------------------------------------------------------- */

const _initCodeTags = () => {
  const hero = qs('.hero');
  if (!hero) return;

  const tags = [
    { text: '<div class="developer">',  class: 'hero__code-tag--1' },
    { text: '</div>',                    class: 'hero__code-tag--2' },
    { text: 'const nicolas = { }',       class: 'hero__code-tag--3' },
  ];

  tags.forEach(({ text, class: cls }) => {
    // Solo agregar si no existe ya (evitar duplicados en HMR)
    if (qs(`.${cls}`, hero)) return;

    const span = document.createElement('span');
    span.className  = `hero__code-tag ${cls}`;
    span.textContent = text;
    span.setAttribute('aria-hidden', 'true');
    hero.appendChild(span);
  });
};

/* -------------------------------------------------------------
   9. GETTERS — Para acceder al estado desde otros módulos
------------------------------------------------------------- */

/**
 * Retorna la instancia del typewriter.
 * @returns {import('../utils/typewriter.js').Typewriter | null}
 */
export const getTypewriter = () => _typewriter;

/**
 * Retorna la instancia del motor de partículas.
 * @returns {import('../utils/particles.js').ParticlesEngine | null}
 */
export const getParticles = () => _particles;

/* -------------------------------------------------------------
   10. DESTROY — Limpieza para SPAs
------------------------------------------------------------- */

/**
 * Destruye todas las instancias del hero.
 * Útil si en el futuro el proyecto se convierte en SPA.
 */
export const destroy = () => {
  _typewriter?.stop();
  _particles?.destroy();
  _typewriter = null;
  _particles  = null;
};

/* -------------------------------------------------------------
   11. EXPORT DEFAULT
------------------------------------------------------------- */
export default { init, getTypewriter, getParticles, destroy };