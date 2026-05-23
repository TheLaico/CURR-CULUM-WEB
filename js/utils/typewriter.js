
/* -------------------------------------------------------------
   1. VALORES POR DEFECTO — Configuración base
------------------------------------------------------------- */
const DEFAULTS = {
  words:        ['Frontend Developer', 'React Developer', 'UI Enthusiast'],
  typeSpeed:    80,    // ms por carácter al escribir
  deleteSpeed:  40,    // ms por carácter al borrar
  pauseAfter:   2000,  // ms de pausa después de escribir
  pauseBefore:  500,   // ms de pausa antes de escribir
  loop:         true,  // repetir infinitamente
  cursor:       true,  // mostrar cursor
};

/* -------------------------------------------------------------
   2. CLASE TYPEWRITER
------------------------------------------------------------- */
export class Typewriter {

  /**
   * @param {HTMLElement} element  - El elemento donde se escribe
   * @param {object}      options  - Opciones de configuración
   */
  constructor(element, options = {}) {
    if (!element) {
      console.warn('[Typewriter] Elemento no encontrado.');
      return;
    }

    this._el       = element;
    this._config   = { ...DEFAULTS, ...options };
    this._words    = this._config.words;
    this._wordIdx  = 0;
    this._charIdx  = 0;
    this._deleting = false;
    this._timer    = null;
    this._running  = false;
  }

  /* -----------------------------------------------------------
     3. API PÚBLICA
  ----------------------------------------------------------- */

  /**
   * Inicia el efecto.
   * @returns {Typewriter} this — para encadenar métodos
   */
  start() {
    if (this._running) return this;
    this._running = true;
    this._tick();
    return this;
  }

  /**
   * Pausa el efecto.
   * @returns {Typewriter} this
   */
  pause() {
    clearTimeout(this._timer);
    this._running = false;
    return this;
  }

  /**
   * Reanuda el efecto.
   * @returns {Typewriter} this
   */
  resume() {
    if (this._running) return this;
    this._running = true;
    this._tick();
    return this;
  }

  /**
   * Detiene el efecto y limpia el elemento.
   * @returns {Typewriter} this
   */
  stop() {
    clearTimeout(this._timer);
    this._running  = false;
    this._charIdx  = 0;
    this._deleting = false;
    this._el.textContent = '';
    return this;
  }

  /**
   * Actualiza las palabras sin reiniciar el efecto.
   * @param {string[]} words
   * @returns {Typewriter} this
   */
  setWords(words) {
    this._words   = words;
    this._wordIdx = 0;
    return this;
  }

  /**
   * Retorna si el efecto está activo.
   * @returns {boolean}
   */
  isRunning() {
    return this._running;
  }

  /* -----------------------------------------------------------
     4. LÓGICA INTERNA — TICK
  ----------------------------------------------------------- */

  /**
   * Paso principal del efecto.
   * Decide si escribir, borrar o pausar en cada ciclo.
   */
  _tick() {
    if (!this._running) return;

    const word    = this._words[this._wordIdx];
    const isLast  = this._wordIdx === this._words.length - 1;
    let   delay   = 0;

    if (this._deleting) {
      // — BORRANDO —
      this._charIdx--;
      this._render(word.slice(0, this._charIdx));
      delay = this._config.deleteSpeed;

      // Terminó de borrar → pasar a la siguiente palabra
      if (this._charIdx === 0) {
        this._deleting = false;
        this._wordIdx  = isLast ? 0 : this._wordIdx + 1;
        delay          = this._config.pauseBefore;
      }

    } else {
      // — ESCRIBIENDO —
      this._charIdx++;
      this._render(word.slice(0, this._charIdx));
      delay = this._config.typeSpeed;

      // Terminó de escribir → pausar y luego borrar
      if (this._charIdx === word.length) {
        // Si es la última palabra y loop:false, parar
        if (!this._config.loop && isLast) {
          this._running = false;
          return;
        }
        this._deleting = true;
        delay          = this._config.pauseAfter;
      }
    }

    this._timer = setTimeout(() => this._tick(), delay);
  }

  /**
   * Actualiza el texto visible en el elemento.
   * @param {string} text
   */
  _render(text) {
    this._el.textContent = text;
  }

  /* -----------------------------------------------------------
     5. VARIANZA — Velocidad con ruido humano
        Hace que el efecto se sienta más natural
  ----------------------------------------------------------- */

  /**
   * Versión del tick con varianza aleatoria en velocidad.
   * Actívala pasando humanize: true en las opciones.
   */
  _tickHuman() {
    if (!this._running) return;

    const word    = this._words[this._wordIdx];
    const isLast  = this._wordIdx === this._words.length - 1;
    let   delay   = 0;

    if (this._deleting) {
      this._charIdx--;
      this._render(word.slice(0, this._charIdx));
      delay = this._humanDelay(this._config.deleteSpeed);

      if (this._charIdx === 0) {
        this._deleting = false;
        this._wordIdx  = isLast ? 0 : this._wordIdx + 1;
        delay          = this._config.pauseBefore;
      }
    } else {
      this._charIdx++;
      this._render(word.slice(0, this._charIdx));
      delay = this._humanDelay(this._config.typeSpeed);

      if (this._charIdx === word.length) {
        if (!this._config.loop && isLast) {
          this._running = false;
          return;
        }
        this._deleting = true;
        delay          = this._config.pauseAfter;
      }
    }

    this._timer = setTimeout(() => this._tickHuman(), delay);
  }

  /**
   * Agrega varianza aleatoria a la velocidad base.
   * @param {number} base - velocidad base en ms
   * @returns {number}
   */
  _humanDelay(base) {
    const variance = base * 0.4;
    return base + (Math.random() * variance * 2 - variance);
  }

  /* -----------------------------------------------------------
     6. INICIALIZACIÓN SEGÚN OPCIONES
  ----------------------------------------------------------- */

  /**
   * Selecciona el método tick correcto según config.
   * Se llama internamente al hacer start().
   */
  _tick() {
    return this._config.humanize
      ? this._tickHuman()
      : this._tickBase();
  }

  _tickBase() {
    if (!this._running) return;

    const word    = this._words[this._wordIdx];
    const isLast  = this._wordIdx === this._words.length - 1;
    let   delay   = 0;

    if (this._deleting) {
      this._charIdx--;
      this._render(word.slice(0, this._charIdx));
      delay = this._config.deleteSpeed;

      if (this._charIdx === 0) {
        this._deleting = false;
        this._wordIdx  = isLast ? 0 : this._wordIdx + 1;
        delay          = this._config.pauseBefore;
      }
    } else {
      this._charIdx++;
      this._render(word.slice(0, this._charIdx));
      delay = this._config.typeSpeed;

      if (this._charIdx === word.length) {
        if (!this._config.loop && isLast) {
          this._running = false;
          return;
        }
        this._deleting = true;
        delay          = this._config.pauseAfter;
      }
    }

    this._timer = setTimeout(() => this._tickBase(), delay);
  }
}

/* -------------------------------------------------------------
   7. FACTORY — Función de conveniencia para crear instancias
      Principio D: el llamador no necesita saber de la clase

   @param {string}  selector  - CSS selector del elemento
   @param {object}  options   - Opciones de configuración
   @returns {Typewriter | null}
------------------------------------------------------------- */
export const createTypewriter = (selector, options = {}) => {
  const el = document.querySelector(selector);
  if (!el) {
    console.warn(`[Typewriter] No se encontró: ${selector}`);
    return null;
  }
  return new Typewriter(el, options);
};

/* -------------------------------------------------------------
   8. PRESETS — Configuraciones listas para usar
------------------------------------------------------------- */
export const PRESETS = {

  /** Efecto rápido para subtítulos */
  fast: {
    typeSpeed:   50,
    deleteSpeed: 25,
    pauseAfter:  1500,
    pauseBefore: 300,
    humanize:    false,
  },

  /** Efecto lento y dramático */
  slow: {
    typeSpeed:   120,
    deleteSpeed: 60,
    pauseAfter:  3000,
    pauseBefore: 800,
    humanize:    false,
  },

  /** Efecto natural con varianza humana */
  human: {
    typeSpeed:   85,
    deleteSpeed: 45,
    pauseAfter:  2200,
    pauseBefore: 500,
    humanize:    true,
  },

  /** Solo escribe una vez, sin borrar */
  once: {
    typeSpeed:   70,
    deleteSpeed: 0,
    pauseAfter:  0,
    loop:        false,
    humanize:    true,
  },
};