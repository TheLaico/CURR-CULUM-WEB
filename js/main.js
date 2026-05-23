import themeManager from './utils/themeManager.js';
import { initAllObservers } from './utils/scrollObserver.js';
import { qsa, toggleClass } from './utils/domHelper.js';
import navbar from './components/navbar.js';
import { initSectionObserver } from './utils/scrollObserver.js';
import navbar from './components/navbar.js';
import { initSectionObserver } from './utils/scrollObserver.js';


themeManager.init();

// Escuchar cambios desde cualquier módulo
themeManager.onChange((theme) => {
    console.log('Tema cambiado a:', theme);
});


const observers = initAllObservers((sectionId) => {
    qsa('.navbar__link').forEach((link) => {
        toggleClass(link, 'is-active',
            link.dataset.nav === sectionId
        );
    });
});



navbar.init();

initSectionObserver((sectionId) => {
  navbar.setActiveLink(sectionId);
});


import whatsappFab from './components/whatsappFab.js';

whatsappFab.init({
  phone:   '573150000000',   // ← tu número real aquí
  message: '¡Hola Nicolas! Vi tu portfolio y me gustaría contactarte.',
});

whatsappFab.initBackToTop();