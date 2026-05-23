

/* -------------------------------------------------------------
   1. IMPORTS — Módulos en orden de dependencia
------------------------------------------------------------- */

// Utils
import { onReady }            from './utils/domHelper.js';
import themeManager           from './utils/themeManager.js';
import { initAllObservers }   from './utils/scrollObserver.js';

// Components
import navbar                 from './components/navbar.js';
import whatsappFab            from './components/whatsappFab.js';

// Sections
import hero                   from './sections/hero.js';
import technologies           from './sections/technologies.js';
import projects               from './sections/projects.js';
import education              from './sections/education.js';

/* -------------------------------------------------------------
   2. CONFIGURACIÓN — Datos personalizables en un lugar
      Principio D: si cambia el número o el link,
      solo se edita aquí, no en 5 archivos distintos
------------------------------------------------------------- */
const CONFIG = {
  whatsapp: {
    phone:   '573215993251',  
    message: '¡Hola Nicolas! Vi tu portfolio y me gustaría contactarte.',
  },
  github: 'https://github.com/TheLaico',
};

/* -------------------------------------------------------------
   3. INIT — Función principal de arranque
------------------------------------------------------------- */

/**
 * Inicializa toda la aplicación en orden.
 * Cada módulo es independiente — si uno falla,
 * los demás siguen funcionando.
 */
const init = () => {
  _initTheme();
  _initNavbar();
  _initSections();
  _initComponents();
  _initObservers();
  _initPerformance();
  _logReady();
};

/* -------------------------------------------------------------
   4. TEMA — Primero para evitar flash de color incorrecto
------------------------------------------------------------- */

const _initTheme = () => {
  try {
    themeManager.init();
  } catch (e) {
    console.error('[Main] Error inicializando tema:', e);
  }
};

/* -------------------------------------------------------------
   5. NAVBAR
------------------------------------------------------------- */

const _initNavbar = () => {
  try {
    navbar.init();
  } catch (e) {
    console.error('[Main] Error inicializando navbar:', e);
  }
};

/* -------------------------------------------------------------
   6. SECCIONES — En orden de aparición en el DOM
------------------------------------------------------------- */

const _initSections = () => {
  const sections = [
    { name: 'hero',         fn: () => hero.init()         },
    { name: 'technologies', fn: () => technologies.init() },
    { name: 'projects',     fn: () => projects.init()     },
    { name: 'education',    fn: () => education.init()    },
  ];

  sections.forEach(({ name, fn }) => {
    try {
      fn();
    } catch (e) {
      console.error(`[Main] Error inicializando sección "${name}":`, e);
    }
  });
};

/* -------------------------------------------------------------
   7. COMPONENTES FLOTANTES
------------------------------------------------------------- */

const _initComponents = () => {
  try {
    whatsappFab.init({
      phone:   CONFIG.whatsapp.phone,
      message: CONFIG.whatsapp.message,
    });
    whatsappFab.initBackToTop();
  } catch (e) {
    console.error('[Main] Error inicializando componentes:', e);
  }
};

/* -------------------------------------------------------------
   8. OBSERVERS — Scroll animations y link activo
------------------------------------------------------------- */

const _initObservers = () => {
  try {
    initAllObservers((sectionId) => {
      navbar.setActiveLink(sectionId);
    });
  } catch (e) {
    console.error('[Main] Error inicializando observers:', e);
  }
};

/* -------------------------------------------------------------
   9. PERFORMANCE — Optimizaciones globales
------------------------------------------------------------- */

const _initPerformance = () => {

  // Pausar animaciones CSS cuando la pestaña no está activa
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.documentElement.style.setProperty(
        '--transition-normal', '0ms'
      );
    } else {
      document.documentElement.style.removeProperty('--transition-normal');
    }
  });

  // Lazy load de imágenes con IntersectionObserver nativo
  if ('loading' in HTMLImageElement.prototype) {
    // El navegador soporta lazy loading nativo
    // ya está configurado en el HTML con loading="lazy"
  } else {
    // Polyfill manual para navegadores sin soporte
    _lazyLoadImages();
  }

  // Precargar fuentes críticas
  _preloadFonts();
};

/**
 * Lazy load manual para navegadores sin soporte nativo.
 */
const _lazyLoadImages = () => {
  if (!('IntersectionObserver' in window)) return;

  const images   = document.querySelectorAll('img[loading="lazy"]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src   = img.dataset.src ?? img.src;
        observer.unobserve(img);
      });
    },
    { rootMargin: '200px' }
  );

  images.forEach((img) => observer.observe(img));
};

/**
 * Preconnect y preload de fuentes críticas.
 * Las fuentes ya tienen preconnect en el HTML,
 * aquí precargamos solo el primer peso que se renderiza.
 */
const _preloadFonts = () => {
  const fonts = [
    'https://fonts.gstatic.com/s/sora/v12/xMQOuFFYT72X5wkB_18qmnndmSdSnk-DKQJRBg.woff2',
  ];

  fonts.forEach((href) => {
    const link  = document.createElement('link');
    link.rel    = 'preload';
    link.as     = 'font';
    link.type   = 'font/woff2';
    link.href   = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/* -------------------------------------------------------------
   10. EASTER EGG — Mensaje en consola para reclutadores
       y devs curiosos que abran DevTools
------------------------------------------------------------- */

const _logReady = () => {
  const styles = {
    title: [
      'font-size: 20px',
      'font-weight: bold',
      'color: #00C2A8',
    ].join(';'),

    subtitle: [
      'font-size: 13px',
      'color: #9C9890',
    ].join(';'),

    accent: [
      'font-size: 13px',
      'font-weight: bold',
      'color: #00C2A8',
    ].join(';'),

    reset: 'font-size: 13px; color: inherit',
  };

  console.log(
    '%c Nicolas Vargas Alvarez %c\n' +
    '%c Frontend Developer · Manizales, Colombia\n\n' +
    '%c¿Revisando el código? Me alegra que te interese.\n' +
    'Este portfolio está construido con %cHTML · CSS · JS%c\n' +
    'sin frameworks, aplicando principios SOLID.\n\n' +
    'GitHub: %https://github.com/TheLaico%c\n' +
    'LinkedIn: %www.linkedin.com/in/nicolas-vargas-alvarez-51149a40b%c',
    styles.title,
    styles.reset,
    styles.subtitle,
    styles.reset,
    styles.accent,
    styles.reset,
    styles.accent,
    styles.reset,
    styles.accent,
    styles.reset,
  );
};

/* -------------------------------------------------------------
   11. ARRANQUE — Esperar a que el DOM esté listo
------------------------------------------------------------- */
onReady(init);